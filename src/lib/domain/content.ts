// Content context: the content tree (Book or Story at the root) and the rules for changing it.
// Aggregates: Book, Story. Entities: Section, Chapter, Scene, Chunk, Quiz, Question.
// Value objects: LocalizedText (Text), AudioAsset (Audio), MediaPath (strings built by audioPath).

export type Lang = 'en' | 'te' | 'kn';
export const LANGS: Lang[] = ['en', 'te', 'kn'];
export const LANG_NAME: Record<Lang, string> = { en: 'English', te: 'Telugu', kn: 'Kannada' };

export type Voice = 'female' | 'male' | 'child';
export const VOICES: Voice[] = ['female', 'male', 'child'];
// ponytail: required voices are a team decision (plan §8); child is optional here.
export const REQUIRED: Voice[] = ['female', 'male'];

/** LocalizedText: one string per language. English is the source and the fallback. */
export type Text = Partial<Record<Lang, string>>;
export type LocalizedText = Text;

/** current = approved and live-ready · draft = waiting for approval · stale = text changed after it was made · missing = none. */
export type AudioState = 'current' | 'draft' | 'stale' | 'missing';
/** AudioAsset: one voice's audio + word-timing transcript for one chunk in one language. */
export type Audio = {
  state: AudioState; source?: 'generated' | 'uploaded'; file?: string;
  prev?: AudioState; // state before the current draft (kept for older saved data)
  before?: Omit<Audio, 'prev' | 'before'>; // the whole asset before the current draft, so Reject can restore it
};
export type AudioAsset = Audio;
export type Chunk = { id: string; text: Text; audio: Partial<Record<Lang, Partial<Record<Voice, Audio>>>> };
export type Scene = { id: string; portrait?: string; landscape?: string; chunks: Chunk[] };

export type QType = 'mcq' | 'tf' | 'fill' | 'match' | 'anagram';
export const QTYPE_NAME: Record<QType, string> = {
  mcq: 'Multiple choice', tf: 'True or false', fill: 'Fill in the blank', match: 'Match the pairs', anagram: 'Anagram',
};
// Options are one list shared by every language, so the correct answer and option order are the same in all of them.
export type Question = { id: string; type: QType; prompt: Text; options: Text[]; answer: number; hint: Text };
export type Quiz = { id: string; questions: Question[] };
export type Chapter = { id: string; title: Text; content: Text; takeaway: Text; ask: Text; scenes: Scene[]; quiz?: Quiz };
export type Section = { id: string; title: Text; chapters: Chapter[] };

export type Status = 'draft' | 'in_review' | 'ready';
export const STATUS_NAME: Record<Status, string> = { draft: 'Draft', in_review: 'In review', ready: 'Approved' };
// `match` stands in for the CMS's saved staging↔production content match (IDs differ between the two).
type Base = {
  id: string; match: string; num: number; name: Text; description: Text;
  status: Status; active: boolean; langOn: Record<Lang, boolean>; updatedAt: string;
};
export type Book = Base & { kind: 'book'; sections: Section[] };
export type Story = Base & { kind: 'story'; cover?: string; themes: string[]; characters: string[]; scenes: Scene[] };
export type Item = Book | Story;

/** True for an object whose keys are all language codes, i.e. a LocalizedText or a per-language map. */
export const isLangMap = (o: object) =>
  Object.keys(o).length > 0 && Object.keys(o).every((k) => (LANGS as string[]).includes(k));

// ---------- reading the tree ----------
type NodeObj = { book: Book; story: Story; section: Section; chapter: Chapter; quiz: Quiz; scene: Scene; chunk: Chunk };
export type NodeType = keyof NodeObj;
type NodeBase = { id: string; depth: number; label: string; sub?: string; crumb: string; parents: string[]; media?: string };
/** One node of the tree. Checking `type` narrows `obj` to the matching entity. */
export type NodeInfo = { [K in NodeType]: NodeBase & { type: K; obj: NodeObj[K] } }[NodeType];
export type NodeOf<K extends NodeType> = Extract<NodeInfo, { type: K }>;
/** Anything in a tree that has an id. */
export type TreeNode = NodeObj[NodeType] | Question;

