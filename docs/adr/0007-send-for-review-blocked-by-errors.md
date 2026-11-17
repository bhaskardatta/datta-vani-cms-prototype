# 0007. Send for review is blocked while the item has validation errors

**Status:** Accepted for the prototype · **Source:** requirements FR-REV-06

## Context
Approve and promote were already blocked by errors. Letting a Content Manager send an item with errors for review would push known problems onto the Super Admin, who would have to send it back.

## Decision
Send for review is refused while the item has any validation error in a language that has started. A language with no text yet is one warning and does not block. The button stays visible, disabled, with the count ("Fix 1 error before sending for review"); the store refuses the call too.

## Consequences
- The Super Admin's review queue only holds items that pass validation.
- A Content Manager cannot ask for help through the review status; they need another channel.
- Warnings (for example the optional child voice) never block.
