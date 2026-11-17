'use client';
import { useRef, type ReactNode } from 'react';
import { type Item, type Lang, type NodeInfo, type NodeOf, type Scene, type Story, type Text, LANG_NAME } from '@/lib/domain/content';
import type { Issue } from '@/lib/domain/validation';
import { act, useApp } from '@/lib/store';
import { Button, Dot, Icon, type IconName, Label, cx, toast } from './ui';

export type Ctx = { item: Item; match: string; lang: Lang; block: string | null; issues: Issue[]; all: NodeInfo[] };

const ICON: Record<NodeInfo['type'], IconName> = { book: 'book', story: 'story', section: 'section', chapter: 'chapter', scene: 'scene', chunk: 'chunk', quiz: 'quiz' };
/** The `lang` attribute for text in this language (English is the page default). */
export const langAttr = (l: Lang) => (l === 'en' ? undefined : l);

// ---------- text field: English shown as the source while translating ----------
export function TextField({ ctx, id, label, value, multiline, compact, onCommit, savedSub }: {
  ctx: Ctx; id: string; label: string; value: Text; multiline?: boolean; compact?: boolean;
  /** Returns false when the store refused the change (then no "Saved" toast). */
  onCommit: (v: string, before: string) => boolean | void; savedSub?: string;
}) {
  const { lang, block } = ctx;
  const cur = value[lang] ?? '';
  const fid = `${id}-${lang}`;
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div>
      {!compact && (
        <Label htmlFor={fid}>{label}{lang !== 'en' && <span className="ml-1 font-medium tracking-normal normal-case">· {LANG_NAME[lang]}</span>}</Label>
      )}
      {lang !== 'en' && (
        <p className={cx('mb-1.5 flex gap-2 rounded-lg border border-line bg-bg px-3 text-muted', compact ? 'py-1 text-xs' : 'py-2 text-sm')}>
          <span className="shrink-0 pt-px text-[10px] font-semibold tracking-wider text-muted uppercase">EN</span>
          <span className="text-ink/80">{value.en || <em className="text-coral-deep">English missing</em>}</span>
        </p>
      )}
      <Tag
        key={`${fid}:${cur}`} id={fid} lang={langAttr(lang)} aria-label={compact ? `${label} (${LANG_NAME[lang]})` : undefined}
        defaultValue={cur} readOnly={!!block} title={block ?? undefined} rows={multiline ? 3 : undefined}
        placeholder={block ? '' : lang === 'en' ? `Add ${label.toLowerCase()}` : `Type the ${LANG_NAME[lang]} translation`}
        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const v = e.target.value.trim();
          if (v !== cur && onCommit(v, cur) !== false) { toast('Saved', { sub: savedSub ?? `${label} · ${LANG_NAME[lang]}` }); }
        }}
        className={cx(
          'w-full rounded-lg border bg-surface px-3 text-[15px] leading-relaxed shadow-xs transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70',
          multiline ? 'resize-y py-2' : 'h-10',
          block ? 'cursor-not-allowed bg-bg text-muted shadow-none' : 'hover:border-indigo/40 focus:border-indigo focus:ring-4 focus:ring-indigo/10 focus:outline-none',
          !cur ? 'border-dashed border-coral' : 'border-line',
        )}
      />
      {!cur && !block && !compact && <p className="mt-1 text-xs text-coral-deep">Empty: {lang === 'en' ? 'required' : `needed before ${LANG_NAME[lang]} can go live`}</p>}
    </div>
  );
}

type TextKey = 'name' | 'description' | 'title' | 'content' | 'takeaway' | 'ask';
/** Saves one localized text field of a node in the current language. */
const field = (ctx: Ctx, nodeId: string, key: TextKey, label: string) => (v: string, before: string) =>
  act.edit(ctx.match, nodeId, (n: Partial<Record<TextKey, Text>>) => { (n[key] ??= {})[ctx.lang] = v; }, { action: `Edited ${LANG_NAME[ctx.lang]} ${label.toLowerCase()}`, before, after: v });

