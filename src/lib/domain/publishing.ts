// Publishing context: review workflow, the promote plan (diff), the promote itself, revert, and the on/off switches.
// Guards return null when allowed, or the reason it is not.
import { type Role, blockEdit, blockSuper } from './access';
import type { AuditEntry } from './audit';
import { type Item, type Lang, LANG_NAME, LANGS, isLangMap, nodes } from './content';
import { coverage } from './localization';
import { errorsIn, validate } from './validation';

export type Env = 'staging' | 'production';
/** Both environments plus what the CMS keeps beside them. */
export type DB = {
  staging: Item[]; production: Item[]; audit: AuditEntry[];
  /** Production item before its last promote (keyed by production id); null = it was new. */
  snapshots: Record<string, Item | null>;
  themes: string[]; characters: string[];
};
const OFF: Record<Lang, boolean> = { en: true, te: false, kn: false };

// ---------- review workflow: draft → in review → approved (ready) ----------
/** Send for review: an editor on staging, and no validation errors in any language that has started. */
export function blockSendForReview(role: Role, env: Env, it: Item) {
  const n = validate(it).filter((i) => i.level === 'error').length;
  return blockEdit(role, env) ?? (n ? `Fix ${n} error${n === 1 ? '' : 's'} before sending for review` : null);
}
/** Delete: only a draft that has never reached production (nothing in production is ever deleted). */
export const blockDeleteDraft = (role: Role, env: Env, it: Item, production: Item[]) =>
  blockEdit(role, env)
    ?? (it.status !== 'draft' ? 'Only a draft can be deleted' : null)
    ?? (production.some((p) => p.match === it.match) ? 'It is in production, so it cannot be deleted' : null);
export const blockApprove = (role: Role, it: Item) =>
  blockSuper(role, 'approve') ?? (errorsIn(validate(it), 'en') ? 'Fix the English errors first' : null);

// ---------- guards ----------
/** Promote: Super Admin, approved item, English included, no errors in any language being promoted. */
export function blockPromote(role: Role, it: Item, langs: Lang[]) {
  const issues = validate(it);
  const bad = langs.filter((l) => errorsIn(issues, l));
  return blockSuper(role, 'promote')
    ?? (it.status !== 'ready' ? 'Approve it first' : null)
    ?? (!langs.includes('en') ? 'English must be included' : null)
    ?? (bad.length ? `Fix the errors in ${bad.map((l) => LANG_NAME[l]).join(', ')} first` : null);
}
/** Root switch: a production item can only be switched on when its English has no errors. Switching off is always allowed. */
export const blockSwitchOn = (it: Item) => (errorsIn(validate(it), 'en') ? 'Fix the English errors before switching on' : null);
/** Language switch: a language can only be switched on in production when it is complete (100% coverage, no errors). */
export const blockEnableLanguage = (it: Item, l: Lang) =>
  errorsIn(validate(it), l) || coverage(it, l) < 1 ? `${LANG_NAME[l]} is not complete in production yet` : null;

// ---------- promote plan ----------
export type Change = { where: string; lang: Lang; kind: 'new' | 'changed'; before?: string; after?: string };
/** What a promote would do to the chunks of the chosen languages. Never lists deletions: promote never deletes. */
export function diff(s: Item, p: Item | undefined, langs: Lang[]) {
  // ponytail: staging↔production children are matched by the "p-" id prefix; the real CMS keeps a saved id mapping.
  const pById = new Map((p ? nodes(p) : []).map((n) => [n.id.replace(/^p-/, ''), n]));
  const counts = Object.fromEntries(LANGS.map((l) => [l, { new: 0, changed: 0, same: 0 }])) as Record<Lang, { new: number; changed: number; same: number }>;
  const changes: Change[] = [];
  let files = 0;
  for (const n of nodes(s)) {
    if (n.type !== 'chunk') continue;
    for (const l of langs) {
      const after = n.obj.text[l];
      if (!after) continue;
      const p = pById.get(n.id);
      const prev = p?.type === 'chunk' ? p.obj : undefined;
      const before = prev?.text[l];
      const voices = Object.values(n.obj.audio[l] ?? {}).filter((a) => a.state === 'current').length;
      if (!prev || before === undefined) { counts[l].new++; files += voices * 2; changes.push({ where: n.crumb, lang: l, kind: 'new', after }); }
      else if (before !== after || JSON.stringify(prev.audio[l]) !== JSON.stringify(n.obj.audio[l])) {
        counts[l].changed++; files += voices * 2;
        changes.push({ where: n.crumb, lang: l, kind: 'changed', before: before === after ? 'Audio replaced' : before, after: before === after ? 'New audio and transcript' : after });
      } else counts[l].same++;
    }
  }
  return { counts, changes, files };
}

