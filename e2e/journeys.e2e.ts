// The nine review journeys (J1–J9 on the Journeys page), each walked through to its real end state.
import { clearToasts, expect, nav, selectNode, setEnv, startJourney, test } from './fixtures';

/** A few bytes of a real WAV file (44-byte header + silence): enough for the browser to call it audio. */
function wav(): Buffer {
  const data = Buffer.alloc(800);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(8000, 24);
  h.writeUInt32LE(8000, 28); h.writeUInt16LE(1, 32); h.writeUInt16LE(8, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

test('J1 · see where everything stands', async ({ page }) => {
  await startJourney(page, 'J1');
  await expect(page).toHaveURL(/\/library$/);
  const item = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}`) }).filter({ visible: true });
  for (const name of ['Ramayana', 'Mahabharatam', 'Book of Datta', 'Bhagavad Gita lessons', 'The Kind Deer', 'Little Dhruva']) await expect(item(name)).toBeVisible();

  await page.getByRole('tab', { name: /Epics/ }).click();
  await expect(item('Ramayana')).toBeVisible();
  await expect(item('The Kind Deer')).toHaveCount(0);
  // Which book is holding up Telugu? One epic has no Telugu at all, one is complete.
  const telugu = page.getByRole('meter', { name: 'Telugu coverage' }).filter({ visible: true });
  await expect(telugu).toHaveCount(4);
  await expect(telugu.and(page.locator('[aria-valuenow="0"]'))).toHaveCount(1);
  await expect(telugu.and(page.locator('[aria-valuenow="100"]'))).toHaveCount(1);

  await page.getByRole('tab', { name: /Bedtime stories/ }).click();
  await expect(item('The Kind Deer')).toBeVisible();
  await expect(item('Ramayana')).toHaveCount(0);

  await setEnv(page, 'Production');
  await expect(page.getByText('What is in production right now, and what families can see.')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /^PRODUCTION/ })).toBeVisible();
  await expect(page.getByText('Switched on', { exact: true })).toBeVisible();
});

test('J2 · fix out-of-date Telugu audio', async ({ page }) => {
  await startJourney(page, 'J2');
  const female = page.getByRole('group', { name: 'Female voice', exact: true });
  await expect(female.getByText('Out of date · text changed')).toBeVisible();

  // Edit the Telugu sentence; clicking away saves it and marks every voice out of date.
  const sentence = page.getByRole('textbox', { name: /^Sentence\W*Telugu$/ });
  await sentence.fill('ఒక రోజు, విశ్వామిత్ర మహర్షి రాజభవనానికి వచ్చారు!');
  await sentence.blur();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  for (const voice of ['Female', 'Male', 'Child']) {
    const row = page.getByRole('group', { name: `${voice} voice`, exact: true });
    await expect(row.getByText('Out of date · text changed')).toBeVisible();
    await row.getByRole('button', { name: 'Regenerate' }).click();
    await expect(row.getByText('Draft · listen, then approve')).toBeVisible();
    await row.getByRole('button', { name: `Play ${voice.toLowerCase()} voice` }).click();
    await expect(page.getByText(/Now playing/)).toBeVisible();
    await row.getByRole('button', { name: `Stop ${voice.toLowerCase()} voice` }).click();
    await row.getByRole('button', { name: 'Approve' }).click();
    await expect(row.getByText('Approved', { exact: true })).toBeVisible();
  }
  await expect(page.getByText('Required voices approved')).toBeVisible();
});

test('J3 · upload a recorded audio file (and a non-audio file is refused)', async ({ page }) => {
  await startJourney(page, 'J3');
  const male = page.getByRole('group', { name: 'Male voice', exact: true });
  await expect(male.getByText('Missing', { exact: true })).toBeVisible();
  const input = male.locator('input[type="file"]');

  await input.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not audio') });
  await expect(page.getByText('notes.txt is not an audio file')).toBeVisible();
  await expect(male.getByText('Missing', { exact: true })).toBeVisible();

  await input.setInputFiles({ name: 'male-telugu.wav', mimeType: 'audio/wav', buffer: wav() });
  await expect(page.getByRole('status').getByText('Uploaded male-telugu.wav', { exact: true })).toBeVisible();
  await expect(male.getByText('Draft · listen, then approve')).toBeVisible();
  await expect(male.getByText('Uploaded male-telugu.wav')).toBeVisible();
  await male.getByRole('button', { name: 'Approve' }).click();
  await expect(male.getByText('Approved', { exact: true })).toBeVisible();
  await expect(page.getByText('Required voices approved')).toBeVisible();
});

test('J4 · translate a quiz question into Kannada', async ({ page }) => {
  await startJourney(page, 'J4');
  await expect(page.getByRole('heading', { name: /Quiz/, level: 2 })).toBeVisible();
  const dots = page.getByRole('img', { name: 'Kannada text missing' });
  await expect(dots).toHaveCount(1);
  await page.getByRole('button', { name: /^Q3/ }).click();

  await page.getByRole('textbox', { name: /^Question\W*Kannada$/ }).fill('ರಾಮನಿಗೆ ___ ಸಹೋದರರು ಇದ್ದರು.');
  await page.getByRole('textbox', { name: 'Option 1 (Kannada)' }).fill('ಮೂವರು');
  await page.getByRole('textbox', { name: /^Hint\W*Kannada$/ }).fill('ಪುತ್ರರನ್ನು ಎಣಿಸಿ, ರಾಮನನ್ನು ಬಿಡಿ.');
  await page.getByRole('textbox', { name: /^Hint\W*Kannada$/ }).blur();
  await expect(dots).toHaveCount(0);

  // A translator cannot change the type or the correct answer.
  await expect(page.getByRole('combobox', { name: 'Question type' })).toBeDisabled();
  await page.getByRole('button', { name: /^Q1/ }).click();
  await expect(page.getByRole('radio', { name: 'Option 1 is correct' })).toBeDisabled();
});

test('J5 · validate, fix, and send for review', async ({ page }) => {
  await startJourney(page, 'J5');
  const send = page.getByRole('button', { name: 'Send for review' });
  await expect(send).toBeDisabled();
  await expect(send).toHaveAttribute('title', 'Fix 1 error before sending for review');

  await page.getByRole('button', { name: /Male voice: audio missing/ }).click();
  const male = page.getByRole('group', { name: 'Male voice', exact: true });
  await male.getByRole('button', { name: 'Regenerate' }).click();
  await male.getByRole('button', { name: 'Approve' }).click();
  await expect(male.getByText('Approved', { exact: true })).toBeVisible();

  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByText('Sent for review', { exact: true })).toBeVisible();
  await expect(page.getByText('In review', { exact: true }).first()).toBeVisible();
});

test('J6 · promote to production and switch Telugu on', async ({ page }) => {
  await startJourney(page, 'J6', 'Super Admin');
  await page.getByRole('button', { name: 'Promote to production' }).click();
  await expect(page).toHaveURL(/\/promote$/);
  const next = page.getByRole('button', { name: 'Next' });

  await expect(next).toBeDisabled();
  await page.getByRole('checkbox', { name: 'These matches are right' }).check();
  await next.click();
  await expect(page.getByRole('heading', { name: 'What will change' })).toBeVisible();
  await next.click();
  await expect(page.getByRole('heading', { name: 'The 17 pre-promote checks' })).toBeVisible();
  await next.click();
  await page.getByRole('button', { name: 'Run dry run' }).click();
  await expect(page.getByText('Clean.')).toBeVisible({ timeout: 10_000 });
  await next.click();

  const promote = page.getByRole('button', { name: 'Promote now' });
  await expect(promote).toBeDisabled();
  await page.getByRole('textbox', { name: 'Type Book of Datta' }).fill('Book of Datta');
  await page.getByRole('textbox', { name: 'Type production' }).fill('production');
  await promote.click();
  await expect(page.getByText(/^Updated in place\. It was already on/)).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Open in production' }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByText('Production · read-only')).toBeVisible();
  const te = page.getByRole('switch', { name: 'Telugu on' });
  await expect(te).toHaveAttribute('aria-checked', 'false');
  await te.click();
  const confirm = page.getByRole('dialog', { name: 'Switch Telugu on in production?' });
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Switch on' }).click();
  await expect(confirm).toBeHidden();
  await expect(te).toHaveAttribute('aria-checked', 'true');

  await clearToasts(page);
  await nav(page, 'Activity');
  await expect(page.getByText('Telugu switched on').first()).toBeVisible();
  await expect(page.getByText('Promoted to production').first()).toBeVisible();
});

test('J7 · add a new bedtime story', async ({ page }) => {
  await startJourney(page, 'J7');
  await page.getByRole('button', { name: 'New bedtime story' }).click();
  const dialog = page.getByRole('dialog', { name: 'New bedtime story' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Create story' }).click();
  await expect(dialog.getByText('Enter a title for the story.')).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: /Title/ })).toHaveAttribute('aria-invalid', 'true');

  await dialog.getByRole('textbox', { name: /Title/ }).fill('The Honest Owl');
  await dialog.getByRole('button', { name: 'Create story' }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByRole('heading', { level: 1, name: 'The Honest Owl' })).toBeVisible();

  await selectNode(page, /Scene 1/);
  await page.getByRole('button', { name: 'Add chunk' }).click();
  await expect(page.getByText('Chunk added', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Chunks \(one sentence each\)/ })).toContainText('2');
});

test('J8 · a Content Manager cannot change production', async ({ page }) => {
  await startJourney(page, 'J8');
  await expect(page.getByRole('heading', { level: 1, name: 'Ramayana' })).toBeVisible();
  await expect(page.getByText('Production · read-only')).toBeVisible();
  await expect(page.getByText(/Read-only\./)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Promote to production' })).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'Families can see it' })).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'Telugu on' })).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'Kannada on' })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: /Book name/ })).not.toBeEditable();

  await selectNode(page, /He was a kind and fair king/);
  await expect(page.getByRole('textbox', { name: /Sentence/ })).not.toBeEditable();
  for (const b of await page.getByRole('button', { name: /Regenerate|Upload/ }).all()) await expect(b).toBeDisabled();

  await nav(page, 'Library');
  await expect(page.getByRole('button', { name: 'New bedtime story' })).toBeDisabled();
  await page.goto('/promote');
  await expect(page.getByRole('heading', { name: 'Only a Super Admin can promote' })).toBeVisible();
});

test('J9 · see who changed what', async ({ page }) => {
  await startJourney(page, 'J9', 'Support Lead');
  await expect(page).toHaveURL(/\/activity$/);
  const entries = page.getByRole('list').filter({ has: page.locator('time') }).getByRole('listitem');
  const total = await entries.count();
  expect(total).toBeGreaterThan(3);

  await page.getByRole('group', { name: 'Environment filter' }).getByRole('button', { name: 'Production' }).click();
  await expect(entries).toHaveCount(3);
  await expect(page.getByText('3 entries')).toBeVisible();
  for (const e of await entries.all()) await expect(e).toContainText('production');

  await page.getByRole('group', { name: 'Environment filter' }).getByRole('button', { name: 'All' }).click();
  await page.getByRole('searchbox', { name: 'Search activity' }).fill('Telugu');
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText('Edited Telugu text');
  await expect(entries.first().getByText('Before')).toBeVisible();
  await expect(entries.first().getByText('After')).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search activity' }).fill('no such thing');
  await expect(page.getByText('No activity matches')).toBeVisible();
});
