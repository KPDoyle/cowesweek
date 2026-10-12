import { readStore } from './event-service';
import { publicProjection } from './public-view';
import { seed } from './seed';
export async function spectatorSnapshot(){
 try{const {state}=await readStore();return {records:publicProjection(state.records),revision:state.revision,source:'event-workspace',updatedAt:new Date().toISOString(),feedConnected:state.records.some(r=>r.kind==='track')};}
 catch {return {records:publicProjection(seed),revision:0,source:'offline-demonstration',updatedAt:new Date().toISOString(),feedConnected:false};}
}
