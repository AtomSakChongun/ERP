---
target: timesheet
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/poochitsakunthon/Documents/Learning/Next/ERP/src/features/timesheet"
timestamp: 2026-10-19T06-39-50Z
slug: src-features-timesheet
---
Method: dual-agent (A: design review · B: detector)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Week status shown 3x; week strip never shows days short of 8h |
| 2 | Match System / Real World | 3 | "Unapproved" mixes Draft and Submitted |
| 3 | User Control and Freedom | 1 | No edit (delete only), irreversible Submit, no undo, no Esc on modals |
| 4 | Consistency and Standards | 2 | Two primary buttons; overtime in Submitted teal; off-system orange in report |
| 5 | Error Prevention | 1 | No overlap check; short weeks submit without warning; locked week fails only at save |
| 6 | Recognition Rather Than Recall | 2 | Blank form every entry; no recents or repeat |
| 7 | Flexibility and Efficiency | 1 | No shortcuts, duplicate, save & add another; ⌘K decorative |
| 8 | Aesthetic and Minimalist Design | 3 | Calm and on-brand; 4 summary cards push the work area down |
| 9 | Error Recovery | 3 | Clear inline errors; raw ISO dates; no Rejected reason |
| 10 | Help and Documentation | 3 | Good inline hints (break rule, legend) |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict
Logic is product-specific (ISO Thursday month rule, auto 1h break after 6h, project-driven tag, lock on submit, Incomplete report → Fill in loop). Composition is category-generic (header → 4 cards → strip → table → footer). Per-day progress vs 8h is hidden in a report tab instead of living on the week strip.
Detector: 0 findings across 15 files (regex-only for .tsx; page-level rules like tiny-text/low-contrast did not run). --no-config rerun also 0. No browser overlay (no browser tool).

## Priority Issues
- [P0] Logging is slow: no edit, no duplicate, blank modal every time (time-entries-table.tsx:40, time-entry-modal.tsx:37-40). Fix: row click → edit modal, Duplicate to today, prefill last project/task and start time, Save & add another, recent chips. Command: /impeccable optimize, /impeccable clarify
- [P0] Submit is irreversible with no review (timesheet-view.tsx:211-216). Fix: review step (total vs target, short days with Fill in, approver), warning when short, Recall while Submitted, persistent banner, Rejected reason. Command: /impeccable harden
- [P1] Week strip/calendar are colour-only, small targets, poor SR semantics (week-strip.tsx:24-33, globals.css:245,259). Fix: aria-pressed + aria-label with hours vs 8h, non-colour short-day marker, mobile state glyphs, 44px arrows, proper tabs. Command: /impeccable audit, /impeccable adapt
- [P1] Modals lack focus trap/Esc/aria-labelledby and backdrop tap discards the form (modal.tsx:37); input focus ring 11% alpha; table min-width 760px scrolls sideways on mobile. Fix: native dialog or focus mgmt, dirty-form guard, 2px brand-green focus-visible, card rows below 600px. Command: /impeccable adapt, /impeccable harden
- [P2] Two primary buttons (timesheet-view.tsx:147,211), fake "Save as draft" (:209), metrics above work, strip below the fold on mobile, teal overtime, orange report tone, hardcoded #a37021. Fix: strip+table first, single state-driven primary, remove Save as draft, map tones to status palette. Command: /impeccable layout, /impeccable distill

## Persona Red Flags
- Alex: no add shortcut, ⌘K dead, no duplicate/edit, no typed durations, filter toggle undiscoverable, no week template.
- Sam: dialogs without focus/Esc/labelledby, errors not aria-describedby, visual-only required mark, unlabeled topbar search, status inside h2.
- Casey: Add button at top, 24px arrows, sideways table scroll, 9-field modal, backdrop tap loses input.

## Minor Observations
- en-US date formatting, uppercase and nowrap/ellipsis clash with Thai-Ready rule.
- Export CSV uses upload icon.
- Leave needs start/end times and bypasses Leave approvals.
- No loading.tsx / API error state.
- Disabled "Submitted" button with check icon reads as clickable.

## Questions to Consider
- Could a week-strip day expand into a one-line inline entry instead of a modal?
- Should gaps be the primary view on the strip instead of a separate report tab?
- Should complete weeks auto-submit, reserving the explicit click for short weeks with a reason?
