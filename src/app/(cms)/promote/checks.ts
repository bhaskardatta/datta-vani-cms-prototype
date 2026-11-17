// The 17 pre-promote checks from the CMS plan PDF, in its order. The prototype can only really evaluate the ones
// that depend on its own data (role, validation, plan, wizard progress); the rest stand for checks that need the real
// databases and file storage and are shown as passed.
import type { Lang } from '@/lib/domain/content';
import { type Issue, errorsIn } from '@/lib/domain/validation';

export type Check = { name: string; state: 'pass' | 'fail' | 'warn' | 'pending'; note?: string; warning?: boolean };

export function promoteChecks(p: {
  isSA: boolean; issues: Issue[]; langs: Lang[]; files: number; matched: number; total: number;
  live: boolean | undefined; isNew: boolean; reviewed: boolean; dryRunClean: boolean; typedOk: boolean;
}): Check[] {
  // Audio problems are the validation issues about a voice (missing, draft or out of date).
  const audioOk = p.langs.every((l) => !p.issues.some((i) => i.lang === l && i.level === 'error' && i.msg.includes('voice')));
  return [
    { name: 'Super Admin with recent MFA, staging → production, production writable', state: p.isSA ? 'pass' : 'fail', note: p.isSA ? 'MFA is simulated in this prototype' : 'Only a Super Admin can promote' },
    { name: 'Passes validation in every language being promoted', state: p.langs.every((l) => !errorsIn(p.issues, l)) ? 'pass' : 'fail' },
    { name: 'Every media file exists, is not empty, and every transcript parses', state: audioOk ? 'pass' : 'fail' },
    { name: 'Staging and production run the same data-model version', state: 'pass' },
    { name: 'Every item maps to production or is marked new', state: 'pass', note: `${p.matched} chunks matched · ${p.total - p.matched} new` },
    { name: 'Referenced themes, characters and quizzes exist', state: 'pass' },
    { name: 'Zero deletions of production rows or files', state: 'pass', note: 'Promote never deletes' },
    { name: 'Production edits since the last import are shown as conflicts', state: 'pass', note: 'No conflicts' },
    { name: 'The root lands switched off, or keeps its current state', state: 'pass', note: p.isNew ? 'Lands switched off' : p.live ? 'Stays on: already live' : 'Stays off' },
    { name: 'The plan was reviewed', state: p.reviewed ? 'pass' : 'pending' },
    { name: 'A dry run of this exact plan completed cleanly', state: p.dryRunClean ? 'pass' : 'pending', note: 'Step 4' },
    { name: 'Blast radius: one epic or story per run, file count capped', state: 'pass', note: `${p.files} files`, warning: true },
    { name: 'Nothing else is running on this item; it is locked while promoting', state: 'pass' },
    { name: 'Production database and file storage reachable, writable, with room', state: 'pass' },
    { name: 'Rows that will be overwritten are snapshotted first', state: 'pass', note: 'At the start of the run' },
    { name: 'Super Admin types the item name and the target environment', state: p.typedOk ? 'pass' : 'pending', note: 'Step 5' },
    { name: 'Change size is normal and the item is not live', state: p.live ? 'warn' : 'pass', note: p.live ? '1,000+ families will see the English changes' : undefined, warning: true },
  ];
}
