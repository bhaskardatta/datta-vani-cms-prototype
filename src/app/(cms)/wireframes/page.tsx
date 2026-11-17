// Wireframes gallery: low-fidelity, greyscale drawings of every screen and key
// state, with numbered notes. The page chrome uses the app's tokens; the
// drawings themselves stay grey on purpose. Server component: no state needed.
import type { Metadata } from 'next';
import Link from 'next/link';
import { WIREFRAMES, type Group } from './screens';
import { B, N, P, Sw } from './wf';

export const metadata: Metadata = { title: 'Wireframes · Datta Vani CMS' };

const JOURNEYS: Record<string, string> = {
  J1: 'See where everything stands',
  J2: 'Fix a Telugu sentence found during testing',
  J3: 'Upload a recorded audio file instead',
  J4: 'Fix a quiz question in Kannada',
  J5: 'Check and send for review',
  J6: 'Promote and switch on (Super Admin)',
  J7: 'Add a new bedtime story',
  J8: 'A Content Manager is stopped from touching production',
  J9: 'See who changed what',
};
const GROUPS: Group[] = ['Screens', 'Promote wizard', 'Component sheets'];

// Stripes and hatching for the drawings (globals.css is owned by another agent).
const CSS = `
.wf-stripe { background: repeating-linear-gradient(135deg, #e5e5e5 0 4px, #fafafa 4px 8px); }
.wf-hatch { background: repeating-linear-gradient(45deg, #ececec 0 8px, #f7f7f7 8px 16px); }
.flow a rect { transition: stroke 0.2s ease, fill 0.2s ease; }
.flow a:hover rect, .flow a:focus-visible rect { stroke: var(--color-indigo); fill: var(--color-tint); }
.flow a:focus { outline: none; }
`;

