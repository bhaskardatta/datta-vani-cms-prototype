# Ubiquitous language

These are the words the team, the code and the screens should all use. If a word here and a word in the UI or code disagree, change one of them so they match.

The code name is in `code font` (from `src/lib/domain/`).

## Content

| Word | Meaning | Code |
|---|---|---|
| **Item** | One top-level thing in the library: an epic or a bedtime story. Promote, review and on/off all work on a whole item. | `Item` |
| **Epic** (also "book") | A long story told in sections and chapters, with quizzes. Say "epic" on screen; the code says `Book`. The 4 existing ones are the Priority 1 work. | `Book` |
| **Bedtime story** | A short story told in scenes, with a cover, themes and characters. No quiz. Priority 2. | `Story` |
| **Section** | A part of an epic (for example "Bala Kanda"). Holds chapters. | `Section` |
| **Chapter** | Part of a section. Has a title, chapter text, a key takeaway, an Ask-Tataji question, scenes, and a quiz. | `Chapter` |
| **Scene** | One picture's worth of story. Has a portrait and a landscape image, and holds chunks. | `Scene` |
| **Chunk** | One sentence (or a few) that is read aloud. The smallest piece. Has text, audio and a transcript per language and voice. | `Chunk` |
| **Quiz** | The questions at the end of a chapter. | `Quiz` |
| **Question** | One quiz question: question text, answer options, the correct answer, a hint. The options and the correct answer are shared by all languages. | `Question` |
| **Key takeaway** | The one-line lesson of a chapter. | `takeaway` |
| **Ask-Tataji question** | The question a child can ask Tataji about the chapter. | `ask` |
| **Theme** / **Character** | Tags on a bedtime story, picked from a shared list. | `themes`, `characters` |
| **Match** | The saved link between a staging item and its production item. IDs are different in the two environments, so we never match by ID. | `match` |

## Languages and translation

| Word | Meaning | Code |
|---|---|---|
| **Language** | English (`en`), Telugu (`te`) or Kannada (`kn`). | `Lang` |
| **Localized text** | One piece of text with a value per language. | `Text` / `LocalizedText` |
| **Source language** | English. Every translation is made from it and shown next to it. | — |
| **Fallback** | When a language is missing or switched off, families see English. | `fallback()` |
| **Started** | A language has started when at least one chunk has text in it. English is always started. | `started()` |
| **Coverage** | Share of chunks that have text **and** approved audio in every required voice, for one language. 100% coverage means "complete". | `coverage()` |
| **Translate** | Done by a person, never by the CMS. | — |

## Audio and transcripts

| Word | Meaning | Code |
|---|---|---|
| **Voice** | Female, male or child. | `Voice` |
| **Required voice** | Female and male. A missing required voice is an error. Child is optional (a warning). | `REQUIRED` |
| **Audio** (audio asset) | One voice's recording for one chunk in one language, plus its transcript. | `Audio` / `AudioAsset` |
| **Transcript** (word timings) | A list of every word with its start and end time, used to highlight words as they are spoken. | `wordTimings()` |
| **Current** | Approved audio that matches the text. | `'current'` |
| **Draft** | New audio (regenerated or uploaded) that is waiting for approval. | `'draft'` |
| **Out of date** (stale) | The text changed after the audio was made. Say "out of date" on screen; the code says `stale`. | `'stale'` |
| **Missing** | No audio yet. | `'missing'` |
| **Regenerate** | Make new audio and transcript from the text. Gives a draft. | `applyAudio(…, 'regenerate')` |
| **Upload** | Add a recorded file. The transcript is made from it. Gives a draft. | `applyAudio(…, 'upload')` |
| **Approve** / **Reject** (audio) | Accept the draft (it becomes current), or throw it away (what was there before comes back). | `applyAudio(…)` |
| **Media path** | The fixed place a file lives, like `…/chunks/1/te/body/female/audio.mp3`. English files sit at the chunk folder's root. | `audioPath()` |

## Checking and review

| Word | Meaning | Code |
|---|---|---|
| **Validate** | Check an item and list its issues. | `validate()` |
| **Issue** | One problem found by validation, for one language, pointing at one node. | `Issue` |
| **Error** | An issue that blocks approve, promote and switching on. | `level: 'error'` |
| **Warning** | An issue that is shown but blocks nothing. | `level: 'warning'` |
| **Status** | Where an item is in review: **Draft**, **In review**, **Approved**. The code calls Approved `ready`. | `Status` |
| **Send for review** | Draft → In review. | — |
| **Approve** (item) | In review → Approved. Super Admin only, no English errors. | `blockApprove()` |
| **Approval cleared** | Editing an approved item sends it back to Draft. | — |

## Environments and publishing

| Word | Meaning | Code |
|---|---|---|
| **Staging** | Where the team edits and tests. | `'staging'` |
| **Production** | What families see. Read-only except for promote and the switches. | `'production'` |
| **Promote** | Copy an approved item from staging into production, for the chosen languages. Super Admin only. Never deletes. | `promoteInto()` |
| **Promote plan** (changes) | What a promote would do: new, changed and unchanged chunks per language. | `diff()` |
| **Dry run** | Run the promote plan without writing anything, to check it. | — |
| **Snapshot** | The production item as it was just before a promote. Used by revert. | `snapshots` |
| **Revert** | Undo the last promote of an item using its snapshot. If the item was new, switch it off (nothing is deleted). | `revertPromote()` |
| **Switched on / off** (root switch, `is_active`) | Whether families can see the item at all. New items land switched off. | `active` |
| **Language switch** | Whether families see a language for this item. Off means they see English. | `langOn` |
| **Lands switched off** | After a first promote, the item is in production but not visible until a Super Admin switches it on. | — |

## People

| Word | Meaning | Code |
|---|---|---|
| **Content Manager** | A volunteer translator or editor. Edits everything on staging. Views production. | `'cm'` |
| **Super Admin** | Dattu or a core-team member. Everything a Content Manager can do, plus approve, promote, revert, and switch things in production. | `'sa'` |
| **Support Lead** | Answers families' questions. View only, both environments. | `'support'` |
| **Activity log** (audit) | The list of every change: who, what, where, before, after, when. Never edited or removed. | `AuditEntry`, `record()` |

## Words to avoid

- "Publish" — say **promote** (to production) or **switch on** (make visible). They are two separate steps.
- "Delete" — nothing is deleted. Say **switch off**.
- "Translate" as a button — the CMS never translates.
- "Sync" — say **promote** (staging → production) or **refresh staging** (production → staging).
