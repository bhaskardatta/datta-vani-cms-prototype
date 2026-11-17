'use client';
import Link from 'next/link';
import {
  useEffect, useRef, useSyncExternalStore,
  type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/** "5 min ago", "3 h ago", or a short date. */
export const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ---------- icons: one Feather-style set, 24px grid, stroke only ----------
const P: Record<string, ReactNode> = {
  library: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>,
  book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
  story: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  section: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  chapter: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
  scene: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
  chunk: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  quiz: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  chevronRight: <polyline points="9 18 15 12 9 6" />,
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  check: <polyline points="20 6 9 17 4 12" />,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  error: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  play: <polygon points="7 4 20 12 7 20 7 4" fill="currentColor" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />,
  refresh: <><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  promote: <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  reset: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
  checks: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  file: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  power: <><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></>,
  menu: <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
};
export type IconName = keyof typeof P;
export const Icon = ({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cx('shrink-0', className)}>
    {P[name]}
  </svg>
);
export const LockIcon = () => <Icon name="lock" size={12} />;
export const Spinner = ({ className }: { className?: string }) => (
  <span aria-hidden className={cx('inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />
);

// ---------- button ----------
const VARIANT = {
  primary: 'bg-indigo text-white shadow-sm enabled:hover:bg-indigo-deep enabled:hover:shadow-md',
  secondary: 'bg-surface text-ink border border-line shadow-xs enabled:hover:border-indigo/40 enabled:hover:bg-tint/60',
  ghost: 'text-ink enabled:hover:bg-ink/[0.05]',
  danger: 'bg-danger text-white shadow-sm enabled:hover:bg-danger-deep',
  prod: 'bg-coral text-ink shadow-sm enabled:hover:brightness-95',
};

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT; size?: 'xs' | 'sm' | 'md';
  icon?: IconName; loading?: boolean;
  /** When set, the button is disabled and this is the reason shown to the user. */
  blocked?: string | null;
};
export function Button({ variant = 'secondary', size = 'md', icon, loading, blocked, className, disabled, title, children, type = 'button', ...p }: BtnProps) {
  const off = disabled || loading || !!blocked;
  return (
    <button
      {...p} type={type} disabled={off} title={blocked ?? title} aria-busy={loading || undefined}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap select-none',
        'transition-[background-color,border-color,box-shadow,transform,filter] duration-200 ease-out enabled:active:translate-y-px enabled:active:shadow-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        size === 'xs' ? 'h-7 px-2 text-xs' : size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm', 'pointer-coarse:h-11 pointer-coarse:min-w-11', VARIANT[variant], className,
      )}
    >
      {loading ? <Spinner /> : blocked ? <LockIcon /> : icon && <Icon name={icon} size={size === 'md' ? 16 : 14} />}
      {children}
    </button>
  );
}

/** A link styled as the primary button (empty states point back to the Library with it). */
export const LinkButton = ({ href, icon, children }: { href: string; icon?: IconName; children: ReactNode }) => (
  <Link href={href} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-indigo px-4 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-deep pointer-coarse:h-11">
    {icon && <Icon name={icon} />}{children}
  </Link>
);

// ---------- pills, dots ----------
const TONE = {
  neutral: 'bg-bg text-muted border-line',
  indigo: 'bg-tint text-indigo-deep border-indigo/20',
  leaf: 'bg-leaf-tint text-leaf border-leaf/20',
  amber: 'bg-amber-tint text-amber border-amber/20',
  danger: 'bg-danger-tint text-danger border-danger/20',
  coral: 'bg-coral-tint text-coral-deep border-coral/40',
};
const DOT = { neutral: 'bg-line-strong', indigo: 'bg-indigo', leaf: 'bg-leaf', amber: 'bg-amber', danger: 'bg-danger', coral: 'bg-coral' };
export type Tone = keyof typeof TONE;
export const STATUS_TONE = { ready: 'leaf', in_review: 'indigo', draft: 'neutral' } as const satisfies Record<string, Tone>;
export const Pill = ({ tone = 'neutral', icon, dot, children, className }: { tone?: Tone; icon?: IconName; dot?: boolean; children: ReactNode; className?: string }) => (
  <span className={cx('inline-flex h-[22px] items-center gap-1 rounded-full border px-2 text-xs font-semibold whitespace-nowrap', TONE[tone], className)}>
    {dot && <span className={cx('h-1.5 w-1.5 rounded-full', DOT[tone])} />}
    {icon && <Icon name={icon} size={12} />}
    {children}
  </span>
);
export const Dot = ({ tone, label }: { tone: Tone; label?: string }) => (
  <span className={cx('inline-block h-2 w-2 shrink-0 rounded-full', DOT[tone])} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />
);

