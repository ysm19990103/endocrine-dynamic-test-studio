# Validation record

Build: **1.0.0**. Review date: **2 November 2026**. All datasets and cases used for validation were synthetic.

## Automated checks

- **138 tests passed** using Node's built-in test runner.
- Exercised pure modules: **100% line**, **92.80% branch**, **100% function** coverage. The clinical engine alone has **94.74% branch** coverage. These statistics exclude the DOM UI, build/server scripts and CSS.
- Boundary tests cover below/equal/above GH, assay-specific ACTH and DST thresholds, native-unit glucose ranges and decimal-rational cross-unit comparisons.
- Quality tests cover missing values/times, zero baselines, censoring, repeated times, timing deviations, mixed/unknown assays and incompatible unit families.
- File tests cover JSON/CSV round trips, original row order, explicit blank records, trailing newlines, quoted fields, BOM, malformed input, unknown schema keys, formula-like input, resource caps and nonfinite/out-of-range numbers.
- SVG tests cover valid self-contained markup, accessible titles, escaping, censored markers and suppression of connections for incomplete/incompatible series.
- Syntax and heuristic privacy scans cover both source files and emitted build assets. No detected credential patterns, contact emails, prohibited data/database files or case transport/persistence APIs. This is a supplemental check, not proof that every possible secret can be detected.

## Browser checks completed

| Check | Observed outcome |
|---|---|
| Default OGTT | Four analyte tabs, expected curves and source-linked comparisons displayed |
| Live numeric editing | Editing IGF-1 ULN updated the ratio immediately; clearing GH sample held its comparison |
| ACTH profile | A 30-minute result below 14.6 retained a review status despite a higher 60-minute result |
| DST boundary | 50 nmol/L met the selected SI reference; 50.01 required review |
| Provenance label | Editing a synthetic case changed the session label to Custom teaching case |
| Quality challenge | Blank source row 6 retained; incomplete, mistimed, duplicated, mixed-assay and censored rows identified |
| English/Chinese labels | Navigation, controls and IGF-1 labels switched without changing the data |
| Source CSV download | Exported file parsed independently: 22 rows, blank row 6 and censored relation retained |
| CSV reimport | Source rows preserved; clinical confirmations reset |
| Invalid import | Unsupported header rejected; active session unchanged |
| JSON download | Edited DST value and complete session metadata verified independently |
| SVG source view | Well-formed self-contained figure source available in a readonly copyable dialog; automated serialization tests pass |

The cloud browser did not return a completed SVG download event during the direct-download check. The SVG viewer therefore includes an explicit copy-source fallback, so users can save the generated XML as a local `.svg` file. CSV and JSON download completion was observed. This browser observation does not establish the cause of the SVG event limitation.

## Remaining validation

No clinical validation, independent laboratory sign-off, formal accessibility audit, mobile-device test matrix, penetration test or regulatory assessment has been performed. Responsive and print styles are included; physical printing and all browser/PDF combinations remain unverified. The app must not be presented as a validated diagnostic or treatment system.

Clinical thresholds are source-backed options whose applicability still requires professional judgment. Exact scheduled-time equality is a conservative software gate, not a validated clinical timing tolerance. Generic method declarations do not establish metrological equivalence.

## Reproduce

```sh
npm test
npm run coverage
npm run build
npm run check
npm run dev
```

GitHub Actions repeats tests, build and source/build privacy checks before Pages publication. The live deployment should be smoke-tested after deployment, because unit tests cannot establish that hosted assets load correctly.
