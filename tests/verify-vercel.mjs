import assert from 'node:assert/strict';
import { build } from 'esbuild';
const b=await build({entryPoints:['lib/event-service.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const api=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
const originalFetch=globalThis.fetch;let last;
try{
 delete process.env.EVENT_API_ORIGIN;delete process.env.EVENT_API_TOKEN;assert.equal((await api.GET()).status,503);
 process.env.EVENT_API_ORIGIN='https://cowesweek.test.chatgpt.site';process.env.EVENT_API_TOKEN='test-only-service-token';
 globalThis.fetch=async(url,options)=>{last={url:String(url),options};return Response.json({records:[{id:'test'}],audit:[]});};
 let r=await api.GET();assert.equal(r.status,200);assert.equal((await r.json()).records[0].id,'test');assert.equal(last.options.headers['OAI-Sites-Authorization'],'Bearer test-only-service-token');assert.equal(last.options.cache,'no-store');
 r=await api.POST(new Request('https://cowesweek.vercel.app/api/data',{method:'POST',headers:{origin:'https://cowesweek.vercel.app'},body:JSON.stringify({kind:'boat',data:{name:'Demo'}})}));assert.equal(r.status,200);assert.equal(last.options.headers.Origin,'https://cowesweek.test.chatgpt.site');assert.equal(JSON.parse(last.options.body).kind,'boat');
 r=await api.POST(new Request('https://cowesweek.vercel.app/api/data',{method:'POST',headers:{origin:'https://other.test'},body:'{}'}));assert.equal(r.status,403);
 r=await api.POST(new Request('https://cowesweek.vercel.app/api/data',{method:'POST',body:'invalid'}));assert.equal(r.status,400);
 globalThis.fetch=async()=>new Response('<html>Access denied</html>',{status:403,headers:{'content-type':'text/html'}});assert.equal((await api.GET()).status,502);
 globalThis.fetch=async()=>Response.json({error:'Version conflict'},{status:409});assert.equal((await api.GET()).status,409);
 process.env.EVENT_API_ORIGIN='http://unsafe.test';assert.equal((await api.GET()).status,503);
 console.log('PASS: Vercel bridge configuration, relay, credentials, origin, validation, and error handling.');
}finally{globalThis.fetch=originalFetch;delete process.env.EVENT_API_ORIGIN;delete process.env.EVENT_API_TOKEN;}
