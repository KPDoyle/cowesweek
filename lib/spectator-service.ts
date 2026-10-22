import { readStore } from './event-service';
import { publicProjection } from './public-view';
import { seed } from './seed';
export async function spectatorSnapshot(){
 try{const {state}=await readStore();const records=publicProjection(state.records);return {records,revision:state.revision,source:'event-workspace',updatedAt:new Date().toISOString(),feedConnected:records.some(r=>r.kind==='track')};}
 catch {return {records:publicProjection(seed),revision:0,source:'offline-demonstration',updatedAt:new Date().toISOString(),feedConnected:false};}
}
