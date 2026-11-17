// Keyboard use on desktop: Tab reaches every control on the Library, dialogs close on Escape, the tree works with arrow keys.
import { expect, signIn, test } from './fixtures';

test.beforeEach(({}, info) => { test.skip(!!info.project.use.hasTouch, 'Keyboard checks run on the desktop projects'); });

test('Tab reaches every control on the Library', async ({ page, browserName }) => {
  await signIn(page);
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'; // WebKit only tabs to links and buttons with Alt held
  // Every control a keyboard user should land on (roving-tabindex groups count once, via their tabindex=0 member).
  const expected = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('a[href], button, select, input, textarea, [tabindex]'));
    return els.filter((el) => {
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      return el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled && r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.closest('dialog:not([open])');
    }).map((el, i) => { el.dataset.kb = String(i); return String(i); });
  });
  const reached = new Set<string>();
  for (let i = 0; i < expected.length + 10; i++) {
    await page.keyboard.press(tab);
    const id = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.kb);
    if (id) reached.add(id);
  }
  const missed = await page.evaluate((ids) => ids.map((id) => {
    const el = document.querySelector<HTMLElement>(`[data-kb="${id}"]`)!;
    return `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}"`;
  }), expected.filter((id) => !reached.has(id)));
  expect(missed).toEqual([]);
});

test('the new-story dialog closes on Escape and gives focus back', async ({ page }) => {
  await signIn(page);
  const open = page.getByRole('button', { name: 'New bedtime story' });
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'New bedtime story' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: /Title/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test('the content tree works with the arrow keys', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: /^Ramayana/ }).filter({ visible: true }).click();
  const tree = page.getByRole('tree');
  const selected = tree.getByRole('treeitem', { selected: true });
  await tree.getByRole('treeitem', { name: /Ramayana/ }).click();
  await expect(selected).toContainText('Ramayana');

  await page.keyboard.press('ArrowDown');
  await expect(selected).toContainText('Bala Kanda');
  await expect(selected).toBeFocused();
  await expect(selected).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(selected).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('ArrowRight');
  await expect(selected).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(selected).toContainText('The King of Ayodhya');
  await page.keyboard.press('ArrowLeft'); // collapse the chapter
  await page.keyboard.press('ArrowLeft'); // step out to its section
  await expect(selected).toContainText('Bala Kanda');
  await page.keyboard.press('End');
  await expect(selected).toContainText('Quiz');
  await page.keyboard.press('Home');
  await expect(selected).toContainText('Ramayana');
});
