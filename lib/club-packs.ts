import { type Entry,scoreResults,duration,csv } from './model';
export function dailyClubPack(records:Entry[],club:Entry<'club'>,date:string){
 const races=records.filter(r=>r.kind==='race'&&r.data.date===date&&r.data.published) as Entry<'race'>[];
 const classes=club.data.classes.split(',').map(c=>c.trim()).filter(Boolean);
 const selected=races.filter(r=>!classes.length||classes.includes(r.data.className)||records.some(p=>p.kind==='prize'&&p.data.clubId===club.id&&p.data.raceId===r.id));
 const boats=records.filter(r=>r.kind==='boat') as Entry<'boat'>[];
 const results=records.filter(r=>r.kind==='result') as Entry<'result'>[];
 const lines:unknown[][]=[['Date','Race','Class','Position','Boat','Sail number','Elapsed','Corrected','Status','Daily prize','Presentation']];
 const paragraphs=[`${club.data.name} — daily results and prizes`,date,'Published results only. Prize assignments are confirmed by the race office.'];
 for(const race of selected){
  const ranked=scoreResults(race.data,results.filter(r=>r.data.raceId===race.id),boats);
  paragraphs.push('',`${race.data.name} · ${race.data.className}`);
  ranked.forEach((r,i)=>{
   const place=r.data.status!=='finished'?'':1+ranked.findIndex(x=>x.data.status==='finished'&&x.corrected===r.corrected&&(race.data.scoring!=='laps'||x.data.laps===r.data.laps));
   const prizes=records.filter(p=>p.kind==='prize'&&p.data.clubId===club.id&&p.data.raceId===race.id&&p.data.boatId===r.data.boatId) as Entry<'prize'>[];
   lines.push([date,race.data.name,race.data.className,place,r.boat?.data.name,r.boat?.data.number,duration(r.data.elapsed),duration(r.corrected),r.data.status,prizes.map(p=>p.data.title).join('; '),prizes.map(p=>p.data.presentation).join('; ')]);
   paragraphs.push(`${place||r.data.status}. ${r.boat?.data.name||r.data.boatId} (${r.boat?.data.number||''}) · ${duration(r.corrected)}${prizes.length?' · '+prizes.map(p=>`${p.data.title}: ${p.data.presentation}`).join('; '):''}`);
  });
 }
 const body=paragraphs.join('\n'),fingerprint=JSON.stringify(lines);
 // Deterministic content signature used to flag packs that need exporting again.
 let hash=2166136261;for(let i=0;i<fingerprint.length;i++)hash=Math.imul(hash^fingerprint.charCodeAt(i),16777619);
 return {subject:`Cowes Week · ${date} · ${club.data.name}`,body,csv:csv(lines),fingerprint:(hash>>>0).toString(16),races:selected.length,rows:lines.length-1};
}
