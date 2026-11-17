'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button, Dot, Icon, Meter, Modal, PageHeader, PageSkeleton, Pill, STATUS_TONE, StatTile, Tabs, ago, cx, toast } from '@/components/ui';
import { blockEdit } from '@/lib/domain/access';
import { type Item, LANG_NAME, LANGS, STATUS_NAME } from '@/lib/domain/content';
import { coverage } from '@/lib/domain/localization';
import { errorsIn, validate } from '@/lib/domain/validation';
import { act, useApp } from '@/lib/store';

type Filter = 'all' | 'book' | 'story';

export default function Library() {
  const s = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [naming, setNaming] = useState(false);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  // Runs after the Modal's own effect has opened the dialog, so focus lands in the field (not on the close button).
  useEffect(() => { if (naming) document.getElementById('new-story-title')?.focus(); }, [naming]);
  if (!s) return <PageSkeleton />;
  const { env, role } = s.ui;
  const prod = env === 'production';
  const everything = prod ? s.db.production : s.db.staging;
  const list = everything.filter((i) => filter === 'all' || i.kind === filter);
  const open = (it: Item) => { act.open(it.match); router.push('/edit'); };
  const newStoryBlock = blockEdit(role, env);

  // Dashboard numbers for the current environment
  const rows = list.map((it) => ({ it, issues: validate(it) }));
  const pairs = list.length * LANGS.length;
  const complete = list.reduce((n, it) => n + LANGS.filter((l) => coverage(it, l) === 1).length, 0);
  const errors = rows.reduce((n, r) => n + r.issues.filter((i) => i.level === 'error').length, 0);
  const blocked = rows.filter((r) => r.issues.some((i) => i.level === 'error')).length;
  const inReview = list.filter((i) => i.status === 'in_review').length;
  const live = list.filter((i) => i.active).length;
  const count = (k: Filter) => everything.filter((i) => k === 'all' || i.kind === k).length;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader title="Library"
        sub={prod ? 'What is in production right now, and what families can see.' : 'Everything on staging, where all editing happens.'}
        actions={<Button variant="primary" icon="plus" blocked={newStoryBlock}
          onClick={() => { setTitle(''); setTitleError(false); setNaming(true); }}>New bedtime story</Button>} />

      <Modal open={naming} onClose={() => setNaming(false)} title="New bedtime story" icon="story"
        footer={<>
          <Button size="sm" variant="ghost" onClick={() => setNaming(false)}>Cancel</Button>
          <Button size="sm" variant="primary" type="submit" form="new-story">Create story</Button>
        </>}>
        <form id="new-story" noValidate onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) { setTitleError(true); return; }
          if (!act.newStory(title)) return;
          setNaming(false);
          toast('New bedtime story created', { sub: 'It starts as a draft, switched off.' });
          router.push('/edit');
        }}>
          <label htmlFor="new-story-title" className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">Title (English) <span className="font-medium normal-case">· required</span></label>
          <input id="new-story-title" value={title} required aria-invalid={titleError || undefined} aria-describedby={titleError ? 'new-story-title-error' : undefined}
            onChange={(e) => { setTitle(e.target.value); if (titleError && e.target.value.trim()) setTitleError(false); }}
            className={cx('h-10 w-full rounded-lg border bg-surface px-3 text-[15px] text-ink shadow-xs transition-[border-color,box-shadow] duration-200 focus:ring-4 focus:outline-none',
              titleError ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-line hover:border-indigo/40 focus:border-indigo focus:ring-indigo/10')} />
          {titleError && <p id="new-story-title-error" className="mt-1.5 text-xs text-danger">Enter a title for the story.</p>}
          <p className="mt-3">It starts as a draft, switched off. You add the description, cover, themes and scenes in the editor.</p>
        </form>
      </Modal>

      <div className="mt-6 grid gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatTile label={prod ? 'Items in production' : 'Items on staging'} value={list.length} icon="library"
          sub={`${list.filter((i) => i.kind === 'book').length} epics · ${list.filter((i) => i.kind === 'story').length} bedtime stories`} />
        <StatTile label="Languages complete" value={<>{complete}<span className="text-lg text-muted">/{pairs}</span></>} icon="globe" tone="leaf"
          sub="Item × language with text and approved audio everywhere" />
        <StatTile label="Validation errors" value={errors} icon="alert" tone={errors ? 'danger' : 'leaf'}
          sub={errors ? `Blocking ${blocked} item${blocked === 1 ? '' : 's'} from promote` : 'Nothing blocking'} />
        {prod
          ? <StatTile label="Switched on" value={<>{live}<span className="text-lg text-muted">/{list.length}</span></>} icon="power" tone="coral" sub="Visible to families" />
          : <StatTile label="Awaiting review" value={inReview} icon="clock" tone={inReview ? 'amber' : 'neutral'} sub={inReview ? 'A Super Admin can approve these' : 'Nothing waiting'} />}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface shadow-xs">
        <div className="flex items-center justify-between border-b border-line px-2 sm:px-4">
          <Tabs<Filter> label="Content type" value={filter} onChange={setFilter} items={([['all', 'All'], ['book', 'Epics'], ['story', <><span className="max-sm:sr-only">Bedtime stories</span><span aria-hidden className="sm:hidden">Stories</span></>]] as [Filter, ReactNode][]).map(([value, label]) => ({
            value, label, extra: <span className="rounded-full bg-bg px-1.5 font-mono text-[11px] text-muted tabular-nums">{count(value)}</span>,
          }))} />
          <p className="hidden text-xs text-muted md:block">Coverage = share of chunks with text and approved female and male audio</p>
        </div>
        {/* Phones: one card per item. */}
        <ul className="divide-y divide-line md:hidden">
          {rows.map(({ it, issues }) => {
            const errs = issues.filter((i) => i.level === 'error').length;
            const live = s.db.production.find((p) => p.match === it.match);
            return (
              <li key={it.id} className="px-4 py-4">
                <button type="button" onClick={() => open(it)} className="flex min-h-11 w-full items-center gap-3 text-left">
                  <ItemIcon it={it} />
                  <span className="min-w-0 flex-1">
                    <span className={cx('block font-semibold', !it.name.en && 'text-muted italic')}>{it.name.en || 'Untitled story'}</span>
                    <span className="text-xs text-muted">{it.kind === 'book' ? 'Epic' : 'Bedtime story'} · updated {ago(it.updatedAt)}</span>
                  </span>
                  <Icon name="chevronRight" size={16} className="text-faint" />
                </button>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  {!prod && <Pill dot tone={STATUS_TONE[it.status]}>{STATUS_NAME[it.status]}</Pill>}
                  <span className="inline-flex items-center gap-1.5 text-muted">{prod ? 'Families' : 'Staging'} <OnOff on={it.active} /></span>
                  {!prod && <span className="inline-flex items-center gap-1.5 text-muted">Production {live ? <OnOff on={live.active} /> : <span className="font-semibold">not yet</span>}</span>}
                  {prod
                    ? <span className="flex gap-1">{LANGS.map((l) => <Pill key={l} tone={l === 'en' || it.langOn[l] ? 'leaf' : 'neutral'}>{l.toUpperCase()}</Pill>)}</span>
                    : errs ? <Pill tone="danger" icon="alert">{errs} error{errs > 1 ? 's' : ''}</Pill> : <Pill tone="leaf" icon="check">Passes</Pill>}
                </div>
                <dl className="mt-3 grid gap-1.5">
                  {LANGS.map((l) => (
                    <div key={l} className="grid grid-cols-[72px_1fr] items-center gap-2">
                      <dt className="text-xs text-muted">{LANG_NAME[l]}</dt>
                      <dd><Meter value={coverage(it, l)} label={`${LANG_NAME[l]} coverage`} /></dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
        {/* Tablets and up: the table. When it is wider than the screen it scrolls inside its own frame, with a fade at the edge. */}
        <div role="region" aria-label="Library table" tabIndex={0} className="scroll-fade relative hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg/50 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap text-muted uppercase">
                <th className="py-2.5 pr-3 pl-5 font-semibold">Name</th>
                {!prod && <th className="px-3 py-2.5 font-semibold">Status</th>}
                <th className="px-3 py-2.5 font-semibold">{prod ? 'Families see it' : 'Staging app'}</th>
                {!prod && <th className="px-3 py-2.5 font-semibold">Production</th>}
                {LANGS.map((l) => <th key={l} className="px-3 py-2.5 font-semibold">{LANG_NAME[l]}</th>)}
                <th className="px-3 py-2.5 font-semibold">{prod ? 'Languages on' : 'Checks'}</th>
                <th className="py-2.5 pr-5 pl-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ it, issues }) => {
                const errs = issues.filter((i) => i.level === 'error').length;
                const live = s.db.production.find((p) => p.match === it.match);
                return (
                  <tr key={it.id} onClick={() => open(it)} className="group cursor-pointer border-b border-line transition-colors duration-150 last:border-0 hover:bg-tint/40">
                    <td className="py-3 pr-3 pl-5">
                      <button type="button" onClick={(e) => { e.stopPropagation(); open(it); }} className="flex items-center gap-3 text-left pointer-coarse:min-h-11">
                        <ItemIcon it={it} />
                        <span>
                          <span className={cx('block font-semibold group-hover:text-indigo', !it.name.en && 'text-muted italic')}>{it.name.en || 'Untitled story'}</span>
                          <span className="text-xs whitespace-nowrap text-muted">{it.kind === 'book' ? 'Epic' : 'Bedtime story'} · updated {ago(it.updatedAt)}</span>
                        </span>
                      </button>
                    </td>
                    {!prod && <td className="px-3"><Pill dot tone={STATUS_TONE[it.status]}>{STATUS_NAME[it.status]}</Pill></td>}
                    <td className="px-3"><OnOff on={it.active} /></td>
                    {!prod && <td className="px-3">{live ? <OnOff on={live.active} /> : <span className="text-xs text-muted">Not yet</span>}</td>}
                    {LANGS.map((l) => <td key={l} className="px-3"><Meter value={coverage(it, l)} label={`${LANG_NAME[l]} coverage`} /></td>)}
                    <td className="px-3 py-3">
                      {prod
                        ? <span className="flex gap-1">{LANGS.map((l) => <Pill key={l} tone={l === 'en' || it.langOn[l] ? 'leaf' : 'neutral'}>{l.toUpperCase()}</Pill>)}</span>
                        : errs
                          ? <Pill tone="danger" icon="alert">{errs} error{errs > 1 ? 's' : ''}</Pill>
                          : <Pill tone="leaf" icon="check">Passes</Pill>}
                      {!prod && errs > 0 && (
                        <span className="mt-1 block text-[11px] text-muted">{LANGS.filter((l) => errorsIn(issues, l)).map((l) => LANG_NAME[l]).join(', ')}</span>
                      )}
                    </td>
                    <td className="py-3 pr-5 pl-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-muted transition-colors duration-200 group-hover:text-indigo" aria-hidden>
                        Open <Icon name="arrowRight" size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="px-5 py-12 text-center text-muted">Nothing here yet.</p>}
      </div>
    </div>
  );
}

const ItemIcon = ({ it }: { it: Item }) => (
  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', it.kind === 'book' ? 'bg-tint text-indigo' : 'bg-coral-tint text-coral-deep')}>
    <Icon name={it.kind === 'book' ? 'book' : 'story'} size={17} />
  </span>
);

const OnOff = ({ on }: { on: boolean }) => (
  <span className={cx('inline-flex items-center gap-1.5 text-xs font-semibold', on ? 'text-leaf' : 'text-muted')}>
    <Dot tone={on ? 'leaf' : 'neutral'} />{on ? 'On' : 'Off'}
  </span>
);
