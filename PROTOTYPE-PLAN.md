# Datta Vani CMS: prototype plan

> The plan written for the 17 November review, kept as it was. For how to run, test and extend the prototype, start at the [README](README.md) and [docs/](docs/README.md).

**For:** the Tuesday 17 November 2026 review (Praveen, Amitha, Bhaskar), then the demo to Dattu before anything real is built.
**Sources:** Dattu's *CMS plan* PDF (8 Nov 2026), the team meeting on 15 Nov 2026, the onboarding site.
**Open it:** https://datta-vani-cms-prototype.vercel.app (public link, sample data only; each person's edits stay in their own browser).
**Run it locally:** `cd cms-prototype && npm run dev`, then open http://localhost:3000. **Update the link:** `cd cms-prototype && vercel deploy --prod`.

---

## 1. What this prototype is for

The meeting's next step was: *"build high-level UI prototypes / wireframes for the Content Admin user journey… show it to Dattambar before we start implementing."* This is that prototype. It lets everyone click through the CMS and agree on the screens and the scope before anyone writes the real thing.

It is a **throwaway review tool**. It uses fake sample data kept in your browser, talks to no database, holds no keys, and none of its code goes into the real CMS.

## 2. Scope, as agreed in the meeting

| Release priority | What the CMS must do | In the prototype |
|---|---|---|
| **1 · Telugu and Kannada for the 4 existing books** | Show the hierarchy, edit text during testing, upload or regenerate audio and word-timing transcripts per voice, edit quizzes, validate, promote to production, switch on | **Fully clickable** |
| **2 · Bedtime stories** | Add and edit stories (no quizzes), with themes, characters, audio | **Fully clickable** |
| Safety rules from the PDF | Staging-only editing, Super Admin promote, lands switched off, nothing hard-deleted, every change logged | **Built in** (role rules, promote checks, activity log) |
| Not discussed in the meeting | MFA, delete/purge flow, AI image generation, quotas, kill-switches | **Left out**: listed in section 8 |

Ground rules the screens follow:
- **Edit on staging only.** Production is read-only for everyone except the Super Admin's promote, enable and disable.
- **New things land switched off** (`is_active = false`) until a Super Admin enables them.
- **Translation is done by people.** The CMS shows the English next to the Telugu or Kannada box; it never translates.
- **Files live at fixed paths.** The media panel shows the path each file lives at (`…/te/body/female/audio.mp3`), because the app builds every URL from one base path.

## 3. Who uses it

| Persona | Who they are | What they can do |
|---|---|---|
| **Content Manager** | A volunteer translator or editor | Everything on staging: edit text, upload or regenerate audio and transcripts, edit quizzes, add stories, validate, send for review. Production: view only |
| **Super Admin** | Dattu or a core-team member | Everything, plus approve, promote to production, enable or disable in production, per language |
| **Support Lead** | Someone answering families' questions | View only, both environments |

A role switcher sits in the top bar, so a reviewer can see what each persona sees. Buttons a role can't use stay visible but disabled, and say why.

## 4. User journeys

Each journey can be started from the **Journeys** page in the prototype.

### J1 · See where everything stands (Praveen's first scenario)
*Given I am signed in as a Content Manager, when I open the library, then I see all the epics and bedtime stories with their enabled state and language coverage.*
1. Sign in → **Library**.
2. Each row shows: status (draft · in review · ready), on/off in staging and in production, coverage bars for English, Telugu, Kannada, and the number of validation errors.
**Done when:** the reviewer can tell, in five seconds, which book is blocking Telugu.

