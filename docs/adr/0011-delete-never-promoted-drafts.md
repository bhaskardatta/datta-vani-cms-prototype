# 0011. Allow deleting a story draft that never reached production

**Status:** Proposed · **Source:** prototype (FR-STORY-07, FR-STORY-08, NFR-03)

## Context
The ground rule is "nothing is deleted". A Content Manager who creates a bedtime story by mistake would otherwise leave a permanent empty draft on staging.

## Decision (proposed)
A Content Manager or Super Admin may delete a story on staging when it is a draft and has never been promoted. Anything in review, approved, or present in production cannot be deleted. The deletion is logged. This is the only hard delete.

## Consequences if accepted
- Staging stays free of abandoned drafts.
- It is an exception to NFR-03 and needs the team's explicit agreement; the prototype implements it so the team can judge it.
- The prototype offers the button for stories only; the rule itself (`blockDeleteDraft`) does not check the kind. Decide whether epics are included.
