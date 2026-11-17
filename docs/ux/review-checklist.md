# Review checklist: Tuesday 17 November

For Praveen, Amitha and Bhaskar, then the demo to Dattu.
How to use it: start each journey from the **Journeys** page in the prototype (it sets the role and opens the right screen), look at the matching wireframe on `/wireframes`, then answer the questions. Write the answer next to each question; anything marked **Decision** needs an owner.

## Before you start

- [ ] Everyone can open the prototype link and has pressed **Reset demo data**.
- [ ] We agree the sample books are placeholders; the real names and text come later.
- [ ] We agree this is a throwaway prototype: we are reviewing screens and scope, not code.

## J1 · See where everything stands (W02, W03)

- Can you tell, in five seconds, which book is holding up Telugu?
- Are the columns right? Is anything missing that you look for today (last editor, due date, tester notes)?
- Is "coverage = text + approved audio in required voices" the right definition?
- Is it clear that "On in staging app" and "In production" are different things?
- Does the Support Lead get what they need from the production view?

## J2 · Fix a Telugu sentence (W05)

- Is the English source in the right place, and is it enough context (or do translators need the sentence before and after)?
- When the text changes, is it obvious which voices need redoing?
- Is "save when you click outside the box" clear enough, or do we need a Save button?
- Is Play with word highlighting enough to check the audio and the transcript?
- **Decision:** who may approve audio, the same Content Manager or a second person?

## J3 · Upload a recorded audio file (W05, W17)

- Is the choice between Upload and Regenerate clear?
- Is it right that the transcript is always regenerated from the uploaded file, as a draft?
- What file formats and sizes must we accept?
- Is showing the fixed file path useful, or just noise for translators?

## J4 · Fix a Kannada quiz (W06)

- Is it clear what a translator may change (words) and may not change (type, order, correct answer)?
- Do quiz options need their own audio? (Not in the prototype.)
- Are the question types complete (multiple choice, true/false, others in the existing app)?

## J5 · Validate and send for review (W07)

- Are the error and warning rules right? Anything that should move between the two?
- Does jumping from an error to the exact chunk feel fast enough?
- **Decided:** Send for review is locked while there are errors in any started language (the button says how many to fix).
- Editing an item that is **In review** leaves it In review (only Approved goes back to Draft). Should an edit during review send it back to Draft, or notify the reviewer?
- **Decision:** which voices are required per language? (Prototype: female and male required, child optional.)

## J6 · Promote and switch on (W10–W15, W08)

- Is the six-step wizard too long for a small fix? Which steps could be combined for a one-sentence change?
- Is "match by name, confirm once" acceptable, given IDs differ between staging and production?
- Is the changes list (before/after per language) enough to trust the promote?
- Are all 17 checks from the PDF still wanted for 1 December? Which are blockers and which are warnings?
- Is typing the name and "production" the right level of friction?
- Is it right that new languages always land switched off, even when the book is already live?
- What exactly does **Revert** restore (rows only, or files too)?
- **Decision:** does a Super Admin approve each item, or can a second Content Manager?

## J7 · New bedtime story (W09)

- Are the fields right (title, description, cover, themes, characters)? Anything from the existing admin app missing?
- Who manages the themes and characters lists, and their translations?
- Confirm: no quizzes for bedtime stories.
- Do stories need the same promote wizard, or a lighter one?
- Is deleting an unpromoted draft (behind a confirm, logged) acceptable, given everything else is switch-off only?

## J8 · Content Manager stopped from production (W08, W03, W18)

- Is the production banner impossible to miss?
- Are the lock reasons understandable to a volunteer?
- Should a Content Manager even be able to switch to the production view, or only the Super Admin and Support Lead?

## J9 · See who changed what (W16)

- Does the log answer "who changed this sentence, and when?"
- Are environment filter and search enough, or do we need filters by person, book and date?
- How long do we keep the log?

## Across all screens

- Does every screen pass the five-second test: is the main action obvious?
- Are any words confusing (chunk, promote, staging, transcript)? Should the UI use different words for volunteers?
- Desktop only for now: is that acceptable for volunteers?
- Is anything in `docs/ux/ux-principles.md` wrong or missing?

## Open decisions to carry to Dattu

From section 8 of `PROTOTYPE-PLAN.md`, plus anything raised above:

1. Where translated text is stored (side tables, a jsonb column, or parallel trees). Blocks step 2.
2. Go or Python for cms-service.
3. Required voices per language.
4. Who approves.
5. Whether MFA, protected delete, AI images, quotas and kill-switches are needed for 1 December.
6. The real names and content of the 4 books, and the existing admin app's fields.
