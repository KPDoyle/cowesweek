'use client';
import { type Entry } from '@/lib/model';
export default function RaceMap({boats,tracks,selected,onSelect,progress,layer,zoom,discipline}:{boats:Entry<'boat'>[],tracks:Entry<'track'>[],selected:string,onSelect:(id:string)=>void,progress:number,layer:string,zoom:number,discipline:string}){
 const project=(lat:number,lon:number)=>discipline==='powerboat'?{x:75+(lon+3.8)/2.6*810,y:335-(lat-50.35)/.65*260}:{x:70+(lon+1.58)/.52*790,y:510-(lat-50.65)/.22*420};
 function position(b:Entry<'boat'>,i:number){const points=tracks.filter(t=>t.data.boatId===b.id).sort((a,b)=>a.data.time.localeCompare(b.data.time));if(points.length){const point=points[Math.min(points.length-1,Math.floor(progress/100*(points.length-1)))];return project(point.data.lat,point.data.lon);}return {x:250+((i*91+progress*(discipline==='powerboat'?5:2.3))%460),y:205+Math.sin((i*1.3+progress/23))*70+i*17};}
 return <svg className="race-map" viewBox="0 0 960 570" role="img" aria-label={`${discipline==='powerboat'?'South coast':'Solent'} illustrative race tracking map`}>
 <defs><pattern id="sea-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#b3c6c9" strokeWidth=".5" opacity=".4"/></pattern><pattern id="land-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#d8dbd1" strokeWidth=".5"/></pattern><linearGradient id="sea" x2="1" y2="1"><stop stopColor="#e7f1f1"/><stop offset="1" stopColor="#d6e6e7"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity=".16"/></filter></defs>
 <rect width="960" height="570" fill="url(#sea)"/><rect width="960" height="570" fill="url(#sea-grid)"/>
 {[0,1,2,3].map(i=><path key={i} d={`M-20 ${195+i*25} Q220 ${100+i*35} 440 ${185+i*27} T1000 ${160+i*25}`} stroke="#c4d8da" strokeWidth="1" fill="none"/>)}
 {discipline==='sailing'?<>
 <path d="M0 0H960V120L905 143L870 120L835 152L815 116L766 157L735 140L690 142L649 177L610 149L586 175L535 136L520 105L491 106L468 171L442 166L434 135L390 122L344 150L326 133L295 163L270 161L232 182L205 170L190 192L163 184L149 205L104 200L88 220L36 216L0 242Z" fill="#f1f1e8" stroke="#a7b5a8" strokeWidth="1.3"/>
 <path d="M116 570L165 506L182 476L213 457L220 438L247 422L261 397L295 383L324 361L372 349L388 327L437 315L465 308L500 315L508 359L523 391L552 372L559 347L582 333L624 344L648 328L680 344L710 347L734 369L789 379L826 413L861 452L913 467L960 506V570Z" fill="#f1f1e8" stroke="#a7b5a8" strokeWidth="1.3"/>
 <path d="M235 510Q420 388 457 397T818 453" fill="none" stroke="#dfcbbb" strokeWidth="3"/><path d="M90 90Q270 190 399 91T890 90" fill="none" stroke="#dfcbbb" strokeWidth="3"/>
 <text x="240" y="90" className="map-label">HAMPSHIRE</text><text x="486" y="488" className="map-label">ISLE OF WIGHT</text><text x="180" y="326" className="water-label" transform="rotate(-15 180 326)">WEST SOLENT</text><text x="714" y="264" className="water-label">EAST SOLENT</text>
 <g className="town"><circle cx="490" cy="317" r="4"/><text x="480" y="342">COWES</text><text x="295" y="416">Yarmouth</text><text x="195" y="193">Lymington</text><text x="795" y="136">Portsmouth</text><text x="820" y="389">Ryde</text><text x="515" y="80">Southampton</text></g>
 <path d="M490 305L272 267L649 211L743 329L490 305" className="course-line"/>
 {[[490,305],[272,267],[649,211],[743,329]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="9" fill={i?'#fff':'#123d43'} stroke="#123d43" strokeWidth="2"/><text x={x} y={y+4} textAnchor="middle" fill={i?'#123d43':'white'} fontSize="10" fontWeight="700">{i||'S'}</text></g>)}
 </>:<>
 <path d="M0 0H960V178L892 167L861 201L806 173L763 215L729 192L690 229L661 194L618 209L581 178L550 192L522 171L480 199L455 236L433 202L401 215L375 249L345 230L319 268L284 234L265 277L224 255L207 296L185 273L146 300L113 263L89 297L76 356L40 379L0 360Z" fill="#f1f1e8" stroke="#a7b5a8" strokeWidth="1.3"/>
 <path d="M780 263L839 235L875 254L899 292L855 311L810 295Z" fill="#f1f1e8" stroke="#a7b5a8"/>
 <text x="180" y="130" className="map-label">DEVON</text><text x="473" y="113" className="map-label">DORSET</text><text x="735" y="120" className="map-label">HAMPSHIRE</text><text x="410" y="420" className="water-label">ENGLISH CHANNEL</text>
 <g className="town"><text x="71" y="350">Torquay</text><text x="340" y="250">Portland</text><text x="575" y="203">Poole</text><text x="813" y="236">Cowes</text></g>
 <path d="M843 235L604 252L355 324L108 363L355 344L604 278L843 235" className="course-line"/>
 {[[843,235],[604,252],[108,363]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="9" fill={i?'white':'#123d43'} stroke="#123d43" strokeWidth="2"/><text x={x} y={y+4} textAnchor="middle" fill={i?'#123d43':'white'} fontSize="10">{i||'S'}</text></g>)}
 </>}
 {layer==='wind' && [1,2,3,4,5,6].map(i=><g key={i} transform={`translate(${i*138-50} ${190+(i%2)*100}) rotate(42)`} opacity=".3"><path d="M0 0V45M-7 8L0 0L7 8" fill="none" stroke="#187c85" strokeWidth="2"/></g>)}
 {layer==='tide' && [1,2,3,4,5].map(i=><g key={i} transform={`translate(${i*170-85} ${320-(i%2)*100})`} opacity=".35"><path d="M0 0H65L55 -7M65 0L55 7" fill="none" stroke="#4386a2" strokeWidth="2"/></g>)}
 <g transform={`translate(${480-480*zoom} ${280-280*zoom}) scale(${zoom})`}>
 {boats.map((b,i)=>{const p=position(b,i);const pts=tracks.filter(t=>t.data.boatId===b.id).sort((a,b)=>a.data.time.localeCompare(b.data.time));return <g key={b.id}>
 {selected===b.id?<path d={pts.length?pts.slice(0,Math.max(1,Math.ceil(progress/100*pts.length))).map((t,n)=>{const pos=project(t.data.lat,t.data.lon);return `${n?'L':'M'}${pos.x} ${pos.y}`;}).join(' '):`M${p.x-100} ${p.y+35}Q${p.x-50} ${p.y+45} ${p.x} ${p.y}`} fill="none" stroke={b.data.colour} strokeWidth="2.5" opacity=".65"/>:null}
 <g role="button" tabIndex={0} aria-label={`Follow ${b.data.name}`} onClick={()=>onSelect(b.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onSelect(b.id);}} className="boat-marker" transform={`translate(${p.x} ${p.y})`}>
 {selected===b.id?<circle r="21" fill={b.data.colour} opacity=".16"/>:null}<path d={discipline==='powerboat'?'M0 -14L8 5L5 11H-5L-8 5Z':'M0 -14L7 4L4 10H-4L-7 4Z'} fill={b.data.colour} stroke="#fff" strokeWidth="2" filter="url(#shadow)"/>
 {selected===b.id || zoom>1?<g><rect x="13" y="-14" width="126" height="27" rx="5" fill="white" filter="url(#shadow)"/><text x="22" y="4" fontSize="11" fill="#16363c" fontWeight="600">{b.data.name}</text></g>:null}
 </g></g>;})}</g>
 <g transform="translate(900 465)"><circle r="30" fill="white" fillOpacity=".75"/><path d="M0 -23L7 9L0 4L-7 9Z" fill="#294b50"/><text y="-34" textAnchor="middle" fontSize="10" fill="#294b50">N</text></g>
 <text x="23" y="541" fontSize="10" fill="#607b80">ILLUSTRATIVE MAP • NOT FOR NAVIGATION</text>
 </svg>;
}
