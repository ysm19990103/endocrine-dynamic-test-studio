export const VERSION = '1.0.0';
export const SCHEMA = 'edts.case.v1';
export const MAX_BYTES = 262144;
export const MAX_ROWS = 500;
export const ANALYTES = {
  gh: {name:'Growth hormone', short:'GH', zh:'生长激素', color:'#176953', units:['ng/mL','ug/L','mIU/L']},
  glucose: {name:'Glucose', short:'Glucose', zh:'葡萄糖', color:'#ba7139', units:['mmol/L','mg/dL']},
  insulin: {name:'Insulin', short:'Insulin', zh:'胰岛素', color:'#6377a1', units:['uIU/mL','mIU/L','pmol/L']},
  gip_total: {name:'Total GIP', short:'Total GIP', zh:'总 GIP', color:'#9a6680', units:['pg/mL','ng/L','pmol/L']},
  gip_active: {name:'Active GIP', short:'Active GIP', zh:'活性 GIP', color:'#7f7c39', units:['pg/mL','ng/L','pmol/L']},
  cortisol: {name:'Cortisol', short:'Cortisol', zh:'皮质醇', color:'#6377a1', units:['ug/dL','nmol/L']}
};
export const ASSAYS = {
  unknown:'Not specified', same_a:'Same method A (declared)', same_b:'Same method B (declared)',
  elecsys2:'Roche Elecsys II', access:'Beckman Access', lcms:'LC-MS/MS', historic:'Historical assay (declared)'
};
export const PROTOCOLS = {ogtt:'OGTT time course', acth:'ACTH stimulation', dst:'Overnight DST review', explorer:'Curve explorer'};
export const GH_PROFILES = {
  none:{name:'Choose a reference'},
  bmi_lt25:{name:'Consensus · BMI <25 · <0.4 ug/L', cutoff:0.4,unit:'ug/L',source:'acromegaly'},
  bmi_ge25:{name:'Consensus · BMI ≥25 · <0.2 ug/L',cutoff:0.2,unit:'ug/L',source:'acromegaly'},
  custom:{name:'Locally selected GH threshold',unit:'ug/L',source:'local'}
};
export const ACTH_PROFILES = {
  none:{name:'Choose a reference'},
  historic_ug:{name:'Historical · 18 ug/dL',cutoff:18,unit:'ug/dL',source:'pai'},
  historic_si:{name:'Historical · 500 nmol/L',cutoff:500,unit:'nmol/L',source:'pai'},
  elecsys2_30:{name:'Elecsys II · 30 min · 14.6 ug/dL',cutoff:14.6,unit:'ug/dL',time:30,assay:'elecsys2',source:'assays'},
  access_30:{name:'Access · 30 min · 14.8 ug/dL',cutoff:14.8,unit:'ug/dL',time:30,assay:'access',source:'assays'},
  lcms_30:{name:'LC-MS/MS · 30 min · 14.5 ug/dL',cutoff:14.5,unit:'ug/dL',time:30,assay:'lcms',source:'assays'},
  custom:{name:'Locally selected cortisol threshold',source:'local'}
};
export const DST_PROFILES = {
  none:{name:'Choose a reference'},
  ese_si:{name:'ESE 2023 · ≤50 nmol/L',cutoff:50,unit:'nmol/L',source:'dst'},
  ese_ug:{name:'ESE 2023 · ≤1.8 ug/dL',cutoff:1.8,unit:'ug/dL',source:'dst'}
};
export const SOURCES = [
  {id:'acromegaly', title:'Acromegaly Consensus · 2024', url:'https://link.springer.com/article/10.1007/s11102-023-01360-1', detail:'Assay-dependent GH nadir references; BMI categories; 30, 60, 90 and 120-minute sampling. IGF-1 requires an appropriate laboratory reference.'},
  {id:'pai',title:'Endocrine Society · Primary adrenal insufficiency · 2016',url:'https://www.endocrine.org/clinical-practice-guidelines/primary-adrenal-insufficiency',detail:'Adult standard-dose ACTH testing; historical peak cortisol references at 30 or 60 minutes, explicitly assay-dependent.'},
  {id:'assays',title:'Javorsky et al. · Specific cortisol assays · 2021',url:'https://academic.oup.com/jes/article/5/4/bvab022/6142947',detail:'Study-derived 30-minute cutoffs for Elecsys II, Access and LC-MS/MS. These profiles do not apply the same numbers to 60-minute samples.'},
  {id:'dst',title:'European Society of Endocrinology · Adrenal incidentalomas · 2023',url:'https://academic.oup.com/ejendo/article/189/1/G1/7198474',detail:'Post–1-mg overnight DST reference in the adrenal-incidentaloma setting. Results need clinical context, assessment of confounders and, when indicated, confirmation.'},
  {id:'glucose',title:'American Diabetes Association · Standards of Care · 2026',url:'https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diab',detail:'Nonpregnant adult fasting and 2-hour venous plasma glucose ranges. Range labels alone do not establish a diagnosis.'},
  {id:'units',title:'Mayo Clinic Laboratories · SI unit conversion',url:'https://www.mayocliniclabs.com/order-tests/si-unit-conversion.html',detail:'Cortisol: ug/dL × 27.6 = nmol/L; GH: ng/mL = ug/L. Glucose mass-to-molar factor: 0.05551. Display conversion is separate from native-unit clinical boundaries.'},
  {id:'limits',title:'Endotext · Endocrine testing protocols',url:'https://www.ncbi.nlm.nih.gov/books/NBK279083/',detail:'Adrenal testing limitations include binding proteins, medications, illness and recent-onset central adrenal insufficiency.'}
];
export const ROW_KEYS = ['planned_min','actual_min','analyte','value','unit','qualifier','assay'];
export const UNIT_LABEL = u => (u || '').replace(/^ug/,'µg').replace(/^uIU/,'µIU');
export const blankRow = () => Object.fromEntries(ROW_KEYS.map(k=>[k,null]));
export function blankCase(protocol='ogtt') {
  return {schema:SCHEMA,version:VERSION,protocol,scenario:'custom',
    context:{adult:false,protocol:false,assay:false,confoundersReviewed:false,plasma:false},
    settings:{ghProfile:'none',ghCutoff:null,acthProfile:'none',acthTime:'both',acthCutoff:null,acthUnit:'ug/dL',dstProfile:'none'},
    igf1:{value:null,uln:null,unit:'ng/mL',ulnUnit:'ng/mL',referenceConfirmed:false}, rows:[blankRow()]};
}
