'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState, type ReactNode } from 'react';
import { Button, Card, Empty, Icon, type IconName, LinkButton, Notice, PageSkeleton, Pill, cx, toast } from '@/components/ui';
import { type Lang, LANG_NAME, LANGS, nodes } from '@/lib/domain/content';
import { started } from '@/lib/domain/localization';
import { diff } from '@/lib/domain/publishing';
import { errorsIn, validate } from '@/lib/domain/validation';
import { act, useApp } from '@/lib/store';
import { type Check, promoteChecks } from './checks';

const STEPS = ['Match', 'Changes', 'Checks', 'Dry run', 'Confirm', 'Promote'];
// Simulated progress: each dry-run and promote line appears after this many milliseconds.
const DRY_RUN_STEP_MS = 550;
const PROMOTE_STEP_MS = 750;
const CHECK_ICON: Record<Check['state'], { icon: IconName; cls: string; label: string }> = {
  pass: { icon: 'checkCircle', cls: 'text-leaf', label: 'Passed' },
  fail: { icon: 'error', cls: 'text-danger', label: 'Failed' },
  warn: { icon: 'alert', cls: 'text-amber', label: 'Warning' },
  pending: { icon: 'clock', cls: 'text-faint', label: 'Pending' },
};

// Plays a list of progress lines one by one, then calls onDone.
function useTicker(total: number, ms: number, onDone: () => void) {
  const [n, setN] = useState(-1);
  const done = useEffectEvent(onDone);
  useEffect(() => {
    if (n < 0 || n >= total) return;
    const t = window.setTimeout(() => { setN(n + 1); if (n + 1 === total) done(); }, ms);
    return () => window.clearTimeout(t);
  }, [n, total, ms]);
  return { n, start: () => setN(0), running: n >= 0 && n < total, done: n >= total };
}

