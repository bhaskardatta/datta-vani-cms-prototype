'use client';
// One small store, kept in localStorage so edits survive a reload. The functions below stand in for cms-service endpoints:
// each one checks the domain guard first (like the server would) and does nothing if the guard says no.
import { useSyncExternalStore } from 'react';
import { seed } from './data';
import { type Role, ROLE_NAME, blockEdit, blockSuper, blockToggle } from './domain/access';
import { record } from './domain/audit';
import {
  type AudioAction, type Chapter, type Chunk, type Item, type Lang, type Scene, type Status, type Story, type TreeNode, type Voice,
  LANG_NAME, STATUS_NAME, applyAudio, editChunkText, findById, nodes,
} from './domain/content';
import {
  type DB, type Env,
  blockApprove, blockDeleteDraft, blockEnableLanguage, blockPromote, blockSendForReview, blockSwitchOn, promoteInto, revertPromote,
} from './domain/publishing';

export type UI = {
  signedIn: boolean; role: Role; env: Env; lang: Lang;
  open?: string; node?: string; promote?: string; showIssues: boolean;
};
export type State = { db: DB; ui: UI };

export const STORAGE_KEY = 'dv-cms-prototype-v1';
const fresh = (): State => ({ db: seed(), ui: { signedIn: false, role: 'cm', env: 'staging', lang: 'en', showIssues: false } });
let state: State | null = null;
const subs = new Set<() => void>();

/** Saved data from an older build, or edited by hand, is replaced with fresh sample data instead of crashing the app. */
const looksLikeState = (x: unknown): x is State => {
  const s = x as Partial<State> | null;
  return !!s && typeof s.ui === 'object' && s.ui !== null && typeof s.db === 'object' && s.db !== null
    && (['staging', 'production', 'audit', 'themes', 'characters'] as const).every((k) => Array.isArray(s.db![k]))
    && typeof s.db.snapshots === 'object' && s.db.snapshots !== null;
};

function get(): State {
  if (!state) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      state = looksLikeState(saved) ? saved : fresh();
    } catch { state = fresh(); } // unparsable JSON, or storage blocked
  }
  return state;
}
const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; };
/** null on the server and during hydration; the stored state after that. */
export const useApp = () => useSyncExternalStore(subscribe, get, () => null);

/** Applies fn to a copy of the state and saves it. Returns whatever fn returns (true = the action applied). */
function set<T>(fn: (s: State) => T): T {
  const next = structuredClone(get());
  const r = fn(next);
  state = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode: keep in memory */ }
  subs.forEach((f) => f());
  return r;
}

function log(s: State, action: string, target: string, extra: { detail?: string; before?: string; after?: string; env?: Env } = {}) {
  const { env = s.ui.env, ...rest } = extra;
  record(s.db.audit, { who: ROLE_NAME[s.ui.role], env, action, target, ...rest });
}
const find = (list: Item[], match?: string) => list.find((i) => i.match === match);
const crumb = (it: Item, nodeId: string) => {
  const n = nodes(it).find((x) => x.id === nodeId);
  return n && n.depth > 0 ? `${it.name.en || 'Untitled'} › ${n.crumb}` : it.name.en || 'Untitled';
};

