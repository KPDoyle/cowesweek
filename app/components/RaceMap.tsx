'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { demoCourse, simulatedPosition, type Position } from '@/lib/race-geometry';
import type { Entry } from '@/lib/model';

type Props = { boats: Entry<'boat'>[]; tracks: Entry<'track'>[]; selected: string; onSelect: (id:string)=>void; progress:number; layer:string; zoom:number; onZoomChange:(zoom:number)=>void; resetKey:number; raceId:string; discipline:string };
type Engine = { L:typeof Leaflet; map:Leaflet.Map; course:Leaflet.LayerGroup; trails:Leaflet.LayerGroup; weather:Leaflet.LayerGroup; nautical:Leaflet.TileLayer; markers:Map<string,{marker:Leaflet.Marker; appearance:string}> };
const tileUrl=process.env.NEXT_PUBLIC_MAP_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const seamarkUrl=process.env.NEXT_PUBLIC_SEAMARK_TILE_URL||'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';
function coordinate(n:number,positive:string,negative:string){return `${Math.abs(n).toFixed(4)}° ${n>=0?positive:negative}`;}

export default function RaceMap({boats,tracks,selected,onSelect,progress,layer,zoom,onZoomChange,resetKey,raceId,discipline}:Props){
  const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null);
  const onSelectRef=useRef(onSelect),onZoomRef=useRef(onZoomChange);
  const [ready,setReady]=useState(false),[mapError,setMapError]=useState(''),[tileError,setTileError]=useState(false),[seamarkError,setSeamarkError]=useState(false),[seamarks,setSeamarks]=useState(true);
  const course=useMemo(()=>demoCourse(discipline,raceId),[discipline,raceId]);
  const reports=useMemo(()=>{const grouped=new Map<string,Entry<'track'>[]>();for(const t of tracks){const list=grouped.get(t.data.boatId)||[];list.push(t);grouped.set(t.data.boatId,list);}for(const list of grouped.values())list.sort((a,b)=>a.data.time.localeCompare(b.data.time));return grouped;},[tracks]);
  const positions=useMemo(()=>boats.map((boat,i)=>{const list=reports.get(boat.id)||[];if(list.length){const index=Math.min(list.length-1,Math.floor(progress/100*(list.length-1))),report=list[index];return {boat,point:[report.data.lat,report.data.lon] as Position,heading:report.data.heading,trail:list.slice(0,index+1).map(t=>[t.data.lat,t.data.lon] as Position),recorded:true};}return {boat,...simulatedPosition(course.points,progress,i),recorded:false};}),[boats,reports,progress,course]);
  const spotlight=positions.find(p=>p.boat.id===selected);
  useEffect(()=>{onSelectRef.current=onSelect;onZoomRef.current=onZoomChange;},[onSelect,onZoomChange]);

  useEffect(()=>{
    let disposed=false;let resize:ResizeObserver|undefined;
    void (async()=>{
      try {
        const module=await import('leaflet');const L=module.default??module;
        if(disposed||!host.current)return;
        const map=L.map(host.current,{zoomControl:false,minZoom:6,maxZoom:18,scrollWheelZoom:false,attributionControl:true});
        map.attributionControl.setPrefix(false);
        // Browser requests preserve Referer and HTTP cache behaviour; only the visible viewport is loaded.
        const tiles=L.tileLayer(tileUrl,{maxZoom:18,keepBuffer:1,updateWhenIdle:true,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'}).addTo(map);
        tiles.on('tileerror',()=>{if(!disposed)setTileError(true);});
        tiles.on('loading',()=>{if(!disposed)setTileError(false);});
        const nautical=L.tileLayer(seamarkUrl,{maxNativeZoom:18,maxZoom:18,keepBuffer:1,updateWhenIdle:true,attribution:'Seamarks © <a href="https://www.openseamap.org/" target="_blank" rel="noreferrer">OpenSeaMap</a> · <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA</a>'});
        nautical.on('tileerror',()=>{if(!disposed)setSeamarkError(true);});
        nautical.on('loading',()=>{if(!disposed)setSeamarkError(false);});
        L.control.scale({position:'bottomleft',imperial:false,maxWidth:100}).addTo(map);
        map.on('zoomend',()=>onZoomRef.current(map.getZoom()));
        engine.current={L,map,nautical,course:L.layerGroup().addTo(map),trails:L.layerGroup().addTo(map),weather:L.layerGroup().addTo(map),markers:new Map()};
        map.setView([50.79,-1.32],11);
        resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe(host.current);
        setReady(true);
      }catch {if(!disposed)setMapError('The map could not load. Refresh to try again.');}
    })();
    return ()=>{disposed=true;resize?.disconnect();engine.current?.map.remove();engine.current=null;};
  },[]);

  useEffect(()=>{
    const e=engine.current;if(!ready||!e)return;
    e.map.fitBounds(course.bounds,{paddingTopLeft:[35,70],paddingBottomRight:[45,90],maxZoom:course.offshore?9:12,animate:false});
  },[ready,course,resetKey]);
  useEffect(()=>{const map=engine.current?.map;if(ready&&map&&map.getZoom()!==zoom)map.setZoom(zoom);},[ready,zoom]);
  useEffect(()=>{const e=engine.current;if(!ready||!e)return;if(seamarks)e.nautical.addTo(e.map);else e.nautical.remove();},[ready,seamarks]);

  useEffect(()=>{
    const e=engine.current;if(!ready||!e)return;const {L}=e;e.course.clearLayers();
    L.polyline(course.points,{color:'#fff',weight:6,opacity:.85,interactive:false}).addTo(e.course);
    L.polyline(course.points,{color:'#1763db',weight:3,dashArray:'9 7',opacity:.85,interactive:false}).addTo(e.course);
    course.marks.forEach((mark,i)=>{
      const label=document.createElement('span');label.textContent=mark.label;
      L.circleMarker(mark.point,{radius:8,color:'#122b50',weight:2,fillColor:i?'#ffdc52':'#122b50',fillOpacity:1}).bindTooltip(label,{permanent:true,direction:i?'bottom':'top',className:'course-mark-label',offset:[0,i?9:-9]}).addTo(e.course);
    });
  },[ready,course]);

  useEffect(()=>{
    const e=engine.current;if(!ready||!e)return;const {L}=e;e.trails.clearLayers();
    const ids=new Set(positions.map(p=>p.boat.id));
    for(const [id,item] of e.markers)if(!ids.has(id)){item.marker.remove();e.markers.delete(id);}
    for(const p of positions){
      const active=p.boat.id===selected;
      const appearance=`${active}-${p.boat.data.colour}-${p.boat.data.name}-${Math.round(p.heading)}`;
      const shape=p.boat.data.discipline==='powerboat'?'M16 4 25 30 22 38H10L7 30Z':'M16 3 24 29 21 38H11L8 29Z';
      const icon=L.divIcon({className:`geographic-boat ${active?'is-selected':''}`,html:`<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true" style="transform:rotate(${Math.round(p.heading)}deg)"><path d="${shape}" fill="${p.boat.data.colour}" stroke="white" stroke-width="2.5"/></svg>`,iconSize:[32,42],iconAnchor:[16,21]});
      let item=e.markers.get(p.boat.id);
      if(!item){
        const marker=L.marker(p.point,{icon,keyboard:true,title:`Follow ${p.boat.data.name}`,alt:p.boat.data.name,riseOnHover:true}).addTo(e.map);
        marker.on('click',()=>onSelectRef.current(p.boat.id));
        const element=marker.getElement();if(element){element.setAttribute('role','button');element.setAttribute('aria-label',`Follow ${p.boat.data.name}`);element.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();onSelectRef.current(p.boat.id);}});}
        item={marker,appearance};e.markers.set(p.boat.id,item);
      }else {item.marker.setLatLng(p.point);if(item.appearance!==appearance){item.marker.setIcon(icon);item.appearance=appearance;}}
      item.marker.setZIndexOffset(active?1000:0);
      const label=document.createElement('span');label.textContent=`${p.boat.data.name}${active?' · '+(p.recorded?'GPS':'demo'):''}`;
      if(!item.marker.getTooltip())item.marker.bindTooltip(label,{permanent:true,direction:'right',offset:[13,0],className:'boat-map-label'});else item.marker.setTooltipContent(label);
      if(p.trail.length>1)L.polyline(p.trail,{color:p.boat.data.colour,weight:active?4:2,opacity:active?.9:.35,interactive:false}).addTo(e.trails);
    }
  },[ready,positions,selected]);

  useEffect(()=>{
    const e=engine.current;if(!ready||!e)return;e.weather.clearLayers();if(layer==='course')return;
    const arrows:Position[]=course.offshore?[[50.48,-1.9],[50.48,-2.35],[50.48,-2.8],[50.48,-3.25]]:[[50.765,-1.47],[50.775,-1.39],[50.798,-1.3],[50.78,-1.21]];
    for(const point of arrows){const label=layer==='wind'?'↗':'→';e.L.marker(point,{interactive:false,keyboard:false,icon:e.L.divIcon({className:`sample-map-arrow ${layer}`,html:`<span>${label}</span><small>${layer==='wind'?'14 kn · sample':'1.8 kn · sample'}</small>`,iconSize:[94,50],iconAnchor:[47,25]})}).addTo(e.weather);}
  },[ready,layer,course]);

  function frameIsland(){engine.current?.map.fitBounds([[50.57,-1.62],[50.95,-1.03]],{padding:[24,45],animate:false});}
  function frameCowes(){engine.current?.map.setView([50.764,-1.297],14,{animate:false});}
  function locateBoat(){if(spotlight&&engine.current)engine.current.map.setView(spotlight.point,Math.max(engine.current.map.getZoom(),course.offshore?10:13),{animate:false});}

  return <div className="geographic-map-shell">
    <div ref={host} className="detailed-race-map" role="region" aria-label={`${course.offshore?'South coast':'Solent'} detailed race tracking map`}/>
    {!ready?<div className="map-loading" role="status">{mapError||'Loading detailed coastal map…'}</div>:null}
    <div className="chart-options" aria-label="Map detail controls"><label><input type="checkbox" checked={seamarks} onChange={e=>setSeamarks(e.target.checked)}/> Seamarks</label><button onClick={frameIsland}>Island overview</button><button onClick={frameCowes}>Cowes harbour</button></div>
    <div className="chart-legend"><span className="legend-course"/> Illustrative course <span className="legend-trail"/> Boat trail</div>
    {spotlight?<button className="map-coordinate" onClick={locateBoat} aria-label={`Locate ${spotlight.boat.data.name} on the map`}><strong>{spotlight.boat.data.name}</strong><span>{coordinate(spotlight.point[0],'N','S')} · {coordinate(spotlight.point[1],'E','W')}</span><small>{spotlight.recorded?'Recorded GPS position':'Simulated position'} · Centre boat ↗</small></button>:null}
    <div className="chart-disclaimer">{tileError?'Some base map tiles are unavailable. ':seamarks&&seamarkError?'Some seamarks are unavailable. ':''}Sample course · Not for navigation</div>
  </div>;
}
