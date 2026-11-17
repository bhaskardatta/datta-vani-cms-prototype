import { describe, expect, it } from 'vitest';
import { type Book, type Item, nodes } from '../src/lib/domain/content';
import {
  blockDeleteDraft, blockEnableLanguage, blockPromote, blockSendForReview, blockSwitchOn, diff, promoteInto, revertPromote,
} from '../src/lib/domain/publishing';
import { chunk, fresh, ids, production, ramayana, staging } from './helpers';

const prodChunks = (it: Item) => nodes(it).filter((n) => n.type === 'chunk');

describe('promote plan (diff)', () => {
  it('shows new and changed English chunks against the older production copy', () => {
    const db = fresh();
    const d = diff(ramayana(db), production(db, 'ramayana'), ['en']);
    expect(d.counts.en).toEqual({ new: 1, changed: 1, same: 7 });
    expect(d.changes).toContainEqual(expect.objectContaining({ kind: 'changed', before: 'He was a kind and fair king.', after: 'He was a kind and just king.' }));
    expect(d.files).toBe(12); // 2 chunks × 3 current voices × (audio + transcript)
  });

  it('every Telugu chunk is new when production has no Telugu yet', () => {
    const db = fresh();
    expect(diff(ramayana(db), production(db, 'ramayana'), ['te']).counts.te).toEqual({ new: 8, changed: 0, same: 0 });
  });

  it('a replaced audio file counts as a change even when the text is the same', () => {
    const db = fresh();
    chunk(ramayana(db), 'r-s1-c1-sc1-k1').audio.en!.female = { state: 'current', source: 'uploaded', file: 'new.mp3' };
    const d = diff(ramayana(db), production(db, 'ramayana'), ['en']);
    expect(d.changes).toContainEqual(expect.objectContaining({ before: 'Audio replaced', after: 'New audio and transcript' }));
  });

  it('only looks at the chosen languages, and is empty right after a promote', () => {
    const db = fresh();
    promoteInto(db, ramayana(db), ['en', 'te']);
    const d = diff(ramayana(db), production(db, 'ramayana'), ['en', 'te']);
    expect(d.counts.en).toMatchObject({ new: 0, changed: 0 });
    expect(d.counts.te).toMatchObject({ new: 0, changed: 0 });
    expect(d.counts.kn).toEqual({ new: 0, changed: 0, same: 0 });
  });
});

