// The store stands in for cms-service endpoints. It needs localStorage, so a small in-memory one is stubbed in.
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { chunk } from './helpers';

const KEY = 'dv-cms-prototype-v1';
const mem = new Map<string, string>();
let mod: typeof import('../src/lib/store');
let snapshot: () => import('../src/lib/store').State;

beforeAll(async () => {
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => { mem.set(k, v); },
    removeItem: (k: string) => { mem.delete(k); },
  });
  mod = await import('../src/lib/store');
  snapshot = () => JSON.parse(mem.get(KEY)!);
});
beforeEach(() => { mod.act.reset(); mod.act.signIn('cm'); });

const K1 = 'r-s1-c1-sc1-k1';
const chunkIn = (match: string, id: string) => chunk(snapshot().db.staging.find((i) => i.match === match), id);

describe('store guards (what cms-service would enforce)', () => {
  it('a Content Manager edit on staging changes the text, marks audio stale and is audited', () => {
    mod.act.editChunkText('ramayana', K1, 'te', 'కొత్త వాక్యం', 'old');
    const c = chunkIn('ramayana', K1);
    expect(c.text.te).toBe('కొత్త వాక్యం');
    expect(c.audio.te?.female?.state).toBe('stale');
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Edited Telugu text', who: 'Content Manager', env: 'staging', after: 'కొత్త వాక్యం' });
  });

  it('nothing is edited while the Content Manager is in production', () => {
    mod.act.env('production');
    const auditBefore = snapshot().db.audit.length;
    mod.act.editChunkText('ramayana', K1, 'te', 'కొత్త వాక్యం', 'old');
    expect(chunkIn('ramayana', K1).text.te).not.toBe('కొత్త వాక్యం');
    expect(snapshot().db.audit).toHaveLength(auditBefore);
  });

  it('a Content Manager cannot promote, approve or switch production', () => {
    const before = JSON.stringify(snapshot().db.production);
    mod.act.promote('datta', ['en', 'te']);
    mod.act.toggleActive('production', 'ramayana', false);
    expect(JSON.stringify(snapshot().db.production)).toBe(before);
    mod.act.status('ramayana', 'ready');
    expect(snapshot().db.staging.find((i) => i.match === 'ramayana')!.status).toBe('in_review');
  });

  it('a Super Admin promotes; it keeps its switches and is audited; an incomplete language stays off', () => {
    mod.act.role('sa');
    const r = mod.act.promote('datta', ['en', 'te', 'kn']);
    expect(r).toEqual({ existed: true, active: true });
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Promoted to production', env: 'production', who: 'Super Admin' });
    mod.act.toggleLang('production', 'datta', 'te', true);
    expect(snapshot().db.production.find((i) => i.match === 'datta')!.langOn.te).toBe(true);
    mod.act.toggleLang('production', 'ramayana', 'te', true); // Telugu not promoted, so not complete
    expect(snapshot().db.production.find((i) => i.match === 'ramayana')!.langOn.te).toBe(false);
  });

  it('only a Super Admin reverts a promote (FR-PERM-04)', () => {
    mod.act.role('sa');
    mod.act.promote('datta', ['en']);
    mod.act.role('cm');
    const before = JSON.stringify(snapshot().db);
    mod.act.revert('datta');
    expect(JSON.stringify(snapshot().db)).toBe(before);
    mod.act.role('sa');
    mod.act.revert('datta');
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Reverted promote', env: 'production' });
  });

  it('a Super Admin can switch a live production item off (FR-SW-05)', () => {
    mod.act.role('sa');
    expect(mod.act.toggleActive('production', 'ramayana', false)).toBe(true);
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Switched off', env: 'production', before: 'On', after: 'Off' });
  });

  it('editing an approved item sends it back to draft', () => {
    mod.act.editChunkText('datta', 'datta-s1-c1-sc1-k1', 'en', 'A new sentence.', 'x');
    expect(snapshot().db.staging.find((i) => i.match === 'datta')!.status).toBe('draft');
    expect(snapshot().db.audit[0].action).toBe('Approval cleared');
  });

  it('refuses send for review while there are errors, and reports whether an action applied', () => {
    mod.act.open('dhruva');
    expect(mod.act.status('dhruva', 'in_review')).toBe(false);
    expect(snapshot().db.staging.find((i) => i.match === 'dhruva')!.status).toBe('draft');
    expect(mod.act.audio('dhruva', 'dhruva-sc1-k2', 'en', 'male', 'regenerate')).toBe(true);
    expect(mod.act.audio('dhruva', 'dhruva-sc1-k2', 'en', 'male', 'approve')).toBe(true);
    expect(mod.act.status('dhruva', 'in_review')).toBe(true);
    mod.act.env('production');
    expect(mod.act.editChunkText('dhruva', 'dhruva-sc1-k1', 'en', 'x', 'y')).toBe(false);
  });

  it('creates a story with its title, and deletes a draft that never reached production', () => {
    expect(mod.act.newStory('   ')).toBeNull();
    const id = mod.act.newStory('  The Owl  ')!;
    const st = snapshot();
    expect(st.db.staging.find((i) => i.match === id)!.name).toEqual({ en: 'The Owl' });
    expect(st.db.audit[0]).toMatchObject({ action: 'Created bedtime story', target: 'The Owl' });
    expect(mod.act.deleteDraft('kind-deer')).toBe(false); // approved and live
    expect(mod.act.deleteDraft(id)).toBe(true);
    expect(snapshot().db.staging.some((i) => i.match === id)).toBe(false);
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Deleted draft', target: 'The Owl', env: 'staging' });
  });

  it('logs switches with before/after, and names the item once in activity targets', () => {
    mod.act.toggleActive('staging', 'dhruva', true);
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Switched on', before: 'Off', after: 'On' });
    mod.act.toggleLang('staging', 'dhruva', 'te', true);
    expect(snapshot().db.audit[0]).toMatchObject({ action: 'Telugu switched on', before: 'Off', after: 'On' });
    mod.act.editChunkText('dhruva', 'dhruva-sc1-k1', 'en', 'Dhruva was a little prince.', 'x');
    expect(snapshot().db.audit[0].target).toBe('Little Dhruva’s Prayer › Scene 1 › Chunk 1');
    mod.act.editChunkText('ramayana', K1, 'en', 'Long ago.', 'x');
    expect(snapshot().db.audit[0].target).toBe('Ramayana › The King of Ayodhya › Scene 1 › Chunk 1');
  });

  it('keeps the selected node when switching between staging and production', () => {
    mod.act.open('ramayana', { node: K1 });
    mod.act.env('production');
    expect(snapshot().ui.node).toBe(`p-${K1}`);
    mod.act.env('staging');
    expect(snapshot().ui.node).toBe(K1);
  });
});