/** Panel heading: what kind of node this is, its name, and one line on what it holds. */
export const H = ({ type, kind, children, sub, lang }: { type: NodeInfo['type']; kind: string; children: ReactNode; sub?: ReactNode; lang?: Lang }) => (
  <div className="mb-6 flex items-start gap-3">
    <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', type === 'quiz' ? 'bg-coral-tint text-coral-deep' : 'bg-tint text-indigo')}>
      <Icon name={ICON[type]} size={17} />
    </span>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold tracking-wider text-muted uppercase">{kind}</div>
      <h2 lang={lang && langAttr(lang)} className="font-display text-xl leading-snug font-bold">{children}</h2>
      {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
    </div>
  </div>
);

// Clickable list of a node's children, with an error marker for the current language.
function Children({ ctx, ids, title, add }: { ctx: Ctx; ids: string[]; title: string; add?: ReactNode }) {
  const bad = new Set(ctx.issues.filter((i) => i.lang === ctx.lang && i.level === 'error').map((i) => i.node));
  const rows = ctx.all.filter((n) => ids.includes(n.id));
  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{title} <span className="font-mono font-normal">· {rows.length}</span></h3>
        {add}
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        {rows.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => act.select(n.id)} className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-tint/50 pointer-coarse:min-h-11">
              <Icon name={ICON[n.type]} size={15} className={n.type === 'quiz' ? 'text-coral-deep' : 'text-faint'} />
              <span className="shrink-0 font-semibold">{n.label}</span>
              {n.sub !== undefined && (
                <span lang={n.sub && n.type === 'chunk' ? langAttr(ctx.lang) : undefined} className={cx('min-w-0 truncate', n.sub ? 'text-muted' : 'text-coral-deep italic')}>
                  {n.sub || `no ${LANG_NAME[ctx.lang]} text`}
                </span>
              )}
              <span className="ml-auto flex items-center gap-2 pl-2">
                {bad.has(n.id) && <Dot tone="danger" label="Has errors" />}
                <Icon name="chevronRight" size={14} className="text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageSlot({ ctx, label, file, ratio, onFile }: { ctx: Ctx; label: string; file?: string; ratio: string; onFile: (name: string) => boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label>{label}</Label>
      <div className={cx('ph flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center font-mono text-[11px] text-muted', ratio, file ? 'border-line' : 'border-dashed border-coral')}>
        <Icon name="scene" size={18} className="text-faint" />
        {file ? <><span className="break-all text-ink">{file}</span><span>original + WebP 1x, 2x</span></> : <span className="text-coral-deep">no image</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && onFile(f.name)) { toast(`${label} image uploaded`, { sub: f.name }); } e.target.value = ''; }} />
      <Button size="sm" icon="upload" className="mt-2" blocked={ctx.block} onClick={() => ref.current?.click()}>{file ? 'Replace' : 'Upload'}</Button>
    </div>
  );
}

