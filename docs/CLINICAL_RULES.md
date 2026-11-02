# Reference rules and limitations

Rules reviewed: **2 November 2026**. This is a source-linked educational prototype for adult, nonpregnant synthetic cases, not a diagnostic system. Test administration, drug dosing, treatment decisions and emergency triage are outside scope.

## GH suppression and IGF-1

The [2024 Acromegaly Consensus](https://link.springer.com/article/10.1007/s11102-023-01360-1) describes assay-dependent post-OGTT GH nadir references that can be considered by BMI category: **<0.4 µg/L for BMI <25** and **<0.2 µg/L for BMI ≥25**. These are explicit options, not automatic selection from an unrecorded BMI.

The implemented reference uses exact post-load samples at 30, 60, 90 and 120 minutes. Equality does not meet a strict `<` reference. A baseline value cannot become the post-load nadir. Assay suitability and clinical confounders require independent review; an isolated curve cannot establish acromegaly or remission.

IGF-1/ULN is arithmetic only, using a positive ULN and equivalent mass units. The user declares an age-/sex-appropriate laboratory reference and matching method. No demographic reference range or diagnosis is inferred.

## ACTH cortisol

The [Endocrine Society primary adrenal insufficiency guideline](https://www.endocrine.org/clinical-practice-guidelines/primary-adrenal-insufficiency) supplies historical assay-dependent references of **18 µg/dL** or **500 nmol/L** for adult standard-dose stimulation, with 30- or 60-minute sampling. The studio provides these as distinct profiles because the rounded numbers are not exactly equivalent under a 27.6 conversion factor. Equality reaches the selected reference; lower values trigger review.

[Javorsky et al., 2021](https://academic.oup.com/jes/article/5/4/bvab022/6142947) provides the implemented **30-minute** study-derived profiles: Elecsys II **14.6 µg/dL**, Access **14.8 µg/dL**, LC-MS/MS **14.5 µg/dL**. The declared assay must match. These values are not universal modern-assay thresholds, and a 60-minute result is never substituted into these profiles.

As discussed in [Endotext](https://www.ncbi.nlm.nih.gov/books/NBK279083/), medications, illness, binding proteins and recent-onset central adrenal insufficiency complicate interpretation. Reaching a reference does not exclude every form of adrenal insufficiency. Low-dose ACTH, pediatric and insulin-tolerance protocols are excluded.

## Completed overnight DST review

The [2023 ESE adrenal incidentaloma guideline](https://academic.oup.com/ejendo/article/189/1/G1/7198474) provides post–1-mg overnight DST references of **≤50 nmol/L** or **≤1.8 µg/dL**. These are distinct selectable profiles because the published paired values are rounded. The studio compares one already collected morning result in this specific setting; index minute 0 denotes that collection, not the administration time.

Above-reference output is a request for review, not an automatic diagnosis of MACS or Cushing syndrome. Clinical findings, confounders, ACTH independence and confirmatory evaluation remain outside the calculator.

## Plasma glucose

[ADA Standards of Care 2026, chapter 2](https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diab) supports the following nonpregnant venous plasma ranges. Comparisons use the row's native unit, avoiding a rounded conversion across a clinical boundary.

| Collection | Intermediate range starts | Diabetes range starts |
|---|---|---|
| Fasting | 100 mg/dL or 5.6 mmol/L | 126 mg/dL or 7.0 mmol/L |
| 2-hour OGTT | 140 mg/dL or 7.8 mmol/L | 200 mg/dL or 11.1 mmol/L |

Intermediate output covers values from the first boundary up to, but excluding, the second. Below the first boundary is described as below the intermediate-range threshold. Range labels are not diagnoses; confirmatory testing is ordinarily needed without unequivocal hyperglycemia. Capillary/CGM, pregnancy-specific and pediatric interpretation are not implemented.

## Descriptive calculations and quality gates

Insulin, total GIP and active GIP receive descriptive curves only. Peak/nadir include baseline. AUC uses adjacent exact observations and actual elapsed times, with no interpolation across a missing supported planned sample. A zero baseline prevents percent-change calculation. Source order and blank records are retained.

[Unit conversion source: Mayo Clinic Laboratories](https://www.mayocliniclabs.com/order-tests/si-unit-conversion.html). Cortisol µg/dL × 27.6 gives nmol/L; GH ng/mL equals µg/L. Glucose curve normalization uses the mass-to-molar factor 0.05551; native-unit glucose thresholds remain separate. Insulin activity-to-molar and GIP mass-to-molar conversion are not generalized across assays.

The app conservatively holds affected comparisons for missing, censored, duplicate, unknown-assay, incompatible or mistimed samples. Exact timing equality is a software guardrail, not a claim that clinical timing tolerances are universally zero. Independent laboratory policy may permit different schedules or tolerances that this release does not model.
