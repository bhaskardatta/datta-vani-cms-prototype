# Datta Vani CMS: requirements

**Status:** starting draft, written from the clickable prototype (`cms-prototype/`) for the team to reuse.
**Sources:** Dattu's *CMS plan* PDF (8 Nov 2026), the team meeting on 15 Nov 2026, [PROTOTYPE-PLAN.md](../PROTOTYPE-PLAN.md).
**How to use it:** every functional requirement has an ID (like `FR-LIB-01`). The same ID is a tag on a Gherkin scenario in `features/`. Write the Ginkgo test from the scenario first, then the code.

Related documents:
- [Ubiquitous language](domain/ubiquitous-language.md): the words to use.
- [Context map](domain/context-map.md): bounded contexts, invariants, domain events, content model.
- `src/lib/domain/`: the rules as small TypeScript functions, with unit tests in `tests/`. These are a reference for the Go code, not code to copy.

## 1. Scope and priorities

| Priority | What | Feature files |
|---|---|---|
| **P1** | Telugu and Kannada for the 4 existing epics: see the hierarchy, edit text on staging, upload or regenerate audio and transcripts per voice, edit quizzes, validate, review, promote to production, switch on per language. | `library`, `editing-translation`, `audio-transcripts`, `quizzes`, `validation`, `review-workflow`, `promote`, `switches`, `permissions`, `audit` |
| **P2** | Bedtime stories: add and edit stories (no quizzes), with cover, themes, characters, scenes, chunks and audio. | `bedtime-stories` |
| **Out of scope for now** | MFA, protected delete/purge, AI image generation, quotas, kill-switches. See open question 5. | — |

Ground rules (apply to everything):
1. Edit on **staging** only. Production is read-only, except a Super Admin's promote, revert and on/off switches.
2. New things **land switched off** until a Super Admin switches them on.
3. **Nothing is deleted.** Promote never deletes; revert of a new item switches it off.
4. **Every change is logged** in the activity log.
5. **People translate.** The CMS shows English next to the translation and never translates.
6. **Files live at fixed paths** built from one base path.

## 2. Personas

| Persona | Who | Can do |
|---|---|---|
| **Content Manager** | Volunteer translator or editor | Everything on staging: edit text, audio, quizzes, stories; validate; send for review. Production: view only. |
| **Super Admin** | Dattu or a core-team member | Everything, plus approve, promote, revert, and switch items and languages on or off in production. |
| **Support Lead** | Answers families' questions | View only, both environments. |

## 3. User journeys

| Journey | Summary | Feature file |
|---|---|---|
| J1 | See where everything stands (library) | `library.feature` |
| J2 | Fix a Telugu sentence, regenerate audio, approve | `editing-translation.feature`, `audio-transcripts.feature` |
| J3 | Upload a recorded audio file instead | `audio-transcripts.feature` |
| J4 | Fix a quiz question in Kannada | `quizzes.feature` |
| J5 | Validate and send for review | `validation.feature`, `review-workflow.feature` |
| J6 | Approve, promote and switch on (Super Admin) | `review-workflow.feature`, `promote.feature`, `switches.feature` |
| J7 | Add a new bedtime story (P2) | `bedtime-stories.feature` |
| J8 | A Content Manager is stopped from touching production | `permissions.feature` |
| J9 | See who changed what | `audit.feature` |

## 4. Functional requirements

Each ID links to the scenario with the same tag.

### Library — [`features/library.feature`](../features/library.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-LIB-01 | P1 | The library lists every epic and bedtime story, with review status, on/off in staging and production, coverage per language, and the number of validation errors. *(The team lead's first scenario.)* |
| FR-LIB-02 | P1 | Coverage for a language = chunks with text **and** current audio in every required voice ÷ all chunks. |
| FR-LIB-03 | P1 | The optional (child) voice does not affect coverage. |
| FR-LIB-04 | P1 | A row names the languages that have errors. |
| FR-LIB-05 | P1 | An item that is not in production says so. |

### Editing and translation — [`features/editing-translation.feature`](../features/editing-translation.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-EDIT-01 | P1 | Text is edited on staging; production does not change. |
| FR-EDIT-02 | P1 | Production is read-only for editing, for every role. |
| FR-EDIT-03 | P1 | The English text is shown next to the box being translated. The CMS never fills in a translation. |
| FR-EDIT-04 | P1 | The editor shows the tree section › chapter › scene › chunk (+ quiz), labelled in the chosen language with English as fallback. |
| FR-EDIT-05 | P1 | Saving the same text again is not a change: nothing saved, no audio marked out of date, nothing logged. |
| FR-EDIT-06 | P1 | Editing an approved item sends it back to draft ("Approval cleared"). |

