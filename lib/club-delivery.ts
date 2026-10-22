import { createHash } from 'node:crypto';
import { type Entry } from './model';
import { dailyClubPack } from './club-packs';
import { readStore,commitOperations } from './event-service';
export function deliveryConfigured(){return !!(process.env.CLUB_DELIVERY_URL&&process.env.CLUB_DELIVERY_TOKEN&&process.env.CLUB_DELIVERY_ALLOWED_HOSTS);}
export async function deliverDailyPacks(date:string){
 if(!deliveryConfigured())throw Error('Connect an approved email delivery endpoint before enabling scheduled distribution.');
 const url=new URL(process.env.CLUB_DELIVERY_URL!);
 const hosts=(process.env.CLUB_DELIVERY_ALLOWED_HOSTS||'').split(',').map(v=>v.trim());
 if(url.protocol!=='https:'||url.username||url.password||!hosts.includes(url.hostname)||/^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)||url.hostname.includes(':')||url.hostname.endsWith('.local')||url.hostname==='localhost')throw Error('Configure an approved HTTPS delivery hostname.');
 const {state}=await readStore();const clubs=state.records.filter(r=>r.kind==='club'&&r.data.active) as Entry<'club'>[];
 let sent=0,skipped=0,failed=0;
 for(const club of clubs){
  const pack=dailyClubPack(state.records,club,date);if(!pack.rows){skipped++;continue;}
  const idempotencyKey=createHash('sha256').update(`${club.id}:${club.data.email}:${date}:${pack.csv}`).digest('hex');
  // Both the provider and our durable delivery record enforce idempotency.
  // The configured gateway MUST honour Idempotency-Key for concurrent/retried calls.
  const existing=state.records.find(r=>r.kind==='delivery'&&r.data.clubId===club.id&&r.data.date===date&&r.data.fingerprint===idempotencyKey) as Entry<'delivery'>|undefined;
  if(existing?.data.status==='sent'){skipped++;continue;}
  try{
   const response=await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(12000),headers:{Authorization:`Bearer ${process.env.CLUB_DELIVERY_TOKEN}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({to:club.data.email,subject:pack.subject,text:pack.body,attachments:[{filename:`cowesweek-${date}.csv`,content:Buffer.from(pack.csv).toString('base64'),contentType:'text/csv'}]})});
   if(!response.ok)throw Error(`Delivery gateway returned HTTP ${response.status}`);
   await commitOperations({kind:'delivery',id:existing?.id,version:existing?.version,data:{clubId:club.id,date,fingerprint:idempotencyKey,status:'sent',providerReference:response.headers.get('x-message-id')||'',time:new Date().toISOString(),error:''}},'Scheduled club distribution');sent++;
  }catch(e){failed++;try{await commitOperations({kind:'delivery',id:existing?.id,version:existing?.version,data:{clubId:club.id,date,fingerprint:idempotencyKey,status:'failed',providerReference:'',time:new Date().toISOString(),error:e instanceof Error?e.message:'Delivery failed'}},'Scheduled club distribution');}catch{/* the same idempotency key safely retries after a storage conflict */}}
 }
 return {sent,skipped,failed};
}
