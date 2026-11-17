# Journey maps

One table per journey (J1 to J9, the same numbers as `PROTOTYPE-PLAN.md` and the Journeys page in the prototype).
"W" numbers point at the wireframes on the `/wireframes` page.

Columns:
- **Step**: what the user does.
- **Screen**: where it happens.
- **What the user thinks**: their likely question or feeling at that moment.
- **Pain point today**: what goes wrong in the current Google Docs + scripts process, or a risk in the new screen.
- **Opportunity**: what the CMS does about it.

---

## J1 · See where everything stands

**Persona:** Content Manager (also Support Lead, Super Admin) · **Trigger:** start of a work session, or Praveen asks "where are we with Telugu?" · **Done when:** they can tell in five seconds which book is holding up Telugu.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Sign in, pick role | Sign in (W01) | "Which role am I?" | Shared logins, no roles | Role picked once; buttons follow the role |
| Read the table | Library, staging (W02) | "Which book is behind in Telugu?" | Must open every Google Doc | One coverage bar per language per book |
| Check errors | Library (W02) | "Is anything blocking?" | Problems found only at release | Error count and languages with errors per row |
| Filter to stories | Library tabs (W02) | "And the bedtime stories?" | Stories tracked in a separate sheet | Same table, tab filter |
| Flip to Production | Library, production (W03) | "What do families see right now?" | Nobody is sure what is live | "Families see it" + "Languages on" columns |

## J2 · Fix a Telugu sentence found during testing

**Persona:** Content Manager · **Trigger:** a tester reports a wrong Telugu sentence · **Done when:** the chunk shows text, audio and transcript all current for Telugu.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Open the book | Library → Editor (W02 → W04) | "Where is that sentence?" | Searching long docs | Tree: section → chapter → scene → chunk |
| Switch to Telugu | Editor tabs (W05) | "Am I in the right language?" | Easy to edit the wrong doc | Language tab with coverage %; label on every field |
| Edit the sentence | Chunk (W05) | "What did the English say?" | English is in another doc | English source shown above the box |
| See audio go out of date | Chunk audio rows (W05) | "Does the audio still match?" | Old audio silently stays live | Changed text marks audio **out of date** automatically |
| Regenerate each voice | Audio row (W05, W17) | "How long will this take?" | Ask a developer, wait days | Regenerate button with busy state, per voice |
| Play and approve | Audio row (W05) | "Does it sound right?" | No easy way to listen with the words | Play highlights words from the transcript; Approve/Reject |

## J3 · Upload a recorded audio file instead

**Persona:** Content Manager · **Trigger:** a volunteer recorded a voice by hand, or generated audio sounds wrong · **Done when:** the uploaded audio and its transcript are approved.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Find the voice row | Chunk (W05) | "Which voice is missing?" | No overview of voices | Missing voice shown with a dashed pill |
| Upload the MP3 | Audio row (W05) | "Upload or regenerate?" | Files emailed, then moved by script | Upload sits next to Regenerate; path is fixed |
| Transcript is made | Audio row (W17) | "Do I need to time the words?" | Manual timing files | Transcript generated from the audio, as a draft |
| Play and approve | Audio row (W05) | "Is the timing right?" | Can't check timing | Word highlighting during playback |

## J4 · Fix a quiz question in Kannada

**Persona:** Content Manager · **Trigger:** Kannada quiz incomplete or wrong · **Done when:** every question, option and hint has Kannada text.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Open the chapter quiz | Tree → Quiz (W06) | "Which questions need work?" | Quiz in a spreadsheet tab | Dot on each question missing Kannada |
| Translate question | Quiz (W06) | "What does the English say?" | Copy-paste between files | English shown above each field |
| Translate options | Quiz (W06) | "Can I reorder these?" | Options got reordered, answers broke | Option order and correct answer locked to English |
| Add the hint | Quiz (W06) | "Is the hint required?" | Hints forgotten | Missing hint shows as a dashed box and a validation item |

## J5 · Check and send for review

