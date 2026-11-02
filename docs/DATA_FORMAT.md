# Data contract

The app accepts a deliberately narrow anonymous schema. This is not an EHR, patient registry or batch cohort importer. One session contains one teaching time course; row numbers are source positions, not patient identifiers.

## CSV

Exact header:

```text
planned_min,actual_min,analyte,value,unit,qualifier,assay
```

| Field | Allowed values |
|---|---|
| `planned_min`, `actual_min` | Empty or finite number from 0 to 1440 |
| `analyte` | Empty or `gh`, `glucose`, `insulin`, `gip_total`, `gip_active`, `cortisol` |
| `value` | Empty or finite number from 0 to 1,000,000,000 |
| `qualifier` | Empty or `eq`, `lt`, `gt` |
| `assay` | Empty or `unknown`, `same_a`, `same_b`, `elecsys2`, `access`, `lcms`, `historic` |

Numeric caps are software input limits, not physiological reference ranges. `same_a` and `same_b` are generic method declarations; they do not identify an actual laboratory or prove assay compatibility. Assay-specific ACTH profiles require the matching explicit assay enum.

| Analyte | Units accepted | Derived display |
|---|---|---|
| GH | `ng/mL`, `ug/L`, `mIU/L` | `ug/L` for mass units; activity family separate |
| Glucose | `mmol/L`, `mg/dL` | `mmol/L`; mass × 0.05551 |
| Insulin | `uIU/mL`, `mIU/L`, `pmol/L` | `mIU/L` for activity units; molar family separate |
| Total or active GIP | `pg/mL`, `ng/L`, `pmol/L` | `ng/L` for mass units; molar family separate |
| Cortisol | `ug/dL`, `nmol/L` | `nmol/L`; mass × 27.6 |

Use ASCII `u` in file tokens. The interface displays the corresponding µ symbol. No universal insulin or GIP mass/activity-to-molar factor is assumed. Total and active GIP are separate analytes.

The parser accepts quoted fields, CRLF/LF line endings and a UTF-8 BOM. It rejects unexpected header columns, free text, formulas and malformed quoting. Empty records are retained. Export uses canonical numeric formatting and CRLF, so it preserves meaning and row positions rather than input bytes.

CSV carries source rows only. It does not carry protocol/context/IGF-1 settings. Import into the intended workflow and reconfirm the reset context checks. For a complete portable session, use JSON.

## JSON

Use a session JSON exported by the application as the template. The exact top-level keys are `schema`, `version`, `protocol`, `scenario`, `context`, `settings`, `igf1`, `rows`. Schema is `edts.case.v1`; this release accepts version `1.0.0`. Every nested object is checked for unexpected or missing keys. Booleans must be actual booleans. No `null` to zero coercion occurs.

JSON restores context declarations as data; they are user assertions, not external validation. `scenario` labels provenance of the starting template, not proof that the current numbers are synthetic. Exports include the current edited values, never a person identifier or filename supplied by the user.

## Derived CSV and SVG

Derived CSV retains one record for every source row, including blanks. It adds version, workflow, source row position, normalized value/unit and row-specific quality codes. Censored values remain tagged with `lt`/`gt`; a normalized bound is still a bound. Missing-schedule and context flags without a source row are shown in the app/report, not silently attached to an unrelated CSV row. The derived CSV is an analysis export, not an import template.

SVG exports the selected curve with axis units, accessible title, actual times, source-row tooltips and the selected reference when compatible. Censored values use open markers and bound symbols. Incomplete/incompatible series are not connected; mixed unit families are not placed on one quantitative axis.
