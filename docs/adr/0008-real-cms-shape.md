# 0008. Shape of the real CMS

**Status:** Accepted · **Source:** team meeting, 15 Nov 2026

## Context
The prototype settles the screens. The real system's shape was decided separately in the meeting.

## Decision
- A new, separate repository, not part of this prototype or the existing app.
- A React CMS website and a backend, `cms-service`.
- cms-service writes directly to the staging and production Supabase databases and the Cloudflare R2 buckets.
- Staging first (ADR 0004).
- Contract-first: the API is agreed as OpenAPI before it is built ([draft](../api/openapi.yaml)).
- Requirements are written as Gherkin scenarios; another team member owns them.
- Priority 1 is Telugu and Kannada for the four existing books; Priority 2 is bedtime stories.

## Consequences
- cms-service holds production write credentials, so its permission checks and audit log carry the whole safety case.
- The prototype's `features/` and `docs/requirements.md` are a starting point to hand to the Gherkin owner, not the final set.
- The language and framework of cms-service are not locked (ADR 0010).
