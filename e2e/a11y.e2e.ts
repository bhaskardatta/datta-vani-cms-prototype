// Accessibility: axe-core (WCAG 2.1 A and AA rules) on every screen, including the editor with a chunk open,
// the promote wizard and the new-story dialog. Serious and critical violations fail the test.
import AxeBuilder from '@axe-core/playwright';
import { clearToasts, expect, test } from './fixtures';
import { SCREENS } from './screens';

for (const screen of SCREENS) {
  test(`a11y: ${screen.name}`, async ({ page }) => {
    await screen.setup(page);
    await clearToasts(page);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const bad = violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.impact} ${v.id}: ${v.help}\n${v.nodes.slice(0, 5).map((n) => `   ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`).join('\n')}`);
    expect(bad, bad.join('\n\n')).toEqual([]);
  });
}
