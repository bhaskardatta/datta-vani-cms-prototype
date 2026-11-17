// Audit context: every change is written down, newest first, and never edited or removed.
import type { Env } from './publishing';

export type AuditEntry = {
  id: string; at: string; who: string; env: Env; action: string; target: string;
  detail?: string; before?: string; after?: string;
};

/** Adds an entry to the front of the log (newest first). The log is append-only: nothing here removes or changes old entries. */
export function record(log: AuditEntry[], e: Omit<AuditEntry, 'id' | 'at'>, at = new Date()): AuditEntry {
  const entry: AuditEntry = { id: `${at.getTime()}-${Math.random().toString(36).slice(2, 7)}`, at: at.toISOString(), ...e };
  log.unshift(entry);
  return entry;
}