export default function Promote() {
  const s = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Lang[] | null>(null);
  const [matchOk, setMatchOk] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [typedEnv, setTypedEnv] = useState('');
  const [result, setResult] = useState<{ existed: boolean; active: boolean } | null>(null);
  // The plan is frozen when the run starts; afterwards production already matches staging.
  const [plan, setPlan] = useState<{ files: number; enChanged: number; langs: Lang[] } | null>(null);
  const item = s?.db.staging.find((i) => i.match === s.ui.promote);
  const dry = useTicker(5, DRY_RUN_STEP_MS, () => {});
  const run = useTicker(5, PROMOTE_STEP_MS, () => {
    if (!item || !plan) return;
    const r = act.promote(item.match, plan.langs);
    setResult(r);
    toast(`“${item.name.en}” promoted to production`, { sub: r.existed ? 'Updated in place. Visibility unchanged.' : 'It landed switched off.' });
  });

  if (!s) return <PageSkeleton />;
  if (s.ui.role !== 'sa') return (
    <Empty title="Only a Super Admin can promote" icon="lock" action={<LinkButton href="/library" icon="library">Back to the Library</LinkButton>}>
      Promote copies content into the live app, so only a Super Admin can run it. Ask one to promote this item.
    </Empty>
  );
  if (!item) return (
    <Empty title="Nothing to promote" icon="promote" action={<LinkButton href="/library" icon="library">Go to the Library</LinkButton>}>
      Open an approved epic or story and press <em>Promote to production</em>.
    </Empty>
  );

  const prodItem = s.db.production.find((p) => p.match === item.match);
  const issues = validate(item);
  const langBlock = (l: Lang) => (!started(item, l) ? 'not started' : errorsIn(issues, l) ? `${errorsIn(issues, l)} errors` : null);
  const langs: Lang[] = picked ?? LANGS.filter((l) => !langBlock(l));
  const d = diff(item, prodItem, langs);
  const chunks = nodes(item).filter((n) => n.type === 'chunk');
  const prodIds = new Set(prodItem ? nodes(prodItem).map((n) => n.id.replace(/^p-/, '')) : []);
  const matched = chunks.filter((c) => prodIds.has(c.id)).length;
  const isSA = s.ui.role === 'sa';
  const name = item.name.en ?? '';
  const nameOk = typedName.trim().toLowerCase() === name.toLowerCase();
  const envOk = typedEnv.trim().toLowerCase() === 'production';
  const typedOk = nameOk && envOk;

  const checks = promoteChecks({
    isSA, issues, langs, files: d.files, matched, total: chunks.length, live: prodItem?.active, isNew: !prodItem,
    reviewed: step >= 2, dryRunClean: dry.done, typedOk,
  });
  const failed = checks.filter((c) => c.state === 'fail');
  const tally = (st: Check['state']) => checks.filter((c) => c.state === st).length;

  const next = [
    !matchOk ? 'Confirm the matches first' : null,
    !langs.includes('en') ? 'English must be included' : null,
    failed.length ? `${failed.length} check${failed.length > 1 ? 's' : ''} failed` : null,
    !dry.done ? 'Run the dry run first' : null,
    !typedOk ? 'Type the name and “production” exactly' : null,
  ][step];
  const totals = langs.reduce((t, l) => ({ new: t.new + d.counts[l].new, changed: t.changed + d.counts[l].changed }), { new: 0, changed: 0 });
  const done = step === 5;

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
        <Link href="/library" className="rounded hover:text-indigo pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center">Library</Link>
        <Icon name="chevronRight" size={12} className="text-faint" />
        <button type="button" className="min-w-0 truncate rounded hover:text-indigo pointer-coarse:min-h-11" onClick={() => { act.open(item.match); router.push('/edit'); }}>{name}</button>
        <Icon name="chevronRight" size={12} className="text-faint" />
        <span>Promote</span>
      </nav>
      <h1 className="mt-1.5 font-display text-2xl leading-tight font-bold tracking-tight sm:text-[28px]">Promote “{name}” to production</h1>
      <p className="mt-1 text-muted">Copies approved staging content into the live app. It never deletes, and it never switches anything on by itself.</p>

      {/* stepper */}
      <ol className="mt-7 flex items-center" aria-label="Steps">
        {STEPS.map((t, i) => {
          const state = i < step || (done && result) ? 'done' : i === step ? 'now' : 'todo';
          return (
            <li key={t} aria-current={i === step ? 'step' : undefined} className={cx('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
              <span className="flex items-center gap-2.5">
                <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-mono text-xs font-semibold transition-colors duration-300',
                  state === 'done' ? 'border-leaf bg-leaf text-white' : state === 'now' ? 'border-indigo bg-surface text-indigo ring-4 ring-indigo/10' : 'border-line-strong bg-surface text-muted')}>
                  {state === 'done' ? <Icon name="check" size={14} /> : i + 1}
                </span>
                <span className={cx('text-sm font-semibold whitespace-nowrap', state === 'now' ? 'text-ink max-sm:sr-only' : cx(state === 'done' ? 'text-leaf' : 'text-muted', 'max-md:sr-only'))}>
                  {t}<span className="sr-only">{state === 'done' ? ' (done)' : state === 'now' ? ' (current)' : ''}</span>
                </span>
              </span>
              {i < STEPS.length - 1 && <span aria-hidden className={cx('mx-1.5 h-0.5 min-w-2 flex-1 rounded-full transition-colors duration-300 sm:mx-3', i < step ? 'bg-leaf' : 'bg-line')} />}
            </li>
          );
        })}
      </ol>
      <p aria-hidden className="mt-2 text-sm font-semibold sm:hidden">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Card className="p-4 sm:p-6">
            {step === 0 && (
              <div>
                <StepTitle sub="IDs differ between the two databases, so the CMS matches by title, then each chapter, scene and chunk by text and order. You confirm once; the matches are saved and reused.">Match staging to production</StepTitle>
                <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="rounded-xl border border-indigo/25 bg-tint/50 p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-indigo-deep uppercase"><span className="h-2 w-2 rounded-full bg-indigo" />Staging</div>
                    <div className="mt-1.5 font-semibold">{name}</div><div className="font-mono text-xs text-muted">id {item.id}</div>
                  </div>
                  <span className="grid h-9 w-9 place-items-center justify-self-center rounded-full bg-bg text-muted max-sm:rotate-90" aria-hidden><Icon name="arrowRight" /></span>
                  <div className={cx('rounded-xl border p-4', prodItem ? 'border-coral/40 bg-coral-tint/50' : 'border-dashed border-coral/60')}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-coral-deep uppercase"><span className="h-2 w-2 rounded-full bg-coral" />Production</div>
                    {prodItem
                      ? <><div className="mt-1.5 font-semibold">{prodItem.name.en}</div><div className="font-mono text-xs text-muted">id {prodItem.id} · {prodItem.active ? 'live, on' : 'off'}</div></>
                      : <div className="mt-1.5 font-semibold text-coral-deep">New: will be created, switched off</div>}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-indigo" style={{ width: `${chunks.length ? (matched / chunks.length) * 100 : 0}%` }} />
                  </div>
                  <p className="text-sm"><strong className="tabular-nums">{matched}</strong> of {chunks.length} chunks matched · <strong className="tabular-nums">{chunks.length - matched}</strong> new</p>
                </div>
                <label className={cx('mt-5 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors duration-200', matchOk ? 'border-leaf/40 bg-leaf-tint' : 'border-line hover:border-indigo/40')}>
                  <input type="checkbox" checked={matchOk} onChange={(e) => setMatchOk(e.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
                  These matches are right
                </label>
              </div>
            )}

            {step === 1 && (
              <div>
                <StepTitle sub="Pick the languages to copy. A language with errors stays on staging until it is fixed.">What will change</StepTitle>
                <fieldset className="mt-5">
                  <legend className="text-xs font-semibold tracking-wide text-muted uppercase">Languages to promote</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LANGS.map((l) => {
                      const b = langBlock(l);
                      const on = langs.includes(l);
                      return (
                        <label key={l} className={cx('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200 pointer-coarse:min-h-11',
                          b ? 'cursor-not-allowed border-line bg-bg text-muted' : on ? 'cursor-pointer border-indigo/40 bg-tint' : 'cursor-pointer border-line hover:border-indigo/40')}
                          title={b ? `${LANG_NAME[l]}: ${b}` : l === 'en' ? 'English is always promoted' : undefined}>
                          <input type="checkbox" disabled={!!b || l === 'en'} checked={on}
                            onChange={(e) => setPicked(e.target.checked ? [...langs, l] : langs.filter((x) => x !== l))} className="h-4 w-4 accent-[var(--color-indigo)]" />
                          {LANG_NAME[l]} {l === 'en' && <span className="text-xs font-normal text-muted">(always)</span>}{b && <Pill tone={b.includes('error') ? 'danger' : 'neutral'}>{b}</Pill>}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div role="region" aria-label="Changes per language" tabIndex={0} className="scroll-fade relative mt-5 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead><tr className="border-b border-line bg-bg/60 text-left text-[11px] font-semibold tracking-wider text-muted uppercase"><th className="px-4 py-2">Language</th><th className="px-4">New chunks</th><th className="px-4">Changed</th><th className="px-4">Unchanged</th></tr></thead>
                    <tbody>{langs.map((l) => (
                      <tr key={l} className="border-b border-line last:border-0">
                        <td className="px-4 py-2.5 font-medium">{LANG_NAME[l]}</td>
                        <td className="px-4 tabular-nums">{d.counts[l].new ? <Pill tone="indigo">{d.counts[l].new}</Pill> : 0}</td>
                        <td className="px-4 tabular-nums">{d.counts[l].changed ? <Pill tone="amber">{d.counts[l].changed}</Pill> : 0}</td>
                        <td className="px-4 text-muted tabular-nums">{d.counts[l].same}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <p className="mt-3 text-sm text-muted"><strong className="text-ink">{d.files}</strong> files to copy (audio + transcript) · <strong className="text-ink">0</strong> production rows deleted · rows updated in place, IDs kept</p>
                {d.changes.length > 0 && (
                  <ul className="scroll-thin mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                    {d.changes.slice(0, 12).map((c, i) => (
                      <li key={i} className="rounded-lg border border-line px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2 text-xs text-muted"><Pill tone={c.kind === 'new' ? 'indigo' : 'amber'}>{c.kind}</Pill>{LANG_NAME[c.lang]} · {c.where}</div>
                        {c.before && <div lang={c.lang === 'en' ? undefined : c.lang} className="mt-1.5 rounded bg-danger-tint/60 px-2 py-0.5 text-danger line-through decoration-danger/40">{c.before}</div>}
                        <div lang={c.lang === 'en' ? undefined : c.lang} className="mt-1 rounded bg-leaf-tint/70 px-2 py-0.5 text-leaf">{c.after}</div>
                      </li>
                    ))}
                    {d.changes.length > 12 && <li className="text-xs text-muted">…and {d.changes.length - 12} more</li>}
                  </ul>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <StepTitle sub="A failed check stops the promote and nothing is written. Warnings need a second look but don’t block.">The 17 pre-promote checks</StepTitle>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill tone="leaf" icon="check">{tally('pass')} passed</Pill>
                  {tally('fail') > 0 && <Pill tone="danger" icon="error">{tally('fail')} failed</Pill>}
                  {tally('warn') > 0 && <Pill tone="amber" icon="alert">{tally('warn')} warning</Pill>}
                  {tally('pending') > 0 && <Pill icon="clock">{tally('pending')} later in the wizard</Pill>}
                </div>
                <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
                  {checks.map((c, i) => {
                    const ic = CHECK_ICON[c.state];
                    return (
                      <li key={i} className={cx('flex flex-wrap items-start gap-x-2 gap-y-0.5 px-3 py-2.5 text-sm sm:flex-nowrap sm:gap-3 sm:px-4', c.state === 'fail' && 'bg-danger-tint/50')}>
                        <span className="w-5 shrink-0 pt-px font-mono text-xs text-muted">{i + 1}</span>
                        <Icon name={ic.icon} size={16} className={cx('mt-0.5', ic.cls)} />
                        <span className="sr-only">{ic.label}: </span>
                        <span className="min-w-0 flex-1">{c.name}{c.warning && <span className="ml-2 text-xs text-muted">(warning only)</span>}</span>
                        {c.note && <span className={cx('w-full pl-[52px] text-xs break-words sm:w-auto sm:max-w-[40%] sm:pl-0 sm:text-right', c.state === 'fail' ? 'font-semibold text-danger' : 'text-muted')}>{c.note}</span>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepTitle sub="Runs the exact plan without writing anything.">Dry run</StepTitle>
                <Log lines={['Plan rebuilt: unchanged since review', `Would copy ${d.files} files to production storage, hash-checked`, `Would update ${matched} rows in place and create ${chunks.length - matched}`, 'Would delete 0 rows and 0 files', prodItem?.active ? 'Visibility unchanged: stays on' : 'Would land switched off']}
                  shown={dry.done ? 5 : Math.max(0, dry.n)} running={dry.running} />
                {dry.done ? <Notice tone="leaf" icon="checkCircle" className="mt-4"><strong>Clean.</strong> Nothing was written.</Notice>
                  : <Button className="mt-4" variant="primary" icon="play" loading={dry.running} onClick={dry.start}>{dry.running ? 'Running…' : 'Run dry run'}</Button>}
              </div>
            )}

            {step === 4 && (
              <div>
                <StepTitle sub={<>Promoting <strong className="text-ink">{langs.map((l) => LANG_NAME[l]).join(', ')}</strong> · {d.files} files · {prodItem?.active ? 'live item, stays on' : 'lands switched off'}.</>}>Confirm</StepTitle>
                <Notice tone="coral" icon="shield" className="mt-4">This writes to the production database 1,000+ families use. A snapshot is taken first, so it can be reverted.</Notice>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <TypeField id="cn" label={<>Type <strong>{name}</strong></>} value={typedName} onChange={setTypedName} ok={nameOk} />
                  <TypeField id="ce" label={<>Type <strong>production</strong></>} value={typedEnv} onChange={setTypedEnv} ok={envOk} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <StepTitle>{result ? 'Promoted' : 'Promoting…'}</StepTitle>
                <Log lines={['Snapshot of production rows saved', `Copying ${plan?.files ?? d.files} files`, 'Writing rows in one transaction', 'Verifying files, paths and hashes', 'Asked the app to refresh its cache']}
                  shown={run.done ? 5 : Math.max(0, run.n)} running={run.running} />
                {!result && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-indigo transition-[width] duration-700" style={{ width: `${Math.max(0, run.n) * 20}%` }} /></div>}
                {result && (
                  <div className="mt-5 animate-fade-up rounded-xl border border-leaf/30 bg-leaf-tint p-5">
                    <div className="flex items-start gap-3">
                      <Icon name="checkCircle" size={22} className="text-leaf" />
                      <div>
                        <p className="font-semibold text-leaf">
                          {result.existed
                            ? result.active
                              ? plan?.enChanged ? 'Updated in place. It was already on, so families see the English changes within about 10 minutes.' : 'Updated in place. It was already on; nothing families see in English changed.'
                              : 'Updated in place. It stays switched off.'
                            : 'Landed in production, switched off. Nobody sees it until a Super Admin switches it on.'}
                        </p>
                        {langs.some((l) => l !== 'en') && <p className="mt-1 text-sm text-ink">{langs.filter((l) => l !== 'en').map((l) => LANG_NAME[l]).join(' and ')} arrived switched off. Switch each language on in production when ready.</p>}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 sm:pl-[34px]">
                      <Button variant="primary" icon="shield" onClick={() => { act.open(item.match, { env: 'production' }); router.push('/edit'); }}>Open in production</Button>
                      <Button icon="reset" onClick={() => { act.revert(item.match); setResult(null); toast('Promote reverted', { tone: 'info', sub: 'Production is back to the snapshot.' }); router.push('/activity'); }}>Revert this promote</Button>
                      <Button variant="ghost" onClick={() => router.push('/library')}>Back to library</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {step < 5 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <Button variant="ghost" icon={step === 0 ? undefined : 'arrowLeft'} onClick={() => (step === 0 ? router.back() : setStep(step - 1))}>{step === 0 ? 'Cancel' : 'Back'}</Button>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
                {next && <span className="text-right text-xs text-muted">{next}</span>}
                <Button variant={step === 4 ? 'prod' : 'primary'} icon={step === 4 ? 'promote' : undefined} blocked={next} onClick={() => {
                  if (step === 4) { setPlan({ files: d.files, enChanged: d.counts.en.new + d.counts.en.changed, langs }); run.start(); }
                  setStep(step + 1);
                }}>
                  {step === 4 ? 'Promote now' : <>Next <Icon name="arrowRight" size={15} /></>}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* summary */}
        <aside aria-label="Promote summary" className="rounded-2xl border border-line bg-surface p-5 shadow-xs lg:sticky lg:top-6">
          <h2 className="text-[11px] font-semibold tracking-wider text-muted uppercase">Summary</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className={cx('grid h-9 w-9 place-items-center rounded-lg', item.kind === 'book' ? 'bg-tint text-indigo' : 'bg-coral-tint text-coral-deep')}><Icon name={item.kind === 'book' ? 'book' : 'story'} size={17} /></span>
            <div className="min-w-0"><div className="truncate font-semibold">{name}</div><div className="text-xs text-muted">{item.kind === 'book' ? 'Epic' : 'Bedtime story'}</div></div>
          </div>
          <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            <Row k="Target">{prodItem ? `Existing · ${prodItem.active ? 'live' : 'off'}` : 'New in production'}</Row>
            <Row k="Languages"><span className="flex flex-wrap justify-end gap-1">{langs.map((l) => <Pill key={l} tone="indigo">{l.toUpperCase()}</Pill>)}</span></Row>
            <Row k="Chunk translations">{totals.new} new · {totals.changed} changed</Row>
            <Row k="Files to copy"><span className="font-mono tabular-nums">{d.files}</span></Row>
            <Row k="Checks">
              {tally('fail') ? <span className="font-semibold text-danger">{tally('fail')} failed</span> : <span className="text-leaf">{tally('pass')} of 17 passed</span>}
            </Row>
            <Row k="Dry run">{dry.done ? <span className="text-leaf">Clean</span> : 'Not run yet'}</Row>
            <Row k="Visibility">{prodItem?.active ? 'Stays on' : 'Lands switched off'}</Row>
          </dl>
          <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs text-muted">
            {['Never deletes production rows or files', 'Snapshot taken first; one-click revert', 'Every step goes in the activity log'].map((t) => (
              <li key={t} className="flex items-start gap-2"><Icon name="shield" size={13} className="mt-px text-leaf" />{t}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

const StepTitle = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <div>
    <h2 className="font-display text-xl font-bold">{children}</h2>
    {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
  </div>
);

const Row = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{children}</dd></div>
);

function Log({ lines, shown, running }: { lines: string[]; shown: number; running: boolean }) {
  return (
    <ul className="mt-4 space-y-1 rounded-xl bg-ink px-4 py-3 font-mono text-[13px] text-white/90" aria-live="polite">
      {lines.map((t, i) => (
        <li key={t} className={cx('flex items-center gap-2 transition-opacity duration-300', i < shown ? 'opacity-100' : i === shown && running ? 'opacity-60' : 'opacity-25')}>
          {i < shown ? <Icon name="check" size={13} className="text-[#7EE2B5]" /> : i === shown && running ? <span className="grid w-[13px] place-items-center"><span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /></span> : <span className="w-[13px]" />}
          {t}
        </li>
      ))}
    </ul>
  );
}

function TypeField({ id, label, value, onChange, ok }: { id: string; label: ReactNode; value: string; onChange: (v: string) => void; ok: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm">{label}</label>
      <div className="relative">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" spellCheck={false}
          className={cx('h-10 w-full rounded-lg border bg-surface px-3 pr-9 shadow-xs transition-[border-color,box-shadow] duration-200 focus:ring-4 focus:outline-none',
            ok ? 'border-leaf focus:ring-leaf/15' : 'border-line hover:border-indigo/40 focus:border-indigo focus:ring-indigo/10')} />
        {ok && <Icon name="check" size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-leaf" />}
      </div>
    </div>
  );
}