export const act = {
  signIn: (role: Role) => set((s) => { s.ui.signedIn = true; s.ui.role = role; s.ui.env = 'staging'; }),
  signOut: () => set((s) => { s.ui.signedIn = false; }),
  role: (role: Role) => set((s) => { s.ui.role = role; }),
  env: (env: Env) => set((s) => {
    s.ui.env = env;
    // Keep the selected node across environments. ponytail: production ids are staging ids with a "p-" prefix
    // (same rule as publishing.diff); a node that does not exist on the other side falls back to the root in the editor.
    const n = s.ui.node;
    if (n) s.ui.node = env === 'production' ? (n.startsWith('p-') ? n : `p-${n}`) : n.replace(/^p-/, '');
  }),
  lang: (lang: Lang) => set((s) => { s.ui.lang = lang; }),
  select: (node: string) => set((s) => { s.ui.node = node; }),
  issues: (show?: boolean) => set((s) => { s.ui.showIssues = show ?? !s.ui.showIssues; }),
  open: (match: string, opts: { node?: string; lang?: Lang; env?: Env; role?: Role } = {}) => set((s) => {
    s.ui.open = match; s.ui.node = opts.node; s.ui.showIssues = false;
    if (opts.lang) s.ui.lang = opts.lang;
    if (opts.env) s.ui.env = opts.env;
    if (opts.role) s.ui.role = opts.role;
  }),
  startPromote: (match: string) => set((s) => { s.ui.promote = match; s.ui.env = 'staging'; }),
  reset: () => set((s) => { s.db = seed(); s.ui = { ...s.ui, open: undefined, node: undefined, promote: undefined, showIssues: false }; }),

  /** Change one node of a staging item. Editing an approved item sends it back to draft. `fn` may return false for "nothing changed".
   *  The caller names the node type it expects for `nodeId` (the id came from that node). Returns true when the change was applied. */
  edit: <N = TreeNode>(match: string, nodeId: string, fn: (node: N, item: Item) => void | boolean, entry?: { action: string; before?: string; after?: string }) =>
    set((s) => {
      const it = find(s.db.staging, match);
      const node = it && findById(it, nodeId);
      if (!it || !node || blockEdit(s.ui.role, s.ui.env)) return false;
      if (fn(node as N, it) === false) return false;
      it.updatedAt = new Date().toISOString();
      if (entry) log(s, entry.action, crumb(it, nodeId), { before: entry.before, after: entry.after, env: 'staging' });
      if (it.status === 'ready') { it.status = 'draft'; log(s, 'Approval cleared', it.name.en ?? '', { detail: 'Edited after approval, so it needs review again.', env: 'staging' }); }
      return true;
    }),

  /** Chunk text changed: its audio and transcript in that language no longer match. */
  editChunkText: (match: string, chunkId: string, lang: Lang, value: string, before: string) =>
    act.edit(match, chunkId, (c: Chunk) => editChunkText(c, lang, value), { action: `Edited ${LANG_NAME[lang]} text`, before, after: value }),

  audio: (match: string, chunkId: string, lang: Lang, voice: Voice, what: AudioAction, file?: string) =>
    act.edit(match, chunkId, (c: Chunk) => applyAudio(c, lang, voice, what, file), {
      action: {
        regenerate: `Regenerated ${LANG_NAME[lang]} ${voice} audio and transcript (draft)`,
        upload: `Uploaded ${LANG_NAME[lang]} ${voice} audio${file ? ` (${file})` : ''}; transcript generated (draft)`,
        approve: `Approved ${LANG_NAME[lang]} ${voice} audio and transcript`,
        reject: `Rejected ${LANG_NAME[lang]} ${voice} audio draft`,
      }[what],
    }),

  status: (match: string, to: Status) => set((s) => {
    const it = find(s.db.staging, match);
    if (!it) return false;
    const block = to === 'ready' ? blockApprove(s.ui.role, it) : to === 'in_review' ? blockSendForReview(s.ui.role, s.ui.env, it) : blockEdit(s.ui.role, s.ui.env);
    if (block) return false;
    const before = STATUS_NAME[it.status];
    it.status = to;
    log(s, to === 'in_review' ? 'Sent for review' : to === 'ready' ? 'Approved' : 'Sent back to draft', it.name.en ?? '', { before, after: STATUS_NAME[to], env: 'staging' });
    return true;
  }),

  toggleActive: (env: Env, match: string, on: boolean) => set((s) => {
    const it = find(s.db[env], match);
    if (!it || blockToggle(s.ui.role, env) || (on && env === 'production' && blockSwitchOn(it))) return false;
    const before = it.active ? 'On' : 'Off';
    it.active = on;
    log(s, on ? 'Switched on' : 'Switched off', it.name.en ?? '', { env, before, after: on ? 'On' : 'Off', detail: env === 'production' ? 'Families see the change within about 10 minutes (cache refresh).' : undefined });
    return true;
  }),
  toggleLang: (env: Env, match: string, lang: Lang, on: boolean) => set((s) => {
    const it = find(s.db[env], match);
    if (!it || blockToggle(s.ui.role, env) || (on && env === 'production' && blockEnableLanguage(it, lang))) return false;
    const before = it.langOn[lang] ? 'On' : 'Off';
    it.langOn[lang] = on;
    log(s, `${LANG_NAME[lang]} switched ${on ? 'on' : 'off'}`, it.name.en ?? '', { env, before, after: on ? 'On' : 'Off' });
    return true;
  }),

  /** Creates a draft story with this title and opens it. Returns its id, or null if refused. */
  newStory: (title: string) => {
    const id = `new${Date.now().toString(36)}`;
    const name = title.trim();
    return set((s) => {
      if (!name || blockEdit(s.ui.role, s.ui.env)) return null;
      const num = Math.max(...s.db.staging.filter((i) => i.kind === 'story').map((i) => i.num)) + 1;
      const story: Story = {
        kind: 'story', id, match: id, num, status: 'draft', active: false, langOn: { en: true, te: false, kn: false },
        updatedAt: new Date().toISOString(), name: { en: name }, description: { en: '' }, themes: [], characters: [],
        scenes: [{ id: `${id}-sc1`, chunks: [{ id: `${id}-sc1-k1`, text: {}, audio: {} }] }],
      };
      s.db.staging.push(story);
      s.ui.open = id; s.ui.node = id; s.ui.lang = 'en'; s.ui.showIssues = false;
      log(s, 'Created bedtime story', name, { env: 'staging' });
      return id;
    });
  },
  /** Deletes a draft that never reached production. Returns true if it was deleted. */
  deleteDraft: (match: string) => set((s) => {
    const it = find(s.db.staging, match);
    if (!it || blockDeleteDraft(s.ui.role, s.ui.env, it, s.db.production)) return false;
    s.db.staging = s.db.staging.filter((i) => i !== it);
    if (s.ui.open === match) { s.ui.open = undefined; s.ui.node = undefined; s.ui.showIssues = false; }
    log(s, 'Deleted draft', it.name.en || 'Untitled', { env: 'staging', detail: 'It was never promoted, so nothing in production changed.' });
    return true;
  }),
  addScene: (match: string, parentId: string) => act.edit(match, parentId, (p: Chapter | Story) => {
    const sid = `${p.id}-sc${p.scenes.length + 1}${Date.now().toString(36).slice(-3)}`;
    p.scenes.push({ id: sid, chunks: [{ id: `${sid}-k1`, text: {}, audio: {} }] });
  }, { action: 'Added a scene' }),
  addChunk: (match: string, sceneId: string) => act.edit(match, sceneId, (sc: Scene) => {
    sc.chunks.push({ id: `${sc.id}-k${sc.chunks.length + 1}${Date.now().toString(36).slice(-3)}`, text: {}, audio: {} });
  }, { action: 'Added a chunk' }),

  promote: (match: string, langs: Lang[]) => {
    let result = { existed: false, active: false };
    set((s) => {
      const it = find(s.db.staging, match);
      if (!it || blockPromote(s.ui.role, it, langs)) return;
      const { prod, existed } = promoteInto(s.db, it, langs);
      result = { existed, active: prod.active };
      log(s, 'Promoted to production', it.name.en ?? '', {
        env: 'production',
        detail: `${langs.map((l) => LANG_NAME[l]).join(', ')} · ${existed ? 'updated in place, visibility unchanged' : 'created, switched off'} · snapshot saved`,
      });
    });
    return result;
  },
  revert: (match: string) => set((s) => {
    if (blockSuper(s.ui.role, 'revert a promote')) return;
    const r = revertPromote(s.db, match);
    if (r) log(s, 'Reverted promote', r.item.name.en ?? '', { env: 'production', detail: r.restored ? 'Restored the snapshot taken before the promote.' : 'Was new: switched off (nothing is deleted).' });
  }),
};
