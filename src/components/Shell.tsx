'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ROLE_NAME, type Role } from '@/lib/domain/access';
import type { Env } from '@/lib/domain/publishing';
import { act, useApp } from '@/lib/store';
import { Confirm, Icon, type IconName, PageSkeleton, Segmented, Toaster, cx, toast } from './ui';

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/library', label: 'Library', icon: 'library' },
  { href: '/edit', label: 'Editor', icon: 'edit' },
  { href: '/activity', label: 'Activity', icon: 'activity' },
];
const REVIEW: { href: string; label: string; icon: IconName }[] = [
  { href: '/journeys', label: 'Journeys', icon: 'map' },
  { href: '/wireframes', label: 'Wireframes', icon: 'layout' },
];

// Layout: from lg (1024px) up, a fixed sidebar and a header with every control (the desktop design).
// Below lg, a compact top bar with a menu button; the navigation and the header controls move into a drawer.
export function Shell({ children }: { children: ReactNode }) {
  const s = useApp();
  const router = useRouter();
  const path = usePathname();
  const [resetOpen, setResetOpen] = useState(false);
  // The drawer remembers the page it was opened on, so navigating anywhere closes it (no effect needed).
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === path;
  const setMenuOpen = (open: boolean) => setMenuOpenOn(open ? path : null);
  const drawer = useRef<HTMLDialogElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (s && !s.ui.signedIn) router.replace('/'); }, [s, router]);
  useEffect(() => {
    const d = drawer.current;
    if (!d) return;
    if (menuOpen && !d.open) d.showModal();
    if (!menuOpen && d.open) d.close();
  }, [menuOpen]);
  if (!s || !s.ui.signedIn) return <div className="h-screen bg-bg"><PageSkeleton /></div>;
  const { env, role } = s.ui;
  const prod = env === 'production';

  const navLink = (n: (typeof NAV)[number]) => {
    const here = path === n.href || path.startsWith(`${n.href}/`);
    return (
      <li key={n.href}>
        <Link href={n.href} aria-current={here ? 'page' : undefined} onClick={() => setMenuOpen(false)}
          className={cx('flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors duration-200 pointer-coarse:h-11',
            here ? 'bg-tint text-indigo' : 'text-muted hover:bg-bg hover:text-ink')}>
          <Icon name={n.icon} size={16} className={here ? 'text-indigo' : 'text-faint'} />{n.label}
        </Link>
      </li>
    );
  };
  const navList = (
    <nav aria-label="Main">
      <ul className="space-y-0.5">{NAV.map(navLink)}</ul>
      <p className="mt-6 mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">For the review</p>
      <ul className="space-y-0.5">{REVIEW.map(navLink)}</ul>
    </nav>
  );
  const statusCard = (
    <div className={cx('rounded-xl border px-3 py-2.5 text-xs', prod ? 'border-coral/40 bg-coral-tint' : 'border-line bg-bg')}>
      <div className="flex items-center gap-1.5 font-semibold text-ink">
        <span className={cx('h-2 w-2 rounded-full', prod ? 'bg-coral' : 'bg-indigo')} aria-hidden />
        {prod ? 'Production' : 'Staging'}
      </div>
      <p className="mt-0.5 text-muted">{ROLE_NAME[role]} · {role === 'support' ? 'view only' : prod ? (role === 'sa' ? 'switch on/off, promote' : 'view only') : 'can edit'}</p>
    </div>
  );
  const envSwitch = (
    <Segmented<Env> label="Environment" value={env} onChange={(e) => { if (e !== env) { act.env(e); toast(`Switched to ${e}`, { tone: 'info', sub: e === 'production' ? 'The live app. Editing is locked here.' : 'Where all editing happens.' }); } }}
      items={[{ value: 'staging', label: 'Staging' }, { value: 'production', label: <><Icon name="shield" size={13} />Production</> }]}
      tone={(v) => (v === 'production' ? 'bg-coral text-ink shadow-sm' : undefined)} />
  );
  const roleSelect = (id: string, full?: boolean) => (
    <div className="relative">
      <Icon name="user" size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted" />
      <select id={id} value={role} onChange={(e) => { act.role(e.target.value as Role); toast(`Now viewing as ${ROLE_NAME[e.target.value as Role]}`, { tone: 'info' }); }}
        className={cx('h-9 appearance-none rounded-lg border border-line bg-surface pr-8 pl-8 text-sm font-medium shadow-xs transition-colors duration-200 hover:border-indigo/40 focus:border-indigo pointer-coarse:h-11', full && 'w-full')}>
        {(Object.keys(ROLE_NAME) as Role[]).map((r) => <option key={r} value={r}>{ROLE_NAME[r]}</option>)}
      </select>
      <Icon name="chevronDown" size={14} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted" />
    </div>
  );
  const plain = 'flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition-colors duration-200 hover:bg-bg hover:text-ink pointer-coarse:h-11 pointer-coarse:min-w-11';
  const signOut = () => { act.signOut(); router.push('/'); };
  const badge = <span className="rounded-md border border-amber/20 bg-sun px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-amber uppercase">Prototype · sample data</span>;

  // Focus trap: Tab and Shift+Tab wrap inside the open drawer.
  const trap = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const f = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, input, [tabindex="0"]'));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="flex min-h-screen flex-col lg:h-screen">
      <div className="sticky top-0 z-30 lg:static">
        {prod && (
          <div className="flex items-center justify-center gap-2 bg-coral px-4 py-1.5 text-center text-[13px] font-semibold text-ink" role="status">
            <Icon name="shield" size={14} />
            <span>PRODUCTION<span className="hidden sm:inline"> · the live app 1,000+ families use</span> · {role === 'sa' ? 'Super Admin: promote, switch on and off only' : 'view only'}</span>
          </div>
        )}
        <header className={cx('flex h-14 shrink-0 items-center gap-2 border-b bg-surface px-2 sm:gap-4 sm:px-4', prod ? 'border-coral' : 'border-line')}>
          <button ref={menuBtn} type="button" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="menu-drawer" onClick={() => setMenuOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-ink transition-colors duration-200 hover:bg-bg lg:hidden">
            <Icon name="menu" size={20} />
          </button>
          <Link href="/library" className="flex min-w-0 items-center gap-2.5 rounded-lg pr-2 pointer-coarse:min-h-11">
            <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo font-display text-sm font-bold text-white">DV</span>
            <span className="truncate font-display text-[16px] font-bold tracking-tight">Datta Vani <span className="text-indigo">CMS</span></span>
          </Link>
          <span className="hidden sm:inline">{badge}</span>

          {/* Desktop header controls. Below xl the labels and two button texts shrink to icons so it fits a 1024px tablet. */}
          <div className="ml-3 hidden items-center gap-2 lg:flex">
            <span className="text-xs font-medium text-muted max-xl:sr-only">Environment</span>
            {envSwitch}
          </div>
          <div className="ml-auto hidden items-center gap-1.5 lg:flex">
            <label htmlFor="role" className="mr-1 text-xs font-medium text-muted max-xl:sr-only">Viewing as</label>
            {roleSelect('role')}
            <span className="mx-1.5 h-6 w-px bg-line" aria-hidden />
            <button type="button" onClick={() => setResetOpen(true)} className={plain} title="Reset demo data">
              <Icon name="reset" size={14} /><span className="max-xl:sr-only">Reset demo data</span>
            </button>
            <button type="button" onClick={signOut} className={plain} title="Sign out">
              <Icon name="logout" size={14} /><span className="max-xl:sr-only">Sign out</span>
            </button>
          </div>
          {/* Small screens: the current environment at a glance; the switch itself is in the menu. */}
          <span className={cx('ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold lg:hidden',
            prod ? 'border-coral/40 bg-coral-tint text-coral-deep' : 'border-indigo/20 bg-tint text-indigo-deep')}>
            <span className={cx('h-1.5 w-1.5 rounded-full', prod ? 'bg-coral' : 'bg-indigo')} aria-hidden />{prod ? 'Production' : 'Staging'}
          </span>
        </header>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-52 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
          {navList}
          <div className="mt-auto">{statusCard}</div>
        </div>
        <main className={cx('relative min-w-0 flex-1 lg:overflow-y-auto', prod && 'bg-[#FBF7F6]')}>{children}</main>
      </div>

      {/* Navigation drawer (below lg). A modal dialog: the page behind is inert, Escape closes it. */}
      <dialog ref={drawer} id="menu-drawer" aria-label="Menu" onClose={() => { setMenuOpen(false); menuBtn.current?.focus(); }} onKeyDown={trap}
        onClick={(e) => { if (e.target === drawer.current) setMenuOpen(false); }}
        className="m-0 h-dvh max-h-none w-[min(20rem,calc(100vw-3rem))] max-w-none border-r border-line bg-surface p-0 text-ink shadow-xl open:flex open:flex-col lg:hidden">
        {menuOpen && (
          <div className="scroll-thin flex flex-1 flex-col gap-5 overflow-y-auto px-3 pt-2 pb-4">
            <div className="flex items-center justify-between pl-3">
              {badge}
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-bg hover:text-ink">
                <Icon name="x" size={18} />
              </button>
            </div>
            {navList}
            <div className="space-y-4 border-t border-line px-3 pt-5">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Environment</p>
                {envSwitch}
              </div>
              <div>
                <label htmlFor="role-drawer" className="mb-1.5 block text-xs font-medium text-muted">Viewing as</label>
                {roleSelect('role-drawer', true)}
              </div>
              <div className="-mx-2.5 flex flex-wrap gap-1">
                <button type="button" onClick={() => { setMenuOpen(false); setResetOpen(true); }} className={plain}><Icon name="reset" size={14} />Reset demo data</button>
                <button type="button" onClick={signOut} className={plain}><Icon name="logout" size={14} />Sign out</button>
              </div>
            </div>
            <div className="mt-auto">{statusCard}</div>
          </div>
        )}
      </dialog>

      <Confirm open={resetOpen} title="Reset all sample data?" confirmLabel="Reset demo data" tone="danger" icon="reset"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => { act.reset(); setResetOpen(false); toast('Sample data reset', { sub: 'Everything is back to the starting state.' }); }}>
        Every edit, promote and log entry in this browser goes back to the starting state. Other reviewers are not affected.
      </Confirm>
      <Toaster />
    </div>
  );
}