// ---------- panels ----------
export function ItemPanel({ ctx }: { ctx: Ctx }) {
  const it = ctx.item;
  const s = useApp();
  const story = it.kind === 'story' ? it : null;
  const count = (t: string) => ctx.all.filter((n) => n.type === t).length;
  return (
    <div className="max-w-3xl">
      <H type={it.kind} lang={ctx.lang} kind={it.kind === 'book' ? 'Book' : 'Bedtime story'}
        sub={it.kind === 'book' ? 'The root of the epic. Its on/off switch decides whether families see any of it.' : 'The root of the story. Its on/off switch decides whether families see it.'}>
        {ctx.all[0].label}
      </H>
      <div className="mb-6 grid grid-cols-3 gap-2 text-sm sm:gap-3">
        {(it.kind === 'book' ? [['Sections', count('section')], ['Chapters', count('chapter')], ['Chunks', count('chunk')]] : [['Scenes', count('scene')], ['Chunks', count('chunk')], ['Voices', 3]]).map(([k, v]) => (
          <div key={k as string} className="rounded-xl border border-line bg-surface px-3 py-3 shadow-xs sm:px-4">
            <div className="text-xs font-medium text-muted">{k}</div>
            <div className="font-display text-2xl font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <TextField ctx={ctx} id="name" label={it.kind === 'book' ? 'Book name' : 'Story title'} value={it.name} onCommit={field(ctx, it.id, 'name', it.kind === 'book' ? 'book name' : 'story title')} />
        <TextField ctx={ctx} id="desc" label="Description" value={it.description} multiline onCommit={field(ctx, it.id, 'description', 'description')} />
      </div>
      {story && s && (
        <div className="mt-8 grid gap-6 sm:grid-cols-[180px_1fr]">
          <ImageSlot ctx={ctx} label="Cover" file={story.cover} ratio="aspect-[3/4]" onFile={(f) => act.edit(ctx.match, it.id, (n: Story) => { n.cover = f; }, { action: 'Uploaded cover image', after: f })} />
          <div className="space-y-5">
            {(['themes', 'characters'] as const).map((k) => (
              <fieldset key={k}>
                <legend className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">{k === 'themes' ? 'Themes' : 'Characters'}</legend>
                <div className="flex flex-wrap gap-2">
                  {s.db[k].map((name) => {
                    const on = story[k].includes(name);
                    return (
                      <button key={name} type="button" aria-pressed={on} disabled={!!ctx.block} title={ctx.block ?? undefined}
                        onClick={() => act.edit(ctx.match, it.id, (n: Story) => { n[k] = on ? n[k].filter((x) => x !== name) : [...n[k], name]; }, { action: `${on ? 'Removed' : 'Added'} ${k === 'themes' ? 'theme' : 'character'} "${name}"` })}
                        className={cx('inline-flex h-8 items-center gap-1 rounded-full border px-3 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 pointer-coarse:h-11',
                          on ? 'border-indigo bg-tint text-indigo-deep' : 'border-line bg-surface text-muted enabled:hover:border-indigo/50 enabled:hover:text-ink')}>
                        {on && <Icon name="check" size={13} />}{name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <p className="text-xs text-muted">Theme and character names are translated in their own catalog (not shown in this prototype).</p>
          </div>
        </div>
      )}
      <p className="mt-6 flex items-start gap-2 font-mono text-xs break-all text-muted">
        <Icon name="file" size={13} />Media base path: {ctx.all.find((n) => n.media)?.media?.split(it.kind === 'book' ? 'sections/' : 'scenes/')[0]}
      </p>
      {story && <Children ctx={ctx} title="Scenes" ids={story.scenes.map((x) => x.id)} add={<Button size="sm" icon="plus" blocked={ctx.block} onClick={() => { if (act.addScene(ctx.match, it.id)) toast('Scene added'); }}>Add scene</Button>} />}
      {it.kind === 'book' && <Children ctx={ctx} title="Sections" ids={it.sections.map((x) => x.id)} />}
    </div>
  );
}

export function SectionPanel({ ctx, n }: { ctx: Ctx; n: NodeOf<'section'> }) {
  return (
    <div className="max-w-3xl">
      <H type="section" lang={ctx.lang} kind="Section" sub="A section groups chapters (the app's learning nodes).">{n.label}</H>
      <TextField ctx={ctx} id={n.id} label="Section title" value={n.obj.title} onCommit={field(ctx, n.id, 'title', 'section title')} />
      <Children ctx={ctx} title="Chapters" ids={n.obj.chapters.map((c) => c.id)} />
    </div>
  );
}

export function ChapterPanel({ ctx, n }: { ctx: Ctx; n: NodeOf<'chapter'> }) {
  const c = n.obj;
  return (
    <div className="max-w-3xl">
      <H type="chapter" lang={ctx.lang} kind="Chapter" sub="Chapter text, the takeaway Tataji ends with, and the question children can ask him.">{n.label}</H>
      <div className="space-y-5">
        <TextField ctx={ctx} id={`${n.id}-t`} label="Chapter title" value={c.title} onCommit={field(ctx, n.id, 'title', 'chapter title')} />
        <TextField ctx={ctx} id={`${n.id}-c`} label="Chapter text" value={c.content} multiline onCommit={field(ctx, n.id, 'content', 'chapter text')} />
        <TextField ctx={ctx} id={`${n.id}-k`} label="Key takeaway" value={c.takeaway} onCommit={field(ctx, n.id, 'takeaway', 'key takeaway')} />
        <TextField ctx={ctx} id={`${n.id}-a`} label="Ask-Tataji question" value={c.ask} onCommit={field(ctx, n.id, 'ask', 'Ask-Tataji question')} />
      </div>
      <Children ctx={ctx} title="Scenes and quiz" ids={[...c.scenes.map((x) => x.id), ...(c.quiz ? [c.quiz.id] : [])]}
        add={<Button size="sm" icon="plus" blocked={ctx.block} onClick={() => { if (act.addScene(ctx.match, n.id)) toast('Scene added'); }}>Add scene</Button>} />
    </div>
  );
}

export function ScenePanel({ ctx, n }: { ctx: Ctx; n: NodeOf<'scene'> }) {
  const sc = n.obj;
  const up = (k: 'portrait' | 'landscape') => (f: string) => act.edit(ctx.match, n.id, (x: Scene) => { x[k] = f; }, { action: `Uploaded ${k} image`, after: f });
  return (
    <div className="max-w-3xl">
      <H type="scene" lang={ctx.lang} kind="Scene" sub="Images are shared by every language, unless they contain words.">{n.crumb}</H>
      <div className="grid grid-cols-[110px_1fr] items-start gap-4 sm:grid-cols-[140px_1fr] sm:gap-6">
        <ImageSlot ctx={ctx} label="Portrait" file={sc.portrait} ratio="aspect-[9/16]" onFile={up('portrait')} />
        <ImageSlot ctx={ctx} label="Landscape" file={sc.landscape} ratio="aspect-video" onFile={up('landscape')} />
      </div>
      <Children ctx={ctx} title="Chunks (one sentence each)" ids={sc.chunks.map((c) => c.id)}
        add={<Button size="sm" icon="plus" blocked={ctx.block} onClick={() => { if (act.addChunk(ctx.match, n.id)) toast('Chunk added'); }}>Add chunk</Button>} />
    </div>
  );
}