### Audio and transcripts — [`features/audio-transcripts.feature`](../features/audio-transcripts.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-AUD-01 | P1 | Changing a chunk's text in one language marks that language's audio out of date, for every voice. Other languages are not touched. |
| FR-AUD-02 | P1 | Missing audio stays missing after a text change. |
| FR-AUD-03 | P1 | A draft also goes out of date after a text change. |
| FR-AUD-04 | P1 | Regenerate makes a draft (audio + transcript). Play highlights each word. Approve makes it current. |
| FR-AUD-05 | P1 | Upload makes a draft that keeps the file name; the transcript is made from the uploaded audio. |
| FR-AUD-06 | P1 | Reject restores exactly what was there before (state, source, file). |
| FR-AUD-07 | P1 | Reject after two drafts in a row restores the asset from before the first draft. |
| FR-AUD-08 | P1 | Approve and reject only work on a draft. |
| FR-AUD-09 | P1 | Files live at fixed paths: `<chunk folder>/[<lang>/]body/<voice>/audio.mp3` and `transcript.json`. English has no language folder. |
| FR-AUD-10 | P1 | A transcript has one entry per word, in order, without overlaps. |

### Quizzes — [`features/quizzes.feature`](../features/quizzes.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-QUIZ-01 | P1 | Question text, answer options and hint can be translated per language. |
| FR-QUIZ-02 | P1 | The correct answer and option order are the same in every language and are set on English only. |
| FR-QUIZ-03 | P1 | Missing question text or a missing option in a started language is an error. |
| FR-QUIZ-04 | P1 | Every chapter of an epic needs a quiz. |
| FR-QUIZ-05 | P1 | Question types: multiple choice, true or false, fill in the blank, match the pairs, anagram. |

### Validation — [`features/validation.feature`](../features/validation.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-VAL-01 | P1 | Validate lists errors and warnings per language. |
| FR-VAL-02 | P1 | Each issue points at the exact node (where + message). |
| FR-VAL-03 | P1 | Clicking an issue opens that node in that language. |
| FR-VAL-04 | P1 | A language with no text at all is one warning ("not started"), not errors. |
| FR-VAL-05 | P1 | Language-independent problems (images, themes, characters, structure) are reported once, under English. |
| FR-VAL-06 | P1 | Missing, draft or out-of-date audio is an error for a required voice and a warning for the child voice. |
| FR-VAL-07 | P1 | A fully translated item passes with no errors. |

### Review workflow — [`features/review-workflow.feature`](../features/review-workflow.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-REV-01 | P1 | A Content Manager sends a draft for review. |
| FR-REV-02 | P1 | A Super Admin approves an item in review. |
| FR-REV-03 | P1 | Approve is blocked while English has errors. |
| FR-REV-04 | P1 | A Content Manager cannot approve. |
| FR-REV-05 | P1 | Only an approved item can be promoted. |
| FR-REV-06 | P1 | Send for review is blocked while the item has any validation error (in any language that has started); the service refuses it too. |
| FR-REV-07 | P1 | In production, Send for review and Promote stay visible but disabled, with the reason. |

### Promote — [`features/promote.feature`](../features/promote.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-PRO-01 | P1 | The staging item is matched to the production item by its saved match, not by ID. |
| FR-PRO-02 | P1 | Before promoting, the Super Admin sees new, changed and unchanged chunks per language, with before and after text. No deletions are ever listed. |
| FR-PRO-03 | P1 | The pre-promote checks (17 in the PDF) are shown; a failed blocker stops the promote. |
| FR-PRO-04 | P1 | The Super Admin types the item name and "production" to confirm, after a clean dry run. |
| FR-PRO-05 | P1 | Production IDs are kept; rows are updated in place. |
| FR-PRO-06 | P1 | Promote never deletes a production row or file. |
| FR-PRO-07 | P1 | A new item lands switched off, with only English on. |
| FR-PRO-08 | P1 | An existing item keeps its root switch and language switches. |
| FR-PRO-09 | P1 | Languages not chosen keep their production text and audio. |
| FR-PRO-10 | P1 | Promote needs: Super Admin, approved item, English included, no errors in the chosen languages. |
| FR-PRO-11 | P1 | A snapshot is saved before each promote; revert restores it. |
| FR-PRO-12 | P1 | Reverting a new item switches it off; it is not deleted. |
| FR-PRO-13 | P1 | Revert with nothing to undo does nothing. |
| FR-PRO-14 | P1 | Promote and revert are logged, naming the languages. |

### Switches — [`features/switches.feature`](../features/switches.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-SW-01 | P1 | A Super Admin switches an item on in production; it is logged. Families see it after the cache refresh (about 10 minutes). |
| FR-SW-02 | P1 | An item with English errors cannot be switched on in production. |
| FR-SW-03 | P1 | A Super Admin switches on a complete language (100% coverage, no errors). |
| FR-SW-04 | P1 | An incomplete language cannot be switched on; the service refuses it too. |
| FR-SW-05 | P1 | Switching off is always allowed; families then see English. |
| FR-SW-06 | P1 | A Content Manager may switch items on and off in staging only. |

