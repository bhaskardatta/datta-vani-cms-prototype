// Shared test helpers: a fresh copy of the sample data and quick lookups.
import { seed } from '../src/lib/data';
import { type Book, type Chunk, findById } from '../src/lib/domain/content';
import type { DB } from '../src/lib/domain/publishing';

export const fresh = (): DB => seed();
export const staging = (db: DB, match: string) => db.staging.find((i) => i.match === match)!;
export const production = (db: DB, match: string) => db.production.find((i) => i.match === match);
export const chunk = (tree: unknown, id: string) => findById(tree, id) as Chunk;
export const ramayana = (db: DB) => staging(db, 'ramayana') as Book;

/** Every id anywhere inside a tree. */
export function ids(o: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(o)) o.forEach((x) => ids(x, out));
  else if (o && typeof o === 'object') {
    const id = (o as { id?: unknown }).id;
    if (typeof id === 'string') out.add(id);
    Object.values(o).forEach((v) => ids(v, out));
  }
  return out;
}
