import {blankCase,blankRow} from './catalog.mjs';
export function example(name='ogtt') {
  const c=blankCase(name==='quality'?'ogtt':name);
  c.scenario=name;
  c.context={adult:true,protocol:true,assay:true,confoundersReviewed:true,plasma:true};
  c.rows=[];
  const add=(analyte,unit,values,times=[0,30,60,90,120],assay='same_a')=>values.forEach((value,i)=>c.rows.push({planned_min:times[i],actual_min:times[i],analyte,value,unit,qualifier:'eq',assay}));
  if(name==='ogtt'||name==='quality') {
    c.settings.ghProfile='bmi_lt25';c.igf1={value:280,uln:240,unit:'ng/mL',ulnUnit:'ng/mL',referenceConfirmed:true};
    add('gh','ng/mL',[1.2,0.62,0.28,0.14,0.19]);
    add('glucose','mmol/L',[5.1,8.8,7.4,6.1,5.3]);
    add('insulin','uIU/mL',[7,46,63,34,14]);
    add('gip_total','pg/mL',[24,118,146,101,62]);
    if(name==='quality') {
      c.rows[2].value=null;c.rows[3].actual_min=95;c.rows[10].assay='same_b';
      c.rows[16].qualifier='lt';c.rows.splice(5,0,blankRow());c.rows.push({...c.rows[0]});
    }
  } else if(name==='acth') {
    c.settings.acthProfile='elecsys2_30';c.settings.acthTime='both';
    add('cortisol','ug/dL',[6.1,15.2,17.8],[0,30,60],'elecsys2');
  } else if(name==='dst') {
    c.settings.dstProfile='ese_si';
    // DST time zero labels the completed morning collection, not drug administration.
    add('cortisol','nmol/L',[38],[0],'same_a');
  }
  return c;
}
