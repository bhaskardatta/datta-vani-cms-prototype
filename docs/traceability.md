# Traceability: requirement → scenario → test → journey

Every functional requirement in [requirements.md](requirements.md), the Gherkin scenario tagged with its ID in `features/`, the automated tests that check it, and the review journey it belongs to. Built by reading the tests, not by naming convention: a test is listed only if it asserts the behaviour.

- **Unit** = Vitest in `tests/` (file › test name, shortened). **E2E** = Playwright in `e2e/`, run on all ten device profiles unless noted.
- **Covered**: an automated test asserts the requirement. **Partial**: part of it is asserted. **Not covered**: only the scenario exists; nothing automated checks it.
- The Gherkin scenarios are not executed: there is no step-definition runner in the prototype. They are the specification for the real system's Ginkgo tests ([ADR 0010](adr/0010-cms-service-in-go.md)).
- Non-functional requirements are covered in [test-strategy.md](test-strategy.md).

## Library (J1) · `features/library.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-LIB-01 | — | `journeys` › J1 (rows, Epics/Stories tabs, production view) | Covered |
| FR-LIB-02 | `localization-validation` › coverage counts chunks with text and approved audio | `journeys` › J1 (Telugu meters 0% and 100%) | Covered |
| FR-LIB-03 | `localization-validation` › an optional voice (child) does not lower coverage | — | Covered |
| FR-LIB-04 | — | — | **Not covered** (the row lists languages with errors; nothing asserts it) |
| FR-LIB-05 | — | — | **Not covered** ("Not yet" for items not in production is shown, not asserted) |

## Editing and translation (J2) · `features/editing-translation.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-EDIT-01 | `store` › a Content Manager edit on staging changes the text… | `journeys` › J2 | Covered |
| FR-EDIT-02 | `access` › production is read-only; even a Super Admin cannot edit production · `store` › nothing is edited while in production | `journeys` › J8 | Covered |
| FR-EDIT-03 | — | — | **Not covered** (English is shown above the box; no test asserts it or that nothing is pre-filled) |
| FR-EDIT-04 | `content` › lists every node in tree order · labels nodes in the chosen language and falls back to English | `keyboard` › content tree works with the arrow keys (desktop only) | Covered |
| FR-EDIT-05 | `content` › does nothing when the text did not really change | — | Partial (domain rule only; "nothing logged" is not asserted) |
| FR-EDIT-06 | `store` › editing an approved item sends it back to draft | — | Covered |

## Audio and transcripts (J2, J3) · `features/audio-transcripts.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-AUD-01 | `content` › marks current and draft audio stale in the edited language only | `journeys` › J2 | Covered |
| FR-AUD-02 | `content` › leaves missing audio as missing | — | Covered |
| FR-AUD-03 | `content` › marks current and draft audio stale… | — | Covered |
| FR-AUD-04 | `content` › regenerate makes a draft, approve makes it current | `journeys` › J2 (regenerate, play, approve per voice) | Covered |
| FR-AUD-05 | `content` › upload keeps the file name through approval | `journeys` › J3 (WAV accepted, `.txt` refused) | Covered |
| FR-AUD-06 | `content` › reject restores exactly what was there before | — | Covered |
| FR-AUD-07 | `content` › reject after two drafts in a row… | — | Covered |
| FR-AUD-08 | `content` › approve and reject only work on a draft | — | Covered |
| FR-AUD-09 | `content` › builds fixed media paths | — | Covered |
| FR-AUD-10 | `content` › one entry per word, in order, without overlaps | — | Covered |

## Quizzes (J4) · `features/quizzes.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-QUIZ-01 | — | `journeys` › J4 (question, option, hint in Kannada) | Covered |
| FR-QUIZ-02 | — (enforced by the data shape: one `options` list, one `answer`) | `journeys` › J4 (type and correct answer locked in Kannada) | Covered |
| FR-QUIZ-03 | `localization-validation` › quiz text and every answer option are needed | `journeys` › J4 (missing-text marker clears) | Covered |
| FR-QUIZ-04 | `localization-validation` › every chapter of an epic needs a quiz | — | Covered |
| FR-QUIZ-05 | — | — | **Not covered** (the five types are listed in the editor; nothing asserts them) |

