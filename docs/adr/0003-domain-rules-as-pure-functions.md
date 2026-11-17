# 0003. Domain rules as pure functions, separate from the UI

**Status:** Accepted · **Source:** prototype code, `src/lib/domain/`

## Context
The rules (what a text edit does to audio, who may promote, what promote may change in production) are the part of the prototype most worth keeping. If they lived inside React components they could not be tested or read on their own, and the real cms-service could not use them as a reference.

## Decision
Each bounded context is one file in `src/lib/domain/` (content, localization, validation, publishing, access, audit). They import nothing from React, the store or the browser. Guards return `null` when an action is allowed, or the reason when it is not. The UI and the store call these functions; the dependency only points inward (see [architecture](../architecture.md)).

## Consequences
- Most rules have fast unit tests that need no browser (`tests/`).
- The same reason text appears on the disabled button and would be the service's 403 message.
- The Go service will reimplement them; the TypeScript is a readable specification, not code to port line by line.
