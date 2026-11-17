# 0012. Editing an item while it is in review

**Status:** Proposed · **Source:** prototype behaviour; not discussed by the team

## Context
The prototype lets a Content Manager keep editing an item after sending it for review; the status stays "In review". Editing an *approved* item sends it back to draft (FR-EDIT-06), but nothing says what an edit during review should do.

## Options
1. Allow edits; status stays In review (what the prototype does). Simple, but the Super Admin may approve something that changed under them.
2. Lock the item while in review; the Content Manager asks for it back.
3. Allow edits, and any edit sends the item back to draft, as with an approved item.

## Decision (proposed)
Option 3: consistent with FR-EDIT-06 and safe for the approver. Not implemented; needs the team's choice.

## Consequences if accepted
- The approve button can rely on what the reviewer saw.
- A small fix after sending for review costs a second send.
