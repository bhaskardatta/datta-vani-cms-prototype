'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChunkPanel } from '@/components/ChunkPanel';
import { ChapterPanel, type Ctx, ItemPanel, ScenePanel, SectionPanel } from '@/components/Panels';
import { QuizPanel } from '@/components/QuizPanel';
import {
  Button, Confirm, Dot, Empty, Icon, type IconName, Kbd, LinkButton, Notice, PageSkeleton, Pill, STATUS_TONE, Switch, Tabs, cx, toast,
} from '@/components/ui';
import { ValidationList } from '@/components/ValidationList';
import { blockEdit, blockSuper, blockToggle } from '@/lib/domain/access';
import { type Lang, type NodeType, LANG_NAME, LANGS, STATUS_NAME, nodes } from '@/lib/domain/content';
import { coverage } from '@/lib/domain/localization';
import { blockApprove, blockDeleteDraft, blockEnableLanguage, blockSendForReview, blockSwitchOn } from '@/lib/domain/publishing';
import { errorsIn, validate } from '@/lib/domain/validation';
import { act, useApp } from '@/lib/store';

const NODE_ICON: Record<NodeType, IconName> = {
  book: 'book', story: 'story', section: 'section', chapter: 'chapter', scene: 'scene', chunk: 'chunk', quiz: 'quiz',
};
type Pending = { lang?: Lang; on: boolean } | null;
const translated = (t: NodeType) => t === 'book' || t === 'story' || t === 'section' || t === 'chapter';
/** True at the desktop layout (tree beside the content). */
const wide = () => window.matchMedia('(min-width: 1024px)').matches;

