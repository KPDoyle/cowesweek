import assert from 'node:assert/strict';
import { build } from 'esbuild';
async function module(file){const b=await build({entryPoints:[file],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}
const {seed}=await module('lib/seed.ts'),{applyOperations}=await module('lib/event-state.ts'),{publicProjection}=await module('lib/public-view.ts'),{defaultPlatform,integrationTemplates,resolveIntegrations,platformBrief}=await module('lib/platform-blueprint.ts');
let state={records:structuredClone(seed),audit:[],revision:1};
const plan={...defaultPlatform,name:'Test Regatta Platform',organiser:'Test organising team',gates:['ownership']};
state=applyOperations(state,{kind:'platformplan',id:'plan-test',data:plan});
state=applyOperations(state,{kind:'integrationplan',id:'entry-interface',data:{...integrationTemplates[0],supplier:'Existing supplier',stage:'mapped'}});
assert.equal(resolveIntegrations(state.records).length,9);assert.equal(resolveIntegrations(state.records)[0].data.supplier,'Existing supplier');assert.equal(resolveIntegrations(state.records)[1].record,undefined);
assert.throws(()=>applyOperations(state,{kind:'platformplan',id:'duplicate',data:plan}));
assert.throws(()=>applyOperations(state,{kind:'integrationplan',id:'duplicate',data:integrationTemplates[0]}));
assert.throws(()=>applyOperations(state,{kind:'integrationplan',id:'bad-area',data:{...integrationTemplates[0],area:'unknown'}}));
const exported=platformBrief([...state.records,{id:'private-payment',kind:'payment',version:1,updatedAt:'',data:{notes:'PRIVATE_EXPORT_SENTINEL'}}]);
assert.ok(exported.includes('# Test Regatta Platform'));assert.ok(exported.includes('Existing supplier'));assert.ok(exported.includes('[x] Agree data ownership'));assert.ok(!exported.includes('PRIVATE_EXPORT_SENTINEL'));
const publicRecords=publicProjection(state.records);assert.ok(!publicRecords.some(r=>['platformplan','integrationplan'].includes(r.kind)));assert.equal(state.records.filter(r=>r.kind==='boat').length,14);
console.log('PASS: reusable event template, nine existing-system plans, saved mapping overrides, unique plans, pilot checklist, safe brief export and public-data separation.');
