'use client';
import { useRouter } from 'next/navigation';
import { ROLE_NAME, type Role } from '@/lib/domain/access';
import { act } from '@/lib/store';
import { Icon, type IconName } from '@/components/ui';

const PERSONAS: { role: Role; does: string; icon: IconName }[] = [
  { role: 'cm', icon: 'edit', does: 'Edits text, translations, audio, transcripts and quizzes on staging. Sends work for review.' },
  { role: 'sa', icon: 'shield', does: 'Approves, promotes to production, and switches content and languages on or off.' },
  { role: 'support', icon: 'eye', does: 'Looks at content in both environments to answer families’ questions. Changes nothing.' },
];

export default function SignIn() {
  const router = useRouter();
  const go = (role: Role) => { act.signIn(role); router.push('/library'); };
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="grid h-11 w-11 place-items-center rounded-xl bg-indigo font-display text-lg font-bold text-white shadow-md">DV</span>
        <p className="rounded-md border border-amber/20 bg-sun px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber uppercase">Prototype for team review · sample data</p>
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">Datta Vani <span className="text-indigo">CMS</span></h1>
      <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
        Where the content team manages the epics, bedtime stories and quizzes, in English, Telugu and Kannada, before they reach the app.
      </p>

      <h2 className="mt-12 font-display text-lg font-bold">Sign in as</h2>
      <p className="mt-1 text-sm text-muted">The real CMS uses your Datta Vani login and checks your role on the server. Here you pick a role to see what it can do.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {PERSONAS.map((p) => (
          <button key={p.role} type="button" onClick={() => go(p.role)}
            className="group flex flex-col rounded-2xl border border-line bg-surface p-5 text-left shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-indigo/50 hover:shadow-lg active:translate-y-0 active:shadow-sm">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${p.role === 'sa' ? 'bg-coral-tint text-coral-deep' : 'bg-tint text-indigo'}`}><Icon name={p.icon} size={19} /></span>
            <span className="mt-4 font-display text-lg font-bold">{ROLE_NAME[p.role]}</span>
            <span className="mt-2 flex-1 text-sm text-muted">{p.does}</span>
            <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo">Continue <Icon name="arrowRight" size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" /></span>
          </button>
        ))}
      </div>
    </main>
  );
}
