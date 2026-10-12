import assert from 'node:assert/strict';
import { build } from 'esbuild';
const input=await build({entryPoints:['lib/seed.ts'],bundle:true,write:false,format:'esm',platform:'node'});const {seed}=await import('data:text/javascript;base64,'+Buffer.from(input.outputFiles[0].text).toString('base64'));
let contents=null,etag='0',conflict=false,lastPut;
class Precondition extends Error{}
globalThis.__blobMock={BlobPreconditionFailedError:Precondition,async head(){return {etag};},async get(_path,options){assert.equal(options.useCache,false);return contents?{statusCode:200,stream:new Response(contents).body,blob:{etag:'W/'+etag}}:null;},async put(_path,value,options){lastPut=options;assert.equal(options.access,'private');if(conflict||options.ifMatch&&options.ifMatch!==etag||contents&&options.allowOverwrite===false)throw new Precondition();contents=value;etag=String(Number(etag)+1);return {etag};}};
const b=await build({entryPoints:['lib/event-service.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'blob-test',setup(builder){builder.onResolve({filter:/^@vercel\/blob$/},()=>({path:'mock',namespace:'test'}));builder.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const {get,put,head,BlobPreconditionFailedError}=globalThis.__blobMock;'}));}}]});
const api=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
const request=body=>new Request('https://cowesweek.vercel.app/api/data',{method:'POST',headers:{origin:'https://cowesweek.vercel.app'},body:JSON.stringify(body)});
try{
 delete process.env.BLOB_STORE_ID;delete process.env.BLOB_READ_WRITE_TOKEN;delete process.env.COWES_INITIAL_SNAPSHOT;assert.equal((await api.GET()).status,503);
 process.env.BLOB_STORE_ID='test-store';assert.equal((await api.GET()).status,503);
 process.env.COWES_INITIAL_SNAPSHOT=JSON.stringify({records:seed,audit:[]});let r=await api.GET();assert.equal(r.status,200);assert.equal((await r.json()).records.length,40);assert.equal(lastPut.allowOverwrite,false);
 delete process.env.COWES_INITIAL_SNAPSHOT;assert.equal((await api.GET()).status,200);
 const boat=seed.find(r=>r.id==='sail-0');r=await api.POST(request({kind:'boat',id:'new-test-boat',data:{...boat.data,name:'Test new boat',status:'entered',checks:[]}}));assert.equal(r.status,200);let data=await r.json();let created=data.records.find(r=>r.id==='new-test-boat');assert.ok(created);assert.ok(lastPut.ifMatch);
 r=await api.POST(request({...created,data:{...created.data,status:'checked-in'}}));assert.equal(r.status,400);
 r=await api.POST(request({...created,data:{...created.data,checks:['insurance','briefing','equipment'],status:'checked-in'}}));assert.equal(r.status,200);data=await r.json();const updated=data.records.find(r=>r.id===created.id);assert.equal(updated.version,2);
 r=await api.POST(request({...created,data:{...created.data,name:'Stale edit'}}));assert.equal(r.status,409);
 const before=contents;r=await api.POST(request({operations:[{kind:'notice',data:{title:'Atomic',body:'test',discipline:'all',priority:'info',time:'2026-08-01'}},{kind:'result',data:{raceId:'race-irc',boatId:'power-0',elapsed:100,penalty:0,laps:1,status:'finished',note:''}}]}));assert.equal(r.status,400);assert.equal(contents,before);
 conflict=true;r=await api.POST(request({...updated,data:{...updated.data,name:'Concurrent edit'}}));assert.equal(r.status,409);assert.equal(contents,before);conflict=false;
 r=await api.POST(request({...updated,delete:true}));assert.equal(r.status,200);data=await r.json();assert.equal(data.records.length,40);assert.ok(data.audit.length>=3);
 r=await api.POST(new Request('https://cowesweek.vercel.app/api/data',{method:'POST',headers:{origin:'https://other.test'},body:'{}'}));assert.equal(r.status,403);
 r=await api.POST(new Request('https://cowesweek.vercel.app/api/data',{method:'POST',body:'bad'}));assert.equal(r.status,400);
 process.env.VERCEL_ENV='preview';assert.equal((await api.GET()).status,503);
 console.log('PASS: snapshot migration, private persistence, edits, validation, atomic batches, concurrency, origin and preview isolation.');
}finally{delete process.env.BLOB_STORE_ID;delete process.env.COWES_INITIAL_SNAPSHOT;delete process.env.VERCEL_ENV;delete globalThis.__blobMock;}
