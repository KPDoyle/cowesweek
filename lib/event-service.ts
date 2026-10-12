import { get,put,head,BlobPreconditionFailedError } from '@vercel/blob';
import { applyOperations,validateSnapshot,EventError,type EventState } from './event-state';
// Vercel Authentication protects all deployment URLs. Private Blob objects are
// read only by this server, with project-scoped OIDC; credentials never enter the UI.
const pathname='cowesweek/event-records-v1.json';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Cowes-Storage':'vercel-private'}});
function ensureConfigured(){
 if(process.env.VERCEL_ENV==='preview')throw new EventError('Preview builds do not use production event records.',503);
 if(!process.env.BLOB_STORE_ID&&!process.env.BLOB_READ_WRITE_TOKEN)throw new EventError('The private event record store is not configured.',503);
}
export async function readStore(forWrite=false):Promise<{state:EventState,etag:string}> {
 ensureConfigured();
 let file=await get(pathname,{access:'private',useCache:false,abortSignal:AbortSignal.timeout(25000)});
 if(!file){
  // Migration bootstrap is one-time and must never silently replace saved data.
  const snapshot=process.env.COWES_INITIAL_SNAPSHOT;if(!snapshot)throw new EventError('The event record store has not been initialised.',503);
  const initial=validateSnapshot(JSON.parse(snapshot));
  try{await put(pathname,JSON.stringify(initial),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:60,abortSignal:AbortSignal.timeout(25000)});}catch(e){if(!(e instanceof BlobPreconditionFailedError))throw e;}
  file=await get(pathname,{access:'private',useCache:false,abortSignal:AbortSignal.timeout(25000)});
 }
 if(!file||file.statusCode!==200)throw new EventError('Unable to read event records.',503);
 if(forWrite){
  // Use the canonical storage ETag from the control-plane metadata. HTTP GET
  // representations can have a CDN/compression ETag that cannot guard a write.
  const before=await head(pathname,{abortSignal:AbortSignal.timeout(25000)});
  const fresh=await get(pathname,{access:'private',useCache:false,abortSignal:AbortSignal.timeout(25000)});
  const after=await head(pathname,{abortSignal:AbortSignal.timeout(25000)});
  if(!fresh||fresh.statusCode!==200||before.etag!==after.etag)throw new EventError('Another edit was saved while loading this record. Refresh and retry.',409);
  return {state:validateSnapshot(await new Response(fresh.stream).json()),etag:after.etag};
 }
 return {state:validateSnapshot(await new Response(file.stream).json()),etag:file.blob.etag};
}
function publicState(state:EventState){return {records:state.records,audit:state.audit.slice(0,60)};}
function failure(e:unknown){
 if(e instanceof EventError)return json({error:e.message},e.status);
 if(e instanceof BlobPreconditionFailedError)return json({error:'Another edit was saved at the same time. Refresh and retry.'},409);
 console.error('Private event store request failed',e instanceof Error?e.name:'UnknownError');return json({error:'Unable to access saved event records. Please retry.'},503);
}
export async function GET(){if(process.env.COWES_PUBLIC_ONLY==='1')return json({error:'Organiser access is unavailable on the public site.'},403);try{return json(publicState((await readStore()).state));}catch(e){return failure(e);}}
export async function POST(request:Request){
 if(process.env.COWES_PUBLIC_ONLY==='1')return json({error:'This site is read-only.'},403);
 try{
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Origin not allowed'},403);
  if(Number(request.headers.get('content-length')||0)>2000000)return json({error:'Import exceeds 2 MB'},413);
  const raw=await request.text();if(raw.length>2000000)return json({error:'Import exceeds 2 MB'},413);
  let body:unknown;try{body=JSON.parse(raw);}catch{return json({error:'Invalid request JSON'},400);}
  const current=await readStore(true);const next=applyOperations(current.state,body);
  const serialised=JSON.stringify(next);if(serialised.length>4000000)throw new EventError('The record store exceeds the current 4 MB limit. Export the records before adding more.',413);
  // Conditional writes are atomic at the object store. Stale concurrent writes
  // fail with 409 rather than dropping someone else's update or its audit entry.
  await put(pathname,serialised,{access:'private',addRandomSuffix:false,allowOverwrite:true,ifMatch:current.etag,contentType:'application/json',cacheControlMaxAge:60,abortSignal:AbortSignal.timeout(25000)});
  return json(publicState(next));
 }catch(e){return failure(e);}
}
