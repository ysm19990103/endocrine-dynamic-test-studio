import {SCHEMA,VERSION,MAX_ROWS,MAX_BYTES,ANALYTES,ASSAYS,PROTOCOLS,GH_PROFILES,ACTH_PROFILES,DST_PROFILES,ROW_KEYS} from './catalog.mjs';
const fail=msg=>{throw new Error(msg);};
function object(value,keys,label) {
  if(!value || Array.isArray(value) || typeof value!=='object') fail(`${label}: object required.`);
  const actual=Object.keys(value);
  if(actual.length!==keys.length || actual.some(k=>!keys.includes(k))) fail(`${label}: unexpected or missing fields. Only the documented anonymous schema is accepted.`);
}
function member(value,list,label,nullable=false) {
  if(nullable && value===null) return;
  if(!list.includes(value)) fail(`${label}: unsupported selection.`);
}
function numeric(value,label,max,nullable=true) {
  if(nullable && value===null) return;
  if(typeof value!=='number' || !Number.isFinite(value) || value<0 || value>max) fail(`${label}: expected a finite nonnegative number ≤${max}.`);
}
function bool(value,label){if(typeof value!=='boolean') fail(`${label}: expected true or false.`);}
export function validateRows(rows) {
  if(!Array.isArray(rows) || rows.length>MAX_ROWS) fail(`At most ${MAX_ROWS} rows are supported.`);
  rows.forEach((r,i)=>{
    const label=`Row ${i+1}`;object(r,ROW_KEYS,label);
    numeric(r.planned_min,`${label} planned time`,1440);numeric(r.actual_min,`${label} actual time`,1440);
    numeric(r.value,`${label} result`,1000000000);
    member(r.analyte,Object.keys(ANALYTES),label,true);
    member(r.qualifier,['eq','lt','gt'],label,true);member(r.assay,Object.keys(ASSAYS),label,true);
    const units=r.analyte?ANALYTES[r.analyte].units:[...new Set(Object.values(ANALYTES).flatMap(a=>a.units))];
    member(r.unit,units,`${label} unit`,true);
  });
  return rows;
}
export function validateCase(c) {
  object(c,['schema','version','protocol','scenario','context','settings','igf1','rows'],'Case');
  member(c.schema,[SCHEMA],'Schema');member(c.version,[VERSION],'Version');
  member(c.protocol,Object.keys(PROTOCOLS),'Protocol');member(c.scenario,['ogtt','acth','dst','quality','custom'],'Scenario');
  const contextKeys=['adult','protocol','assay','confoundersReviewed','plasma'];
  object(c.context,contextKeys,'Context');contextKeys.forEach(k=>bool(c.context[k],`Context ${k}`));
  object(c.settings,['ghProfile','ghCutoff','acthProfile','acthTime','acthCutoff','acthUnit','dstProfile'],'Settings');
  member(c.settings.ghProfile,Object.keys(GH_PROFILES),'GH profile');numeric(c.settings.ghCutoff,'GH threshold',1000000);
  member(c.settings.acthProfile,Object.keys(ACTH_PROFILES),'ACTH profile');member(c.settings.acthTime,['30','60','both'],'ACTH timing');
  numeric(c.settings.acthCutoff,'Cortisol threshold',1000000);member(c.settings.acthUnit,['ug/dL','nmol/L'],'Cortisol unit');
  member(c.settings.dstProfile,Object.keys(DST_PROFILES),'DST profile');
  object(c.igf1,['value','uln','unit','ulnUnit','referenceConfirmed'],'IGF-1');numeric(c.igf1.value,'IGF-1',1000000);numeric(c.igf1.uln,'IGF-1 ULN',1000000);
  member(c.igf1.unit,['ng/mL','ug/L'],'IGF-1 unit');member(c.igf1.ulnUnit,['ng/mL','ug/L'],'ULN unit');bool(c.igf1.referenceConfirmed,'IGF-1 reference');
  validateRows(c.rows);return c;
}
export function parseCase(text) {
  if(typeof text!=='string' || new TextEncoder().encode(text).length>MAX_BYTES) fail('File exceeds the 256 KiB limit.');
  let value;try{value=JSON.parse(text);}catch{fail('The file is not valid JSON.');}
  validateCase(value);return structuredClone(value);
}
export const isBlank = r => ROW_KEYS.every(k=>r[k]===null);
