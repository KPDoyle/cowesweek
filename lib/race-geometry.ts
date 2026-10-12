export type Position = [number, number];
export type CourseMark = { label: string; point: Position };
export type DemoCourse = { title: string; points: Position[]; marks: CourseMark[]; bounds: [Position, Position]; offshore: boolean };

const solent: Position[] = [[50.779,-1.302],[50.769,-1.36],[50.749,-1.43],[50.732,-1.491],[50.738,-1.515],[50.756,-1.43],[50.787,-1.34],[50.795,-1.25],[50.782,-1.16],[50.785,-1.23],[50.779,-1.302]];
const outward: Position[] = [[50.779,-1.302],[50.75,-1.45],[50.70,-1.56],[50.66,-1.63],[50.65,-1.93],[50.43,-2.46],[50.51,-2.92],[50.455,-3.48]];
const windward: Position[] = [[50.779,-1.302],[50.798,-1.35],[50.773,-1.325],[50.791,-1.29],[50.779,-1.302]];

export function demoCourse(discipline: string, raceId: string): DemoCourse {
  if(discipline==='powerboat' && raceId!=='race-power3') return {
    title:'Cowes–Torquay–Cowes', offshore:true,
    points:[...outward,...outward.slice(0,-1).reverse()],
    marks:[{label:'S / F · Cowes',point:outward[0]},{label:'1 · Poole Bay',point:outward[4]},{label:'2 · Torquay turn',point:outward[7]}],
    bounds:[[50.33,-3.61],[50.90,-1.1]],
  };
  const j70=raceId==='race-j70';
  return {title:j70?'Cowes windward / leeward':'West & East Solent',offshore:false,
    points:j70?windward:solent,
    marks:j70?[{label:'S / F · Cowes',point:windward[0]},{label:'1 · Windward',point:windward[1]},{label:'2 · Leeward',point:windward[2]}]:[{label:'S / F · Cowes',point:solent[0]},{label:'1 · West Solent',point:solent[4]},{label:'2 · East Solent',point:solent[8]}],
    bounds:j70?[[50.755,-1.39],[50.819,-1.26]]:[[50.675,-1.6],[50.89,-1.08]],
  };
}

function distance(a: Position,b: Position){
  const latitude=(a[0]+b[0])/2*Math.PI/180;
  return Math.hypot(b[0]-a[0],(b[1]-a[1])*Math.cos(latitude));
}

/** Advance by distance along the water route, with small fleet separation. */
export function simulatedPosition(points: Position[], progress: number, fleetIndex: number){
  const fraction=Math.max(0,Math.min(1,progress/100-fleetIndex*.025));
  const lengths=points.slice(1).map((p,i)=>distance(points[i],p));
  let remaining=lengths.reduce((sum,n)=>sum+n,0)*fraction;
  let segment=0;
  while(segment<lengths.length-1 && remaining>lengths[segment]){remaining-=lengths[segment];segment++;}
  const a=points[segment],b=points[segment+1];
  const t=lengths[segment]?Math.min(1,remaining/lengths[segment]):0;
  const offset=Math.sin(fleetIndex*1.7)*.00065*Math.sin(Math.PI*fraction);
  const point:Position=[a[0]+(b[0]-a[0])*t+offset,a[1]+(b[1]-a[1])*t+offset];
  const heading=(Math.atan2((b[1]-a[1])*Math.cos(a[0]*Math.PI/180),b[0]-a[0])*180/Math.PI+360)%360;
  return {point,heading,trail:[...points.slice(0,segment+1),point]};
}
