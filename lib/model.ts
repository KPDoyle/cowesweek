import { z } from 'zod';
import { extraSchemas,geometryText,webUrl } from './spectator-model';
const str = z.string().trim().min(1).max(240);
const short = z.string().trim().max(2000).default('');
const discipline = z.enum(['sailing','powerboat']);
const nonnegative = z.number().finite().min(0);
export const schemas = {
 ...extraSchemas,
 event: z.object({name:str,discipline,organiser:str,description:short}),
 boat: z.object({name:str,number:str,discipline,className:str,skipper:str,club:short,tcc:z.number().finite().min(0.1).max(3),crew:short,contact:short,berth:short,colour:z.string().regex(/^#[a-fA-F0-9]{6}$/),photoUrl:webUrl,publicSharing:z.boolean().default(true),checks:z.array(z.enum(['insurance','licence','briefing','equipment','scrutineering'])).default([]),status:z.enum(['entered','checked-in','withdrawn'])}),
 race: z.object({name:str,discipline,className:str,date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),start:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),status:z.enum(['scheduled','racing','postponed','finished','abandoned']),course:short,laps:z.number().int().min(1).max(100),scoring:z.enum(['IRC','elapsed','laps']),distance:nonnegative.max(1000),published:z.boolean().default(false),geometry:geometryText,geometrySource:z.enum(['illustrative','organiser']).default('illustrative')}),
 result: z.object({raceId:str,boatId:str,elapsed:nonnegative.max(604800),penalty:nonnegative.max(604800),laps:z.number().int().min(0).max(100),status:z.enum(['finished','DNS','DNF','DSQ','DNE','RDG']),note:short,pointsOverride:z.number().min(0).max(10000).optional(),nonDiscardable:z.boolean().default(false)}),
 notice: z.object({title:str,body:short,discipline:z.enum(['all','sailing','powerboat']),priority:z.enum(['info','important']),published:z.boolean().default(false),time:str}),
 incident: z.object({title:str,boatId:short,location:str,priority:z.enum(['low','medium','high']),status:z.enum(['open','responding','resolved']),notes:short,time:str}),
 protest: z.object({raceId:str,boatId:str,against:short,description:short,status:z.enum(['submitted','hearing','decided','withdrawn']),decision:short}),
 berth: z.object({name:str,location:str,length:nonnegative.max(200),boatId:short,status:z.enum(['available','occupied','reserved']),notes:short}),
 track: z.object({boatId:str,raceId:z.string().max(100).default(''),time:z.string().datetime(),lat:z.number().finite().min(49).max(52),lon:z.number().finite().min(-6).max(1),speed:nonnegative.max(200),heading:nonnegative.max(360)}),
};
export type Kind = keyof typeof schemas;
export type Entry<K extends Kind = Kind> = K extends Kind ? {id:string,kind:K,version:number,updatedAt:string,data:z.infer<typeof schemas[K]>}:never;
export type Boat = z.infer<typeof schemas.boat>;
export type Race = z.infer<typeof schemas.race>;
export type Result = z.infer<typeof schemas.result>;
export function scoreResults(race:Race, results:Entry<'result'>[], boats:Entry<'boat'>[]) {
 return results.map(r=>{const b=boats.find(b=>b.id===r.data.boatId);return {...r,boat:b,corrected:Math.round((race.scoring==='IRC'?r.data.elapsed*(b?.data.tcc??1):r.data.elapsed)+r.data.penalty)};}).sort((a,b)=>{
  const aValid=a.data.status==='finished',bValid=b.data.status==='finished';
  if(aValid!==bValid)return aValid?-1:1;
  if(race.scoring==='laps' && aValid && bValid && a.data.laps!==b.data.laps)return b.data.laps-a.data.laps;
  return a.corrected-b.corrected;
 });
}
export function duration(s:number) {return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s%3600/60).toString().padStart(2,'0')}:${Math.round(s%60).toString().padStart(2,'0')}`;}
export function csv(rows:unknown[][]) {return rows.map(row=>row.map(value=>{let v=String(value??'');if(typeof value!=='number'&&/^[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export const requiredChecks=(d:string)=>d==='powerboat'?['insurance','licence','briefing','equipment','scrutineering']:['insurance','briefing','equipment'];
