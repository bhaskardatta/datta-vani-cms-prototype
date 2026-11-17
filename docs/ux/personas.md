# Personas

Three people use the Datta Vani CMS. Each has one role in the CMS, and the role decides what the screens let them do.
The prototype lets you switch between them from the top bar ("Viewing as").

How we work today, for context: the text of the books lives in **Google Docs**, translations are pasted in by hand, and audio and transcript files are **moved into place by scripts** that a developer runs. Nobody can see, in one place, which book is complete in which language, and nobody but a developer can put a fix live.

---

## 1. Content Manager: "the translator"

| | |
|---|---|
| **Who** | A volunteer translator or editor. Fluent in Telugu or Kannada and English. Not technical. Works a few evenings a week, often on a laptop. |
| **Role in the CMS** | Everything on **staging**: edit text, translate, upload or regenerate audio and transcripts, edit quizzes, add bedtime stories, validate, send for review. **Production: view only.** |
| **Main journeys** | J1, J2, J3, J4, J5, J7, J8 |

**Goals**
- Fix a wrong Telugu or Kannada sentence quickly, as soon as testers find it.
- Know that the audio matches the new words before moving on.
- See what is still missing in "my" language, without asking anyone.
- Hand finished work to the Super Admin with confidence that it is complete.

**Frustrations today**
- The English and the translation sit in different Google Docs; it is easy to translate the wrong paragraph.
- After a text fix, nobody knows if the audio was re-recorded. Old audio quietly stays live.
- Has to message a developer to run the script that moves files. Waits days for a one-word fix.
- Can't tell which sentences are still untranslated without reading the whole doc.
- Afraid of breaking the live app, so hesitates to change anything.

**What they need from the CMS**
- The English sentence shown right above the box they type in (W05, W06).
- Audio that is automatically marked **out of date** when the words change, with Regenerate and Upload on the same row (W05).
- A list of errors that jumps to the exact sentence (W07).
- To be unable to touch production, and to be told so clearly, so there is nothing to be afraid of (W08).

---

## 2. Super Admin: "the gatekeeper"

| | |
|---|---|
| **Who** | Dattu, or a core-team member. Understands the app, the data and the risks. Responsible for what 1,000+ families see. |
| **Role in the CMS** | Everything a Content Manager can do, plus **approve**, **promote staging → production**, and **switch content and languages on or off** in production. |
| **Main journeys** | J6, J9 (and J1 to check status) |

**Goals**
- Put a fixed or newly translated book live safely, without a developer.
- Release Telugu as soon as it is ready, even if Kannada is not.
- Know exactly what will change in production before it changes.
- Be able to undo a mistake.

**Frustrations today**
- Promoting means running scripts by hand and hoping the paths are right.
- No preview of what will change; the first sign of a mistake is a family reporting it.
- Hard to switch a single language on or off.
- No record of who changed what, so problems are hard to trace.

**What they need from the CMS**
- A step-by-step promote wizard that shows the changes, runs the 17 checks and a dry run, and asks for typed confirmation (W10 to W15).
- New content and new languages that **land switched off**, so going live is always a separate, deliberate step (W08, W15).
- A revert button and a complete activity log (W15, W16).

---

## 3. Support Lead: "the helper"

| | |
|---|---|
| **Who** | Someone who answers questions from families ("why is my child hearing English in the Telugu book?"). |
| **Role in the CMS** | **View only**, in both staging and production. Changes nothing. |
| **Main journeys** | J1, J9 |

**Goals**
- Check quickly whether a book or language is switched on in production.
- See whether a fix is already on staging and on its way.
- Find out when something changed, to explain it to a family.

**Frustrations today**
- Has to ask the team every time; no way to look it up.
- Can't tell staging from production when looking at shared docs.

**What they need from the CMS**
- The production Library with "families see it" and "languages on" columns (W03).
- The Activity log, searchable by item (W16).
- A clear, always-visible sign of which environment they are looking at (striped production banner).
- No buttons that could change anything; every edit control is locked and says why.
