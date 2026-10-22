import { deliveryConfigured,deliverDailyPacks } from '@/lib/club-delivery';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300;
// Vercel Cron authenticates using the project CRON_SECRET. No unauthenticated sends.
export async function GET(request:Request){
 if(process.env.COWES_PUBLIC_ONLY==='1')return Response.json({error:'Organiser service only.'},{status:403});
 if(!process.env.CRON_SECRET||request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return Response.json({error:'Scheduled service authentication required.'},{status:401});
 if(!deliveryConfigured())return Response.json({error:'Email delivery is not configured.'},{status:503});
 try{const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return Response.json(await deliverDailyPacks(date));}catch{return Response.json({error:'Daily distribution failed. Check the delivery log.'},{status:503});}
}
