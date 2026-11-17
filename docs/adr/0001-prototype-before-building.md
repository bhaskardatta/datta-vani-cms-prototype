# 0001. Build a throwaway clickable prototype before the real CMS

**Status:** Accepted · **Source:** team meeting, 15 Nov 2026

## Context
The meeting's next step was to build UI prototypes of the Content Admin journey and show them before implementation starts. The team had a written plan (the *CMS plan* PDF) but no shared picture of the screens, and the real system's stack is not fully decided.

## Decision
Build a clickable prototype of every journey (J1–J9) with fake data. It is a review tool: none of its code is meant to be copied into the real CMS. What carries over is the agreed behaviour: journeys, screens, requirements, Gherkin scenarios and the domain rules as a reference.

## Consequences
- Scope and wording can be argued over a working screen instead of a document.
- Anything learned here must be written down (requirements, feature files, ADRs), because the code will not survive.
- The prototype can drift from the real system once building starts. It should be frozen once the journeys are agreed.
