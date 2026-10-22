import { readStore,commitOperations } from '@/lib/event-service';
import { newCode,hashCode } from '@/lib/crew-access';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(process.env.COWES_PUBLIC_ONLY==='1')return Response.json({error:'Organiser access required.'},{status:403});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin not allowed.'},{status:403});
 try{
  const {boatId,revoke}=await request.json() as {boatId:string;revoke?:boolean};const {state}=await readStore();
  if(!state.records.some(r=>r.kind==='boat'&&r.id===boatId))return Response.json({error:'Choose an existing boat.'},{status:400});
  const existing=state.records.find(r=>r.kind==='crewaccess'&&r.data.boatId===boatId);
  if(revoke){if(existing)await commitOperations({...existing,data:{...existing.data,active:false}});return Response.json({message:'Boat registration code revoked.'});}
  const code=newCode(),expiresAt=new Date(Date.now()+90*86400000).toISOString();
  await commitOperations({kind:'crewaccess',id:existing?.id,version:existing?.version,data:{boatId,codeHash:hashCode(code),expiresAt,active:true}});
  return Response.json({code,expiresAt},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to change access. Refresh and retry.'},{status:409});}
}
