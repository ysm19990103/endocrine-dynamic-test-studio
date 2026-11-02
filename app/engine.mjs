import {ANALYTES,GH_PROFILES,ACTH_PROFILES,DST_PROFILES} from './catalog.mjs';
import {isBlank,validateCase} from './schema.mjs';
import {normalize,compareUnits} from './units.mjs';
const issue=(code,message,rows=[],severity='hold')=>({code,message,rows,severity});
export function expectedTimes(c,analyte) {
  if(c.protocol==='ogtt') return analyte==='glucose'?[0,120]:['gh','insulin','gip_total','gip_active'].includes(analyte)?[0,30,60,90,120]:[];
  if(c.protocol==='acth' && analyte==='cortisol') return [0,...(c.settings.acthTime==='both'?[30,60]:[Number(c.settings.acthTime)])];
  if(c.protocol==='dst' && analyte==='cortisol') return [0];
  return [];
}
export function analyzeSeries(c,analyte) {
  const rows=c.rows.map((r,i)=>({...r,row:i+1})).filter(r=>r.analyte===analyte);
  const issues=[];const expected=expectedTimes(c,analyte);
  for(const r of rows) {
    if(['planned_min','actual_min','value','unit','qualifier','assay'].some(k=>r[k]===null)) issues.push(issue('incomplete','Incomplete sample; blanks are not zero.',[r.row]));
    if(r.assay==='unknown') issues.push(issue('unknown_assay','Assay/method has not been specified.',[r.row]));
    if(r.planned_min!==null && r.actual_min!==null && r.planned_min!==r.actual_min) issues.push(issue('timing','Actual time differs from planned time. Reference comparison is held.',[r.row]));
    if(r.qualifier && r.qualifier!=='eq') issues.push(issue('censored','Censored result is retained as a bound; no exact-value substitution.',[r.row]));
    if(c.protocol==='ogtt' && r.planned_min!==null && ![0,30,60,90,120].includes(r.planned_min)) issues.push(issue('off_schedule','Sample is outside the supported OGTT schedule.',[r.row]));
    if(c.protocol==='acth' && analyte==='cortisol' && r.planned_min!==null && ![0,30,60].includes(r.planned_min)) issues.push(issue('off_schedule','Sample is outside the supported ACTH schedule.',[r.row]));
    if(c.protocol==='dst' && analyte==='cortisol' && r.planned_min!==null && r.planned_min!==0) issues.push(issue('off_schedule','DST uses one completed morning collection, indexed at minute 0.',[r.row]));
  }
  for(const key of ['planned_min','actual_min']) {
    const groups=new Map();for(const r of rows) if(r[key]!==null) groups.set(r[key],[...(groups.get(r[key])||[]),r.row]);
    for(const [time,ids] of groups) if(ids.length>1) issues.push(issue('duplicate',`Duplicate ${key==='planned_min'?'planned':'actual'} time (${time} min); values are not averaged.`,ids));
  }
  for(const time of expected) if(!rows.some(r=>r.planned_min===time)) issues.push(issue('missing_time',`Missing planned ${time}-minute sample.`));
  const assays=new Set(rows.map(r=>r.assay).filter(Boolean));
  if(assays.size>1) issues.push(issue('mixed_assays','Multiple assay/method declarations; series are not pooled.',rows.map(r=>r.row)));
  const points=rows.filter(r=>r.actual_min!==null && r.value!==null && r.unit!==null).map(r=>({...r,normalized:normalize(analyte,r.value,r.unit)})).sort((a,b)=>a.actual_min-b.actual_min||a.row-b.row);
  const families=new Set(points.map(p=>p.normalized.unit));
  if(families.size>1) issues.push(issue('mixed_units','Units require an assay-specific conversion that this studio does not assume.',rows.map(r=>r.row)));
  const arithmeticHolds=issues.filter(x=>x.code!=='timing'&&x.code!=='off_schedule');
  const metrics=arithmeticHolds.length===0 && points.length>0 ? (()=>{
    const values=points.map(p=>p.normalized.value), peak=Math.max(...values),nadir=Math.min(...values);
    const baseline=points.find(p=>p.planned_min===0)?.normalized.value??null;
    const auc=points.length>=2?points.slice(1).reduce((sum,p,i)=>sum+(p.actual_min-points[i].actual_min)*(p.normalized.value+points[i].normalized.value)/2,0):null;
    return {peak,nadir,peakAt:points.filter(p=>p.normalized.value===peak).map(p=>p.actual_min),nadirAt:points.filter(p=>p.normalized.value===nadir).map(p=>p.actual_min),baseline,auc,span:points.length>1?[points[0].actual_min,points.at(-1).actual_min]:null,peakChange:baseline>0?100*(peak-baseline)/baseline:null};
  })():null;
  return {analyte,rows,points,expected,issues,metrics,unit:families.size===1?[...families][0]:null,connect:arithmeticHolds.length===0&&points.length>1,ready:issues.length===0&&rows.length>0};
}
function contextIssues(c) {
  const messages={adult:'Adult, nonpregnant teaching context must be confirmed.',protocol:'Protocol and sample timing must be confirmed.',assay:'Assay and selected reference applicability must be confirmed.',confoundersReviewed:'Medication, illness and binding-protein/other confounders require review.'};
  return Object.entries(messages).filter(([key])=>!c.context[key]).map(([key,text])=>issue(`context_${key}`,text));
}
function result(analyte,title,status,summary,extra={}) {return {analyte,title,status,summary,...extra};}
function hold(analyte,title,reasons,extra={}) {return result(analyte,title,'hold','Reference comparison held for review.',{reasons,...extra});}
function compareGH(c,s,common) {
  const p=GH_PROFILES[c.settings.ghProfile],cutoff=c.settings.ghProfile==='custom'?c.settings.ghCutoff:p.cutoff;
  const reasons=[...common,...s.issues];
  if(!(cutoff>0)) reasons.push(issue('profile','Select a positive GH reference threshold.'));
  if(s.unit && s.unit!=='ug/L') reasons.push(issue('gh_units','GH activity units cannot be converted to mass units without an assay-specific factor.'));
  const meta={cutoff,unit:'ug/L',operator:'<',source:p.source||null};
  if(reasons.length || !s.ready) return hold('gh','GH suppression reference',reasons,meta);
  const post=s.points.filter(r=>[30,60,90,120].includes(r.planned_min));
  const nadir=post.reduce((a,b)=>compareUnits('gh',a.value,a.unit,b.value,b.unit)<=0?a:b);
  const below=compareUnits('gh',nadir.value,nadir.unit,cutoff,'ug/L')<0;
  return result('gh','GH suppression reference',below?'within':'review',below?'Post-load nadir is below the selected reference.':'Post-load nadir is not below the selected reference.',{...meta,value:nadir.normalized.value,at:nadir.actual_min,reasons:[]});
}
function compareACTH(c,s,common) {
  const p=ACTH_PROFILES[c.settings.acthProfile];
  const cutoff=c.settings.acthProfile==='custom'?c.settings.acthCutoff:p.cutoff;
  const unit=c.settings.acthProfile==='custom'?c.settings.acthUnit:p.unit;
  const times=p.time?[p.time]:c.settings.acthTime==='both'?[30,60]:[Number(c.settings.acthTime)];
  const reasons=[...common,...s.issues];
  if(!(cutoff>0)) reasons.push(issue('profile','Select a positive cortisol reference threshold.'));
  if(p.time && !s.points.some(r=>r.planned_min===p.time)) reasons.push(issue('profile_time','This assay profile requires a 30-minute sample. A 60-minute value is not a substitute.'));
  if(p.assay && s.rows.some(r=>r.assay!==p.assay)) reasons.push(issue('profile_assay','The declared assay does not match the selected reference profile.'));
  const meta={cutoff,unit,operator:'≥',source:p.source||null,times};
  if(reasons.length || !s.ready) return hold('cortisol','ACTH cortisol reference',reasons,meta);
  const selected=s.points.filter(r=>times.includes(r.planned_min));
  if(!selected.length) return hold('cortisol','ACTH cortisol reference',[issue('no_post','No eligible post-stimulation sample.')],meta);
  const peak=selected.reduce((a,b)=>compareUnits('cortisol',a.value,a.unit,b.value,b.unit)>=0?a:b);
  const meets=compareUnits('cortisol',peak.value,peak.unit,cutoff,unit)>=0;
  return result('cortisol','ACTH cortisol reference',meets?'within':'review',meets?'Eligible cortisol result reaches the selected reference.':'Eligible cortisol result is below the selected reference.',{...meta,value:peak.normalized.value,valueUnit:'nmol/L',at:peak.actual_min,reasons:[]});
}
function compareDST(c,s,common) {
  const p=DST_PROFILES[c.settings.dstProfile],reasons=[...common,...s.issues];
  if(!p.cutoff) reasons.push(issue('profile','Select a DST reference profile.'));
  if(s.rows.length!==1) reasons.push(issue('dst_count','DST review requires one completed morning cortisol result.'));
  const meta={cutoff:p.cutoff,unit:p.unit,operator:'≤',source:p.source||null};
  if(reasons.length || !s.ready) return hold('cortisol','Post-DST cortisol reference',reasons,meta);
  const r=s.points[0],within=compareUnits('cortisol',r.value,r.unit,p.cutoff,p.unit)<=0;
  return result('cortisol','Post-DST cortisol reference',within?'within':'review',within?'Result is at or below the selected DST reference.':'Result is above the selected DST reference; further review is needed.',{...meta,value:r.normalized.value,valueUnit:'nmol/L',reasons:[]});
}
function glucoseRange(c,s,common,time) {
  const title=time===0?'Fasting plasma glucose':'2-hour plasma glucose';
  const reasons=[...common,...s.issues];
  if(!c.context.plasma) reasons.push(issue('plasma','Venous plasma specimen and fasting/OGTT context must be confirmed.'));
  if(reasons.length || !s.ready) return hold('glucose',title,reasons,{source:'glucose'});
  const r=s.points.find(p=>p.planned_min===time);
  const boundaries=r.unit==='mg/dL'?(time===0?[100,126]:[140,200]):(time===0?[5.6,7.0]:[7.8,11.1]);
  const range=r.value>=boundaries[1]?'diabetes-range':r.value>=boundaries[0]?'intermediate-range':'below intermediate-range threshold';
  return result('glucose',title,range==='below intermediate-range threshold'?'within':'review',range+'. This label alone is not a diagnosis.',{source:'glucose',value:r.value,valueUnit:r.unit,reasons:[]});
}
export function analyzeCase(c) {
  validateCase(c);
  const analytes=[...new Set(c.rows.map(r=>r.analyte).filter(Boolean))];
  if(c.protocol==='ogtt') for(const a of ['gh','glucose']) if(!analytes.includes(a)) analytes.push(a);
  if(['acth','dst'].includes(c.protocol) && !analytes.includes('cortisol')) analytes.push('cortisol');
  const series=Object.fromEntries(analytes.map(a=>[a,analyzeSeries(c,a)]));
  const unassigned=c.rows.map((r,i)=>({r,i})).filter(({r})=>!isBlank(r)&&r.analyte===null).map(({i})=>issue('unassigned','Nonblank row has no analyte; assign it before reference comparison.',[i+1]));
  const common=[...contextIssues(c),...unassigned];
  const results=[];
  if(c.protocol==='ogtt') results.push(compareGH(c,series.gh,common),glucoseRange(c,series.glucose,common,0),glucoseRange(c,series.glucose,common,120));
  if(c.protocol==='acth') results.push(compareACTH(c,series.cortisol,common));
  if(c.protocol==='dst') results.push(compareDST(c,series.cortisol,common));
  const blankRows=c.rows.map((r,i)=>isBlank(r)?i+1:null).filter(Boolean);
  const issues=[...unassigned,...Object.values(series).flatMap(s=>s.issues.map(i=>({...i,analyte:s.analyte})))];
  const igf1=c.igf1.value!==null && c.igf1.uln>0?{ratio:c.igf1.value/c.igf1.uln,referenceConfirmed:c.igf1.referenceConfirmed}:null;
  return {series,results,issues,contextIssues:contextIssues(c),blankRows,igf1,activeRows:c.rows.length-blankRows.length};
}
