// In-page measurements for the layout tests. Each returns a list of human-readable offenders (empty = pass).
import type { Page } from '@playwright/test';

/** Horizontal overflow: the page itself must not scroll sideways, nothing may stick out past the viewport,
 *  and the only sideways-scrolling boxes allowed are intentional ones: a labelled, focusable region
 *  (role="region" + aria-label + tabindex="0"), e.g. a wide table or drawing that scrolls inside its own frame. */
export async function horizontalOverflow(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const describe = (el: Element) => {
      const name = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      const r = el.getBoundingClientRect();
      return `${el.tagName.toLowerCase()} "${name}" ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`;
    };
    const out: string[] = [];
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    if (doc.scrollWidth > vw + 1) out.push(`page scrolls sideways: scrollWidth ${doc.scrollWidth} > ${vw}`);
    const REGION = '[role="region"][aria-label][tabindex="0"]';
    const shown = (el: Element) => {
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
    };
    const outside = (el: Element) => { const r = el.getBoundingClientRect(); return r.right > vw + 1 || r.left < -1; };
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      if (!shown(el) || el.parentElement?.closest(REGION) || el.closest('.sr-only')) continue;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) continue;
      const s = getComputedStyle(el);
      if ((s.overflowX === 'auto' || s.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1 && !el.matches(REGION)) {
        out.push(`scrolls sideways inside (not a labelled scroll region): ${describe(el)}, content ${el.scrollWidth}px in ${el.clientWidth}px`);
      }
      // Report the outermost element that sticks out, not each of its children.
      if (outside(el) && !(el.parentElement && outside(el.parentElement))) out.push(`sticks out of the ${vw}px viewport: ${describe(el)}`);
    }
    return out;
  });
}

/** Touch targets smaller than 44x44 (buttons, links, switches, tabs, tree items, form toggles).
 *  Exempt: inline links inside a sentence (WCAG 2.5.8), and checkboxes/radios whose wrapping label is the target. */
export async function smallTapTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const sel = 'button, a[href], select, [role="switch"], [role="tab"], [role="treeitem"], input[type="checkbox"], input[type="radio"], summary';
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const s = getComputedStyle(el);
      let r = el.getBoundingClientRect();
      if (s.display === 'none' || s.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
      if (el.closest('.sr-only, [aria-hidden="true"], [inert]')) continue;
      const own = (el.textContent ?? '').trim().length;
      if (el.tagName === 'A' && s.display === 'inline' && (el.parentElement?.textContent ?? '').trim().length > own + 1) continue;
      if (el.tagName === 'INPUT') { const label = el.closest('label'); if (label) r = label.getBoundingClientRect(); }
      if (Math.round(r.width) < 44 || Math.round(r.height) < 44) {
        const name = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
        out.push(`${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''} "${name}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  });
}
