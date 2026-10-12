// Vercel server-only bridge to the existing private persistent event database.
// All deployment URLs must retain Vercel Authentication until app-level roles exist.
const json=(body:unknown,status:number)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function relay(method:string,body?:string){
 const origin=process.env.EVENT_API_ORIGIN,token=process.env.EVENT_API_TOKEN;
 if(!origin||!token)return json({error:'The event database connection is not configured.'},503);
 try{
  const url=new URL('/api/data',origin);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.chatgpt.site'))return json({error:'Invalid event database configuration.'},503);
  const result=await fetch(url,{method,headers:{'OAI-Sites-Authorization':`Bearer ${token}`,'Content-Type':'application/json',Origin:url.origin},body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(25000)});
  if(!result.headers.get('content-type')?.includes('application/json'))return json({error:'The event database is temporarily unavailable.'},502);
  const data=await result.json();return json(data,result.status);
 }catch{return json({error:'Unable to reach the event database. Please retry.'},502);}
}
export async function GET(){return relay('GET');}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Origin not allowed'},403);
 if(Number(request.headers.get('content-length')||0)>2000000)return json({error:'Import exceeds 2 MB'},413);
 const body=await request.text();if(body.length>2000000)return json({error:'Import exceeds 2 MB'},413);
 try{JSON.parse(body);}catch{return json({error:'Invalid request JSON'},400);}
 return relay('POST',body);
}
