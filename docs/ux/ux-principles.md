# UX principles

The rules every CMS screen follows. If a new screen breaks one of these, change the screen, or bring it to the team as a decision.
Each rule has an example from the prototype (W = wireframe number on `/wireframes`).

## 1. One primary action per screen

Each screen has one filled (primary) button: the next step in the flow. Everything else is secondary or a quiet link.

- Library: **+ New bedtime story**. Promote wizard: **Next →**, then **Promote now**. Result: **Open in production**.
- In the editor header only the *next* workflow button is shown: Send for review → Approve → Promote (W04).
- If you want to add a second filled button, ask which one the user really needs now.

## 2. Locked actions explain why

A button the current user can't use stays **visible and in the same place**, shows a lock, and says why in plain words. We never hide it and never let it fail silently.

- "Only a Super Admin can promote" (W04), "Approve it first", "Add the Telugu sentence first" (W18), "Telugu is not complete in production yet" (W19).
- Hiding buttons makes people think a feature is missing. A reason teaches the rule.
- Code: pass the reason to the button (`blocked="…"`), which disables it and shows the text.

## 3. Staging or production is always visible

You must never wonder which database you are looking at.

- Environment switch in the top bar on every screen.
- Production adds a full-width warning banner and uses the warning colour (striped in the wireframes) on every production pill and log entry (W03, W08, W16).
- The Library has separate columns for "on in staging app" and "in production" (W02).
- Production is read-only for editing, for everyone. Only promote, switch on and switch off happen there.

## 4. English source shown while translating

Translators never work from memory or another window.

- Every text field in Telugu or Kannada shows the English above it (W05, W06).
- The language name is on every field label, and the active language tab is always visible.
- Structure belongs to English: in quizzes the question type, option order and correct answer are locked to English (W06).
- The CMS never machine-translates. People translate.

## 5. Errors lead to the exact spot

A problem report is only useful if it takes you to the problem.

- Each validation issue says **what** is wrong and **where** (breadcrumb), and clicking it opens that chunk in that language (W07).
- Red dots in the tree bubble up to every parent, so you can follow them down (W04).
- Only two levels: **errors** block approve, promote and switching on; **warnings** do not. The rule is written on the panel.
- Promote checks say which language failed and why (W12).

## 6. Nothing destructive

Mistakes must be cheap.

- Nothing is hard-deleted. Promote never deletes production rows or files.
- New items and new languages land **switched off**. Going live is always a separate, deliberate step (W15, W08).
- Changes to production need a dry run and typed confirmation (W13, W14). A snapshot is taken first, so **Revert** is always available (W15).
- Changing a sentence marks its audio **out of date** instead of silently keeping wrong audio (W05).
- New audio arrives as a **draft**; it only becomes current after someone listens and approves.
- Every change is logged with before and after (W16).

## 7. Supporting rules

- **Plain words.** "Families can see it", not `is_active`. "Out of date · text changed", not "stale".
- **Show, don't make them type.** File paths, themes and characters are shown or picked, never typed.
- **Same pattern everywhere.** Story scenes and chunks use the same panels as epics.
- **Save is obvious.** Text saves when you leave the field; the save appears in Activity.
- **Status moves one way.** Draft → In review → Approved. Editing an approved item sends it back to Draft, and that is logged.

## Accessibility checklist

Check every screen against this list before showing it.

**Structure**
- [ ] One `<h1>` per page; headings in order (h1 → h2 → h3), no skipped levels.
- [ ] Landmarks: `<header>`, `<nav aria-label>`, `<main>`, `<aside aria-label>` for the tree and the validation panel.
- [ ] Real `<button>` for actions, `<a>`/`<Link>` for navigation. No clickable `<div>`.
- [ ] Tabs use `role="tablist"` / `role="tab"` / `aria-selected`; switches use `role="switch"` / `aria-checked`.
- [ ] Current item marked with `aria-current` (nav link, tree node, wizard step).

**Keyboard**
- [ ] Every action reachable with Tab, in a sensible order; Enter/Space activate.
- [ ] Visible focus ring on everything (`:focus-visible` outline in the app colour). Never `outline: none` without a replacement.
- [ ] Dialogs close with Escape and return focus.
- [ ] The tree's expand/collapse buttons have labels ("Expand Bala Kanda").

**Text and colour**
- [ ] Body text contrast at least 4.5:1; large text and icons at least 3:1.
- [ ] State is never shown by colour alone: pills carry words (✓ Approved, ✕ Missing), switches have On/Off labels, errors have ✕ and warnings have !.
- [ ] Production is marked by a banner with words, not only the coral colour.
- [ ] Telugu and Kannada text renders in a font that supports the script, at a readable size (15px+ in inputs).

**Forms**
- [ ] Every input has a `<label>` linked by `for`/`id` (or `aria-label` for compact fields). Placeholders are not labels.
- [ ] Locked fields use `readOnly` plus a visible reason, so screen readers can still read the value.
- [ ] The typed-confirmation inputs have clear labels ("Type Ramayana", "Type production") and `autocomplete="off"`.

**Feedback and motion**
- [ ] Busy states (Generating…, Running…) disable the button and change its text.
- [ ] "Now playing" uses `aria-live="polite"`.
- [ ] Locked buttons expose the reason (title today; consider visible helper text in the real build, because tooltips don't work on touch or for every screen reader).
- [ ] Animations respect `prefers-reduced-motion`; nothing flashes.