describe('promote invariants', () => {
  it('keeps production IDs: rows are updated in place', () => {
    const db = fresh();
    const p = production(db, 'ramayana')!;
    p.id = 'prod-ramayana-77'; // real production IDs differ from staging IDs
    const before = ids(p);
    const { prod, existed } = promoteInto(db, ramayana(db), ['en']);
    expect(existed).toBe(true);
    expect(prod.id).toBe('prod-ramayana-77');
    for (const id of before) expect(ids(prod).has(id)).toBe(true);
    expect(db.production.filter((i) => i.match === 'ramayana')).toHaveLength(1);
  });

  it('never deletes: rows that exist only in production are kept', () => {
    const db = fresh();
    const p = production(db, 'ramayana') as Book;
    p.sections[0].chapters[0].scenes[0].chunks.push({ id: 'p-only', text: { en: 'Only in production.' }, audio: {} });
    const before = ids(p);
    const count = db.production.length;
    const { prod } = promoteInto(db, ramayana(db), ['en', 'te']);
    for (const id of before) expect(ids(prod).has(id)).toBe(true);
    expect(chunk(prod, 'p-only').text.en).toBe('Only in production.');
    expect(db.production).toHaveLength(count);
  });

  it('adds staging rows that are new to production', () => {
    const db = fresh();
    const { prod } = promoteInto(db, ramayana(db), ['en']);
    expect(prodChunks(prod)).toHaveLength(9);
    expect(chunk(prod, 'p-r-s1-c1-sc2-k2').text.en).toMatch(/four sons/);
  });

  it('never switches anything on: a live item stays on, an off item stays off, languages keep their switches', () => {
    const db = fresh();
    const p = production(db, 'ramayana')!;
    expect(p.active).toBe(true);
    let { prod } = promoteInto(db, ramayana(db), ['en', 'te']);
    expect(prod.active).toBe(true);
    expect(prod.langOn).toEqual({ en: true, te: false, kn: false }); // Telugu content arrived, but Telugu is still off

    production(db, 'ramayana')!.active = false;
    ({ prod } = promoteInto(db, ramayana(db), ['en']));
    expect(prod.active).toBe(false);
  });

  it('a new item lands switched off, with only English on', () => {
    const db = fresh();
    expect(production(db, 'dhruva')).toBeUndefined();
    const s = staging(db, 'dhruva');
    s.active = true;
    const { prod, existed } = promoteInto(db, s, ['en']);
    expect(existed).toBe(false);
    expect(prod.active).toBe(false);
    expect(prod.langOn).toEqual({ en: true, te: false, kn: false });
    expect(prod.id).toBe('p-dhruva');
  });

  it('leaves languages that were not chosen exactly as they are in production', () => {
    const db = fresh();
    const p = production(db, 'ramayana')!;
    const pc = chunk(p, 'p-r-s1-c1-sc1-k1');
    pc.text.kn = 'ಉತ್ಪಾದನೆಯ ಪಠ್ಯ';
    pc.audio.kn = { female: { state: 'current', source: 'uploaded', file: 'prod.mp3' } };
    const { prod } = promoteInto(db, ramayana(db), ['en', 'te']);
    const c = chunk(prod, 'p-r-s1-c1-sc1-k1');
    expect(c.text.kn).toBe('ಉತ್ಪಾದನೆಯ ಪಠ್ಯ');
    expect(c.audio.kn).toEqual({ female: { state: 'current', source: 'uploaded', file: 'prod.mp3' } });
    expect(c.text.te).toBe(chunk(ramayana(db), 'r-s1-c1-sc1-k1').text.te);
  });

  it('does not copy a language that was not chosen into production', () => {
    const db = fresh();
    const { prod } = promoteInto(db, ramayana(db), ['en']);
    expect(nodes(prod).some((n) => n.type === 'chunk' && n.obj.text.te)).toBe(false);
    expect(prod.name).toEqual({ en: 'Ramayana' });
  });

  it('copies, so later staging edits do not leak into production', () => {
    const db = fresh();
    promoteInto(db, ramayana(db), ['en']);
    chunk(ramayana(db), 'r-s1-c1-sc1-k1').text.en = 'Changed after promote';
    expect(chunk(production(db, 'ramayana'), 'p-r-s1-c1-sc1-k1').text.en).not.toBe('Changed after promote');
  });
});

describe('revert', () => {
  it('restores the production copy saved before the promote', () => {
    const db = fresh();
    const before = structuredClone(production(db, 'ramayana'));
    promoteInto(db, ramayana(db), ['en', 'te']);
    const r = revertPromote(db, 'ramayana');
    expect(r?.restored).toBe(true);
    expect(production(db, 'ramayana')).toEqual(before);
  });

  it('a new item is switched off, not deleted', () => {
    const db = fresh();
    promoteInto(db, staging(db, 'dhruva'), ['en']);
    production(db, 'dhruva')!.active = true; // a Super Admin switched it on
    const r = revertPromote(db, 'dhruva');
    expect(r?.restored).toBe(false);
    expect(production(db, 'dhruva')).toMatchObject({ active: false, langOn: { en: true, te: false, kn: false } });
  });

  it('does nothing when there is no promote to undo (bug fix: it used to switch a live item off)', () => {
    const db = fresh();
    const before = structuredClone(db.production);
    expect(revertPromote(db, 'ramayana')).toBeNull();
    expect(db.production).toEqual(before);

    promoteInto(db, ramayana(db), ['en']);
    revertPromote(db, 'ramayana');
    const once = structuredClone(db.production);
    expect(revertPromote(db, 'ramayana')).toBeNull(); // a second revert changes nothing
    expect(db.production).toEqual(once);
  });
});

