# cms-service API: draft contract

[`openapi.yaml`](openapi.yaml) is a **proposal** for the contract-first discussion, not an agreed or implemented API. It was derived from what the prototype's store actions do ([`src/lib/store.ts`](../../src/lib/store.ts)) and the rules in [`src/lib/domain/`](../../src/lib/domain/), so every operation corresponds to something a reviewer can click in the prototype. Each operation names the requirement IDs it serves (see [requirements.md](../requirements.md)).

Validated with `npx @redocly/cli lint docs/api/openapi.yaml` (recommended rules; one warning: no `license` field, left for the owner) and `npx @apidevtools/swagger-cli validate docs/api/openapi.yaml`.

## Shape in one paragraph

The environment is a path parameter (`/envs/{env}/…`). Content writes are accepted on `staging` only; switches on both, by role; promote is its own resource (`/promotions`) and always goes staging → production. Every write runs the same guards as the prototype (`block…` functions in `src/lib/domain/`), returns 403 with the guard's message in `reason` when refused, changes nothing and logs nothing. Item writes carry `If-Match: <version>`. Errors are RFC 9457 problem details.

## Open questions

1. **One service, environment in the path?** The meeting decided cms-service writes directly to both Supabase projects and both R2 buckets. The alternative is one deployment per environment with the promote job holding both connections. The contract changes little either way.
2. **Concurrency granularity.** Item-level `If-Match` means two translators on different chunks of the same book will collide. Per-node versions avoid that but cost more. How many people edit one book at the same time?
3. **Audio generation is asynchronous.** The draft returns 202 and the client polls. Is polling enough, or do we want server-sent events? What are the generation cost and rate limits per run?
4. **Saving the staging ↔ production match.** The prototype asks the Super Admin to confirm the match ("These matches are right") but the contract has no endpoint to store or correct it. Depends on requirements open question 7.
5. **Revert depth.** `POST /promotions/{id}/revert` allows only the latest promote per item, as the prototype does. More levels need a snapshot history (requirements open question 8).
6. **Audit filtering.** FR-AUDIT-02 asks for a filter by action. Actions are free text in the prototype; the real log probably needs an action code alongside the text.
7. **Upload limits.** Maximum audio and image size, accepted formats, and whether the server transcodes to MP3 and generates the WebP sizes.
8. **Role source.** Which claim in the Datta Vani login carries the CMS role, and who manages it.
9. **Endpoints that depend on proposed decisions:** `DELETE /envs/{env}/items/{itemId}` ([ADR 0011](../adr/0011-delete-never-promoted-drafts.md)) and editing while an item is in review ([ADR 0012](../adr/0012-editing-while-in-review.md)).
10. **File cap per promote** (NFR-05). The plan reports `files`; the cap value is not agreed.
