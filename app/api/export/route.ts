import { spectatorSnapshot } from '@/lib/spectator-service';
import { prepareRace,raceFrame } from '@/lib/race-engine';
import { csv,type Entry } from '@/lib/model';
export const runtime='nodejs';export const dynamic='force-dynamic';
const xml=(v:unknown)=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export async function GET(request:Request){
 const url=new URL(request.url),format=url.searchParams.get('format')||'json',snapshot=await spectatorSnapshot();
 const races=snapshot.records.filter(r=>r.kind==='race') as Entry<'race'>[],race=races.find(r=>r.id===url.searchParams.get('race'))||races[0];if(!race)return Response.json({error:'No public race found'},{status:404});
 const boats=(snapshot.records.filter(r=>r.kind==='boat') as Entry<'boat'>[]).filter(b=>b.data.discipline===race.data.discipline&&b.data.className===race.data.className&&(!url.searchParams.get('boat')||b.id===url.searchParams.get('boat'))),tracks=snapshot.records.filter(r=>r.kind==='track') as Entry<'track'>[],prepared=prepareRace(race,boats,tracks);
 const count=Array.from(prepared.samples.values()).reduce((n,v)=>n+v.length,0);if(count>20000)return Response.json({error:'This export exceeds 20,000 reports. Export individual boats instead.'},{status:413});
 let body='',contentType='application/json';
 if(format==='csv'){contentType='text/csv';body=csv([['Boat','Number','Time UTC','Latitude','Longitude','Speed kn','Heading','Source'],...boats.flatMap(b=>(prepared.samples.get(b.id)||[]).map(s=>[b.data.name,b.data.number,new Date(s.time).toISOString(),s.point[0],s.point[1],s.speed,s.heading,s.recorded?'GPS':'simulation']))]);}
 else if(format==='gpx'){contentType='application/gpx+xml';body=`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="Cowes Week Live" xmlns="http://www.topografix.com/GPX/1/1" xmlns:cw="https://cowesweek.vercel.app/gpx"><metadata><name>${xml(race.data.name)}${prepared.hasRecorded?'':' — simulated recording'}</name></metadata>${boats.map(b=>`<trk><name>${xml(b.data.name)}</name><trkseg>${(prepared.samples.get(b.id)||[]).map(s=>`<trkpt lat="${s.point[0]}" lon="${s.point[1]}"><time>${new Date(s.time).toISOString()}</time><extensions><cw:speed>${s.speed/1.943844}</cw:speed><cw:heading>${s.heading}</cw:heading><cw:source>${s.recorded?'GPS':'simulation'}</cw:source></extensions></trkpt>`).join('')}</trkseg></trk>`).join('')}</gpx>`;}
 else if(format==='kml'){contentType='application/vnd.google-earth.kml+xml';body=`<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${xml(race.data.name)}</name>${boats.map(b=>`<Placemark><name>${xml(b.data.name)}</name><description>${prepared.hasRecorded?'Recorded GPS':'Simulated course recording'}</description><LineString><coordinates>${(prepared.samples.get(b.id)||[]).map(s=>`${s.point[1]},${s.point[0]},0`).join(' ')}</coordinates></LineString></Placemark>`).join('')}</Document></kml>`;}
 else if(format==='json'){body=JSON.stringify({race,source:prepared.hasRecorded?'recorded GPS':'simulation',boats,positions:raceFrame(prepared,prepared.windowEnd),recordings:boats.map(b=>({boat:b.data.name,samples:prepared.samples.get(b.id)||[]}))});}
 else return Response.json({error:'Choose csv, gpx, kml or json'},{status:400});
 return new Response(body,{headers:{'Content-Type':contentType,'Content-Disposition':`attachment; filename="cowesweek-${race.id}.${format}"`,'Cache-Control':'public, s-maxage=15'}});
}
