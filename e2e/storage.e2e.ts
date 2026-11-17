// Saved data in localStorage from an older build, or edited by hand, must never leave a blank page.
import { expect, test } from './fixtures';

const KEY = 'dv-cms-prototype-v1';

/** Puts `raw` in the app's localStorage key before the first load of the test (after the fixture's own clean-up). */
const seedStorage = (page: import('@playwright/test').Page, raw: string) =>
  page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('e2e-seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('e2e-seeded', '1'); }
  }, [KEY, raw] as const);

test('unreadable saved data is replaced with fresh sample data', async ({ page }) => {
  await seedStorage(page, '{not json');
  await page.goto('/library');
  // Fresh data is signed out, so the app goes to sign-in; signing in shows the sample library.
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: /Content Manager/ }).click();
  await expect(page.getByRole('button', { name: /^Ramayana/ }).filter({ visible: true })).toBeVisible();
});

test('saved data that breaks a screen shows a way out, not a blank page', async ({ page, consoleErrors }) => {
  // Right top-level shape, but the book has no sections: the library cannot draw it.
  const broken = {
    ui: { signedIn: true, role: 'cm', env: 'staging', lang: 'en', showIssues: false },
    db: { staging: [{ kind: 'book', id: 'x', match: 'x', num: 1, name: { en: 'Broken' } }], production: [], audit: [], snapshots: {}, themes: [], characters: [] },
  };
  await seedStorage(page, JSON.stringify(broken));
  await page.goto('/library');
  await expect(page.getByRole('heading', { name: 'This screen could not open' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Sign in as' })).toBeVisible();
  consoleErrors.splice(0); // expected here: React reports the caught render error to the console
});
