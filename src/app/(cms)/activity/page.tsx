'use client';
import { useState } from 'react';
import { Icon, type IconName, PageHeader, PageSkeleton, Pill, Segmented, ago, cx } from '@/components/ui';
import type { Env } from '@/lib/domain/publishing';
import { useApp } from '@/lib/store';

// Picks an icon from the action wording, so the log scans by kind of change.
const iconFor = (action: string): IconName =>
  /promot/i.test(action) ? 'promote' : /revert/i.test(action) ? 'reset' : /switch/i.test(action) ? 'power'
    : /approv/i.test(action) ? 'checkCircle' : /review/i.test(action) ? 'send' : /audio|voice/i.test(action) ? 'play'
      : /upload/i.test(action) ? 'upload' : /creat|added/i.test(action) ? 'plus' : 'edit';

export default function Activity() {
  const s = useApp();
  const [env, setEnv] = useState<Env | 'all'>('all');
  const [q, setQ] = useState('');
  if (!s) return <PageSkeleton />;
  const list = s.db.audit.filter((a) => (env === 'all' || a.env === env) && `${a.action} ${a.target} ${a.who}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader title="Activity" sub="Every change: who, what, before and after, which environment, and when. Nothing here can be edited." />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented<Env | 'all'> label="Environment filter" value={env} onChange={setEnv}
          items={[{ value: 'all', label: 'All' }, { value: 'staging', label: 'Staging' }, { value: 'production', label: 'Production' }]} />
        <div className="relative w-full sm:w-auto">
          <label htmlFor="q" className="sr-only">Search activity</label>
          <Icon name="search" size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actions, items, people"
            className="h-9 w-full rounded-lg border sm:w-80 pointer-coarse:h-11 border-line bg-surface pr-3 pl-9 text-sm shadow-xs transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70 hover:border-indigo/40 focus:border-indigo focus:ring-4 focus:ring-indigo/10 focus:outline-none" />
        </div>
        <span className="text-sm text-muted tabular-nums sm:ml-auto">{list.length} {list.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      <ol className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        {list.map((a) => (
          <li key={a.id} className="grid gap-x-5 gap-y-1 px-4 py-4 sm:px-5 transition-colors duration-150 hover:bg-bg/50 sm:grid-cols-[130px_auto_1fr]">
            <div className="text-sm">
              <time dateTime={a.at} title={new Date(a.at).toLocaleString('en-IN')} className="font-medium">{ago(a.at)}</time>
              <div className="text-xs text-muted">{a.who}</div>
            </div>
            <span className={cx('hidden h-8 w-8 place-items-center rounded-full sm:grid', a.env === 'production' ? 'bg-coral-tint text-coral-deep' : 'bg-tint text-indigo')}>
              <Icon name={iconFor(a.action)} size={14} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{a.action}</span>
                <Pill dot tone={a.env === 'production' ? 'coral' : 'indigo'}>{a.env}</Pill>
              </div>
              <div className="text-sm text-muted">{a.target}</div>
              {a.detail && <div className="mt-1 text-sm">{a.detail}</div>}
              {(a.before || a.after) && (
                <div className="mt-2 grid gap-1 rounded-lg border border-line bg-bg/60 px-3 py-2 text-sm">
                  {a.before && <div className="flex gap-2"><span className="w-12 shrink-0 pt-0.5 text-[11px] font-semibold tracking-wide text-danger uppercase">Before</span><span className="min-w-0 break-words text-muted line-through decoration-danger/30">{a.before}</span></div>}
                  {a.after && <div className="flex gap-2"><span className="w-12 shrink-0 pt-0.5 text-[11px] font-semibold tracking-wide text-leaf uppercase">After</span><span className="min-w-0 break-words">{a.after}</span></div>}
                </div>
              )}
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li className="flex flex-col items-center px-5 py-14 text-center">
            <Icon name="search" size={22} className="text-faint" />
            <p className="mt-2 font-semibold">No activity matches</p>
            <p className="text-sm text-muted">Try another word, or show all environments.</p>
          </li>
        )}
      </ol>
    </div>
  );
}
