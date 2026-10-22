import { deliveryConfigured } from '@/lib/club-delivery';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){if(process.env.COWES_PUBLIC_ONLY==='1')return Response.json({error:'Organiser service only.'},{status:403});return Response.json({clubDelivery:deliveryConfigured(),scheduled:!!process.env.CRON_SECRET},{headers:{'Cache-Control':'no-store'}});}
