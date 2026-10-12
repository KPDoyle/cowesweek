'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export type Field = {key:string,label:string,type?:string,options?:{value:string,label:string}[],required?:boolean,min?:number,max?:number,step?:string,wide?:boolean};
export default function Editor({title,fields,values,onClose,onSave,busy,error}:{title:string,fields:Field[],values:Record<string,unknown>,onClose:()=>void,onSave:(data:Record<string,unknown>)=>void,busy:boolean,error:string}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return ()=>dialog?.close();},[]);
 return <dialog ref={ref} className="editor" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const data={...values};for(const f of fields){const v=fd.get(f.key);data[f.key]=f.type==='number'?Number(v):f.type==='checkbox'?v==='on':String(v??'');}onSave(data);}}>
 <div className="dialog-head"><div><p className="eyebrow">RACE OFFICE</p><h2>{title}</h2></div><button type="button" className="icon-btn" aria-label="Close form" onClick={onClose} disabled={busy}><X size={20}/></button></div>
 <div className="form-grid">{fields.map(f=><label key={f.key} className={f.wide?'wide':''}>{f.label}{f.type==='textarea'?<textarea name={f.key} defaultValue={String(values[f.key]??'')} required={f.required} maxLength={2000} rows={4}/>:f.options?<select name={f.key} defaultValue={String(values[f.key]??f.options[0]?.value)} required={f.required}>{f.options.map(o=><option value={o.value} key={o.value}>{o.label}</option>)}</select>:f.type==='checkbox'?<input type="checkbox" name={f.key} defaultChecked={Boolean(values[f.key])}/>:<input name={f.key} type={f.type||'text'} defaultValue={String(values[f.key]??'')} required={f.required} min={f.min} max={f.max} step={f.step} maxLength={240}/>}</label>)}</div>
 {error?<p className="form-error" role="alert">{error}</p>:null}<div className="dialog-foot"><button type="button" className="btn secondary" onClick={onClose} disabled={busy}>Cancel</button><button className="btn primary" disabled={busy}>{busy?'Saving…':'Save changes'}</button></div>
 </form></dialog>;
}