// Flat list of every node in an item, in tree order, with its media base path (the app builds every URL from it).
export function nodes(it: Item, lang: Lang = 'en'): NodeInfo[] {
  const t = (x: Text) => x[lang] || x.en || ''; // same rule as localization.fallback (kept inline to avoid an import cycle)
  const root = { id: it.id, depth: 0, label: t(it.name) || 'Untitled', crumb: t(it.name) || 'Untitled', parents: [] };
  const out: NodeInfo[] = [it.kind === 'book' ? { ...root, type: 'book', obj: it } : { ...root, type: 'story', obj: it }];
  const scenes = (list: Scene[], depth: number, parents: string[], crumb: string, base: string) =>
    list.forEach((sc, i) => {
      const sp = `${base}scenes/${i + 1}/`, sCrumb = crumb ? `${crumb} › Scene ${i + 1}` : `Scene ${i + 1}`;
      out.push({ id: sc.id, type: 'scene', depth, label: `Scene ${i + 1}`, crumb: sCrumb, parents, obj: sc, media: sp });
      sc.chunks.forEach((c, k) => out.push({
        id: c.id, type: 'chunk', depth: depth + 1, label: `Chunk ${k + 1}`, sub: t(c.text), crumb: `${sCrumb} › Chunk ${k + 1}`,
        parents: [...parents, sc.id], obj: c, media: `${sp}chunks/${k + 1}/`,
      }));
    });
  if (it.kind === 'book') {
    const base = `content_media/daily_learnings/books/${it.num}/`;
    it.sections.forEach((s, si) => {
      const sLabel = t(s.title) || `Section ${si + 1}`;
      out.push({ id: s.id, type: 'section', depth: 1, label: sLabel, crumb: sLabel, parents: [it.id], obj: s });
      s.chapters.forEach((c, ci) => {
        const cLabel = t(c.title) || `Chapter ${ci + 1}`, cParents = [it.id, s.id];
        out.push({ id: c.id, type: 'chapter', depth: 2, label: cLabel, crumb: cLabel, parents: cParents, obj: c });
        scenes(c.scenes, 3, [...cParents, c.id], cLabel, `${base}sections/${si + 1}/chapters/${ci + 1}/`);
        if (c.quiz) out.push({ id: c.quiz.id, type: 'quiz', depth: 3, label: 'Quiz', sub: `${c.quiz.questions.length} questions`, crumb: `${cLabel} › Quiz`, parents: [...cParents, c.id], obj: c.quiz });
      });
    });
  } else {
    // Crumbs below the root never repeat the item name (books start at the section/chapter, stories at the scene).
    scenes(it.scenes, 1, [it.id], '', `content_media/bedtime_stories/stories/${it.num}/`);
  }
  return out;
}

export const chunksOf = (it: Item): Chunk[] => nodes(it).flatMap((n) => (n.type === 'chunk' ? [n.obj] : []));

/** Depth-first search for any object with this id inside a tree. */
export const findById = (o: unknown, id: string): TreeNode | undefined => {
  if (Array.isArray(o)) { for (const x of o) { const r = findById(x, id); if (r) return r; } return undefined; }
  if (o && typeof o === 'object') {
    if ((o as { id?: string }).id === id) return o as TreeNode;
    for (const v of Object.values(o)) { const r = findById(v, id); if (r) return r; }
  }
  return undefined;
};

/** MediaPath: files live at fixed paths. English sits at the root, other languages in a `<lang>/` folder. */
export const audioPath = (media: string, lang: Lang, voice: Voice, file: 'audio.mp3' | 'transcript.json') =>
  `${media}${lang === 'en' ? '' : `${lang}/`}body/${voice}/${file}`;

// ---------- changing the tree ----------

/**
 * Rule: changing a chunk's text in one language makes that language's audio and transcript out of date (stale).
 * Missing audio stays missing. Other languages are not touched. Returns false (and changes nothing) if the text is the same.
 * Event: ChunkTextEdited → AudioMarkedStale.
 */
export function editChunkText(c: Chunk, lang: Lang, value: string): boolean {
  if ((c.text[lang] ?? '') === value) return false;
  c.text[lang] = value;
  for (const a of Object.values(c.audio[lang] ?? {}) as Audio[]) if (a.state === 'current' || a.state === 'draft') a.state = 'stale';
  return true;
}

export type AudioAction = 'regenerate' | 'upload' | 'approve' | 'reject';
/**
 * Audio lifecycle for one voice: regenerate or upload → draft → approve (current) or reject (back to what it was).
 * Approve and Reject only work on a draft. Returns false if the action did not apply.
 */
export function applyAudio(c: Chunk, lang: Lang, voice: Voice, what: AudioAction, file?: string): boolean {
  const map = (c.audio[lang] ??= {});
  const a: Audio = map[voice] ?? { state: 'missing' };
  const keep = (x: Audio) => ({ state: x.state, ...(x.source ? { source: x.source } : {}), ...(x.file ? { file: x.file } : {}) });
  // A second regenerate/upload on top of a draft remembers the asset from before the first draft, not the draft.
  const was = a.state === 'draft' ? { prev: a.prev, before: a.before } : { prev: a.state, before: keep(a) };
  if (what === 'regenerate') map[voice] = { state: 'draft', source: 'generated', ...was };
  else if (what === 'upload') map[voice] = { state: 'draft', source: 'uploaded', file, ...was };
  else if (a.state !== 'draft') return false;
  else if (what === 'approve') map[voice] = keep({ ...a, state: 'current' });
  else map[voice] = a.before ?? { state: a.prev ?? 'missing', source: a.prev && a.prev !== 'missing' ? 'generated' : undefined };
  return true;
}

/** Fake word-level transcript: [{word, start, end}] in seconds. Words follow each other with a small gap. */
export function wordTimings(text: string) {
  let t = 0;
  return text.split(/\s+/).filter(Boolean).map((word) => {
    const start = t, end = t + 0.24 + word.length * 0.055;
    t = end + 0.08;
    return { word, start: +start.toFixed(2), end: +end.toFixed(2) };
  });
}
