// Access context: who can do what. Each function returns null when allowed, or the reason it is not
// (the UI shows that reason on the disabled button; cms-service would return it as a 403 message).
import type { Env } from './publishing';

export type Role = 'cm' | 'sa' | 'support';
export const ROLE_NAME: Record<Role, string> = { cm: 'Content Manager', sa: 'Super Admin', support: 'Support Lead' };

/** Editing content: staging only, and never by a Support Lead. */
export const blockEdit = (role: Role, env: Env) =>
  role === 'support' ? 'Support Leads can only view'
    : env === 'production' ? 'Production is read-only. Edit on staging, then promote' : null;

/** Super-Admin-only actions: approve, promote, revert. */
export const blockSuper = (role: Role, what: string) => (role === 'sa' ? null : `Only a Super Admin can ${what}`);

/** Switching an item or a language on or off. Anyone but Support on staging; only a Super Admin in production. */
export const blockToggle = (role: Role, env: Env) =>
  role === 'support' ? 'Support Leads can only view'
    : env === 'production' && role !== 'sa' ? 'Only a Super Admin can switch content on or off in production' : null;
