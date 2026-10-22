import assert from 'node:assert/strict';
import { build } from 'esbuild';
async function module(file,mock=false){const r=await build({entryPoints:[file],bundle:true,write:false,format:'esm',platform:'node',plugins:mock?[{name:'event-test',setup(b){b.onResolve({filter:/(?:@\/lib\/|\.\/)event-service$/},()=>({path:'store',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const readStore=async()=>({state:globalThis.__deliveryTest.state});export const commitOperations=async(body,actor)=>globalThis.__deliveryTest.commit(body,actor);'}));}}]:[]});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}
const {seed}=await module('lib/seed.ts'),{applyOperations}=await module('lib/event-state.ts');
let state={records:structuredClone(seed),audit:[],revision:1};
state=applyOperations(state,{kind:'club',id:'club-test',data:{name:'Test club',email:'results@example.test',classes:'IRC 1',active:true}});
let race=state.records.find(r=>r.id==='race-irc');state=applyOperations(state,{...race,data:{...race.data,published:true}});
globalThis.__deliveryTest={state,commit(body,actor){this.state=applyOperations(this.state,body,actor);return this.state;}};
const service=await module('lib/club-delivery.ts',true);assert.equal(service.deliveryConfigured(),false);await assert.rejects(()=>service.deliverDailyPacks('2026-08-01'));
const originalFetch=globalThis.fetch;let calls=0;const keys=[];
try{
 process.env.CLUB_DELIVERY_URL='https://gateway.example.test/messages';process.env.CLUB_DELIVERY_TOKEN='test-only';process.env.CLUB_DELIVERY_ALLOWED_HOSTS='gateway.example.test';
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url.hostname,'gateway.example.test');const body=JSON.parse(options.body);assert.equal(body.to,'results@example.test');assert.ok(body.text.includes('Test club'));assert.ok(body.attachments[0].content);assert.ok(!JSON.stringify(body).includes('Demo crew roster'));keys.push(options.headers['Idempotency-Key']);return new Response('{}',{status:200,headers:{'x-message-id':'test-id'}});};
 let result=await service.deliverDailyPacks('2026-08-01');assert.equal(result.sent,1);assert.equal(calls,1);assert.ok(globalThis.__deliveryTest.state.records.some(r=>r.kind==='delivery'&&r.data.status==='sent'));
 result=await service.deliverDailyPacks('2026-08-01');assert.equal(result.skipped,1);assert.equal(calls,1);
 const scored=globalThis.__deliveryTest.state.records.find(r=>r.kind==='result'&&r.data.raceId==='race-irc');globalThis.__deliveryTest.commit({...scored,data:{...scored.data,elapsed:scored.data.elapsed+1}});
 result=await service.deliverDailyPacks('2026-08-01');assert.equal(result.sent,1);assert.equal(calls,2);assert.notEqual(keys[0],keys[1]);
 process.env.CLUB_DELIVERY_ALLOWED_HOSTS='different.example.test';await assert.rejects(()=>service.deliverDailyPacks('2026-08-01'));assert.equal(calls,2);
 const route=await module('app/api/club-delivery/route.ts',true);assert.equal((await route.GET(new Request('https://race.example.test/api/club-delivery'))).status,401);
 console.log('PASS: delivery disabled without configuration, approved hosts, recipient/payload scoping, no private data, persistent idempotency, corrected-pack redelivery and cron authentication. No real emails sent.');
}finally{globalThis.fetch=originalFetch;delete globalThis.__deliveryTest;for(const key of ['CLUB_DELIVERY_URL','CLUB_DELIVERY_TOKEN','CLUB_DELIVERY_ALLOWED_HOSTS'])delete process.env[key];}
