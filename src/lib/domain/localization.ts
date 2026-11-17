// Localization context: how far each language has got, and what a family sees when a translation is missing.
// Translation is done by people. The CMS never translates.
import { type Item, type Lang, type Text, REQUIRED, chunksOf } from './content';

/** The text in one language, or '' if there is none. */
export const say = (t: Text | undefined, l: Lang) => t?.[l] || '';

/** Fallback rule: show the language if it has text, otherwise English. */
export const fallback = (t: Text | undefined, l: Lang) => t?.[l] || t?.en || '';

/** A language has started once any chunk has text in it. English always counts as started. */
export const started = (it: Item, l: Lang) => l === 'en' || chunksOf(it).some((c) => c.text[l]?.trim());

/** Coverage: share of chunks (0..1) with text plus approved (current) audio in every required voice. */
export function coverage(it: Item, l: Lang) {
  const chunks = chunksOf(it);
  const done = chunks.filter((c) => c.text[l]?.trim() && REQUIRED.every((v) => c.audio[l]?.[v]?.state === 'current'));
  return chunks.length ? done.length / chunks.length : 0;
}
