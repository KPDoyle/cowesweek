import { GET as readData, POST as writeData } from '@/lib/event-service';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(){return readData();}
export async function POST(request:Request){return writeData(request);}