### J2 · Fix a Telugu sentence found during testing
1. Library → open *Ramayana* → switch to the **Telugu** tab.
2. Tree: section → chapter → scene → **chunk**.
3. The English sentence is shown above the Telugu box. Edit the Telugu text.
4. The CMS marks that chunk's Telugu audio and transcript as **out of date**, because the words changed.
5. Press **Regenerate** for each voice (female, male, child) → a **draft** appears → **Play** it (words highlight as they're spoken) → **Approve**.
**Done when:** the chunk shows text, audio and transcript all current for Telugu.

### J3 · Upload a recorded audio file instead
1. Same chunk → **Upload** on a voice → pick an MP3.
2. The transcript is regenerated from the uploaded audio as a draft → approve.

### J4 · Fix a quiz question in Kannada
1. Chapter → **Quiz** → pick a question → **Kannada** tab.
2. Edit the question, options, hint; the correct answer and option order stay the same as English.

### J5 · Check and send for review
1. Item header → **Validate**. The panel lists **errors** (block promote and enable) and **warnings**, per language.
2. Click an error → the editor jumps to the exact chunk.
3. When there are no errors → **Send for review**.

### J6 · Promote and switch on (Super Admin)
1. Switch role to Super Admin → open the item → **Approve** → **Promote to production**.
2. **Match:** the CMS matches the staging book to the production one by its name (IDs differ between the two).
3. **Changes:** new, changed and unchanged chapters and chunks, per language, with before-and-after text.
4. **Checks:** the PDF's 17 pre-promote checks, each passed or failed. A failed blocker stops here.
5. **Dry run** → **type the book name and "production"** → **Promote**.
6. It lands **switched off** in production. Switch to the Production environment → enable the book, then enable **Telugu**.
**Done when:** production shows the book on, Telugu on, and the activity log has every step.

### J7 · Add a new bedtime story (Priority 2)
1. Library → **New bedtime story** → title, description, cover, themes, characters.
2. Add scenes and chunks, add audio per voice, validate, send for review.

### J8 · A Content Manager is stopped from touching production
1. As a Content Manager, switch to Production → every edit control is read-only; Promote says *Only a Super Admin can promote*.

### J9 · See who changed what
1. **Activity** → filter by environment or action → each entry shows who, what, before and after, and when.

## 5. Wireframes

Low-fidelity layouts of the three main screens. The clickable prototype follows these.

**Library**
```
┌ STAGING ▾ ────────────────────────────── Role: Content Manager ▾ ┐
│ Library                                       [ + New bedtime story ] │
│ [ All | Epics | Bedtime stories ]                                 │
│ ─────────────────────────────────────────────────────────────── │
│ Name            Status     Staging Prod   EN    TE    KN   Checks  │
│ Ramayana        In review  ○ off   ● on   ███   ██░   █░░  3 errors│
│ Mahabharatam    Draft      ○ off   ● on   ███   █░░   ░░░  9 errors│
│ The Kind Deer   Ready      ○ off   —      ███   ███   ███  ✓       │
└─────────────────────────────────────────────────────────────────┘
```

**Editor** (book or story)
```
┌ Ramayana · In review          [ Validate ] [ Send for review ] [ Promote ] ┐
│ [ English | Telugu ● | Kannada ]                                         │
│ ┌ Tree ─────────────┐ ┌ Chunk 2 · Scene 1 · Chapter 1 ────────────────┐ │
│ │ ▾ Bala Kanda      │ │ English (source)                               │ │
│ │   ▾ The Prince…   │ │ "King Dasharatha ruled the city of Ayodhya."   │ │
│ │     ▾ Scene 1     │ │ Telugu                                         │ │
│ │       • Chunk 1   │ │ [ అయోధ్య నగరాన్ని దశరథ మహారాజు పాలించాడు.   ] │ │
│ │       • Chunk 2 ◀ │ │ Audio + transcript                             │ │
│ │     ▸ Scene 2     │ │ female  ✓ current   ▶ Play  Regenerate  Upload │ │
│ │     ◇ Quiz        │ │ male    ! draft     ▶ Play  Approve  Reject    │ │
│ │ ▸ Ayodhya Kanda   │ │ child   ✗ missing         Regenerate  Upload   │ │
│ └───────────────────┘ │ Files: …/chunks/2/te/body/female/audio.mp3     │ │
│                       └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

**Promote** (Super Admin)
```
  ① Match ── ② Changes ── ③ Checks ── ④ Dry run ── ⑤ Confirm ── ⑥ Done
  ┌──────────────────────────────────────────────────────────────┐
  │ Staging "Ramayana"  →  Production "Ramayana" (matched by name) │
  │ Languages to promote: [✓] English [✓] Telugu [ ] Kannada (2 errors) │
  │ 3 chunks changed · 1 chunk new · 0 deleted (promote never deletes) │
  │ Lands switched OFF in production until a Super Admin enables it   │
  │                                            [ Back ]  [ Next → ]   │
  └──────────────────────────────────────────────────────────────┘
```

## 6. Screens in the prototype

| Screen | What's on it |
|---|---|
| Sign in | Fake sign-in: pick a persona |
| Library | Epics and bedtime stories, status, on/off per environment, language coverage, validation count, new story |
| Editor | Language tabs, tree, panels for book, section, chapter, scene, chunk, quiz and story; validation panel; workflow buttons; on/off switches in production |
| Promote | Six-step wizard: match, changes, checks, dry run, typed confirmation, result |
| Activity | Every change, filterable |
| Journeys | The journeys above, each with a Start button that sets the role and opens the right screen |

Top bar on every screen: environment switch (Staging / **Production** in a warning colour), role switch, and **Reset demo data**.

## 7. Sample data

Four sample books (*Ramayana*, *Mahabharatam*, *Book of Datta*, *Bhagavad Gita lessons*) and three bedtime stories. These are **placeholders**, not the real content: the names of the 4 real books and their text should replace them once the team has staging access. A few problems are planted on purpose (missing Telugu text, missing male-voice audio, an incomplete quiz), so validation and promote have something to show.

Audio is simulated: **Play** speaks the sentence with the browser's built-in voice (where it has one for that language) and highlights each word from the transcript timings.

## 8. Decisions made, and questions still open

**Defaults I took for the prototype** (change any of them):
- Clickable front end with fake data; nothing connects to Supabase or R2.
- The onboarding site's colours and fonts (indigo, coral, Inter / DM Sans).
- Desktop layout.
- Required voices: female and male are required; child is optional (a warning, not an error).
- Translated text is shown per language on the same item. How it's *stored* is still open (below); the screens look the same either way.

**For the team to settle** (none of these change the screens much):
1. Where translated text is stored: side tables, a jsonb column, or parallel trees. This blocks Dattu's step 2.
2. Go or Python for cms-service (meeting leaned Go).
3. Which voices are required per language.
4. Who approves: does a Super Admin approve each item, or can a second Content Manager?
5. Whether the PDF's left-out pieces (MFA, protected delete, AI images, quotas, kill-switches) are needed for 1 December or later.
6. The real names and content of the 4 books, and the existing admin app's fields, so the editor matches them.