### Permissions — [`features/permissions.feature`](../features/permissions.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-PERM-01 | P1 | In production, a Content Manager sees every control read-only, with the reason. |
| FR-PERM-02 | P1 | The service refuses a forbidden request even if the screen allowed it; nothing changes and nothing is logged. |
| FR-PERM-03 | P1 | The role table (edit / switch / promote per role and environment) is enforced. |
| FR-PERM-04 | P1 | Only a Super Admin approves and reverts. |
| FR-PERM-05 | P1 | Opening the promote page as anyone but a Super Admin shows a blocked state, not the wizard. |

### Activity log — [`features/audit.feature`](../features/audit.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-AUDIT-01 | P1 | Each entry shows who, what, where, before, after, when; newest first. |
| FR-AUDIT-02 | P1 | The log can be filtered by environment and action. |
| FR-AUDIT-03 | P1 | Every change listed in the feature file is logged. |
| FR-AUDIT-04 | P1 | The log is append-only. |
| FR-AUDIT-05 | P1 | A refused action is not logged. |

### Bedtime stories — [`features/bedtime-stories.feature`](../features/bedtime-stories.feature)

| ID | Priority | Requirement |
|---|---|---|
| FR-STORY-01 | P2 | A Content Manager creates a new story: a switched-off draft with one scene and one empty chunk. |
| FR-STORY-02 | P2 | A story has title, description, cover, themes, characters, scenes, chunks and audio. |
| FR-STORY-03 | P2 | A story needs a cover, at least one theme, one character and one scene. |
| FR-STORY-04 | P2 | Story media lives under `content_media/bedtime_stories/stories/<num>/`. |
| FR-STORY-05 | P2 | Stories follow the same editing, audio, review, promote and switch rules as epics. |
| FR-STORY-06 | P2 | A new story needs a title, asked for in a dialog; cancelling creates nothing. |
| FR-STORY-07 | P2 | A Content Manager or Super Admin can delete a story on staging that is a draft and has never been promoted; it is logged. |
| FR-STORY-08 | P2 | Anything in review, approved, or present in production cannot be deleted. |

## 5. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 Security | Every permission rule is enforced on the server (cms-service), not only by hiding buttons. A forbidden request changes nothing. |
| NFR-02 Safety | Promote runs as one transaction per item: all or nothing. A snapshot is written before any production row changes. |
| NFR-03 Safety | No hard deletes of anything that has reached production. "Remove" means switch off. The one exception: a staging draft that was never promoted can be deleted (FR-STORY-07). |
| NFR-04 Auditability | Every change writes an audit entry in the same transaction as the change. Audit entries cannot be updated or deleted. |
| NFR-05 Blast radius | One item per promote; the number of files per promote is capped (number to be agreed). |
| NFR-06 Freshness | Families see a switch change within about 10 minutes (cache refresh). |
| NFR-07 Text | All text is stored and shown as UTF-8 and renders Telugu and Kannada script correctly. Trailing spaces are trimmed on save. |
| NFR-08 Media | Media paths are fixed and built from one base path; the app never stores full URLs. |
| NFR-09 Accessibility | The CMS works with a keyboard; disabled controls say why; colour is never the only signal. |
| NFR-10 Testability | Each FR has at least one Gherkin scenario and one automated test (Ginkgo for cms-service). Domain rules are pure functions that need no database to test. |
| NFR-11 Browser | Desktop browsers (latest Chrome, Edge, Safari, Firefox). Mobile is not needed for the CMS. |

## 6. Open questions

1. **Where is translated text stored?** Side tables, a jsonb column, or parallel trees. Blocks Dattu's step 2. The domain model is the same either way.
2. **Go or Python for cms-service?** The meeting leaned Go (Ginkgo for tests).
3. **Which voices are required per language?** The prototype says female and male required, child optional.
4. **Who approves?** Only a Super Admin, or can a second Content Manager approve?
5. **The PDF's left-out pieces** (MFA, protected delete, AI images, quotas, kill-switches): needed for 1 December, or later?
6. **The real names and content of the 4 books**, and the existing admin app's fields, so the editor matches them.
7. **How are staging and production rows matched?** The prototype uses a name match for items and an id prefix for children. The real CMS needs a saved mapping table.
8. **How many levels of revert?** The prototype keeps one snapshot per item (undo the last promote only).
9. **Should editing English mark translations for review?** Today an English edit only marks English audio out of date.
10. **File cap per promote** (NFR-05): what number?