export default function WireframesPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <style>{CSS}</style>

      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-indigo uppercase">Low-fidelity · for Tuesday’s review</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Wireframes</h1>
        <p className="mt-2 text-muted">
          One grey drawing per screen and key state, with numbered notes that explain each decision. They are deliberately rough,
          so the review talks about <em>what is on the screen and why</em>, not colours. The clickable prototype is the hi-fi version;
          each wireframe links to its real screen. The written UX documents (personas, journey maps, site map, screen inventory,
          principles, review checklist) are in <code className="rounded bg-bg px-1 font-mono text-[13px]">docs/ux/</code>.
        </p>
      </header>

      <section aria-labelledby="legend" className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-surface px-5 py-3 text-sm">
        <h2 id="legend" className="text-xs font-semibold tracking-wide text-muted uppercase">How to read them</h2>
        <span className="flex items-center gap-2"><N n={1} /> numbered note</span>
        <span className="flex items-center gap-2"><B kind="primary">Primary</B> the one main action</span>
        <span className="flex items-center gap-2"><B kind="locked">Locked</B> visible, disabled, says why</span>
        <span className="flex items-center gap-2"><P kind="striped">striped</P> production, or needs attention</span>
        <span className="flex items-center gap-2"><P kind="solid">solid</P> done · <P kind="dashed">dashed</P> missing</span>
        <span className="flex items-center gap-2"><Sw on /> on/off switch</span>
      </section>

      <Flow />

      <div className="mt-10 grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Wireframe index" className="self-start lg:sticky lg:top-6">
          <a href="#flow" className="block rounded-lg px-2 py-1 text-sm font-semibold hover:bg-tint hover:text-indigo pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center">How screens connect</a>
          {GROUPS.map((g) => (
            <div key={g} className="mt-4">
              <h2 className="px-2 text-xs font-semibold tracking-wide text-muted uppercase">{g}</h2>
              <ol className="mt-1">
                {WIREFRAMES.filter((w) => w.group === g).map((w) => (
                  <li key={w.id}>
                    <a href={`#wf-${w.id}`} className="flex gap-2 rounded-lg px-2 py-1 text-[13px] text-muted transition-colors duration-200 hover:bg-tint hover:text-indigo pointer-coarse:min-h-11 pointer-coarse:items-center">
                      <span className="font-mono text-xs text-muted">W{w.id}</span>
                      <span className="truncate">{w.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-12">
          {GROUPS.map((g) => (
            <section key={g} aria-labelledby={`g-${g}`} className="space-y-6">
              <h2 id={`g-${g}`} className="font-display text-xl font-bold">{g}</h2>
              {WIREFRAMES.filter((w) => w.group === g).map((w) => (
                <article key={w.id} id={`wf-${w.id}`} aria-labelledby={`t-${w.id}`} className="scroll-mt-20 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:scroll-mt-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-mono text-sm font-semibold text-muted">W{w.id}</span>
                    <h3 id={`t-${w.id}`} className="font-display text-lg font-bold">{w.title}</h3>
                    <span className="flex flex-wrap gap-1" aria-label="Journeys">
                      {w.journeys.map((j) => (
                        <span key={j} title={`${j} · ${JOURNEYS[j]}`} className="rounded-full border border-indigo/25 bg-tint px-2 py-0.5 text-xs font-semibold text-indigo">{j}</span>
                      ))}
                    </span>
                    {w.href && (
                      <span className="ml-auto text-right text-sm">
                        <Link href={w.href} className="font-semibold text-indigo hover:text-indigo-deep hover:underline pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">Open the real screen →</Link>
                        {w.tip && <span className="block text-xs text-muted">{w.tip}</span>}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div role="region" aria-label={`W${w.id} drawing`} tabIndex={0} className="scroll-fade relative overflow-x-auto"><div className="min-w-[640px]">{w.draw}</div></div>
                    <ol className="space-y-2.5 text-sm" aria-label={`Notes for W${w.id}`}>
                      {w.notes.map((n, i) => (
                        <li key={i} className="flex gap-2.5"><N n={i + 1} /><span className="text-ink/85">{n}</span></li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- flow diagram ----------
type Node = { t: string; wf: string; x: number; y: number; dashed?: boolean };
const W = 130, HGT = 46, XS = [35, 195, 355, 515, 675, 835];
const row = (y: number, items: [string, string, boolean?][]): Node[] => items.map(([t, wf, dashed], i) => ({ t, wf, x: XS[i], y, dashed }));

const P1A = row(56, [['Sign in', '01'], ['Library', '02'], ['Telugu chunk', '05'], ['Kannada quiz', '06'], ['Validate + fix', '07'], ['Send for review', '07']]);
const P1B = row(162, [['Approve', '04'], ['Match + changes', '10'], ['17 checks', '12'], ['Dry run + confirm', '13'], ['Lands switched off', '15'], ['Switch on in prod', '08']]);
const P2 = row(268, [['Library', '02'], ['New bedtime story', '09'], ['Scenes + audio', '05'], ['Validate + fix', '07'], ['Send for review', '07'], ['Same path as P1', '04', true]]);

function Flow() {
  const arrows = (r: Node[]) => r.slice(1).map((n, i) => <line key={n.x} x1={r[i].x + W + 2} y1={n.y + HGT / 2} x2={n.x - 4} y2={n.y + HGT / 2} markerEnd="url(#arr)" />);
  const nodes = (r: Node[]) => r.map((n) => (
    <a key={n.x + n.t} href={`#wf-${n.wf}`}>
      <rect x={n.x} y={n.y} width={W} height={HGT} rx="8" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="1.5" strokeDasharray={n.dashed ? '5 4' : undefined} />
      <text x={n.x + 12} y={n.y + 20} fontSize="12.5" fontWeight="600" fill="var(--color-ink)">{n.t}</text>
      <text x={n.x + 12} y={n.y + 36} fontSize="10.5" fill="var(--color-muted)" fontFamily="var(--font-mono)">W{n.wf}</text>
    </a>
  ));
  const last = P1A[5], first = P1B[0];
  return (
    <section id="flow" aria-labelledby="flow-h" className="mt-8 scroll-mt-20 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:scroll-mt-6">
      <h2 id="flow-h" className="font-display text-xl font-bold">How the screens connect</h2>
      <p className="mt-1 text-sm text-muted">The two release priorities, start to finish. Click a box to jump to its wireframe. Every step lands in the Activity log (<a href="#wf-16" className="text-indigo hover:underline">W16</a>).</p>
      <div role="region" aria-label="Screen flow diagram" tabIndex={0} className="scroll-fade relative mt-4 overflow-x-auto">
        <svg viewBox="0 0 1000 322" className="flow w-full min-w-[760px] font-sans pointer-coarse:min-w-[960px]" role="group" aria-labelledby="flow-h">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--color-faint)" />
            </marker>
          </defs>
          <text x="35" y="22" fontSize="13" fontWeight="700" fill="var(--color-indigo)">P1 · Telugu and Kannada fixes for the 4 existing books</text>
          <text x="35" y="44" fontSize="11" fill="var(--color-muted)">Content Manager · staging</text>
          <text x="35" y="154" fontSize="11" fill="var(--color-muted)">Super Admin · staging → production</text>
          <text x="35" y="250" fontSize="13" fontWeight="700" fill="var(--color-coral-deep)">P2 · New bedtime story</text>
          <text x="210" y="250" fontSize="11" fill="var(--color-muted)">Content Manager · staging</text>
          <g stroke="var(--color-faint)" strokeWidth="1.5" fill="none">
            {arrows(P1A)}{arrows(P1B)}{arrows(P2)}
            <path d={`M${last.x + W / 2} ${last.y + HGT + 2} V132 H18 V${first.y + HGT / 2} H${first.x - 4}`} markerEnd="url(#arr)" />
          </g>
          {nodes(P1A)}{nodes(P1B)}{nodes(P2)}
        </svg>
      </div>
    </section>
  );
}
