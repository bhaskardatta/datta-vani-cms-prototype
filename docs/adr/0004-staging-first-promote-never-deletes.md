# 0004. Staging first; promote never deletes and lands switched off

**Status:** Accepted · **Source:** *CMS plan* PDF and team meeting, 15 Nov 2026

## Context
The CMS writes to the production database that families' app reads. A wrong delete or an accidental switch-on is visible to every family within minutes, and there is no separate review environment for content.

## Decision
- All editing happens on staging. Production is read-only except a Super Admin's promote, revert and on/off switches.
- Promote copies one item at a time, keeps production IDs, updates rows in place, and never deletes a production row or file.
- New items and new languages land switched off; existing items keep their switches. Switching on is a separate, logged step.
- A snapshot is saved before each promote so it can be reverted.

## Consequences
- Removing content means switching it off; production can accumulate rows that exist only there.
- Staging must be kept close to production, or plans will show noise (see the handover risks).
- The prototype keeps one snapshot per item; how many levels of revert the real system needs is open.
