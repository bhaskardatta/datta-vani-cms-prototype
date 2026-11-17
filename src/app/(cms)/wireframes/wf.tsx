// Low-fidelity wireframe primitives. Greyscale on purpose: boxes, bars and
// monospace labels, so nobody mistakes a wireframe for the finished design.
// Self-contained (no imports from src/components) so other edits can't break it.
import type { ReactNode } from 'react';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/** Numbered annotation marker. Indigo = annotation layer, not part of the UI. */
export const N = ({ n }: { n: number }) => (
  <span role="img" aria-label={`Note ${n}`}
    className="inline-grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-indigo px-1 font-mono text-[10px] leading-none font-bold text-white ring-2 ring-white">
    {n}
  </span>
);

/** Placeholder for a line of text. */
export const T = ({ w = 'w-24', dark, thick }: { w?: string; dark?: boolean; thick?: boolean }) => (
  <span aria-hidden className={cx('inline-block shrink-0 rounded-sm align-middle', thick ? 'h-3' : 'h-2', dark ? 'bg-neutral-500' : 'bg-neutral-300', w)} />
);

/** Real words, where the words matter (labels, key copy). */
export const L = ({ children, b, dim, className }: { children: ReactNode; b?: boolean; dim?: boolean; className?: string }) => (
  <span className={cx('font-mono text-[11px] leading-tight', b ? 'font-bold text-neutral-800' : dim ? 'text-[#666]' : 'text-neutral-600', className)}>{children}</span>
);

export const H = ({ children }: { children: ReactNode }) => (
  <div className="font-mono text-[15px] font-bold tracking-tight text-neutral-800">{children}</div>
);

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'locked' | 'danger';
/** Button. `locked` = visible but disabled, always with a reason. */
export const B = ({ kind = 'secondary', children, why }: { kind?: BtnKind; children: ReactNode; why?: string }) => (
  <span className="inline-flex flex-col items-start gap-0.5">
    <span className={cx('inline-flex h-6 items-center gap-1 rounded px-2 font-mono text-[10.5px] whitespace-nowrap',
      kind === 'primary' && 'bg-neutral-800 font-bold text-white',
      kind === 'secondary' && 'border border-neutral-500 bg-white text-neutral-700',
      kind === 'ghost' && 'text-neutral-600 underline decoration-neutral-300 underline-offset-2',
      kind === 'danger' && 'border-2 border-neutral-800 bg-white font-bold text-neutral-800',
      kind === 'locked' && 'border border-dashed border-neutral-400 bg-neutral-100 text-[#666]')}>
      {kind === 'locked' && <Lock />}{children}
    </span>
    {why && <span className="font-mono text-[9.5px] text-neutral-500 italic">“{why}”</span>}
  </span>
);

export const Lock = () => (
  <svg aria-hidden width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);

type PillKind = 'solid' | 'outline' | 'dashed' | 'striped';
/** Status pill. Shape and fill carry the meaning, never colour alone. */
export const P = ({ kind = 'outline', children }: { kind?: PillKind; children: ReactNode }) => (
  <span className={cx('inline-flex h-[18px] items-center gap-1 rounded-full px-1.5 font-mono text-[9.5px] whitespace-nowrap',
    kind === 'solid' && 'bg-neutral-700 text-white',
    kind === 'outline' && 'border border-neutral-500 text-neutral-700',
    kind === 'dashed' && 'border border-dashed border-neutral-500 text-neutral-600',
    kind === 'striped' && 'wf-stripe border border-neutral-500 font-bold text-neutral-800')}>
    {children}
  </span>
);

/** On/off switch. */
export const Sw = ({ on, label, locked }: { on: boolean; label?: string; locked?: boolean }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={cx('relative inline-block h-3.5 w-6 rounded-full border', on ? 'border-neutral-800 bg-neutral-800' : 'border-neutral-400 bg-white', locked && 'opacity-50')}>
      <span className={cx('absolute top-px h-2.5 w-2.5 rounded-full', on ? 'right-px bg-white' : 'left-px bg-neutral-400')} />
    </span>
    {locked && <Lock />}
    {label && <L dim={locked}>{label}</L>}
  </span>
);

