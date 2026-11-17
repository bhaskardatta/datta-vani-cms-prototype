import { describe, expect, it } from 'vitest';
import { blockEdit, blockSuper, blockToggle } from '../src/lib/domain/access';
import { record } from '../src/lib/domain/audit';
import type { AuditEntry } from '../src/lib/domain/audit';
import { blockApprove } from '../src/lib/domain/publishing';
import { fresh, staging } from './helpers';

describe('role policy', () => {
  it('Content Manager edits staging but production is read-only', () => {
    expect(blockEdit('cm', 'staging')).toBeNull();
    expect(blockEdit('cm', 'production')).toMatch(/read-only/);
  });

  it('even a Super Admin cannot edit production directly', () => {
    expect(blockEdit('sa', 'production')).toMatch(/Edit on staging, then promote/);
  });

  it('Support Lead can only view, everywhere', () => {
    expect(blockEdit('support', 'staging')).toMatch(/only view/);
    expect(blockToggle('support', 'staging')).toMatch(/only view/);
  });

  it('only a Super Admin approves, promotes, and switches things in production', () => {
    expect(blockSuper('cm', 'promote')).toBe('Only a Super Admin can promote');
    expect(blockSuper('sa', 'promote')).toBeNull();
    expect(blockToggle('cm', 'production')).toMatch(/Only a Super Admin/);
    expect(blockToggle('cm', 'staging')).toBeNull();
    expect(blockToggle('sa', 'production')).toBeNull();
  });

  it('approval needs a Super Admin and no English errors', () => {
    const db = fresh();
    expect(blockApprove('cm', staging(db, 'datta'))).toMatch(/Only a Super Admin/);
    expect(blockApprove('sa', staging(db, 'datta'))).toBeNull();
    expect(blockApprove('sa', staging(db, 'clever-crow'))).toBe('Fix the English errors first');
  });
});

describe('audit log', () => {
  it('adds the newest entry first and keeps every older entry unchanged', () => {
    const log: AuditEntry[] = [{ id: 'a1', at: '2026-11-14T04:00:00.000Z', who: 'Super Admin', env: 'staging', action: 'Approved', target: 'X' }];
    const old = structuredClone(log[0]);
    const e = record(log, { who: 'Content Manager', env: 'staging', action: 'Edited Telugu text', target: 'Y', before: 'a', after: 'b' }, new Date('2026-11-15T10:00:00Z'));
    expect(log).toHaveLength(2);
    expect(log[0]).toBe(e);
    expect(e).toMatchObject({ at: '2026-11-15T10:00:00.000Z', who: 'Content Manager', before: 'a', after: 'b' });
    expect(log[1]).toEqual(old);
  });
});