// ---------- promote ----------
/**
 * Copies the chosen languages of a staging item into production. Invariants:
 *  - production IDs are kept (rows are updated in place);
 *  - languages not chosen keep their production values;
 *  - nothing in production is deleted (production-only rows stay);
 *  - visibility never turns on by itself (new items land switched off; existing items keep their switches);
 *  - a snapshot of the production item is saved first, so the promote can be reverted.
 * Event: ItemPromoted.
 */
export function promoteInto(db: DB, s: Item, langs: Lang[]) {
  const i = db.production.findIndex((p) => p.match === s.match);
  const p = i >= 0 ? db.production[i] : undefined;
  const pIndex = new Map<string, unknown>();
  const index = (o: unknown) => {
    if (Array.isArray(o)) o.forEach(index);
    else if (o && typeof o === 'object') { const id = (o as { id?: string }).id; if (id) pIndex.set(id, o); Object.values(o).forEach(index); }
  };
  index(p);
  const isObj = (o: unknown): o is Record<string, unknown> => !!o && typeof o === 'object' && !Array.isArray(o);
  const hasId = (o: unknown): o is { id: string } => isObj(o) && typeof o.id === 'string';
  const merge = (a: unknown, b: unknown): unknown => {
    if (Array.isArray(a)) {
      const out = a.map((x, k) => merge(x, hasId(x) ? pIndex.get(`p-${x.id}`) : (b as unknown[] | undefined)?.[k]));
      // Promote never deletes: rows that exist only in production are kept, after the staging rows.
      const kept = new Set(out.filter(hasId).map((x) => x.id));
      if (Array.isArray(b)) for (const y of b) if (hasId(y) && !kept.has(y.id)) out.push(structuredClone(y));
      return out;
    }
    if (isObj(a)) {
      // An empty staging map still counts as a language map when production's is one, so other languages survive.
      if (isLangMap(a) || (!Object.keys(a).length && isObj(b) && isLangMap(b))) {
        const r: Record<string, unknown> = {};
        for (const l of LANGS) { const v = langs.includes(l) ? a[l] : (b as Record<string, unknown> | undefined)?.[l]; if (v !== undefined) r[l] = structuredClone(v); }
        return r;
      }
      const bo = isObj(b) ? b : undefined;
      // Production IDs are kept; a row that is new to production gets a fresh "p-" id.
      return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, k === 'id' ? (bo?.id ?? `p-${v}`) : merge(v, bo?.[k])]));
    }
    return a;
  };
  const next = merge(s, p) as Item;
  next.active = p ? p.active : false;
  next.langOn = p ? { ...p.langOn } : { ...OFF };
  next.updatedAt = new Date().toISOString();
  db.snapshots[next.id] = p ? structuredClone(p) : null;
  if (p) db.production[i] = next; else db.production.push(next);
  return { prod: next, existed: !!p };
}

/**
 * Undo the last promote of an item: restore the snapshot, or, if the item was new, switch it off (nothing is deleted).
 * Does nothing (returns null) when there is no promote to undo. Event: PromoteReverted.
 */
export function revertPromote(db: DB, match: string): { item: Item; restored: boolean } | null {
  const i = db.production.findIndex((p) => p.match === match);
  if (i < 0) return null;
  const id = db.production[i].id;
  if (!(id in db.snapshots)) return null;
  const snap = db.snapshots[id];
  if (snap) db.production[i] = structuredClone(snap);
  else { db.production[i].active = false; db.production[i].langOn = { ...OFF }; }
  delete db.snapshots[id];
  return { item: db.production[i], restored: !!snap };
}
