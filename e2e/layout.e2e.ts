// Layout on every screen and every device: no sideways scroll, nothing cut off at the edge, navigation reachable,
// the primary action visible and clickable, touch targets big enough, and a full-page screenshot for review.
import path from 'node:path';
import { clearToasts, closeMenuIfOpen, expect, openMenu, settle, signIn, test } from './fixtures';
import { horizontalOverflow, smallTapTargets } from './layout-checks';
import { SCREENS } from './screens';

for (const screen of SCREENS) {
  test(`layout: ${screen.name}`, async ({ page }, info) => {
    await screen.setup(page);
    await clearToasts(page);

    await test.step('no sideways scrolling, nothing past the viewport edge', async () => {
      expect.soft(await horizontalOverflow(page)).toEqual([]);
    });

    if (screen.shell && (info.project.use.viewport?.width ?? 0) >= 1024) {
      await test.step('desktop app shell: the page itself does not scroll (only its panes do)', async () => {
        expect.soft(await page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);
      });
    }

    if (screen.shell) {
      await test.step('main navigation is reachable', async () => {
        await openMenu(page);
        const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
        await expect(links).toHaveText([/Library/, /Editor/, /Activity/, /Journeys/, /Wireframes/]);
        for (const link of await links.all()) await expect.soft(link).toBeInViewport();
        await closeMenuIfOpen(page);
      });
    }

    await test.step('primary action is visible and clickable', async () => {
      const primary = screen.primary(page);
      await primary.scrollIntoViewIfNeeded();
      await expect.soft(primary).toBeVisible();
      await expect.soft(primary).toBeInViewport();
      await primary.click({ trial: true, timeout: 5_000 }); // fails if covered by another element or not actionable
    });

    if (info.project.use.hasTouch) {
      await test.step('touch targets are at least 44×44', async () => {
        expect.soft(await smallTapTargets(page)).toEqual([]);
      });
    }

    await test.step('screenshot', async () => {
      await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector('main')?.scrollTo(0, 0); });
      await page.screenshot({ path: path.join(__dirname, 'screenshots', info.project.name, `${screen.name}.png`), fullPage: true, animations: 'disabled' });
    });
  });
}

// The phone and tablet-portrait navigation: a menu button opens a drawer that traps focus and closes on Escape and on navigation.
test('navigation drawer on small screens', async ({ page, browserName }, info) => {
  test.skip((info.project.use.viewport?.width ?? 1440) >= 1024, 'The sidebar is always visible at this width');
  await signIn(page);
  const menu = page.getByRole('button', { name: 'Open menu' });
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(menu).toBeVisible();

  await menu.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await settle(page);
  expect(await horizontalOverflow(page)).toEqual([]);
  if (info.project.use.hasTouch) expect(await smallTapTargets(page)).toEqual([]);

  // Focus stays inside the drawer.
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab'); // WebKit only tabs to links and buttons with Alt
    expect(await drawer.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(menu).toBeFocused();

  await menu.click();
  await drawer.getByRole('link', { name: 'Activity' }).click();
  await expect(page).toHaveURL(/\/activity$/);
  await expect(drawer).toBeHidden();
});
