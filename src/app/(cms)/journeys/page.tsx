'use client';
import { useRouter } from 'next/navigation';
import { Button, Icon, PageHeader, Pill, toast } from '@/components/ui';
import { ROLE_NAME, type Role } from '@/lib/domain/access';
import type { Lang } from '@/lib/domain/content';
import type { Env } from '@/lib/domain/publishing';
import { act } from '@/lib/store';

type Journey = {
  id: string; title: string; role: Role; priority?: string; goal: string; steps: string[]; look: string;
  start: { route: string; open?: string; node?: string; lang?: Lang; env?: Env; issues?: boolean };
};

const JOURNEYS: Journey[] = [
  {
    id: 'J1', title: 'See where everything stands', role: 'cm', goal: 'Praveen’s first scenario: open the library and see every epic and story, its on/off state and its language coverage.',
    steps: ['Read the Library table', 'Switch between Epics and Bedtime stories', 'Flip the top bar to Production to see what families see'],
    look: 'Can you tell in five seconds which book is holding up Telugu?', start: { route: '/library', env: 'staging' },
  },
  {
    id: 'J2', title: 'Fix out-of-date Telugu audio', role: 'cm', priority: 'Priority 1', goal: 'A Telugu sentence was corrected during testing, so its audio no longer matches.',
    steps: ['The female voice shows “Out of date”', 'Edit the sentence if needed, then click outside the box to save', 'Regenerate the voice, play it (words highlight), approve it', 'Do the same for any other voice marked out of date'],
    look: 'Is it obvious which voices need redoing after a text change?', start: { route: '/edit', open: 'ramayana', node: 'r-s1-c2-sc1-k1', lang: 'te', env: 'staging' },
  },
  {
    id: 'J3', title: 'Upload a recorded audio file', role: 'cm', priority: 'Priority 1', goal: 'The male Telugu voice is missing; a volunteer recorded it by hand.',
    steps: ['Upload an audio file on the male voice', 'A transcript is made from it as a draft', 'Play and approve'],
    look: 'Upload and generate sit side by side: is the choice clear?', start: { route: '/edit', open: 'ramayana', node: 'r-s1-c1-sc2-k2', lang: 'te', env: 'staging' },
  },
  {
    id: 'J4', title: 'Translate a quiz into Kannada', role: 'cm', priority: 'Priority 1', goal: 'Fill in the missing Kannada for the chapter quiz.',
    steps: ['Pick the question with a red dot', 'Type the Kannada under each English line', 'Note the correct answer and option order are locked to English'],
    look: 'Is it clear what a translator may and may not change?', start: { route: '/edit', open: 'ramayana', node: 'r-s1-c1-q', lang: 'kn', env: 'staging' },
  },
  {
    id: 'J5', title: 'Validate, fix, and send for review', role: 'cm', priority: 'Priority 2', goal: 'A new bedtime story has an error. Find it, fix it, send it on.',
    steps: ['Validation is open on the right', 'Click the error to jump to it', 'Regenerate and approve the missing voice', 'Send for review'],
    look: 'Does jumping from an error to the exact chunk feel fast?', start: { route: '/edit', open: 'dhruva', lang: 'en', env: 'staging', issues: true },
  },
  {
    id: 'J6', title: 'Promote and switch on', role: 'sa', goal: 'Book of Datta is approved in all three languages. Put it live.',
    steps: ['Press Promote to production', 'Confirm the match, review the changes, read the 17 checks', 'Run the dry run, type the name and “production”', 'It lands with Telugu and Kannada off: open it in production and switch them on'],
    look: 'Does this feel safe enough for a database 1,000+ families use?', start: { route: '/edit', open: 'datta', env: 'staging' },
  },
  {
    id: 'J7', title: 'Add a new bedtime story', role: 'cm', priority: 'Priority 2', goal: 'Start a story from nothing.',
    steps: ['Press + New bedtime story', 'Title, description, cover, themes and characters', 'Write the first chunk and generate its voices', 'Add scenes and chunks as needed'],
    look: 'Is anything missing that the content team would need on day one?', start: { route: '/library', env: 'staging' },
  },
  {
    id: 'J8', title: 'A Content Manager can’t touch production', role: 'cm', goal: 'Check the guardrail from the plan and the meeting.',
    steps: ['The editor opens in production, read-only', 'Every switch and button explains why it is locked', 'Promote is Super Admin only'],
    look: 'Are the locked states clear rather than confusing?', start: { route: '/edit', open: 'ramayana', env: 'production' },
  },
  {
    id: 'J9', title: 'See who changed what', role: 'support', goal: 'Answer “who changed this, and when?”.',
    steps: ['Filter by environment', 'Search by item or action', 'Read before and after'],
    look: 'Would this answer a question from Dattu after a bad edit?', start: { route: '/activity' },
  },
];

export default function Journeys() {
  const router = useRouter();
  const go = (j: Journey) => {
    const { route, open, node, lang, env, issues } = j.start;
    act.role(j.role);
    if (env) act.env(env);
    if (open) act.open(open, { node, lang, env, role: j.role });
    if (issues) act.issues(true);
    toast(`${j.id} · ${j.title}`, { tone: 'info', sub: `Viewing as ${ROLE_NAME[j.role]}${env ? ` on ${env}` : ''}.` });
    router.push(route);
  };
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader title="User journeys"
        sub="The paths to walk through in Tuesday’s review. Start sets the right role, environment and screen. Priority 1 is Telugu and Kannada for the existing books; Priority 2 is bedtime stories." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {JOURNEYS.map((j) => (
          <article key={j.id} className="group flex flex-col rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-indigo/30 hover:shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-7 min-w-9 place-items-center rounded-md bg-ink px-1.5 font-mono text-xs font-semibold text-white">{j.id}</span>
              <Pill icon="user" tone={j.role === 'sa' ? 'coral' : j.role === 'support' ? 'neutral' : 'indigo'}>{ROLE_NAME[j.role]}</Pill>
              {j.priority && <Pill tone="leaf">{j.priority}</Pill>}
            </div>
            <h2 className="mt-3 font-display text-lg leading-snug font-bold">{j.title}</h2>
            <p className="mt-1 text-sm text-muted">{j.goal}</p>
            <ol className="mt-4 space-y-2 text-sm">
              {j.steps.map((s, i) => (
                <li key={s} className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bg font-mono text-[11px] font-semibold text-muted ring-1 ring-line">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex gap-2 rounded-lg border border-amber/20 bg-sun px-3 py-2 text-sm">
              <Icon name="eye" size={15} className="mt-0.5 text-amber" />
              <span><span className="font-semibold">Look for: </span>{j.look}</span>
            </p>
            <div className="mt-4 flex flex-1 items-end"><Button variant="primary" onClick={() => go(j)}>Start {j.id}<Icon name="arrowRight" size={15} /></Button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