/** Text input. `missing` = dashed (nothing typed yet); `ro` = read-only grey. */
export const In = ({ w = 'w-full', rows = 1, missing, ro, children }: { w?: string; rows?: number; missing?: boolean; ro?: boolean; children?: ReactNode }) => (
  <div className={cx('flex flex-col justify-center gap-1.5 rounded px-2', w, rows > 1 ? 'py-2' : 'h-7',
    missing ? 'border border-dashed border-neutral-500 bg-white' : ro ? 'border border-neutral-300 bg-neutral-100' : 'border border-neutral-500 bg-white')}>
    {children ?? (missing ? <L dim>type the translation…</L> : Array.from({ length: rows }, (_, i) => <T key={i} w={i === rows - 1 && rows > 1 ? 'w-2/3' : 'w-5/6'} dark={!ro} />))}
  </div>
);

/** A region of the screen. */
export const Box = ({ children, className, dashed, label }: { children?: ReactNode; className?: string; dashed?: boolean; label?: string }) => (
  <div className={cx('rounded border bg-white', dashed ? 'border-dashed border-neutral-400' : 'border-neutral-300', className)}>
    {label && <div className="border-b border-neutral-200 px-2 py-1"><L dim>{label}</L></div>}
    {children}
  </div>
);

/** Honest image placeholder. */
export const Img = ({ label, className }: { label: string; className?: string }) => (
  <div className={cx('wf-hatch grid place-items-center rounded border border-neutral-300', className)}><L dim>{label}</L></div>
);

/** Coverage bar. */
export const Bar = ({ v }: { v: number }) => (
  <span className="inline-flex items-center gap-1">
    <span className="inline-block h-1.5 w-12 overflow-hidden rounded-full bg-neutral-200"><span className="block h-full bg-neutral-600" style={{ width: `${v}%` }} /></span>
    <L dim>{v}%</L>
  </span>
);

export const Row = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx('flex items-center gap-2', className)}>{children}</div>
);

type Env = 'staging' | 'production';
type Role = 'Content Manager' | 'Super Admin' | 'Support Lead';
const NAV = ['Library', 'Editor', 'Activity', 'Journeys'];

/** The app frame: top bar (env + role), optional production banner, left nav. */
export function Frame({ env = 'staging', role = 'Content Manager', nav, children, bare }: {
  env?: Env; role?: Role; nav?: string; children: ReactNode; bare?: boolean;
}) {
  const prod = env === 'production';
  return (
    <div className="overflow-hidden rounded-md border-2 border-neutral-700 bg-neutral-50 select-none">
      {prod && !bare && (
        <div className="wf-stripe border-b border-neutral-700 py-1 text-center"><L b>PRODUCTION · the live app · {role === 'Super Admin' ? 'promote, switch on/off only' : 'view only'}</L></div>
      )}
      {!bare && (
        <div className="flex h-9 items-center gap-3 border-b border-neutral-300 bg-white px-3">
          <L b>DATTA VANI CMS</L>
          <span className="flex overflow-hidden rounded border border-neutral-500">
            <span className={cx('px-1.5 font-mono text-[10px]', !prod ? 'bg-neutral-800 font-bold text-white' : 'text-neutral-500')}>staging</span>
            <span className={cx('px-1.5 font-mono text-[10px]', prod ? 'wf-stripe font-bold text-neutral-900' : 'text-neutral-500')}>production</span>
          </span>
          <span className="ml-auto flex items-center gap-2"><L dim>viewing as</L><span className="rounded border border-neutral-400 px-1.5"><L>{role} ▾</L></span><L dim>reset · sign out</L></span>
        </div>
      )}
      <div className="flex">
        {nav && !bare && (
          <div className="w-[88px] shrink-0 space-y-1 border-r border-neutral-300 bg-white p-2">
            {NAV.map((n) => (
              <div key={n} className={cx('rounded px-1.5 py-0.5 font-mono text-[10px]', n === nav ? 'bg-neutral-200 font-bold text-neutral-900' : 'text-neutral-500')}>{n}</div>
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1 p-3">{children}</div>
      </div>
    </div>
  );
}
