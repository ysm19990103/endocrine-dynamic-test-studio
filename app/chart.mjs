import {ANALYTES,UNIT_LABEL} from './catalog.mjs';
import {formatNumber,normalize} from './units.mjs';
export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function chartSVG(s,reference=null,{compact=false,exported=false}={}) {
  const name=ANALYTES[s.analyte].name,color=ANALYTES[s.analyte].color;
  const w=800,h=compact?130:300,l=compact?20:67,r=compact?14:24,t=compact?15:38,b=compact?20:48;
  if(!s.unit || !s.points.length) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="No compatible ${escapeHTML(name)} curve"><rect width="${w}" height="${h}" fill="#fafbf7"/><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#65716b" font-family="system-ui" font-size="15">${s.points.length?'Incompatible units · inspect source rows':'Add samples to view this curve'}</text></svg>`;
  let ref=null;
  if(reference?.cutoff>0 && reference.unit){const n=normalize(s.analyte,reference.cutoff,reference.unit);if(n?.unit===s.unit)ref=n.value;}
  const xmax=Math.max(1,...s.points.map(p=>p.actual_min)),ymax=Math.max(0.01,...s.points.map(p=>p.normalized.value),ref||0)*1.18;
  const x=n=>l+n/xmax*(w-l-r),y=n=>h-b-n/ymax*(h-t-b);
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHTML(name)} by actual sample time. ${s.connect?'Connected exact samples.':'Unconnected sample markers; review data quality.'}"><title>${escapeHTML(name)} time course · educational prototype</title><rect width="${w}" height="${h}" fill="#fafbf7"/>`;
  if(!compact){
    svg+=`<text x="${l}" y="20" fill="#53675c" font-size="12" font-family="system-ui">${escapeHTML(UNIT_LABEL(s.unit))}${exported?' · Synthetic / teaching use':''}</text>`;
    for(let i=0;i<=4;i++){const v=ymax*i/4;svg+=`<path d="M${l},${y(v)}H${w-r}" stroke="#dce4dc" stroke-width="1"/><text x="${l-12}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="#6b766e" font-family="system-ui">${formatNumber(v,2)}</text>`;}
    const times=[...new Set([0,...s.points.map(p=>p.actual_min)])];
    const ticks=times.length<=9?times:[0,xmax/4,xmax/2,3*xmax/4,xmax];
    for(const time of ticks)svg+=`<text x="${x(time)}" y="${h-b+21}" text-anchor="middle" font-size="11" fill="#6b766e" font-family="system-ui">${formatNumber(time,1)}</text>`;
    svg+=`<text x="${(l+w-r)/2}" y="${h-5}" text-anchor="middle" font-size="11" fill="#6b766e" font-family="system-ui">Actual sample time (min)</text>`;
  }
  if(ref!==null && !compact) svg+=`<path d="M${l},${y(ref)}H${w-r}" stroke="#ab8b50" stroke-dasharray="5 5"/><text x="${w-r}" y="${Math.max(t+12,y(ref)-7)}" text-anchor="end" fill="#896a32" font-family="system-ui" font-size="11">Selected reference ${formatNumber(ref)} ${escapeHTML(UNIT_LABEL(s.unit))}</text>`;
  if(s.connect) svg+=`<polyline points="${s.points.map(p=>`${x(p.actual_min)},${y(p.normalized.value)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${compact?2.5:3}" stroke-linejoin="round"/>`;
  for(const p of s.points){
    const cx=x(p.actual_min),cy=y(p.normalized.value),bound=p.qualifier==='lt'?'&lt;':p.qualifier==='gt'?'&gt;':'';
    svg+=`<circle cx="${cx}" cy="${cy}" r="${compact?3:5}" fill="${p.qualifier==='eq'?color:'#fafbf7'}" stroke="${color}" stroke-width="2"><title>Row ${p.row}: ${bound}${formatNumber(p.value,6)} ${escapeHTML(UNIT_LABEL(p.unit))} at ${p.actual_min} min; ${escapeHTML(p.assay)}</title></circle>`;
    if(bound&&!compact)svg+=`<text x="${cx+8}" y="${cy-8}" font-size="14" fill="${color}">${bound}</text>`;
  }
  if(!s.connect&&!compact)svg+=`<text x="${w-r}" y="20" text-anchor="end" font-size="11" fill="#986332" font-family="system-ui">Markers only · review quality</text>`;
  return svg+'</svg>';
}
