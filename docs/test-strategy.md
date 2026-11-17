# Test strategy

What is tested, at which level, and what is not. Counts are from the runs on 17 November 2026 (`npm test`, `npm run test:e2e`). Which requirement each test covers is in [traceability.md](traceability.md).

## The levels

| Level | Tool | Count | What it proves | Runs in |
|---|---|---|---|---|
| Rules | Vitest, `tests/{content,localization-validation,publishing,access}.test.ts` | 52 | The domain rules on their own: audio lifecycle, coverage, validation policy, role policy, promote plan, promote and revert invariants. No browser, no store. | under 1 s |
| Store | Vitest, `tests/store.test.ts` | 16 | The stand-in for cms-service refuses what the guards refuse (no change, no audit entry), logs what it accepts, and replaces unreadable or wrongly shaped saved data with fresh sample data. Calls the store directly, bypassing the UI. | under 1 s |
| Journeys | Playwright, `e2e/journeys.e2e.ts` | 9 per device | J1–J9 from the Journeys page to their real end state, as a reviewer would click them. | |
| Layout | Playwright, `e2e/layout.e2e.ts` | 12 per device | Every screen: no sideways page scroll, nothing outside the viewport, navigation reachable, primary action visible and clickable, 44×44 touch targets on touch devices; the menu drawer traps focus and closes. Saves a screenshot per screen. | |
| Accessibility | Playwright + axe-core, `e2e/a11y.e2e.ts` | 11 per device | WCAG 2.1 A and AA rules (including colour contrast at AA) on every screen and key state. Serious and critical findings fail. | |
| Keyboard | Playwright, `e2e/keyboard.e2e.ts` | 3 per desktop device | Tab reaches every Library control, the dialog closes on Escape and returns focus, the tree works with arrow keys, Home and End. | |
| Saved data | Playwright, `e2e/storage.e2e.ts` | 2 per device | Bad localStorage data never leaves a blank page. | |
| Specification | Gherkin, `features/*.feature` | 78 scenarios | Not executed. The behaviour, tagged with requirement IDs, for the real system's tests. | |

Every Playwright test also fails on any console error or uncaught exception (`e2e/fixtures.ts`), and starts from clean sample data.

**Totals:** 68 unit tests, all passing. 370 Playwright tests (37 × 10 devices): 347 passed, 23 skipped by design (keyboard tests on the six touch devices; the drawer test on the five devices wide enough for the sidebar). The Playwright run takes about 2.5 minutes locally with 6 workers.

The shape is deliberately bottom-heavy on rules: the rules are what carries over to the real system ([ADR 0003](adr/0003-domain-rules-as-pure-functions.md)), and they are cheap to test exhaustively. The browser tests check that the screens use those rules and that a reviewer can complete each journey on each device.

## Device matrix

Ten Playwright projects on the three real engines, emulated ([ADR 0006](adr/0006-playwright-device-emulation.md)): desktop Chrome, Firefox and Safari (WebKit) at 1440×900; a small laptop at 1280×720; iPad portrait and landscape; iPhone 14; iPhone SE (320 px wide, the smallest); Pixel 7; Galaxy S9+. Viewports and engines per project are listed in [e2e/README.md](../e2e/README.md#devices-projects-in-playwrightconfigts).

## Accessibility bar

- axe-core with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` tags; any serious or critical violation fails the build.
- Colour contrast at WCAG AA, checked by axe on every screen.
- Keyboard: every control reachable; dialogs close on Escape and return focus; the tree follows the ARIA tree pattern.
- Touch targets at least 44×44 on touch devices (inline links in a sentence are exempt).
- The checklist in [ux-principles.md](ux/ux-principles.md#accessibility-checklist) covers what automation cannot (meaning, reading order, wording).

## What is not tested

- **Physical devices.** Emulation does not cover the on-screen keyboard covering fields, real scrolling, OS font scaling, or Safari's address bar. Firefox has no mobile emulation.
- **Real audio.** Playback is speech synthesis with fake timings; tests check that the player appears, not the sound. There is no real generation, upload storage or transcript parsing.
- **Load and performance.** One user, in-memory data, a handful of items.
- **Security.** There is no authentication, server or network; the role switcher is a UI control. Guards are tested for behaviour, not as a security boundary.
- **Concurrency.** Two people editing the same item, a promote racing an edit: the prototype has one user per browser.
- **The Gherkin scenarios themselves** (no step runner), and the six requirements listed as not covered in [traceability.md](traceability.md#summary).
- **Screen readers.** axe checks structure and names; nobody has run the screens with VoiceOver, NVDA or TalkBack.

## How to run

```bash
npm test                                   # unit tests
npm run check                              # lint + typecheck + unit tests + build
npm run test:e2e                           # all ten devices (builds first)
npx playwright test --project=iphone-se    # one device
npx playwright show-report e2e/report      # last HTML report
```

CI (`.github/workflows/ci.yml`) runs the same when started by hand from the Actions tab (it is manual-only for now, to save Actions minutes; the automatic triggers are commented in the file), and uploads the HTML report when a test fails.
