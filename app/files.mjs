import {ROW_KEYS,MAX_BYTES,MAX_ROWS,blankRow,VERSION} from './catalog.mjs';
import {validateRows,validateCase,parseCase} from './schema.mjs';
import {analyzeCase} from './engine.mjs';
export {parseCase};
const bytes=text=>new TextEncoder().encode(text).length;
export function parseCSV(text) {
  if(typeof text!=='string'||bytes(text)>MAX_BYTES) throw new Error('File exceeds the 256 KiB limit.');
  text=text.replace(/^\uFEFF/,'');
  const records=[];let row=[],field='',quoted=false,closed=false,started=false;
  const pushField=()=>{row.push(field);field='';closed=false;};
  const pushRow=()=>{pushField();records.push(row);row=[];started=false;if(records.length>MAX_ROWS+1)throw new Error('Too many CSV records.');};
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(quoted) {if(ch==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=ch;continue;}
    if(ch==='"'){if(field!==''||closed)throw new Error('Invalid CSV quoting.');quoted=true;started=true;continue;}
    if(ch===','){pushField();started=true;continue;}
    if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;pushRow();continue;}
    if(closed)throw new Error('Unexpected characters after a quoted field.');
    field+=ch;started=true;
  }
  if(quoted)throw new Error('Unclosed CSV quote.');
  if(started||field!==''||row.length)pushRow();
  if(!records.length || records[0].length!==ROW_KEYS.length || records[0].some((k,i)=>k!==ROW_KEYS[i])) throw new Error(`Use exactly these CSV columns: ${ROW_KEYS.join(',')}. No identifiers or extra columns are accepted.`);
  const rows=records.slice(1).map((record,index)=>{
    if(record.every(v=>v==='') && (record.length===1||record.length===ROW_KEYS.length)) return blankRow();
    if(record.length!==ROW_KEYS.length)throw new Error(`CSV row ${index+2} has the wrong column count.`);
    const r=Object.fromEntries(ROW_KEYS.map((key,i)=>[key,record[i]===''?null:record[i]]));
    for(const key of ['planned_min','actual_min','value']) if(r[key]!==null){
      if(!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(r[key]))throw new Error(`CSV row ${index+2}: numeric values only; formulas and free text are rejected.`);
      r[key]=Number(r[key]);
    }
    return r;
  });
  validateRows(rows);return rows;
}
const cell=value=>{const s=value===null||value===undefined?'':String(value);return /[",\r\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;};
const encode=records=>records.map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n';
export function rowsCSV(rows){validateRows(rows);return encode([ROW_KEYS,...rows.map(r=>ROW_KEYS.map(k=>r[k]))]);}
export function caseJSON(c){validateCase(c);return JSON.stringify(c,null,2)+'\n';}
export function analysisCSV(c) {
  const a=analyzeCase(c);
  const records=[['studio_version','protocol','row','analyte','planned_min','actual_min','source_value','source_unit','qualifier','assay','normalized_value','normalized_unit','quality_codes']];
  c.rows.forEach((r,i)=>{
    const s=a.series[r.analyte],p=s?.points.find(p=>p.row===i+1);
    const codes=a.issues.filter(x=>x.rows.includes(i+1)).map(x=>x.code);
    // Censored bounds remain bounds in the derived export; never relabel them as exact results.
    records.push([VERSION,c.protocol,i+1,r.analyte,r.planned_min,r.actual_min,r.value,r.unit,r.qualifier,r.assay,p?.normalized.value,p?.normalized.unit,codes.join('|')]);
  });
  return encode(records);
}
