# End-to-end tests (Playwright)

Real browser engines (Chromium, Firefox, WebKit) driving the production build of the prototype on emulated desktops, tablets and phones. Free and local: no cloud service.

## Run

```bash
npm run test:e2e                                   # everything: builds, starts on :3200, runs all 10 devices
npx playwright test --project=iphone-se            # one device
npx playwright test journeys -g J6                 # one file / one test
npx playwright test --project=desktop-chrome --headed   # watch it in a real window
npx playwright show-report e2e/report              # the HTML report of the last run
```

First time on a machine: `npx playwright install chromium firefox webkit`.

If a server is already running on port 3200 it is reused (handy while iterating: `npm run build && npm run start -- -p 3200`). Rebuild after changing the app.

## Devices (projects in `playwright.config.ts`)

| Project | Engine | Viewport |
|---|---|---|
| desktop-chrome | Chromium | 1440×900 |
| desktop-firefox | Firefox | 1440×900 |
| desktop-safari | WebKit | 1440×900 |
| laptop-small | Chromium | 1280×720 |
| ipad-portrait / ipad-landscape | WebKit, touch | 810×1080 / 1080×810 |
| iphone-14 | WebKit, touch | 390×664 |
| iphone-se | WebKit, touch | 320×568 (smallest) |
| pixel-7 | Chromium, touch | 412×839 |
| galaxy-s9 | Chromium, touch | 320×658 |

## What is covered

- `journeys.e2e.ts`: J1–J9 from the Journeys page, each walked to its real end state (J3 uploads an in-memory WAV and has a `.txt` refused; J5 is blocked, fixed, then sent; J6 promotes all the way and switches Telugu on in production; J7 checks the empty-title error; J8 checks nothing in production is editable by a Content Manager; J9 filters and searches).
- `layout.e2e.ts`, for every screen in `screens.ts` on every device:
  - the page never scrolls sideways and nothing sticks out of the viewport; the only sideways scrolling allowed is a labelled, focusable region (wide tables and drawings, which show a fade at the edge);
  - on desktop widths the app shell itself does not scroll (only its panes);
  - the main navigation is reachable (sidebar, or the menu drawer on small screens);
  - the screen's primary action is visible and clickable (not covered);
  - on touch devices every button, link, switch, tab, tree item and checkbox target is at least 44×44 (inline links in a sentence are exempt);
  - a full-page screenshot to `e2e/screenshots/<project>/<screen>.png` (regenerated on every run, so not committed; see `.gitignore`).
  - Plus: the menu drawer traps focus, closes on Escape and on navigation.
- `a11y.e2e.ts`: axe-core (WCAG 2.1 A + AA) on every screen, including the editor with a chunk open, the validation panel, the promote wizard and the new-story dialog. Serious and critical findings fail.
- `storage.e2e.ts`: saved data that cannot be read is replaced with fresh sample data; saved data that breaks a screen shows a reset button instead of a blank page.
- Console: every test fails on any console error or uncaught page error (fixture in `fixtures.ts`).
- `keyboard.e2e.ts` (desktop projects): Tab reaches every control on the Library, the new-story dialog closes on Escape and returns focus, the content tree works with the arrow keys, Home and End.

Every test starts from clean sample data (the `dv-cms-prototype-v1` localStorage key is cleared before the app loads).

## Limits, plainly

- These are **emulated devices on real engines**. "iPhone" means WebKit at the iPhone's size, pixel ratio and touch settings, not Safari on a physical iPhone; Android means desktop Chromium emulating the phone. Things like the on-screen keyboard covering fields, real scrolling momentum, OS font scaling, and Safari's address bar are not tested.
- Firefox has no mobile emulation, so it runs on desktop only.
- Desktop screenshots show the viewport: the desktop layout scrolls inside its panes, so a "full page" is one screen. On phones and tablets the page scrolls, so their screenshots show everything.
- Audio playback is the browser's speech synthesis and simulated timing; the tests check the player appears, not the sound.
- Real-device clouds (BrowserStack, Sauce Labs, LambdaTest) are paid. This same suite can be pointed at them later through their Playwright integrations without rewriting the tests.
