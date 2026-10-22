import { createHash,randomBytes } from 'node:crypto';
import { type Entry } from './model';
export const crewCookie='cw_crew';
export const hashCode=(code:string)=>createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
export const newCode=()=>`CW-${randomBytes(16).toString('hex').toUpperCase()}`;
export function accessForCode(records:Entry[],code:string){
 if(!/^CW-[A-Fa-f0-9]{32}$/.test(code))return undefined;
 const hash=hashCode(code);
 return records.find(r=>r.kind==='crewaccess'&&r.data.active&&r.data.codeHash===hash&&Date.parse(r.data.expiresAt)>Date.now()) as Entry<'crewaccess'>|undefined;
}
export function competitorRecords(records:Entry[],boatId:string){
 const boat=records.find(r=>r.kind==='boat'&&r.id===boatId) as Entry<'boat'>|undefined;
 if(!boat)return [];
 return records.flatMap<Entry>(r=>{
  if(r.kind==='boat'&&r.id===boatId){const {contact,...data}=r.data;void contact;return [{...r,data:{...data,contact:''}}];}
  if(r.kind==='race'&&r.data.discipline===boat.data.discipline&&r.data.className===boat.data.className)return [r];
  if(r.kind==='declaration'&&r.data.boatId===boatId)return [r];
  if(r.kind==='shoreevent'&&r.data.published&&['everyone','competitors'].includes(r.data.audience)&&(r.data.discipline==='all'||r.data.discipline===boat.data.discipline))return [r];
  if(r.kind==='benefit'&&r.data.active&&(r.data.discipline==='all'||r.data.discipline===boat.data.discipline))return [r];
  if(r.kind==='communication'&&r.data.published&&['everyone','competitors'].includes(r.data.audience)&&(r.data.discipline==='all'||r.data.discipline===boat.data.discipline)&&(!r.data.className||r.data.className===boat.data.className))return [r];
  if(r.kind==='forecast'&&r.data.published&&r.data.discipline===boat.data.discipline)return [r];
  if(r.kind==='notice'&&r.data.published&&(r.data.discipline==='all'||r.data.discipline===boat.data.discipline))return [r];
  return [];
 });
}