describe('saved data at the localStorage boundary', () => {
  // A fresh copy of the module, so it reads localStorage again instead of using the state it already holds.
  const load = async (raw: string) => {
    mem.set(KEY, raw);
    vi.resetModules();
    const m = await import('../src/lib/store');
    m.act.role('cm'); // any action reads the saved state first, then saves
    return JSON.parse(mem.get(KEY)!) as import('../src/lib/store').State;
  };

  it.each([
    ['unparsable JSON', '{not json'],
    ['JSON null', 'null'],
    ['an older shape without the snapshots and catalogs', JSON.stringify({ db: { staging: [], production: [], audit: [] }, ui: {} })],
    ['a db that is not an object', JSON.stringify({ db: 'x', ui: {} })],
  ])('%s is replaced with fresh sample data instead of crashing', async (_, raw) => {
    const s = await load(raw);
    expect(s.db.staging.map((i) => i.match)).toContain('ramayana');
    expect(s.ui.signedIn).toBe(false);
  });

  it('valid saved data is kept', async () => {
    const saved = JSON.parse(mem.get(KEY)!);
    saved.db.audit.unshift({ id: 'x', at: '2026-01-01T00:00:00.000Z', who: 'Content Manager', env: 'staging', action: 'Marker', target: 'Test' });
    const s = await load(JSON.stringify(saved));
    expect(s.db.audit[0].action).toBe('Marker');
  });
});
