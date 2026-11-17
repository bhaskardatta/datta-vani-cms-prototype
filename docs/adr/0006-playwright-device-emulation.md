# 0006. Playwright device emulation instead of a paid device cloud

**Status:** Accepted · **Source:** prototype test setup, `playwright.config.ts`

## Context
Reviewers will open the link on laptops, tablets and phones. Real-device clouds (BrowserStack, Sauce Labs, LambdaTest) cost money and need accounts; the prototype has no budget and a short life.

## Decision
Run the end-to-end suite in Playwright on its three engines (Chromium, Firefox, WebKit) across ten emulated desktop, tablet and phone profiles, against a production build. Include layout checks, 44×44 touch targets, axe accessibility checks and keyboard tests.

## Consequences
- Free and local; the same run works in CI.
- "iPhone" means WebKit at the iPhone's size and touch settings, not Safari on a device. The on-screen keyboard, real scrolling, OS font scaling and Safari's address bar are not tested ([e2e/README.md](../../e2e/README.md)).
- The suite can later be pointed at a device cloud through its Playwright integration without rewriting tests.
