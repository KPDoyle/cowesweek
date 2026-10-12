import { spectatorSnapshot } from '@/lib/spectator-service';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(await spectatorSnapshot(),{headers:{'Cache-Control':'public, s-maxage=15, stale-while-revalidate=30','X-Cowes-View':'public-read-only'}});}
