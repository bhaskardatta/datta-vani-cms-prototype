# Datta Vani CMS: clickable prototype

A throwaway prototype of the content management system for the Datta Vani children's app. It exists so the team can agree the Content Admin journey (epics and bedtime stories, English, Telugu and Kannada text, per-voice audio and word-timing transcripts, quizzes, review, staging → production promote) **before** the real CMS is built.

**It is not the CMS.** All data is fake and lives in your browser's localStorage. There is no backend, no database, no login and no keys. None of this code is meant to go into the real system; what carries over is the agreed behaviour, the requirements and the rules ([architecture](docs/architecture.md#from-prototype-to-the-real-system)).

**Live demo:** https://datta-vani-cms-prototype.vercel.app (sample data only; each person's edits stay in their own browser; "Reset demo data" in the top bar starts again).

## Quick start

Needs Node 24 or later (`.nvmrc` pins the version CI uses).

```bash
nvm use
npm ci
npm run dev        # http://localhost:3000, then pick a role
```

## Checks

| Command | What it runs |
|---|---|
| `npm run check` | lint, typecheck, unit tests, production build: the gate CI runs first |
| `npm run lint` | ESLint (Next.js and TypeScript rules; domain files may import only other domain files) |
| `npm run typecheck` | `tsc --noEmit` over app, tests and e2e |
| `npm test` | Vitest unit tests in `tests/` |
| `npm run test:e2e` | Playwright on ten emulated devices; builds and serves on port 3200. First time: `npx playwright install chromium firefox webkit`. Details in [e2e/README.md](e2e/README.md) |
| `npm run format:check` | Prettier, config and CI files only (why: `.prettierignore`) |

## How to review it

Open the **Journeys** page (left menu, "For the review"). Each card sets the right role and opens the right screen. In fifteen minutes:

1. **J1** Library: can you tell which book is holding up Telugu?
2. **J2** Fix a Telugu sentence: the audio goes out of date; regenerate, play, approve each voice.
3. **J5** Validate and send for review: click an error to jump to it; Send is blocked until it is fixed.
4. **J6** As Super Admin, promote: match, changes, 17 checks, dry run, typed confirmation; then switch Telugu on in production.
5. **J8** As Content Manager, switch to Production: everything is locked and says why.

The questions to answer while clicking are in the [review checklist](docs/ux/review-checklist.md).

## Repository map

```
src/lib/domain/   the rules, as pure functions (one file per bounded context)
src/lib/store.ts  stand-in for cms-service: guard → change → audit → save to localStorage
src/lib/data.ts   sample books and stories, with planted problems
src/app/          screens (sign-in, library, editor, promote, activity, journeys, wireframes)
src/components/   shell, editor panels, shared UI pieces
tests/            Vitest unit tests for the rules and the store
e2e/              Playwright journeys, layout, accessibility and keyboard tests
features/         Gherkin scenarios, tagged with requirement IDs
docs/             requirements, architecture, decisions, test strategy, traceability, API draft, UX and domain notes
```

## Status and known limits

- Version 0.1.0, built for the 17 November 2026 review ([CHANGELOG](CHANGELOG.md)). The original plan is [PROTOTYPE-PLAN.md](PROTOTYPE-PLAN.md).
- Audio is simulated: Play uses the browser's speech synthesis and fake word timings; waveforms are drawn from a hash. MFA, the dry run and promote progress are simulated too.
- Staging and production children are matched by an id prefix, not a saved mapping. Revert keeps one level.
- The four books and three stories are placeholders, not the real content.
- Tests run on emulated devices, not physical ones; see [what is not tested](docs/test-strategy.md#what-is-not-tested).
- Six requirements have no automated test yet ([traceability](docs/traceability.md#summary)).

## Documentation

Start at [docs/README.md](docs/README.md). The most useful for a newcomer: [architecture](docs/architecture.md), [requirements](docs/requirements.md), [decision records](docs/adr/README.md), [handover](docs/handover.md). How to contribute: [CONTRIBUTING.md](CONTRIBUTING.md).
