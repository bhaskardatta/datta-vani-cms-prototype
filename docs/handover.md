# Handover to the real CMS

For whoever starts the real CMS repository ([ADR 0008](adr/0008-real-cms-shape.md)). Short on purpose; each point links to the detail.

## What the prototype pins down

These are concrete and clickable. They still need the team's confirmation where the review checklist asks for it.

- **The nine journeys** (J1–J9) and the screens that serve them: library, editor (tree, panels per node, validation list), promote wizard, activity log ([journey maps](ux/journey-maps.md), [screen inventory](ux/screen-inventory.md)).
- **78 functional requirements** with IDs, each with a Gherkin scenario ([requirements](requirements.md), `features/`), and which of them have automated tests ([traceability](traceability.md)).
- **The rules**, as small tested functions: what a text edit does to audio, the audio draft lifecycle, coverage, the validation policy, who may do what, and what promote may and may not change in production ([context map](domain/context-map.md)).
- **The safety model**: staging-only editing, promote never deletes and never switches anything on, snapshot before promote, every change logged, every refusal enforced below the UI ([ADR 0004](adr/0004-staging-first-promote-never-deletes.md), [ADR 0005](adr/0005-guards-enforced-in-the-store.md)).
- **A first API shape** derived from the above ([draft OpenAPI](api/openapi.yaml)).

## Open questions

Gathered from [requirements §6](requirements.md#6-open-questions), the [review checklist](ux/review-checklist.md), the [API notes](api/README.md) and the proposed ADRs. Duplicates merged.

| # | Question | Source | Owner |
|---|---|---|---|
| 1 | Where is translated text stored: side tables, a jsonb column, or parallel trees? Blocks the data work. | Requirements 1 | TBD |
| 2 | cms-service in Go (Gin, Ginkgo) or Python? | Requirements 2, [ADR 0010](adr/0010-cms-service-in-go.md) | TBD |
| 3 | Which voices are required per language? (Prototype: female and male required, child optional.) | Requirements 3 | TBD |
| 4 | Who approves an item: only a Super Admin, or a second Content Manager? Who approves audio: the same person or a second one? | Requirements 4, review checklist | TBD |
| 5 | Are MFA, protected delete, AI images, quotas and kill-switches needed for 1 December, or later? | Requirements 5 | TBD |
| 6 | The real names and content of the four books, and the existing admin app's fields. | Requirements 6 | TBD |
| 7 | How are staging and production rows matched and the match saved? | Requirements 7, API notes 4 | TBD |
| 8 | How many levels of revert? (Prototype: the last promote only.) | Requirements 8, API notes 5 | TBD |
| 9 | Should an English edit mark the translations for review? | Requirements 9 | TBD |
| 10 | The file cap per promote. | Requirements 10 (NFR-05) | TBD |
| 11 | May a never-promoted story draft be deleted? Epics too? | [ADR 0011](adr/0011-delete-never-promoted-drafts.md) | TBD |
| 12 | What does an edit do to an item that is in review? | [ADR 0012](adr/0012-editing-while-in-review.md) | TBD |
| 13 | Is a phone or tablet layout needed for volunteers? NFR-11 says desktop only; the prototype works on phones anyway. | Review checklist, NFR-11 | TBD |
| 14 | How many people edit the same book at once? Decides item-level or per-node conflict checks. | API notes 2 | TBD |
| 15 | Audio generation: cost per call, rate limits, and whether clients poll or get pushed updates. | API notes 3 | TBD |

## Risks worth raising

- **cms-service writes directly to production.** It holds the production database and R2 credentials. Its permission checks, the one-transaction promote and the same-transaction audit entry are the whole safety case; there is no second gate. Worth an explicit review of how those credentials are stored, rotated and scoped, and of what a Super Admin account compromise could do.
- **No machine translation means translator time sets the pace.** Priority 1 is two languages across four books, every sentence by hand ([ADR 0009](adr/0009-no-machine-translation.md)). How many translators there are, and their hours, should be known before any date is promised.
- **Audio regeneration cost.** Every text edit makes that language's audio for every voice out of date (FR-AUD-01). A proofreading pass over a chapter can trigger dozens of regenerations per voice. The cost and time per generation are not known yet.
- **Staging freshness.** The promote plan compares staging with production. If staging drifts (old clones, test edits nobody promoted), plans fill with noise and reviewers stop reading them. Decide how and how often staging is refreshed from production, and what happens to unpromoted work when it is.
- **One level of revert.** A second promote of the same item overwrites the only snapshot. Until question 8 is answered, a bad promote followed by another promote cannot be fully undone.

## Suggested next steps

1. Record the review outcome against the [review checklist](ux/review-checklist.md) and update the requirements and ADR statuses to match.
2. Answer question 1 (text storage); it blocks the data model.
3. Hand `features/` and the requirement IDs to the Gherkin owner as a starting set.
4. Walk the [draft OpenAPI](api/openapi.yaml) with whoever builds cms-service and the website; settle the API open questions; decide ADR 0010.
5. Start the new repository with the same toolchain gate as this one (lint, typecheck, tests, build in CI).
6. Build Priority 1 as thin end-to-end slices on staging first: library read, text edit, audio regenerate and approve, validation. Promote and production switches after those work on staging.
7. Freeze this prototype once the journeys are agreed, so it does not drift from the real system.