## Validation (J5) · `features/validation.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-VAL-01 | `localization-validation` › finds the planted Telugu problems | `journeys` › J5 | Covered |
| FR-VAL-02 | `localization-validation` › finds the planted Telugu problems, each pointing at its chunk | — | Covered |
| FR-VAL-03 | — | `journeys` › J5 (click the error, the chunk's voice rows appear) | Covered |
| FR-VAL-04 | `localization-validation` › a language that has not started is one warning | — | Covered |
| FR-VAL-05 | `localization-validation` › reports language-independent problems once, under English | — | Covered |
| FR-VAL-06 | `localization-validation` › reports language-independent problems once (child = warning) · editing text turns approved audio into errors | — | Covered |
| FR-VAL-07 | `localization-validation` › a fully translated book passes | — | Covered |

## Review workflow (J5, J6) · `features/review-workflow.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-REV-01 | `store` › refuses send for review while there are errors… then sends | `journeys` › J5 | Covered |
| FR-REV-02 | `access` › approval needs a Super Admin and no English errors | — | Partial (no E2E approves; J6 starts from an approved item) |
| FR-REV-03 | `access` › approval needs a Super Admin and no English errors | — | Covered |
| FR-REV-04 | `access` › approval needs a Super Admin · `store` › a Content Manager cannot promote, approve or switch production | — | Covered |
| FR-REV-05 | `publishing` › promote needs a Super Admin, an approved item… | — | Covered |
| FR-REV-06 | `publishing` › send for review is blocked while the item has validation errors · `store` › refuses send for review | `journeys` › J5 (disabled with the reason, then enabled) | Covered |
| FR-REV-07 | — | `journeys` › J8 (Promote disabled in production) | Partial (Send for review in production is not checked) |

## Promote (J6) · `features/promote.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-PRO-01 | `publishing` › keeps production IDs (the item is found by its `match`) | `journeys` › J6 (match step must be confirmed) | Partial (the prototype matches by a key and an id prefix, not a saved mapping) |
| FR-PRO-02 | `publishing` › diff: new and changed chunks; every Telugu chunk new; replaced audio is a change; only chosen languages | `journeys` › J6 (changes step) | Covered |
| FR-PRO-03 | — | `journeys` › J6 (the checks step is shown) | Partial (a failing blocker stopping the wizard is not tested) |
| FR-PRO-04 | — | `journeys` › J6 (Promote now disabled until both are typed) | Covered |
| FR-PRO-05 | `publishing` › keeps production IDs: rows are updated in place | — | Covered |
| FR-PRO-06 | `publishing` › never deletes: rows that exist only in production are kept | — | Covered |
| FR-PRO-07 | `publishing` › a new item lands switched off, with only English on | — | Covered |
| FR-PRO-08 | `publishing` › never switches anything on · `store` › a Super Admin promotes; it keeps its switches | `journeys` › J6 (Telugu off after promote) | Covered |
| FR-PRO-09 | `publishing` › leaves languages that were not chosen exactly as they are · does not copy a language that was not chosen | — | Covered |
| FR-PRO-10 | `publishing` › promote needs a Super Admin, an approved item, English, and no errors | — | Covered |
| FR-PRO-11 | `publishing` › revert restores the production copy saved before the promote | — | Covered |
| FR-PRO-12 | `publishing` › revert: a new item is switched off, not deleted | — | Covered |
| FR-PRO-13 | `publishing` › revert does nothing when there is no promote to undo | — | Covered |
| FR-PRO-14 | `store` › a Super Admin promotes… is audited · only a Super Admin reverts a promote | `journeys` › J6 (Activity shows the promote) | Partial (the languages named in the entry are not asserted) |

## Switches (J6) · `features/switches.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-SW-01 | `publishing` › an item with English errors cannot be switched on (allowed case) · `store` › logs switches with before/after | — | Partial (switching an item on in production is not exercised end to end) |
| FR-SW-02 | `publishing` › an item with English errors cannot be switched on in production | — | Covered |
| FR-SW-03 | `store` › a Super Admin promotes… (Telugu then switched on) | `journeys` › J6 (Telugu switched on, with confirmation) | Covered |
| FR-SW-04 | `publishing` › a language that is not complete cannot be switched on · `store` › an incomplete language stays off | — | Covered |
| FR-SW-05 | `store` › a Super Admin can switch a live production item off | — | Covered |
| FR-SW-06 | `access` › only a Super Admin… switches things in production (staging allowed) | `journeys` › J8 (switches locked for a Content Manager in production) | Covered |

## Permissions (J8) · `features/permissions.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-PERM-01 | — | `journeys` › J8 | Covered |
| FR-PERM-02 | `store` › nothing is edited while in production · a Content Manager cannot promote, approve or switch production | — | Covered |
| FR-PERM-03 | `access` › role policy (all five tests) | — | Covered |
| FR-PERM-04 | `access` › approval needs a Super Admin · `store` › only a Super Admin reverts a promote | — | Covered |
| FR-PERM-05 | — | `journeys` › J8 (`/promote` opened directly shows the blocked state) | Covered |

## Activity log (J9) · `features/audit.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-AUDIT-01 | `access` › adds the newest entry first | `journeys` › J9 (before and after shown) | Covered |
| FR-AUDIT-02 | — | `journeys` › J9 (environment filter, search) | Partial (filter by environment and text search; there is no filter by action) |
| FR-AUDIT-03 | `store` › entries for text edits, approval cleared, story create/delete, switches, promote, revert | — | Partial (not every change in the scenario's table is asserted) |
| FR-AUDIT-04 | `access` › keeps every older entry unchanged | — | Covered |
| FR-AUDIT-05 | `store` › nothing is edited while in production (audit length unchanged) | — | Covered |

## Bedtime stories (J7) · `features/bedtime-stories.feature`

| ID | Unit | E2E | Status |
|---|---|---|---|
| FR-STORY-01 | `store` › creates a story with its title | `journeys` › J7 | Covered |
| FR-STORY-02 | — | — | **Not covered** (cover, themes and characters are editable; nothing asserts it) |
| FR-STORY-03 | `localization-validation` › reports language-independent problems once (cover, character) | — | Partial (missing theme and missing scene not asserted) |
| FR-STORY-04 | `content` › puts story media under the bedtime stories folder | — | Covered |
| FR-STORY-05 | — (by construction: stories go through the same functions) | — | **Not covered** as a separate test |
| FR-STORY-06 | `store` › creates a story (blank title refused) | `journeys` › J7 (empty title error) · `keyboard` › dialog closes on Escape | Partial (that cancelling creates nothing is not asserted) |
| FR-STORY-07 | `store` › deletes a draft that never reached production · `publishing` › only a never-promoted draft can be deleted | — | Covered |
| FR-STORY-08 | `publishing` › only a draft that has never reached production can be deleted | — | Covered |

## Summary

78 functional requirements: 61 covered, 11 partial, 6 not covered (FR-LIB-04, FR-LIB-05, FR-EDIT-03, FR-QUIZ-05, FR-STORY-02, FR-STORY-05). Every requirement has a Gherkin scenario.
