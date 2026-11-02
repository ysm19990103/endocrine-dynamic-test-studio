# Security and privacy

## Intended boundary

This public demonstration is for synthetic endocrine teaching cases. It has no authentication, authorization, patient-record management, audit service or clinical data-retention system. Do not use it for identifiable patient data, private research datasets, API keys or other confidential material.

## Data flow

Static host → HTML/CSS/JavaScript/icon → browser memory → optional local download/print.

A selected local file is read in the tab with the File API, validated against an allowlisted schema, and processed in memory. There is no upload endpoint, application fetch call, analytics SDK, cookie, browser database, case persistence, service worker or URL-state serialization. Reloading returns to a bundled synthetic example. The one-step undo session exists only in memory.

Ordinary hosting requests disclose standard network metadata to the host. External reference links navigate to other organizations. Browser extensions, a compromised browser/device, screenshots, print spools and downloaded files are outside this app's control. Memory-only processing does not mean forensic erasure or regulatory compliance.

## Controls

| Risk | Implemented control | Limit |
|---|---|---|
| Accidental data publication | No patient/name/date/free-text fields; only synthetic source examples; no data-file fixture directory; public source review | Numeric data can still be sensitive; only use synthetic examples here |
| Imported script/content injection | Exact recursive schema keys, controlled enums, finite bounded numbers, output escaping | No general-purpose document parser or arbitrary HTML import |
| Spreadsheet formula injection | Only validated numeric fields and enum values can reach CSV export; formula-like CSV inputs are rejected | Exported files still require normal local handling |
| Oversized or malformed imports | 256 KiB / 500-row limits, strict CSV state machine, transactional validation | No guarantee against every browser resource exhaustion scenario |
| Covert network or persistence | CSP `connect-src 'none'`, no transport/persistence APIs, no external scripts/fonts, no runtime dependencies | Host-level logs and browser behavior remain outside app scope |
| Stale application assets | Content-hashed module/CSS filenames; no service worker | Hosting availability is not guaranteed |
| Credential/data files in repository | Ignore rules plus syntax/secret-pattern/email/data-format scans and manual publication review | Heuristic scans cannot prove absence of every secret or private datum |
| Build/deploy privilege | Read-only default workflow token; Pages write + OIDC only for deploy; checkout does not persist credentials | Workflow actions still depend on trusted upstream maintainers |

The CSP uses a meta element suitable for static hosting. It cannot enforce `frame-ancestors`; a production operator wanting clickjacking protection must supply response headers. The demo is not hardened for clinical deployment, and no penetration test or regulatory assessment is claimed.

## Clinical error as a safety risk

Missing, censored, duplicate, unknown-assay, mistimed or incompatible samples hold the affected reference comparison. Unassigned nonblank rows hold every reference comparison. No imputation, averaging of duplicates, zero substitution, guessed insulin/GIP molar conversion or automatic diagnosis occurs. Printed and exported source files remain review artifacts, not certified laboratory results.

## Reporting

For a non-sensitive reproducible issue, open a repository issue using synthetic data only. Do not post tokens, personal health information, private files or exploit details that would expose a real system. For a sensitive vulnerability, use GitHub's private vulnerability reporting if it is enabled; otherwise use an already established private maintainer channel. No contact address or private credential is embedded in this repository.
