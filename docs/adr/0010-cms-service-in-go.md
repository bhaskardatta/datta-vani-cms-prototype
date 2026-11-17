# 0010. cms-service in Go with Gin, tested with Ginkgo

**Status:** Proposed · **Source:** team meeting, 15 Nov 2026 (leaning, not locked)

## Context
The meeting leaned towards Go for cms-service, with Gin for HTTP and Ginkgo for BDD-style tests that mirror the Gherkin scenarios. Python was the alternative raised (requirements open question 2).

## Decision (proposed)
Write cms-service in Go with Gin, and test each Gherkin scenario with a Ginkgo spec. The domain rules in `src/lib/domain/` are the reference for the Go implementation.

## Consequences if accepted
- Ginkgo's Describe/It structure maps one-to-one onto the feature files and requirement IDs.
- The prototype's TypeScript cannot be shared with the service; rules are reimplemented and the unit tests serve as examples.
- Needs a decision owner and a date; until then the OpenAPI draft is language-neutral on purpose.
