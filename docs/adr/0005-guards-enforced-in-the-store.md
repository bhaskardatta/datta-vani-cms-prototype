# 0005. Role guards are enforced in the store, not only by the UI

**Status:** Accepted · **Source:** prototype code; NFR-01

## Context
Hiding or disabling a button is not a permission check. The real cms-service must refuse a forbidden request even if a screen allowed it (NFR-01), and the prototype should show that behaviour rather than imply it.

## Decision
Every action in `src/lib/store.ts` calls the domain guard first and does nothing if it refuses: no change, no audit entry. The UI calls the same guard to disable the control and show the reason. Unit tests call the store directly, bypassing the UI, to prove a refused action changes nothing (`tests/store.test.ts`).

## Consequences
- The store is the shape of the future API: one function per endpoint, each with its guard (see [the draft contract](../api/openapi.yaml)).
- A rule is defined once; the button and the "server" cannot disagree.
- In the prototype the browser is still the only enforcer, so this demonstrates the rule; it secures nothing.
