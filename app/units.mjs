// Decimal-rational comparison avoids changing a decision by rounding a converted value.
function fraction(n) {
  if(typeof n !== 'number' || !Number.isFinite(n)) throw new Error('A finite number is required.');
  let [mantissa,exp='0']=n.toString().toLowerCase().split('e');
  const places=(mantissa.split('.')[1]||'').length;
  const power=Number(exp)-places;
  const numerator=BigInt(mantissa.replace('.',''));
  return power>=0 ? [numerator*10n**BigInt(power),1n] : [numerator,10n**BigInt(-power)];
}
const DEFINITIONS = {
  gh:{'ng/mL':['ug/L',1],'ug/L':['ug/L',1],'mIU/L':['mIU/L',1]},
  glucose:{'mg/dL':['mmol/L',0.05551],'mmol/L':['mmol/L',1]},
  cortisol:{'ug/dL':['nmol/L',27.6],'nmol/L':['nmol/L',1]},
  insulin:{'uIU/mL':['mIU/L',1],'mIU/L':['mIU/L',1],'pmol/L':['pmol/L',1]},
  gip_total:{'pg/mL':['ng/L',1],'ng/L':['ng/L',1],'pmol/L':['pmol/L',1]},
  gip_active:{'pg/mL':['ng/L',1],'ng/L':['ng/L',1],'pmol/L':['pmol/L',1]}
};
export function normalize(analyte,value,unit) {
  const d=DEFINITIONS[analyte]?.[unit];
  if(!d || !Number.isFinite(value)) return null;
  return {value:value*d[1],unit:d[0],factor:d[1]};
}
export function compareUnits(analyte,value,unit,cutoff,cutoffUnit) {
  const a=normalize(analyte,value,unit), b=normalize(analyte,cutoff,cutoffUnit);
  if(!a || !b || a.unit!==b.unit) return null;
  const [an,ad]=fraction(value),[afn,afd]=fraction(a.factor);
  const [bn,bd]=fraction(cutoff),[bfn,bfd]=fraction(b.factor);
  const left=an*afn*bd*bfd, right=bn*bfn*ad*afd;
  return left<right?-1:left>right?1:0;
}
export function formatNumber(value, digits=3) {
  if(value===null || value===undefined || !Number.isFinite(value)) return '—';
  if(value!==0 && Math.abs(value)<0.001) return value.toExponential(2);
  return new Intl.NumberFormat('en',{maximumFractionDigits:digits}).format(value);
}
