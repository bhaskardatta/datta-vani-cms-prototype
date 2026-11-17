# 0002. Fake data in the browser's localStorage, no backend

**Status:** Accepted for the prototype · **Source:** prototype plan, section 8 (a default, open to change)

## Context
Reviewers need to click through edits, promotes and switches and see the results persist across pages. The prototype must not touch the real Supabase or R2, must hold no keys, and must be shareable by link.

## Decision
All data is sample data generated in `src/lib/data.ts` and kept in one localStorage key (`dv-cms-prototype-v1`). `src/lib/store.ts` plays the part of cms-service. There is no server, no database and no authentication; the sign-in screen picks a role. Saved data that cannot be read, or has the wrong shape, is replaced with fresh sample data; a screen that still fails shows a reset button (`src/app/error.tsx`).

## Consequences
- Free to host as a static site; each reviewer's edits stay in their own browser. "Reset demo data" puts everything back.
- Nothing about performance, concurrency, transactions or security can be learned from it.
- Changing the data shape needs a new storage key, or old saved data is thrown away on first load.
