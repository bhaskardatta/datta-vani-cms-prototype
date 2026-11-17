# Screen inventory

Every screen and key state in the prototype: what it is for, its one primary action, the states it can be in, and which requirements and journeys it serves.
"W" numbers are the wireframes on `/wireframes`. Routes are the real screens in the clickable prototype.

## Requirements (from the meeting and Dattu's CMS plan)

| ID | Requirement | Priority |
|---|---|---|
| R1 | Show the content hierarchy (book → section → chapter → scene → chunk; story → scene → chunk) | P1 |
| R2 | Edit text on staging, per language, with the English source visible | P1 |
| R3 | Upload or regenerate audio + word-timing transcript per voice (female, male, child) | P1 |
| R4 | Edit quizzes per language | P1 |
| R5 | Validate (errors block, warnings don't) | P1 |
| R6 | Promote staging → production (Super Admin, 6 steps, 17 checks) | P1 |
| R7 | Switch content and each language on/off in production | P1 |
| R8 | Add and edit bedtime stories (themes, characters, cover, audio; no quizzes) | P2 |
| R9 | Edit on staging only; production read-only | Safety |
| R10 | Only a Super Admin approves, promotes and switches on/off | Safety |
| R11 | New things land switched off | Safety |
| R12 | Nothing is hard-deleted; promote can be reverted | Safety |
| R13 | Every change is logged (who, what, before, after, when, environment) | Safety |

## Screens

| W | Screen / state | Route | Purpose | Primary action | States | Requirements | Journeys |
|---|---|---|---|---|---|---|---|
| 01 | Sign in | `/` | Choose a role (prototype stand-in for the real login) | Continue as a role | — | R10 | J1, J8 |
| 02 | Library, staging | `/library` | See every epic and story: status, on/off in staging and production, coverage per language, errors | + New bedtime story | All / Epics / Stories tab; row with errors; row passing; story not yet in production ("Not yet") | R1, R5, R8 | J1, J2, J7 |
| 03 | Library, production | `/library` + Production | See what families see right now | none (view only) | Item on / off; languages on per item; New story locked with reason | R7, R9 | J1, J6, J8 |
| 04 | Editor, book root | `/edit` | Edit book name and description; see counts and media path; run the workflow | The next workflow step (Send for review → Approve → Promote) | Draft / In review / Approved; buttons locked per role with reason; tree with error dots | R1, R2, R5, R10 | J1, J5, J6 |
| 05 | Editor, chunk with audio rows | `/edit` (chunk selected, TE tab) | Edit one sentence and keep its audio + transcript current, per voice | Regenerate / Approve on the row that needs it | Text present / missing (dashed); each voice approved / draft / out of date / missing / missing-optional; playing with word highlight; generating (busy) | R2, R3, R11 | J2, J3, J7 |
| 06 | Editor, quiz translation | `/edit` (quiz selected, KN tab) | Translate question, options and hint | Type the translation (no button; saves on blur) | Question with missing text (dot); type select locked outside English; correct answer locked | R4 | J4 |
| 07 | Editor, validation panel open | `/edit` + Validation | List errors and warnings per language; jump to each | Click an issue to jump to it | Errors and warnings; language passes; panel closed / open | R5 | J5, J7 |
| 08 | Editor, production read-only | `/edit` + Production | View live content; switch the item and each language on/off | Switch on (Super Admin) | Super Admin: switches enabled unless English errors / language incomplete. Content Manager and Support: everything locked with reason. Item not in production yet: empty state with "Back to staging" | R7, R9, R10 | J6, J8 |
| 09 | New bedtime story | `/library` → `/edit` | Create a story: title, description, cover, themes, characters, scenes | + Add scene | Empty (all required fields dashed); partly filled; draft and switched off | R8, R11 | J7 |
| 10 | Promote 1, Match | `/promote` | Confirm the staging item matches the production one | Next (after ticking "These matches are right") | Matched existing item; new item ("will be created, switched off"); Next locked until ticked | R6 | J6 |
| 11 | Promote 2, Changes | `/promote` | Choose languages; review new / changed / unchanged with before and after | Next | Language locked (errors / not started); English always included | R6, R12 | J6 |
| 12 | Promote 3, Checks | `/promote` | Show the 17 pre-promote checks | Next | Each check pass / fail / warning / pending; Next locked if any fail | R6, R10 | J6 |
| 13 | Promote 4, Dry run | `/promote` | Run the plan without writing anything | Run dry run, then Next | Not run / running / clean | R6, R12 | J6 |
| 14 | Promote 5, Confirm | `/promote` | Typed confirmation of name and "production" | Promote now | Locked until both typed exactly | R6, R10 | J6 |
| 15 | Promote 6, Result | `/promote` | Show what happened and what families see | Open in production | Running (progress) / done: landed off, updated and stays off, updated and stays on; Revert | R6, R11, R12, R13 | J6, J9 |
| 16 | Activity | `/activity` | Read every change | none (read only; filter and search) | All / staging / production; search; no matches | R13 | J9 |
| — | Journeys | `/journeys` | Start any journey with the right role and screen | Start | — | (review aid) | J1–J9 |
| — | Wireframes | `/wireframes` | This low-fi review of every screen | — | — | (review aid) | J1–J9 |

## Component sheets

| W | Component | States covered | Used on |
|---|---|---|---|
| 17 | Audio row | approved · draft · out of date · missing (required) · missing (optional) · generating | W05, W07, W09 |
| 18 | Button | primary · secondary · ghost · danger · locked with reason · hover · focus · busy | everywhere |
| 19 | On/off switch | off · on · locked with reason · read-only in table · per-language codes | W02, W03, W08 |
| 20 | Status pill | workflow (Draft / In review / Approved) · validation · environment · change kind | W02, W04, W07, W11, W16 |

## Gaps (not in the prototype)

Left out on purpose because they were not discussed in the meeting: MFA, the protected delete/purge flow, AI image generation, quotas, kill-switches, and the theme/character catalog editor. See section 8 of `PROTOTYPE-PLAN.md`.
