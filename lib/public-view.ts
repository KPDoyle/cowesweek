import type { Entry } from './model';
// Allow-list fields and record kinds. Never return the organiser snapshot or audit log.
const fields:Record<string,string[]>={
 event:['name','discipline','description'],boat:['name','number','discipline','className','skipper','club','tcc','colour','status','photoUrl'],race:['name','discipline','className','date','start','status','course','laps','scoring','distance','published','geometry','geometrySource'],result:['raceId','boatId','elapsed','penalty','laps','status','pointsOverride','nonDiscardable'],track:['boatId','raceId','time','lat','lon','speed','heading'],notice:['title','body','discipline','priority','time'],sponsor:['name','tagline','logoUrl','website','placement','target','colour'],media:['title','type','url','body','discipline','raceId','time'],raceevent:['raceId','boatId','type','elapsed','title','body','published'],conditions:['discipline','windSpeed','windFrom','tideSpeed','tideDirection','tackAngle','source','sourceUrl','time'],series:['name','discipline','className','raceIds','discards','minimumRaces','published'],venue:['name','lat','lon','description','url'],
};
const publicationKinds=new Set(['notice','sponsor','media','raceevent','series','venue']);
export function publicProjection(records:Entry[]){
 const allowedBoats=new Set(records.filter(r=>r.kind==='boat'&&r.data.publicSharing!==false).map(r=>r.id));
 return records.flatMap(r=>{
  if(!fields[r.kind]||publicationKinds.has(r.kind)&&!(r.data as Record<string,unknown>).published)return [];
  if(r.kind==='boat'&&!allowedBoats.has(r.id))return [];
  if(['track','result','raceevent'].includes(r.kind)&&((r.data as Record<string,unknown>).boatId)&&!allowedBoats.has(String((r.data as Record<string,unknown>).boatId)))return [];
  if(r.kind==='result'){const race=records.find(x=>x.id===r.data.raceId&&x.kind==='race') as Entry<'race'>|undefined;if(!race||!race.data.published)return [];}
  const data=Object.fromEntries(fields[r.kind].filter(k=>Object.hasOwn(r.data,k)).map(k=>[k,(r.data as Record<string,unknown>)[k]]));
  return [{id:r.id,kind:r.kind,version:r.version,updatedAt:r.updatedAt,data} as Entry];
 });
}
export function withDemoExtras(records:Entry[]){
 // These extras exist only while no organiser-published equivalent exists. They are labelled demonstrations.
 const next=[...records];const add=(kind:Entry['kind'],id:string,data:unknown)=>next.push({id,kind,version:1,updatedAt:'2026-08-01T09:00:00Z',data:data as Entry['data']} as Entry);
 if(!next.some(r=>r.kind==='series'))add('series','demo-series',{name:'Solent Series · demonstration',discipline:'sailing',className:'IRC 1',raceIds:'race-irc,race-irc2',discards:0,minimumRaces:1,published:true});
 if(!next.some(r=>r.kind==='conditions'))for(const discipline of ['sailing','powerboat'])add('conditions',`demo-conditions-${discipline}`,{discipline,windSpeed:14,windFrom:225,tideSpeed:1.8,tideDirection:90,tackAngle:45,source:'sample',sourceUrl:'',time:'2026-08-01T09:00:00Z'});
 if(!next.some(r=>r.kind==='venue'))for(const [i,name,lat,lon,description] of [[1,'The Parade',50.7675,-1.298,'Cowes waterfront viewpoint'],[2,'Egypt Point',50.7708,-1.324,'West Solent shoreline viewpoint'],[3,'Cowes Yacht Haven',50.7612,-1.299,'Marina and event hub']] as const)add('venue',`demo-venue-${i}`,{name,lat,lon,description,url:`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,published:true});
 return next;
}
