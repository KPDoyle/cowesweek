import { readStore,commitOperations } from '@/lib/event-service';
import { EventError } from '@/lib/event-state';
import { accessForCode,competitorRecords,crewCookie } from '@/lib/crew-access';
import { type Entry } from '@/lib/model';
export const runtime='nodejs';export const dynamic='force-dynamic';
const response=(body:unknown,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
const cookie=(request:Request)=>request.headers.get('cookie')?.split(';').find(c=>c.trim().startsWith(crewCookie+'='))?.trim().slice(crewCookie.length+1)||'';
export async function GET(request:Request){try{const {state}=await readStore();const access=accessForCode(state.records,cookie(request));if(!access)return response({error:'Enter your boat registration code.'},401);return response({records:competitorRecords(state.records,access.data.boatId)});}catch{return response({error:'The crew service is unavailable. Please retry.'},503);}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return response({error:'Origin not allowed.'},403);
 try{
  const raw=await request.text();if(raw.length>12000)return response({error:'Request too large.'},413);const body=JSON.parse(raw);
  const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
  if(body.action==='logout')return response({message:'Signed out.'},200,{'Set-Cookie':`${crewCookie}=; Path=/api/competitor; HttpOnly; SameSite=Strict; Max-Age=0${secure}`});
  const {state}=await readStore();
  const code=body.action==='login'?String(body.code||'').trim().toUpperCase():cookie(request);
  const access=accessForCode(state.records,code);if(!access)return response({error:'Registration code is invalid, expired or revoked.'},401);
  if(body.action==='login')return response({records:competitorRecords(state.records,access.data.boatId)},200,{'Set-Cookie':`${crewCookie}=${code}; Path=/api/competitor; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`});
  const boat=state.records.find(r=>r.kind==='boat'&&r.id===access.data.boatId) as Entry<'boat'>;
  let operation:unknown;
  if(body.action==='crew')operation={...boat,version:body.version,data:{...boat.data,crew:String(body.crew||''),skipper:String(body.skipper||'')}};
  else if(body.action==='declare'){
   const race=state.records.find(r=>r.kind==='race'&&r.id===body.raceId&&r.data.className===boat.data.className&&r.data.discipline===boat.data.discipline);
   if(!race)return response({error:'Choose a race in your class.'},400);
   const existing=state.records.find(r=>r.kind==='declaration'&&r.data.boatId===boat.id&&r.data.raceId===race.id);
   operation={kind:'declaration',id:existing?.id,version:body.version,data:{boatId:boat.id,raceId:race.id,submittedBy:String(body.submittedBy||''),outcome:body.outcome,compliant:body.compliant===true,notes:String(body.notes||''),status:'submitted',reviewNote:'',time:new Date().toISOString()}};
  }else return response({error:'Unknown crew action.'},400);
  const next=await commitOperations(operation,`Crew · ${boat.data.name}`);return response({records:competitorRecords(next.records,boat.id)});
 }catch(e){return response({error:e instanceof EventError?e.message:'Unable to save. Refresh and retry.'},e instanceof EventError?e.status:400);}
}
