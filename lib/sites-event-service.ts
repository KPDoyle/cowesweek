import { env } from 'cloudflare:workers';
import { seed } from '@/lib/seed';
import { schemas,type Kind } from '@/lib/model';
export const dynamic='force-dynamic';
const db=()=>{if(!env.DB)throw new Error('Database unavailable');return env.DB;};
const response=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
// The deployment is owner-private. Sites authenticates all requests before this handler.
// Keep the private audience until an organiser/member authorisation system is added.
async function initialise(){
 if(!env.DB)throw new Error('The event database is unavailable.');
 const exists=await db().prepare('SELECT id FROM records WHERE id = ?').bind('sailing-event').first();
 if(!exists)await db().batch(seed.map(r=>db().prepare('INSERT OR IGNORE INTO records(id,kind,data,version,updated_at) VALUES(?,?,?,?,?)').bind(r.id,r.kind,JSON.stringify(r.data),1,r.updatedAt)));
}
async function getData(){const [records,audit]=await Promise.all([db().prepare('SELECT * FROM records ORDER BY updated_at DESC').all(),db().prepare('SELECT * FROM audit ORDER BY time DESC LIMIT 60').all()]);return {records:records.results.map((r:any)=>({id:r.id,kind:r.kind,data:JSON.parse(r.data),version:r.version,updatedAt:r.updated_at})),audit:audit.results};}
export async function GET(){try{await initialise();return response(await getData());}catch(e){console.error(e);return response({error:'Unable to load event records. Please retry.'},503);}}
export async function POST(request:Request){
 try{
  const origin=request.headers.get('origin');if(origin && origin!==new URL(request.url).origin)return response({error:'Origin not allowed'},403);
  if(Number(request.headers.get('content-length')||0)>2000000)return response({error:'Import exceeds 2 MB'},413);
  const raw=await request.text();if(raw.length>2000000)return response({error:'Import exceeds 2 MB'},413);
  const body=JSON.parse(raw);await initialise();
  const operations=Array.isArray(body.operations)?body.operations:[body];
  if(operations.length<1||operations.length>500)return response({error:'Please submit between 1 and 500 records.'},400);
  const actor=request.headers.get('oai-authenticated-user-email')||'Site owner';const now=new Date().toISOString();
  const known=(await db().prepare('SELECT id,kind,data,version FROM records').all()).results as any[];
  const statements=[];const keys=new Set<string>();
  for(const op of operations){
   if(!Object.hasOwn(schemas,op.kind))return response({error:'Unknown record type'},400);
   const kind=op.kind as Kind;
   const id=op.id||crypto.randomUUID();if(typeof id!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(id))return response({error:'Invalid record ID'},400);
   if(keys.has(id))return response({error:'Duplicate records in import'},400);keys.add(id);
   const existing=known.find(r=>r.id===id);
   if(existing&&existing.kind!==kind)return response({error:'Record type mismatch'},400);
   if(existing&&op.version!==existing.version)return response({error:'This record was updated elsewhere. Refresh before saving.'},409);
   if(op.delete){
    if(kind==='event')return response({error:'Events cannot be deleted'},400);
    const used=known.some(r=>r.id!==id&&[JSON.parse(r.data).boatId,JSON.parse(r.data).raceId].includes(id));
    if(used)return response({error:'This record is in use. Remove its linked results, tracks or berth allocation first.'},400);
    statements.push(db().prepare('DELETE FROM records WHERE id = ? AND version = ?').bind(id,op.version));
   } else {
    const parsed=schemas[kind].safeParse(op.data);if(!parsed.success)return response({error:parsed.error.issues.map(x=>`${x.path.join('.')}: ${x.message}`).join('; ')},400);
    const d=parsed.data as any;
    if(d.boatId && !known.some(r=>r.kind==='boat'&&r.id===d.boatId))return response({error:'Choose an existing boat'},400);
    if(d.raceId){const race=known.find(r=>r.kind==='race'&&r.id===d.raceId);if(!race)return response({error:'Choose an existing race'},400);const rd=JSON.parse(race.data);const boat=known.find(r=>r.kind==='boat'&&r.id===d.boatId);if(boat){const bd=JSON.parse(boat.data);if(rd.discipline!==bd.discipline||rd.className!==bd.className)return response({error:'The boat must belong to the selected race class'},400);}}
    if(kind==='boat'&&d.status==='checked-in'){const required=d.discipline==='powerboat'?['insurance','licence','briefing','equipment','scrutineering']:['insurance','briefing','equipment'];if(!required.every(c=>d.checks.includes(c)))return response({error:'Complete the readiness checklist before check-in.'},400);}
    if(kind==='berth'&&((d.status==='available'&&d.boatId)||(d.status==='occupied'&&!d.boatId)))return response({error:'Available berths must be unallocated; occupied berths need a boat.'},400);
    if(kind==='result' && known.some(r=>r.kind==='result'&&r.id!==id&&JSON.parse(r.data).raceId===d.raceId&&JSON.parse(r.data).boatId===d.boatId))return response({error:'This boat already has a result in this race. Edit the existing result.'},409);
    if(kind==='berth'&&d.boatId&&known.some(r=>r.kind==='berth'&&r.id!==id&&JSON.parse(r.data).boatId===d.boatId))return response({error:'This boat is already allocated a berth.'},409);
    if(existing)statements.push(db().prepare('UPDATE records SET data = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?').bind(JSON.stringify(d),now,id,op.version));
    else statements.push(db().prepare('INSERT INTO records(id,kind,data,version,updated_at) VALUES(?,?,?,?,?)').bind(id,kind,JSON.stringify(d),1,now));
   }
   statements.push(db().prepare('INSERT INTO audit(id,action,record_id,actor,time) SELECT ?,?,?,?,? WHERE changes() = 1').bind(crypto.randomUUID(),`${op.delete?'Deleted':existing?'Updated':'Created'} ${kind}`,id,actor,now));
  }
  const saved=await db().batch(statements);
  if(saved.some((r,i)=>i%2===0 && r.meta.changes===0))return response({error:'A record changed while you were saving. Refresh and retry.'},409);
  return response(await getData());
 }catch(e){console.error(e);return response({error:'Unable to save changes. Check the input and retry.'},400);}
}
