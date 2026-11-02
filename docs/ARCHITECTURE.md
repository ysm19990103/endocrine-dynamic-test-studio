# Architecture

A zero-dependency static ES-module application, with no backend or database.

| Module | Responsibility |
|---|---|
| `catalog.mjs` | Versioned enums, supported references, source register, blank schema |
| `schema.mjs` | Strict recursive case/row validation and JSON import |
| `units.mjs` | Compatible unit families, display normalization, decimal-rational cutoff comparison |
| `engine.mjs` | Pure time-course analysis, quality checks and reference comparisons |
| `files.mjs` | Bounded CSV parser and deterministic CSV/JSON export |
| `chart.mjs` | Self-contained SVG rendering and text escaping |
| `examples.mjs` | Hand-authored synthetic teaching cases |
| `ui.mjs` | In-memory state, input events, accessible controls and local downloads |

Source rows remain in input order. Analysis creates copies with source row numbers, then sorts those copies by actual time. Missing values are `null`, distinct from zero. Quality findings carry row positions where applicable. AUC is trapezoidal over the complete supported planned series, using actual times; timing mismatches can permit descriptive arithmetic while still holding the reference comparison. Duplicate times, censoring, incomplete values and incompatible assay/unit families hold combined metrics and line connection.

Each medical reference comparator produces a status, explanatory summary, selected threshold, applicable time/source and hold reasons. An interpretation result never rewrites a source row. The GH comparison excludes baseline from the post-load nadir. The assay-specific cortisol study profiles select only 30-minute results. Rounded unit-equivalent guideline cutoffs are separate profiles to avoid hiding a boundary discrepancy.

The UI updates derived output on numeric `input`, preserving the focused editor and cursor. Session replacement uses a modal plus a one-step memory-only undo. Import parsing completes before replacing the active case. CSV import clears clinical confirmations; JSON restores a fully validated session.

The build traverses local ES-module imports and rewrites them to content-hashed filenames, then hashes CSS and rewrites HTML. `dist/` contains only static application assets. GitHub Pages deploys that directory after validation. There is no service worker, runtime dependency installation, API credential or data artifact in the published app.

Automated tests exercise the pure modules. Browser interaction checks exercise the UI separately. Medical validity and software coverage are different claims; this prototype has not undergone clinical validation.
