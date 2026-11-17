# Decision records

Short records of decisions that shape this prototype and the real CMS. **Accepted** means decided (by the team, or for the prototype only where it says so). **Proposed** means it still needs the team.

| # | Decision | Status |
|---|---|---|
| [0001](0001-prototype-before-building.md) | Build a throwaway clickable prototype before the real CMS | Accepted |
| [0002](0002-fake-data-in-localstorage.md) | Fake data in localStorage, no backend | Accepted (prototype) |
| [0003](0003-domain-rules-as-pure-functions.md) | Domain rules as pure functions, separate from the UI | Accepted |
| [0004](0004-staging-first-promote-never-deletes.md) | Staging first; promote never deletes and lands switched off | Accepted |
| [0005](0005-guards-enforced-in-the-store.md) | Role guards enforced in the store, not only the UI | Accepted |
| [0006](0006-playwright-device-emulation.md) | Playwright device emulation instead of a paid device cloud | Accepted |
| [0007](0007-send-for-review-blocked-by-errors.md) | Send for review blocked by validation errors | Accepted (prototype) |
| [0008](0008-real-cms-shape.md) | Shape of the real CMS (separate repo, React + cms-service, direct writes, contract-first) | Accepted |
| [0009](0009-no-machine-translation.md) | People translate; no machine translation | Accepted |
| [0010](0010-cms-service-in-go.md) | cms-service in Go with Gin and Ginkgo | Proposed |
| [0011](0011-delete-never-promoted-drafts.md) | Allow deleting a never-promoted story draft | Proposed |
| [0012](0012-editing-while-in-review.md) | What an edit does to an item in review | Proposed |

New record: copy the shape of an existing one (Context, Decision, Consequences, Status), take the next number, keep it under 25 lines.