// ---------- switch ----------
export function Switch({ on, onChange, label, blocked, size = 'md', hint }: { on: boolean; onChange: (v: boolean) => void; label: string; blocked?: string | null; size?: 'sm' | 'md'; hint?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} disabled={!!blocked} title={blocked ?? hint ?? label}
      onClick={() => onChange(!on)}
      className="group inline-flex items-center gap-2.5 rounded-full text-sm font-medium disabled:cursor-not-allowed pointer-coarse:min-h-11"
    >
      <span className={cx('relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200',
        size === 'sm' ? 'h-5 w-9' : 'h-6 w-11', on ? 'bg-leaf' : 'bg-faint',
        blocked ? 'opacity-50' : on ? 'group-hover:bg-[#145F3F]' : 'group-hover:bg-muted')}>
        <span className={cx('absolute left-0.5 grid place-items-center rounded-full bg-white shadow-sm transition-transform duration-200',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', on && (size === 'sm' ? 'translate-x-4' : 'translate-x-5'))}>
          {blocked && <Icon name="lock" size={9} className="text-muted" />}
        </span>
      </span>
      <span className={cx(blocked && 'text-muted')}>{label}</span>
    </button>
  );
}

// ---------- meter ----------
export function Meter({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct === 100 ? 'bg-leaf' : pct >= 50 ? 'bg-indigo' : pct > 0 ? 'bg-coral' : 'bg-transparent';
  return (
    <div className="flex min-w-[96px] items-center gap-2" title={`${label}: ${pct}% of chunks have text and approved audio`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={cx('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cx('w-9 text-right font-mono text-xs tabular-nums', pct === 100 ? 'text-leaf' : 'text-muted')}>{pct}%</span>
    </div>
  );
}

// ---------- modal and confirm ----------
// Safari does not focus a button when it is clicked, so a dialog cannot rely on document.activeElement to know
// where to send focus back to on close. Remember the last control the pointer pressed instead.
let lastPressed: HTMLElement | null = null;
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (e) => { lastPressed = (e.target as Element | null)?.closest<HTMLElement>('button, a[href], [tabindex]') ?? null; }, true);
}

export function Modal({ open, onClose, title, children, wide, footer, icon, tone = 'indigo' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
  footer?: ReactNode; icon?: IconName; tone?: 'indigo' | 'coral' | 'danger';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      const a = document.activeElement as HTMLElement | null;
      opener.current = a && a !== document.body ? a : lastPressed;
      d.showModal();
    }
    if (!open) {
      if (d.open) d.close();
      if (opener.current?.isConnected) opener.current.focus();
      opener.current = null;
    }
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-label={title}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={cx('m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] flex-col overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl open:flex', wide ? 'max-w-2xl' : 'max-w-md')}>
      {open && (
        <>
          <div className="flex shrink-0 items-start gap-3 px-5 pt-5 sm:px-6">
            {icon && (
              <span className={cx('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full',
                { indigo: 'bg-tint text-indigo', coral: 'bg-coral-tint text-coral-deep', danger: 'bg-danger-tint text-danger' }[tone])}>
                <Icon name={icon} size={18} />
              </span>
            )}
            <h2 className="flex-1 pt-1 font-display text-lg leading-snug font-bold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-bg hover:text-ink pointer-coarse:h-11 pointer-coarse:w-11">
              <Icon name="x" />
            </button>
          </div>
          <div className={cx('min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-5 text-sm text-muted sm:px-6', icon && 'sm:pl-[72px]')}>{children}</div>
          {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-bg/60 px-5 py-3.5 sm:px-6">{footer}</div>}
        </>
      )}
    </dialog>
  );
}

/** A yes/no question in a Modal. Replaces window.confirm. */
export function Confirm({ open, title, children, confirmLabel, tone = 'indigo', icon = 'alert', onConfirm, onCancel }: {
  open: boolean; title: string; children: ReactNode; confirmLabel: string; tone?: 'indigo' | 'coral' | 'danger'; icon?: IconName;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} icon={icon} tone={tone}
      footer={<>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant={tone === 'danger' ? 'danger' : tone === 'coral' ? 'prod' : 'primary'} onClick={onConfirm} autoFocus>{confirmLabel}</Button>
      </>}>
      {children}
    </Modal>
  );
}

// ---------- toasts ----------
type ToastT = { id: number; msg: string; tone: 'success' | 'info' | 'danger'; sub?: string };
let toasts: ToastT[] = [];
const NONE: ToastT[] = [];
const tSubs = new Set<() => void>();
const emit = () => tSubs.forEach((f) => f());
const dismiss = (id: number) => { toasts = toasts.filter((t) => t.id !== id); emit(); };
export function toast(msg: string, opts: { tone?: ToastT['tone']; sub?: string } = {}) {
  const id = Date.now() + Math.random();
  toasts = [...toasts.slice(-3), { id, msg, tone: opts.tone ?? 'success', sub: opts.sub }];
  emit();
  window.setTimeout(() => dismiss(id), 4200);
}
export function Toaster() {
  const list = useSyncExternalStore((cb) => { tSubs.add(cb); return () => { tSubs.delete(cb); }; }, () => toasts, () => NONE);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed right-5 bottom-5 z-50 flex w-[360px] max-w-[calc(100%-40px)] flex-col gap-2">
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg">
          <Icon name={t.tone === 'success' ? 'checkCircle' : t.tone === 'danger' ? 'error' : 'info'} size={18}
            className={cx('mt-px', t.tone === 'success' ? 'text-[#7EE2B5]' : t.tone === 'danger' ? 'text-[#FFA899]' : 'text-[#B9B0FF]')} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{t.msg}</p>
            {t.sub && <p className="mt-0.5 text-[13px] text-white/75">{t.sub}</p>}
          </div>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-white/70 pointer-coarse:-my-2.5 pointer-coarse:h-11 pointer-coarse:w-11 transition-colors duration-200 hover:bg-white/10 hover:text-white">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------- tabs and segmented control ----------
// Arrow keys move between options (roving focus), as the ARIA tabs pattern expects.
function arrowNav(e: KeyboardEvent<HTMLElement>, values: string[], value: string, onChange: (v: string) => void) {
  const i = values.indexOf(value);
  const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: values.length - 1 }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  const v = values[(to + values.length) % values.length];
  onChange(v);
  (e.currentTarget.querySelector(`[data-v="${v}"]`) as HTMLElement | null)?.focus();
}

export function Tabs<T extends string>({ label, value, onChange, items, className }: {
  label: string; value: T; onChange: (v: T) => void; className?: string;
  items: { value: T; label: ReactNode; extra?: ReactNode }[];
}) {
  return (
    <div role="tablist" aria-label={label} className={cx('flex gap-1', className)}
      onKeyDown={(e) => arrowNav(e, items.map((x) => x.value), value, onChange as (v: string) => void)}>
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} data-v={t.value} role="tab" type="button" aria-selected={on} tabIndex={on ? 0 : -1} onClick={() => onChange(t.value)}
            className={cx('relative -mb-px flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 sm:gap-2 sm:px-3.5',
              on ? 'border-indigo text-indigo' : 'border-transparent text-muted hover:border-line-strong hover:text-ink')}>
            {t.label}{t.extra}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string>({ label, value, onChange, items, tone }: {
  label: string; value: T; onChange: (v: T) => void;
  items: { value: T; label: ReactNode }[]; tone?: (v: T) => string | undefined;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg bg-bg p-0.5 ring-1 ring-line">
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button key={t.value} type="button" aria-pressed={on} onClick={() => onChange(t.value)}
            className={cx('flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] pointer-coarse:h-11 pointer-coarse:min-w-11 font-semibold capitalize transition-[background-color,color,box-shadow] duration-200',
              on ? (tone?.(t.value) ?? 'bg-surface text-indigo shadow-sm') : 'text-muted hover:bg-surface/60 hover:text-ink')}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------- layout pieces ----------
export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section className={cx('rounded-2xl border border-line bg-surface shadow-xs', className)}>{children}</section>
);

export const Label = ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">{children}</label>
);

export const PageHeader = ({ title, sub, actions, crumb }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; crumb?: ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <div className="min-w-0">
      {crumb && <div className="mb-1.5 text-xs text-muted">{crumb}</div>}
      <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight">{title}</h1>
      {sub && <p className="mt-1 max-w-2xl text-[15px] text-muted">{sub}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export function StatTile({ label, value, sub, icon, tone = 'indigo' }: { label: string; value: ReactNode; sub?: ReactNode; icon: IconName; tone?: Tone }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-5 py-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={cx('grid h-8 w-8 place-items-center rounded-lg border', TONE[tone])}><Icon name={icon} size={16} /></span>
      </div>
      <div className="mt-1 font-display text-[32px] leading-none font-bold tracking-tight tabular-nums">{value}</div>
      {sub && <div className="mt-2 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={cx('animate-pulse rounded-lg bg-line/70', className)} />;

/** Shown for the one frame before the browser store loads. */
export const PageSkeleton = () => (
  <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-8 w-56" />
    <Skeleton className="mt-3 h-4 w-full max-w-96" />
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
    <Skeleton className="mt-6 h-72 rounded-2xl" />
  </div>
);

export const Empty = ({ title, icon = 'info', children, action }: { title: string; icon?: IconName; children?: ReactNode; action?: ReactNode }) => (
  <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-tint text-indigo"><Icon name={icon} size={22} /></span>
    <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
    {children && <div className="mt-2 text-muted">{children}</div>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-grid h-5 min-w-5 place-items-center rounded border border-line bg-surface px-1 font-mono text-[11px] text-muted shadow-xs">{children}</kbd>
);

/** Small banner: info, warning, read-only. */
export const Notice = ({ tone = 'amber', icon = 'lock', children, className }: { tone?: 'amber' | 'indigo' | 'leaf' | 'danger' | 'coral'; icon?: IconName; children: ReactNode; className?: string }) => (
  <div className={cx('flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-sm', {
    amber: 'border-amber/20 bg-sun text-ink', indigo: 'border-indigo/20 bg-tint text-ink', leaf: 'border-leaf/25 bg-leaf-tint text-ink',
    danger: 'border-danger/20 bg-danger-tint text-ink', coral: 'border-coral/40 bg-coral-tint text-ink',
  }[tone], className)}>
    <Icon name={icon} size={16} className={cx('mt-0.5', { amber: 'text-amber', indigo: 'text-indigo', leaf: 'text-leaf', danger: 'text-danger', coral: 'text-coral-deep' }[tone])} />
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