describe('guards', () => {
  it('promote needs a Super Admin, an approved item, English, and no errors in the chosen languages', () => {
    const db = fresh();
    const datta = staging(db, 'datta'); // approved, complete in all languages
    expect(blockPromote('sa', datta, ['en', 'te', 'kn'])).toBeNull();
    expect(blockPromote('cm', datta, ['en'])).toBe('Only a Super Admin can promote');
    expect(blockPromote('sa', datta, ['te'])).toBe('English must be included');
    expect(blockPromote('sa', ramayana(db), ['en'])).toBe('Approve it first');
    ramayana(db).status = 'ready';
    expect(blockPromote('sa', ramayana(db), ['en'])).toBeNull();
    expect(blockPromote('sa', ramayana(db), ['en', 'te', 'kn'])).toBe('Fix the errors in Telugu, Kannada first');
  });

  it('a language that is not complete in production cannot be switched on', () => {
    const db = fresh();
    expect(blockEnableLanguage(production(db, 'datta')!, 'te')).toBe('Telugu is not complete in production yet');
    promoteInto(db, staging(db, 'datta'), ['en', 'te']);
    expect(blockEnableLanguage(production(db, 'datta')!, 'te')).toBeNull();
    expect(blockEnableLanguage(production(db, 'datta')!, 'kn')).toBe('Kannada is not complete in production yet');
  });

  it('an item with English errors cannot be switched on in production', () => {
    const db = fresh();
    promoteInto(db, staging(db, 'clever-crow'), ['en']);
    expect(blockSwitchOn(production(db, 'clever-crow')!)).toBe('Fix the English errors before switching on');
    expect(blockSwitchOn(production(db, 'ramayana')!)).toBeNull();
  });

  it('send for review is blocked while the item has validation errors in any started language', () => {
    const db = fresh();
    const dhruva = staging(db, 'dhruva'); // English male voice missing on chunk 2
    expect(blockSendForReview('cm', 'staging', dhruva)).toBe('Fix 1 error before sending for review');
    chunk(dhruva, 'dhruva-sc1-k2').audio.en!.male = { state: 'current', source: 'generated' };
    expect(blockSendForReview('cm', 'staging', dhruva)).toBeNull(); // Telugu/Kannada not started: warnings only
    expect(blockSendForReview('cm', 'production', dhruva)).toMatch(/read-only/);
    expect(blockSendForReview('support', 'staging', dhruva)).toBe('Support Leads can only view');
    expect(blockSendForReview('cm', 'staging', staging(db, 'clever-crow'))).toMatch(/^Fix \d+ errors before sending for review$/);
  });

  it('only a draft that has never reached production can be deleted', () => {
    const db = fresh();
    expect(blockDeleteDraft('cm', 'staging', staging(db, 'dhruva'), db.production)).toBeNull();
    expect(blockDeleteDraft('sa', 'staging', staging(db, 'dhruva'), db.production)).toBeNull();
    expect(blockDeleteDraft('support', 'staging', staging(db, 'dhruva'), db.production)).toBe('Support Leads can only view');
    expect(blockDeleteDraft('cm', 'production', staging(db, 'dhruva'), db.production)).toMatch(/read-only/);
    expect(blockDeleteDraft('cm', 'staging', staging(db, 'kind-deer'), db.production)).toBe('Only a draft can be deleted');
    expect(blockDeleteDraft('cm', 'staging', staging(db, 'gita'), db.production)).toBe('It is in production, so it cannot be deleted'); // a draft, but live
    promoteInto(db, staging(db, 'dhruva'), ['en']);
    revertPromote(db, 'dhruva'); // reverted, but it still exists in production (switched off)
    expect(blockDeleteDraft('cm', 'staging', staging(db, 'dhruva'), db.production)).toBe('It is in production, so it cannot be deleted');
  });
});