export default function Editor() {
  const s = useApp();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Pending>(null);
  const [deleting, setDeleting] = useState(false);
  // Small screens: the tree is a collapsible panel above the content.
  const [treeOpen, setTreeOpen] = useState(false);
  const tree = useRef<HTMLUListElement>(null);
  const editor = useRef<HTMLElement>(null);
  const showIssues = !!s?.ui.showIssues;

  // Escape closes the validation panel (dialogs handle their own Escape first).
  useEffect(() => {
    if (!showIssues) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) act.issues(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showIssues]);

  if (!s) return <PageSkeleton />;
  const { ui, db } = s;
  const prod = ui.env === 'production';
  const staging = db.staging.find((i) => i.match === ui.open);
  const item = (prod ? db.production : db.staging).find((i) => i.match === ui.open);

  if (!ui.open || !staging) return (
    <Empty title="Nothing open" icon="edit" action={<LinkButton href="/library" icon="library">Go to the Library</LinkButton>}>
      Pick an epic or a bedtime story from the Library to start editing.
    </Empty>
  );
  if (!item) return (
    <Empty title={`“${staging.name.en || 'This story'}” is not in production yet`} icon="shield" action={<Button icon="arrowLeft" onClick={() => act.env('staging')}>Back to staging</Button>}>
      It reaches production only when a Super Admin promotes it from staging.
    </Empty>
  );

  const lang = ui.lang;
  const all = nodes(item, lang);
  const issues = validate(item);
  const sel = all.find((n) => n.id === ui.node) ?? all[0];
  const ctx: Ctx = { item, match: item.match, lang, block: blockEdit(ui.role, ui.env), issues, all };
  const errorCount = issues.filter((i) => i.level === 'error').length;

  // Error markers bubble up to every parent, so a red dot leads you down the tree.
  const bad = new Set<string>();
  for (const i of issues) if (i.lang === lang && i.level === 'error') {
    const n = all.find((x) => x.id === i.node);
    if (n) [n.id, ...n.parents].forEach((p) => bad.add(p));
  }
  const hidden = (parents: string[]) => parents.some((p) => collapsed.has(p));
  const hasKids = (id: string) => all.some((x) => x.parents.at(-1) === id);
  const visible = all.filter((n) => !hidden(n.parents));
  const toggle = (id: string, open?: boolean) => setCollapsed((c) => {
    const x = new Set(c);
    if (open ?? x.has(id)) x.delete(id); else x.add(id);
    return x;
  });

  const go = (id: string) => {
    act.select(id);
    tree.current?.querySelector<HTMLElement>(`[data-node="${id}"]`)?.focus();
  };
  // Tree keyboard: up/down move, right opens or steps in, left closes or steps out, Home/End jump.
  const onTreeKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const i = visible.findIndex((n) => n.id === sel.id);
    const n = visible[i];
    const kids = n && hasKids(n.id) && n.depth > 0;
    const k = e.key;
    if (k === 'ArrowDown' && i < visible.length - 1) go(visible[i + 1].id);
    else if (k === 'ArrowUp' && i > 0) go(visible[i - 1].id);
    else if (k === 'Home') go(visible[0].id);
    else if (k === 'End') go(visible[visible.length - 1].id);
    else if (k === 'ArrowRight') { if (kids && collapsed.has(n.id)) toggle(n.id, true); else if (visible[i + 1]?.parents.at(-1) === n.id) go(visible[i + 1].id); }
    else if (k === 'ArrowLeft') { if (kids && !collapsed.has(n.id)) toggle(n.id, false); else if (n.parents.length) go(n.parents.at(-1)!); }
    else return;
    e.preventDefault();
  };

  const toggleBlock = blockToggle(ui.role, ui.env);
  const sendBlock = prod ? 'Production is read-only. Send for review on staging.' : blockSendForReview(ui.role, ui.env, item);
  const approveBlock = blockApprove(ui.role, item);
  const promoteBlock = prod ? 'Promote from staging.' : blockSuper(ui.role, 'promote') ?? (staging.status !== 'ready' ? 'Approve it first' : null);
  const deleteBlock = blockDeleteDraft(ui.role, ui.env, staging, db.production);
  const name = item.name.en || 'Untitled story';

  // Staging switches apply straight away; production ones ask first.
  const applySwitch = (p: NonNullable<Pending>) => {
    const ok = p.lang ? act.toggleLang(ui.env, item.match, p.lang, p.on) : act.toggleActive(ui.env, item.match, p.on);
    const what = p.lang ? `${LANG_NAME[p.lang]} for “${name}”` : `“${name}”`;
    if (ok) toast(`${what} switched ${p.on ? 'on' : 'off'}`, { sub: prod ? 'Families see the change within about 10 minutes.' : 'In the staging app.' });
    setPending(null);
  };
  const askSwitch = (p: NonNullable<Pending>) => (prod ? setPending(p) : applySwitch(p));

  // Jumping to an issue on a narrow screen closes the list and scrolls the editor into view.
  const validation = (
    <ValidationList issues={issues} lang={lang} selected={sel.id}
      onPick={(i) => { act.lang(i.lang); act.select(i.node); if (!wide()) { act.issues(false); editor.current?.scrollIntoView({ block: 'start' }); } }} />
  );

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b border-line bg-surface px-4 pt-4 lg:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
          <Link href="/library" className="rounded hover:text-indigo pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center">Library</Link>
          <Icon name="chevronRight" size={12} className="text-faint" />
          <span>{item.kind === 'book' ? 'Epic' : 'Bedtime story'}</span>
        </nav>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <span className={cx('grid h-10 w-10 place-items-center rounded-xl', item.kind === 'book' ? 'bg-tint text-indigo' : 'bg-coral-tint text-coral-deep')}>
            <Icon name={item.kind === 'book' ? 'book' : 'story'} size={20} />
          </span>
          <h1 className={cx('font-display text-2xl font-bold tracking-tight', !item.name.en && 'text-muted italic')}>{name}</h1>
          {!prod && <Pill dot tone={STATUS_TONE[item.status]}>{STATUS_NAME[item.status]}</Pill>}
          {prod && <Pill tone="coral" icon="shield">Production · read-only</Pill>}
          <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
            <Button variant={ui.showIssues ? 'primary' : 'secondary'} icon="checks" onClick={() => act.issues()} aria-expanded={ui.showIssues}>
              Validation
              {errorCount
                ? <span className={cx('ml-0.5 rounded-full px-1.5 font-mono text-[11px] tabular-nums', ui.showIssues ? 'bg-white/20 text-white' : 'bg-danger-tint text-danger')}>{errorCount}</span>
                : <Icon name="check" size={14} className={ui.showIssues ? 'text-white' : 'text-leaf'} />}
            </Button>
            {staging.kind === 'story' && staging.status === 'draft' && (
              <Button variant="ghost" icon="trash" blocked={deleteBlock} onClick={() => setDeleting(true)}>Delete draft</Button>
            )}
            {staging.status === 'draft' && (
              <Button icon="send" blocked={sendBlock} onClick={() => { if (act.status(item.match, 'in_review')) toast('Sent for review', { sub: 'A Super Admin can now approve it.' }); }}>Send for review</Button>
            )}
            {!prod && item.status === 'in_review' && (
              <Button icon="check" blocked={approveBlock} onClick={() => { if (act.status(item.match, 'ready')) toast(`“${name}” approved`, { sub: 'It can now be promoted to production.' }); }}>Approve</Button>
            )}
            <Button variant="primary" icon="promote" blocked={promoteBlock} onClick={() => { act.startPromote(item.match); router.push('/promote'); }}>Promote to production</Button>
          </div>
        </div>

        {/* switches */}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Switch on={item.active} label={prod ? 'Families can see it' : 'On in the staging app'}
            blocked={toggleBlock ?? (!item.active && prod ? blockSwitchOn(item) : null)}
            onChange={(v) => askSwitch({ on: v })} />
          {prod && (['te', 'kn'] as Lang[]).map((l) => (
            <Switch key={l} size="sm" on={item.langOn[l]} label={`${LANG_NAME[l]} on`}
              blocked={toggleBlock ?? (!item.langOn[l] ? blockEnableLanguage(item, l) : null)}
              onChange={(v) => askSwitch({ lang: l, on: v })} />
          ))}
          {prod && <span className="text-xs text-muted">English is the fallback: a language that is off shows English instead.</span>}
        </div>

        {/* language tabs */}
        <Tabs<Lang> label="Language" value={lang} onChange={(l) => act.lang(l)} className="mt-2"
          items={LANGS.map((l) => {
            const e = errorsIn(issues, l), pct = Math.round(coverage(item, l) * 100);
            return {
              value: l, label: LANG_NAME[l],
              extra: <>
                <span className={cx('font-mono text-xs font-normal tabular-nums max-sm:hidden', pct === 100 ? 'text-leaf' : 'text-muted')}>{pct}%</span>
                {e > 0 && <span className="rounded-full bg-danger-tint px-1.5 font-mono text-[11px] text-danger tabular-nums" aria-label={`${e} errors`}>{e}</span>}
              </>,
            };
          })} />
      </div>

      {/* body */}
      <div className={cx('grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]', ui.showIssues && 'xl:grid-cols-[300px_minmax(0,1fr)_360px]')}>
        <aside aria-label="Content tree" className="flex min-h-0 flex-col border-b border-line bg-surface lg:border-r lg:border-b-0">
          <button type="button" aria-expanded={treeOpen} aria-controls="content-tree" onClick={() => setTreeOpen(!treeOpen)}
            className="flex min-h-11 items-center gap-2 px-4 text-left text-sm font-semibold lg:hidden">
            <Icon name="list" size={16} className="text-muted" />
            <span className="shrink-0">Contents</span>
            <span lang={translated(sel.type) && lang !== 'en' ? lang : undefined} className="min-w-0 flex-1 truncate font-normal text-muted">· {sel.depth === 0 ? sel.label : sel.crumb}</span>
            <Icon name="chevronDown" size={16} className={cx('text-muted transition-transform duration-200', treeOpen && 'rotate-180')} />
          </button>
          <ul ref={tree} id="content-tree" role="tree" aria-label={`${name} contents`} onKeyDown={onTreeKey} className={cx('scroll-thin relative max-h-[60vh] flex-1 overflow-x-hidden overflow-y-auto border-t border-line px-2 py-2 lg:block lg:max-h-none lg:border-t-0', !treeOpen && 'hidden')}>
            {visible.map((n) => {
              const kids = hasKids(n.id) && n.depth > 0;
              const shut = collapsed.has(n.id);
              const here = sel.id === n.id;
              const strong = n.type === 'book' || n.type === 'story' || n.type === 'section';
              return (
                <li key={n.id} data-node={n.id} role="treeitem" aria-level={n.depth + 1} aria-selected={here} aria-expanded={kids ? !shut : undefined}
                  tabIndex={here ? 0 : -1} onClick={() => { act.select(n.id); if (!wide()) setTreeOpen(false); }}
                  className={cx('group relative flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 text-[13px] transition-colors duration-150 focus-visible:outline-offset-[-2px] pointer-coarse:min-h-11 pointer-coarse:py-0',
                    here ? 'bg-tint text-indigo-deep' : 'text-ink hover:bg-bg')}
                  style={{ paddingLeft: 4 + n.depth * 14 }}>
                  {here && <span aria-hidden className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-indigo" />}
                  {kids ? (
                    <button type="button" tabIndex={-1} aria-label={shut ? `Expand ${n.label}` : `Collapse ${n.label}`}
                      onClick={(e) => { e.stopPropagation(); toggle(n.id); }}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink pointer-coarse:h-11 pointer-coarse:w-11">
                      <Icon name="chevronRight" size={13} className={cx('transition-transform duration-200', !shut && 'rotate-90')} />
                    </button>
                  ) : <span className="w-5 shrink-0 pointer-coarse:w-11" />}
                  <Icon name={NODE_ICON[n.type]} size={14} className={cx(here ? 'text-indigo' : n.type === 'quiz' ? 'text-coral-deep' : 'text-faint')} />
                  <span lang={translated(n.type) && lang !== 'en' ? lang : undefined}
                    className={cx(n.type === 'chunk' ? 'shrink-0 font-mono text-[11px] text-muted' : 'min-w-0 truncate', strong && 'font-semibold', here && 'font-semibold')}>
                    {n.depth === 0 ? n.label : n.type === 'chunk' ? n.label.replace('Chunk ', '') : n.label}
                  </span>
                  {n.type === 'chunk' && (
                    <span lang={n.sub && lang !== 'en' ? lang : undefined} className={cx('min-w-0 truncate', n.sub ? (here ? 'text-indigo-deep/80' : 'text-muted') : 'text-coral-deep italic')}>{n.sub || 'missing'}</span>
                  )}
                  {n.type === 'quiz' && <span className="truncate text-xs text-muted">{n.sub}</span>}
                  {bad.has(n.id) && <span className="ml-auto pl-1"><Dot tone="danger" label="Has errors" /></span>}
                </li>
              );
            })}
          </ul>
          <p className="hidden flex-wrap items-center gap-1 border-t border-line px-3 py-2 text-[11px] text-muted lg:flex pointer-coarse:hidden">
            <Kbd>↑</Kbd><Kbd>↓</Kbd> move <span className="mx-1" /> <Kbd>←</Kbd><Kbd>→</Kbd> close or open
          </p>
        </aside>

        <section ref={editor} aria-label="Editor" className="scroll-thin relative min-w-0 scroll-mt-16 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {ui.showIssues && <div className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5 xl:hidden">{validation}</div>}
          {ctx.block && <Notice className="mb-5 max-w-3xl"><strong>Read-only.</strong> {ctx.block}.</Notice>}
          <div key={sel.id} className="animate-fade-up">
            {(sel.type === 'book' || sel.type === 'story') && <ItemPanel ctx={ctx} />}
            {sel.type === 'section' && <SectionPanel ctx={ctx} n={sel} />}
            {sel.type === 'chapter' && <ChapterPanel ctx={ctx} n={sel} />}
            {sel.type === 'scene' && <ScenePanel ctx={ctx} n={sel} />}
            {sel.type === 'chunk' && <ChunkPanel key={sel.id + lang} ctx={ctx} n={sel} />}
            {sel.type === 'quiz' && <QuizPanel key={sel.id} ctx={ctx} n={sel} />}
          </div>
        </section>

        {ui.showIssues && <aside aria-label="Validation" className="scroll-thin relative hidden animate-fade-up overflow-y-auto border-l border-line bg-surface px-5 py-5 xl:block">{validation}</aside>}
      </div>

      <Confirm open={deleting} tone="danger" icon="trash" title={`Delete “${name}”?`} confirmLabel="Delete draft"
        onCancel={() => setDeleting(false)}
        onConfirm={() => { setDeleting(false); if (act.deleteDraft(staging.match)) { toast(`“${name}” deleted`, { tone: 'info', sub: 'It was a draft and never reached production.' }); router.push('/library'); } }}>
        This draft has never been promoted, so families never saw it. It cannot be undone.
        <span className="mt-2 block">The deletion is written to the activity log.</span>
      </Confirm>

      <Confirm open={!!pending} tone={pending?.on ? 'coral' : 'danger'} icon="power"
        title={pending ? `Switch ${pending.lang ? `${LANG_NAME[pending.lang]} ` : `“${name}” `}${pending.on ? 'on' : 'off'} in production?` : ''}
        confirmLabel={pending?.on ? 'Switch on' : 'Switch off'}
        onCancel={() => setPending(null)} onConfirm={() => pending && applySwitch(pending)}>
        {pending?.on
          ? pending.lang
            ? `Families who chose ${LANG_NAME[pending.lang]} will see “${name}” in ${LANG_NAME[pending.lang]} within about 10 minutes.`
            : `“${name}” appears in the app for every family within about 10 minutes.`
          : pending?.lang
            ? `Families who chose ${LANG_NAME[pending.lang]} will see English instead. Nothing is deleted.`
            : `“${name}” disappears from the app for every family within about 10 minutes. Nothing is deleted, and you can switch it back on.`}
        <span className="mt-2 block">The change is written to the activity log.</span>
      </Confirm>
    </div>
  );
}
