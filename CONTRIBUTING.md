# Contributing

This is a throwaway review prototype ([ADR 0001](docs/adr/0001-prototype-before-building.md)). Keep changes small and in service of the review.

## Setup

Node from `.nvmrc` (`nvm use`), then `npm ci`. For end-to-end tests, once per machine: `npx playwright install chromium firefox webkit`.

## Branches and commits

- Branch from `main`: `feature/<short-name>` or `fix/<short-name>`. Open a pull request; `npm run check` must pass before merging (CI is manual for now: run it from the Actions tab).
- Commit messages: imperative summary under about 70 characters ("Block send for review on validation errors"), then a blank line and the why if it is not obvious. Mention requirement IDs (`FR-REV-06`) when a commit implements or changes one.

## The gate

`npm run check` runs lint, typecheck, unit tests and the production build. Run it before pushing; the CI workflow runs the same, then the Playwright suite, when started by hand. Run `npm run test:e2e` locally when you change anything a user can see.

## Where things go

- A rule (who may do what, what a change does to other data) goes in `src/lib/domain/` as a pure function, with a unit test in `tests/`. Domain files import only other domain files; ESLint enforces it.
- An action that changes data goes in `src/lib/store.ts`: check the guard, change, write the audit entry. Never change data from a component.
- Screens and components call guards to disable controls and show the reason; they do not re-implement rules.

## Adding or changing a journey

1. Add or edit the requirement in `docs/requirements.md` with the next ID in its area, and a scenario tagged with that ID in the matching `features/*.feature`.
2. Add the journey to `JOURNEYS` in `src/app/(cms)/journeys/page.tsx` (role, start screen, steps, what to look for) and to `docs/ux/journey-maps.md`.
3. Add a test to `e2e/journeys.e2e.ts` that starts it from the Journeys page and walks it to its end state. If it opens a new screen or state, add that to `e2e/screens.ts` so it gets the layout and accessibility checks too.
4. Update the row in `docs/traceability.md`.

## Documentation

Plain English, short, specific to this project. Link to an existing document rather than repeating it. A decision that changes behaviour gets an ADR in `docs/adr/`.
