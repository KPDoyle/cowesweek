import { z } from 'zod';
const text=z.string().trim().max(2000).default('');
export const webUrl=z.string().max(800).default('').refine(v=>{if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}},'Use a public HTTPS URL.');
export function parseGeometry(value:string){
 if(!value.trim())return [];
 const points=JSON.parse(value) as unknown;
 if(!Array.isArray(points)||points.length<2||points.length>150)throw Error('Provide 2–150 course points as [[latitude,longitude], …].');
 return points.map(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<49||p[0]>52||p[1]<-6||p[1]>1)throw Error('Course points must be within the south-coast region.');return p as [number,number];});
}
export const geometryText=z.string().max(12000).default('').refine(v=>{try{parseGeometry(v);return true;}catch{return false;}},'Use 2–150 valid [latitude,longitude] points in a JSON array.');
export const extraSchemas={
 sponsor:z.object({name:z.string().min(1).max(240),tagline:text,logoUrl:webUrl,website:webUrl,placement:z.enum(['centre','class','boat','mark','venue','replay']),target:text,colour:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#1763db'),published:z.boolean().default(false)}),
 media:z.object({title:z.string().min(1).max(240),type:z.enum(['video','photo','report','commentary']),url:webUrl,body:text,discipline:z.enum(['all','sailing','powerboat']),raceId:z.string().max(100).default(''),published:z.boolean().default(false),time:z.string().datetime()}),
 raceevent:z.object({raceId:z.string().min(1).max(100),boatId:z.string().max(100).default(''),type:z.enum(['start','rounding','incident','finish','commentary']),elapsed:z.number().finite().min(0).max(604800),title:z.string().min(1).max(240),body:text,published:z.boolean().default(false)}),
 conditions:z.object({discipline:z.enum(['sailing','powerboat']),windSpeed:z.number().finite().min(0).max(120),windFrom:z.number().finite().min(0).max(360),tideSpeed:z.number().finite().min(0).max(15),tideDirection:z.number().finite().min(0).max(360),tackAngle:z.number().min(20).max(80).default(45),source:z.enum(['sample','manual']),sourceUrl:webUrl,time:z.string().datetime()}),
 series:z.object({name:z.string().min(1).max(240),discipline:z.enum(['sailing','powerboat']),className:z.string().min(1).max(240),raceIds:z.string().min(1).max(2000),discards:z.number().int().min(0).max(10),minimumRaces:z.number().int().min(1).max(100).default(1),published:z.boolean().default(false)}),
 venue:z.object({name:z.string().min(1).max(240),lat:z.number().min(49).max(52),lon:z.number().min(-6).max(1),description:text,url:webUrl,published:z.boolean().default(false)}),
};
