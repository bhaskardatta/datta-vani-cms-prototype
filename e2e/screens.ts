// Every screen the layout, accessibility and screenshot checks visit, with how to reach it
// and the one primary action that must be visible and clickable there.
import type { Locator, Page } from '@playwright/test';
import { expect, nav, signIn, startJourney } from './fixtures';

export type Screen = { name: string; shell: boolean; setup: (page: Page) => Promise<void>; primary: (page: Page) => Locator };

const openPromote = async (page: Page) => {
  await startJourney(page, 'J6', 'Super Admin');
  await page.getByRole('button', { name: 'Promote to production' }).click();
  await expect(page.getByRole('heading', { name: 'Match staging to production' })).toBeVisible();
};

export const SCREENS: Screen[] = [
  {
    name: 'sign-in', shell: false,
    setup: async (page) => { await page.goto('/'); },
    primary: (page) => page.getByRole('button', { name: /Content Manager/ }),
  },
  {
    name: 'library', shell: true,
    setup: async (page) => { await signIn(page); },
    primary: (page) => page.getByRole('button', { name: 'New bedtime story' }),
  },
  {
    name: 'new-story-dialog', shell: false, // a modal is open: the page behind it, navigation included, is inert by design
    setup: async (page) => {
      await signIn(page);
      await page.getByRole('button', { name: 'New bedtime story' }).click();
      await expect(page.getByRole('dialog', { name: 'New bedtime story' })).toBeVisible();
    },
    primary: (page) => page.getByRole('button', { name: 'Create story' }),
  },
  {
    name: 'editor', shell: true,
    setup: async (page) => {
      await startJourney(page, 'J6', 'Super Admin');
      await expect(page.getByRole('heading', { level: 1, name: 'Book of Datta' })).toBeVisible();
    },
    primary: (page) => page.getByRole('button', { name: 'Promote to production' }),
  },
  {
    name: 'editor-chunk', shell: true,
    setup: async (page) => {
      await startJourney(page, 'J2');
      await expect(page.getByRole('group', { name: 'Female voice', exact: true })).toBeVisible();
    },
    primary: (page) => page.getByRole('group', { name: 'Female voice', exact: true }).getByRole('button', { name: 'Regenerate' }),
  },
  {
    name: 'editor-validation', shell: true,
    setup: async (page) => {
      await startJourney(page, 'J5');
      await expect(page.getByRole('heading', { name: 'Validation', level: 2 })).toBeVisible();
    },
    primary: (page) => page.getByRole('button', { name: /Male voice: audio missing/ }),
  },
  {
    name: 'promote', shell: true,
    setup: openPromote,
    primary: (page) => page.getByRole('checkbox', { name: 'These matches are right' }),
  },
  {
    name: 'promote-step-3', shell: true,
    setup: async (page) => {
      await openPromote(page);
      await page.getByRole('checkbox', { name: 'These matches are right' }).check();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByRole('heading', { name: 'The 17 pre-promote checks' })).toBeVisible();
    },
    primary: (page) => page.getByRole('button', { name: 'Next' }),
  },
  {
    name: 'activity', shell: true,
    setup: async (page) => { await signIn(page, 'Support Lead'); await nav(page, 'Activity'); await expect(page).toHaveURL(/\/activity$/); },
    primary: (page) => page.getByRole('searchbox', { name: 'Search activity' }),
  },
  {
    name: 'journeys', shell: true,
    setup: async (page) => { await signIn(page); await nav(page, 'Journeys'); await expect(page).toHaveURL(/\/journeys$/); },
    primary: (page) => page.getByRole('button', { name: 'Start J1' }),
  },
  {
    name: 'wireframes', shell: true,
    setup: async (page) => { await signIn(page); await nav(page, 'Wireframes'); await expect(page).toHaveURL(/\/wireframes$/); },
    primary: (page) => page.getByRole('link', { name: /Open the real screen/ }).first(),
  },
];
