// Shared setup for every e2e test: clean sample data, a console-error watch, and small helpers
// that work the same on a desktop window and on a phone (where navigation lives in a drawer).
import { test as base, expect, type Page } from '@playwright/test';

const KEY = 'dv-cms-prototype-v1';

export const test = base.extend<{ consoleErrors: string[] }>({
  // Clean seed data: the app's localStorage key is cleared once, before the app's first load in this test.
  // (A sessionStorage flag keeps later navigations and reloads inside the test from wiping its own changes.)
  page: async ({ page }, use) => {
    await page.addInitScript((key) => {
      if (!sessionStorage.getItem('e2e-clean')) { localStorage.removeItem(key); sessionStorage.setItem('e2e-clean', '1'); }
    }, KEY);
    await use(page);
  },
  // Every test fails if the page logs a console error or throws.
  consoleErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await use(errors);
    expect(errors, 'console errors or uncaught exceptions').toEqual([]);
  }, { auto: true }],
});
export { expect };

export type Role = 'Content Manager' | 'Super Admin' | 'Support Lead';

/** Pick a role on the sign-in screen; lands on the Library. */
export async function signIn(page: Page, role: Role = 'Content Manager') {
  await page.goto('/');
  await page.getByRole('button', { name: new RegExp(role) }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();
}

/** Opens the navigation drawer when the screen is too narrow for the sidebar. No-op on desktop. */
export async function openMenu(page: Page) {
  const menu = page.getByRole('button', { name: 'Open menu' });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  }
}

/** Follows a link in the main navigation (sidebar or drawer). */
export async function nav(page: Page, label: string) {
  await openMenu(page);
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label }).click();
}

/** Sets the environment from the top bar (or from the drawer on small screens). */
export async function setEnv(page: Page, env: 'Staging' | 'Production') {
  await openMenu(page);
  await page.getByRole('group', { name: 'Environment' }).getByRole('button', { name: env }).click();
  await closeMenuIfOpen(page);
}

export async function closeMenuIfOpen(page: Page) {
  const close = page.getByRole('button', { name: 'Close menu' });
  if (await close.isVisible()) await close.click();
}

/** Starts a journey from the Journeys page, as a reviewer would. */
export async function startJourney(page: Page, id: string, role: Role = 'Content Manager') {
  await signIn(page, role);
  await nav(page, 'Journeys');
  await expect(page.getByRole('heading', { level: 1, name: 'User journeys' })).toBeVisible();
  await page.getByRole('button', { name: `Start ${id}` }).click();
}

/** Selects a node in the editor's content tree, opening the tree panel first when it is collapsed (small screens). */
export async function selectNode(page: Page, name: string | RegExp) {
  const tree = page.getByRole('tree');
  if (!(await tree.isVisible())) await page.getByRole('button', { name: /^Contents/ }).click();
  await tree.getByRole('treeitem', { name }).first().click();
}

/** Dismisses every toast and waits for entry animations to finish, so measurements and screenshots see the settled page. */
export async function clearToasts(page: Page) {
  for (const b of await page.getByRole('button', { name: 'Dismiss' }).all()) await b.click({ timeout: 1_000 }).catch(() => {}); // it may expire by itself meanwhile
  await expect(page.getByRole('button', { name: 'Dismiss' })).toHaveCount(0);
  await settle(page);
}

/** Waits until no finite CSS animation is running (dialogs pop in, panels fade up). */
export async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity));
}
