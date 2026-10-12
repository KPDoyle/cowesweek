import { schemas,requiredChecks,type Entry,type Kind } from './model';
export type Audit={id:string,action:string,record_id:string,actor:string,time:string};
export type EventState={records:Entry[],audit:Audit[],revision:number};
export class EventError extends Error {constructor(message:string,public status=400){super(message);}}
export function validateSnapshot(raw:unknown):EventState {
 const state=raw as EventState;
 if(!state||!Array.isArray(state.records)||!Array.isArray(state.audit))throw new EventError('Invalid migration snapshot',503);
 const ids=new Set<string>();
 for(const record of state.records){
  if(!record||typeof record.id!=='string'||ids.has(record.id)||!Object.hasOwn(schemas,record.kind)||!Number.isInteger(record.version)||record.version<1)throw new EventError('Invalid record in migration snapshot',503);
  schemas[record.kind].parse(record.data);ids.add(record.id);
 }
 return {records:state.records,audit:state.audit,revision:state.revision||1};
}
export function applyOperations(state:EventState,raw:unknown,actor='Race office'):EventState {
 const body=raw as {operations?:unknown[]};const operations=Array.isArray(body?.operations)?body.operations:[body];
 if(operations.length<1||operations.length>500)throw new EventError('Please submit between 1 and 500 records.');
 let records=[...state.records];const additions:Audit[]=[];const keys=new Set<string>();const now=new Date().toISOString();
 for(const item of operations){
  const op=item as {kind:Kind,id?:string,version?:number,data?:unknown,delete?:boolean};
  if(!op||!Object.hasOwn(schemas,op.kind))throw new EventError('Unknown record type');
  const id=op.id||crypto.randomUUID();if(typeof id!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(id))throw new EventError('Invalid record ID');
  if(keys.has(id))throw new EventError('Duplicate records in import');keys.add(id);
  const existing=records.find(r=>r.id===id);if(existing&&existing.kind!==op.kind)throw new EventError('Record type mismatch');
  if(existing&&op.version!==existing.version)throw new EventError('This record was updated elsewhere. Refresh before saving.',409);
  if(op.delete){
   if(!existing)throw new EventError('Record no longer exists',409);
   if(op.kind==='event')throw new EventError('Events cannot be deleted');
   if(records.some(r=>{const d=r.data as Record<string,unknown>;return r.id!==id&&[d.boatId,d.raceId].includes(id);}))throw new EventError('This record is in use. Remove its linked results, tracks or berth allocation first.');
   records=records.filter(r=>r.id!==id);
  }else{
   const parsed=schemas[op.kind].safeParse(op.data);if(!parsed.success)throw new EventError(parsed.error.issues.map(x=>`${x.path.join('.')}: ${x.message}`).join('; '));
   const d=parsed.data as Record<string,unknown>;
   if(d.boatId&&!records.some(r=>r.kind==='boat'&&r.id===d.boatId))throw new EventError('Choose an existing boat');
   if(d.raceId){const race=records.find(r=>r.kind==='race'&&r.id===d.raceId) as Entry<'race'>|undefined;if(!race)throw new EventError('Choose an existing race');const boat=records.find(r=>r.kind==='boat'&&r.id===d.boatId) as Entry<'boat'>|undefined;if(boat&&(race.data.discipline!==boat.data.discipline||race.data.className!==boat.data.className))throw new EventError('The boat must belong to the selected race class');}
   if(op.kind==='series'){const ids=String(d.raceIds).split(',').map(v=>v.trim());if(!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!records.some(r=>r.kind==='race'&&r.id===id&&r.data.discipline===d.discipline&&r.data.className===d.className)))throw new EventError('Choose unique existing races from the selected class.');}
   if(op.kind==='boat'&&d.status==='checked-in'&&!requiredChecks(String(d.discipline)).every(c=>(d.checks as string[]).includes(c)))throw new EventError('Complete the readiness checklist before check-in.');
   if(op.kind==='berth'&&((d.status==='available'&&d.boatId)||(d.status==='occupied'&&!d.boatId)))throw new EventError('Available berths must be unallocated; occupied berths need a boat.');
   if(op.kind==='result'&&records.some(r=>r.kind==='result'&&r.id!==id&&(r.data as Record<string,unknown>).raceId===d.raceId&&(r.data as Record<string,unknown>).boatId===d.boatId))throw new EventError('This boat already has a result in this race. Edit the existing result.',409);
   if(op.kind==='berth'&&d.boatId&&records.some(r=>r.kind==='berth'&&r.id!==id&&(r.data as Record<string,unknown>).boatId===d.boatId))throw new EventError('This boat is already allocated a berth.',409);
   const record={id,kind:op.kind,data:parsed.data,version:(existing?.version||0)+1,updatedAt:now} as Entry;
   records=[record,...records.filter(r=>r.id!==id)];
  }
  additions.unshift({id:crypto.randomUUID(),action:`${op.delete?'Deleted':existing?'Updated':'Created'} ${op.kind}`,record_id:id,actor,time:now});
 }
 return {records,audit:[...additions,...state.audit],revision:state.revision+1};
}
