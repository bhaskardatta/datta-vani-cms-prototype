# Changelog

All notable changes to this prototype. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/) loosely: this is a review tool, not a library.

## [0.1.0] - 2026-11-17

First version, for the 17 November team review.

### Added
- Clickable prototype of the Content Admin journeys J1–J9: sign-in by role, library, editor (content tree, panels per node type, per-voice audio and transcripts, quizzes, validation list, switches), six-step promote wizard with the 17 pre-promote checks, activity log, journeys page, wireframes page.
- Domain rules as pure functions in `src/lib/domain/` (content, localization, validation, publishing, access, audit), and a localStorage store that enforces the same guards as the UI.
- Sample data: four placeholder books and three bedtime stories with planted problems.
- Requirements with IDs, Gherkin feature files, UX and domain documents.
- Vitest unit tests for the rules and the store, including saved data that is unreadable or has the wrong shape.
- Playwright tests on ten emulated desktop, tablet and phone profiles: the nine journeys, layout and touch-target checks, axe accessibility checks, keyboard checks, and recovery from bad saved data.
- Toolchain: ESLint (Next.js and TypeScript rules, pure-domain import rule), Prettier for config files, EditorConfig, Node version pin, `npm run check`, GitHub Actions CI.
- Architecture overview, decision records, test strategy, requirement traceability, draft OpenAPI contract for cms-service, handover notes.