**Persona:** Content Manager · **Trigger:** work on an item is finished · **Done when:** the item is "In review" with no errors.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Press Validation | Editor header (W07) | "Am I done?" | No check exists | Panel lists errors and warnings per language |
| Read the rule | Validation panel (W07) | "What actually blocks me?" | Unclear standards | Rule written at the top: errors block, warnings don't |
| Click an error | Validation panel → chunk (W07) | "Where is it?" | Hunting through docs | Jumps to the exact chunk in the right language |
| Fix it | Chunk (W05) | "Is it gone now?" | No feedback | Count updates; tree dot disappears |
| Send for review | Editor header (W04, W07) | "Who sees this next?" | Message on WhatsApp | Status changes to In review; logged in Activity |

## J6 · Promote and switch on (Super Admin)

**Persona:** Super Admin · **Trigger:** an item is in review and ready to go live · **Done when:** production shows the book on, Telugu on, and the activity log has every step.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Approve | Editor header (W04) | "Has English got errors?" | No gate | Approve locked while English has errors, with reason |
| Match | Promote 1 (W10) | "Is this the same book in production?" | IDs differ; scripts guess | Match by name and text; confirmed once, saved |
| Review changes | Promote 2 (W11) | "What exactly changes for families?" | No preview | New / changed / unchanged per language, before and after |
| Pick languages | Promote 2 (W11) | "Can Telugu go without Kannada?" | All or nothing | Tick languages; ones with errors are locked out |
| Read 17 checks | Promote 3 (W12) | "Is it safe?" | Checks done from memory, if at all | All 17 checks listed; a failure stops here |
| Dry run | Promote 4 (W13) | "Will it work?" | First run is the real run | Runs the plan without writing |
| Type to confirm | Promote 5 (W14) | "Am I sure?" | One wrong command and it's live | Type the name and "production" |
| See the result | Promote 6 (W15) | "Can families see it now?" | Unclear | Plain sentence: lands off / stays on; revert available |
| Switch on | Production editor (W08) | "Is Telugu complete?" | Toggle by database edit | Book switch + one switch per language, locked until complete |

## J7 · Add a new bedtime story (Priority 2)

**Persona:** Content Manager · **Trigger:** a new story is written and approved for production · **Done when:** the story passes validation and is sent for review.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| New bedtime story | Library (W02) | "Where do I start?" | Developer creates the record | One primary button on the Library |
| Title, description, cover | New story (W09) | "What is required?" | Requirements unwritten | Empty required fields shown dashed; validation lists them |
| Themes, characters | New story (W09) | "How do I spell this character?" | Spelling varies between stories | Picked from shared lists |
| Add scenes and chunks | Scene/chunk panels (W05) | "Is this like the epics?" | Different process per content type | Same panels as epics; one way to learn |
| Add audio per voice | Audio rows (W05) | "Which voices are required?" | Unclear | Female + male required, child optional, labelled |
| Validate, send for review | Editor header (W07) | "Is it complete?" | No check | Same validation and workflow as J5 |

## J8 · A Content Manager is stopped from touching production

**Persona:** Content Manager · **Trigger:** they switch the top bar to Production (by curiosity or by mistake) · **Done when:** nothing can be changed, and the screen explains why.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Switch to Production | Top bar (W03) | "Am I on the live app now?" | Live and test look the same | Striped banner and striped env switch on every screen |
| Open an item | Production editor (W08) | "Can I fix it here?" | Edits sometimes made straight in production | Fields read-only; note says "Edit on staging, then promote" |
| Try to promote / switch | Production editor (W08) | "Why can't I?" | Silent failure or hidden button | Button visible, locked, with the reason |

## J9 · See who changed what

**Persona:** Super Admin, Support Lead · **Trigger:** a family reports a change, or a check after a promote · **Done when:** they find the entry with who, what, before, after and when.

| Step | Screen | What the user thinks | Pain point today | Opportunity |
|---|---|---|---|---|
| Open Activity | Activity (W16) | "What happened today?" | No log at all | One append-only log, newest first |
| Filter by environment | Activity (W16) | "Only what went live" | — | Environment filter; production entries striped |
| Search an item or person | Activity (W16) | "Who touched this sentence?" | Doc version history only, per doc | Search across actions, items and people |
| Read before / after | Activity (W16) | "What was it before?" | Lost | Before and after kept for every text change |
