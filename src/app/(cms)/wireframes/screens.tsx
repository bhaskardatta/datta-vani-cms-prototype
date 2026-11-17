// Every wireframe: what it is, which journeys it serves, the drawing, and the
// numbered notes that explain the decisions. The page just renders this list.
import type { ReactNode } from 'react';
import { B, Bar, Box, Frame, H, Img, In, L, N, P, Row, Sw, T, cx } from './wf';

export type Group = 'Screens' | 'Promote wizard' | 'Component sheets';
export type Wireframe = {
  id: string; title: string; group: Group; journeys: string[];
  href?: string; tip?: string; draw: ReactNode; notes: string[];
};

// ---------- shared editor pieces ----------
const LANGS = [['English', 100], ['Telugu', 72], ['Kannada', 40]] as const;

function EditorHead({ title, status, prod, lang = 'Telugu', actions, switches }: {
  title: string; status?: ReactNode; prod?: boolean; lang?: string; actions?: ReactNode; switches?: ReactNode;
}) {
  return (
    <div className="border-b border-neutral-300 bg-white px-3 pt-2">
      <L dim>Library › Epic</L>
      <Row className="mt-1 flex-wrap">
        <H>{title}</H>
        {status}
        {prod && <P kind="striped">Production · read-only</P>}
        <span className="ml-auto flex flex-wrap items-start gap-1.5">{actions}</span>
      </Row>
      {switches && <Row className="mt-2 flex-wrap gap-4">{switches}</Row>}
      <Row className="mt-2 gap-0">
        {LANGS.map(([l, v]) => (
          <span key={l} className={cx('flex items-center gap-1 border-b-2 px-2.5 py-1', l === lang ? 'border-neutral-800' : 'border-transparent')}>
            <L b={l === lang}>{l}</L><L dim>{v}%</L>
            {l === 'Kannada' && <P kind="solid">2</P>}
          </span>
        ))}
      </Row>
    </div>
  );
}

function Tree({ sel, marks }: { sel: string; marks?: string[] }) {
  const rows: [string, number, string?][] = [
    ['Book', 0], ['▾ Bala Kanda', 1], ['▾ The prince is born', 2], ['▾ Scene 1', 3],
    ['Chunk 1', 4, 'sentence'], ['Chunk 2', 4, 'sentence'], ['▸ Scene 2', 3], ['◇ Quiz', 3, '4 questions'], ['▸ Ayodhya Kanda', 1],
  ];
  return (
    <div className="w-[150px] shrink-0 space-y-0.5 border-r border-neutral-300 bg-white py-2 pr-1">
      {rows.map(([label, d, sub]) => (
        <div key={label} style={{ paddingLeft: 6 + d * 8 }}
          className={cx('flex items-center gap-1 rounded-sm py-0.5 pr-1', label === sel && 'bg-neutral-200')}>
          <L b={label === sel}>{label}</L>
          {sub && <T w="w-8" />}
          {marks?.includes(label) && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-800" role="img" aria-label="has errors" />}
        </div>
      ))}
    </div>
  );
}

const Source = ({ children }: { children?: ReactNode }) => (
  <div className="rounded bg-neutral-100 px-2 py-1.5"><Row><L b>English:</L>{children ?? <T w="w-3/4" />}</Row></div>
);

function AudioRow({ voice, state, n }: { voice: string; state: 'approved' | 'draft' | 'stale' | 'missing' | 'optional'; n?: number }) {
  const pill = {
    approved: <P kind="solid">✓ Approved</P>,
    draft: <P kind="outline">Draft · listen, then approve</P>,
    stale: <P kind="striped">! Out of date · text changed</P>,
    missing: <P kind="dashed">✕ Missing</P>,
    optional: <P kind="dashed">Missing (optional)</P>,
  }[state];
  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-1.5">
      <span className="w-12"><L b>{voice}</L></span>
      {pill}
      {n !== undefined && <N n={n} />}
      <span className="ml-auto flex flex-wrap gap-1">
        {state !== 'missing' && state !== 'optional' && <B kind="ghost">▶ Play</B>}
        {state === 'draft'
          ? <><B kind="primary">Approve</B><B>Reject</B></>
          : <><B>↻ Regenerate</B><B>↑ Upload</B></>}
        {state !== 'missing' && state !== 'optional' && <B kind="ghost">Transcript</B>}
      </span>
    </div>
  );
}

const StepBar = ({ at }: { at: number }) => (
  <Row className="flex-wrap gap-1">
    {['Match', 'Changes', 'Checks', 'Dry run', 'Confirm', 'Promote'].map((s, i) => (
      <span key={s} className={cx('flex items-center gap-1 rounded-full px-2 py-0.5',
        i === at ? 'bg-neutral-800 text-white' : i < at ? 'border border-neutral-500' : 'border border-dashed border-neutral-300')}>
        <span className={cx('font-mono text-[10px]', i === at ? 'font-bold text-white' : i < at ? 'text-neutral-700' : 'text-[#666]')}>{i < at ? '✓' : i + 1} {s}</span>
      </span>
    ))}
  </Row>
);

function PromoteFrame({ at, children, next = 'Next →', why, n }: { at: number; children: ReactNode; next?: string; why?: string; n?: number }) {
  return (
    <Frame env="staging" role="Super Admin" nav="Editor">
      <L dim>Library › Ramayana › Promote</L>
      <H>Promote “Ramayana” to production</H>
      <L dim>Copies approved staging content into the live app. Never deletes. Never switches anything on.</L>
      <div className="mt-2"><StepBar at={at} /></div>
      <Box className="mt-2 p-3">{children}</Box>
      {at < 5 && (
        <Row className="mt-2 justify-between">
          <B kind="ghost">{at === 0 ? 'Cancel' : '← Back'}</B>
          <Row>{n !== undefined && <N n={n} />}{why ? <B kind="locked" why={why}>{next}</B> : <B kind="primary">{next}</B>}</Row>
        </Row>
      )}
    </Frame>
  );
}

// ---------- the wireframes ----------
export const WIREFRAMES: Wireframe[] = [
  {
    id: '01', title: 'Sign in', group: 'Screens', journeys: ['J1', 'J8'], href: '/',
    draw: (
      <Frame bare>
        <div className="mx-auto max-w-[520px] py-6">
          <L dim>PROTOTYPE FOR TEAM REVIEW · SAMPLE DATA</L>
          <div className="mt-1 font-mono text-2xl font-bold text-neutral-800">Datta Vani CMS</div>
          <div className="mt-2 space-y-1"><T w="w-5/6" /><T w="w-2/3" /></div>
          <Row className="mt-5"><L b>Sign in as</L><N n={1} /></Row>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {['Content Manager', 'Super Admin', 'Support Lead'].map((r, i) => (
              <Box key={r} className="p-2">
                <Row><L b>{r}</L>{i === 0 && <N n={2} />}</Row>
                <div className="mt-2 space-y-1"><T w="w-full" /><T w="w-4/5" /><T w="w-3/5" /></div>
                <div className="mt-3"><L b>Continue →</L></div>
              </Box>
            ))}
          </div>
          <Row className="mt-3"><T w="w-3/4" /><N n={3} /></Row>
        </div>
      </Frame>
    ),
    notes: [
      'In the prototype you pick a role instead of typing a password, so reviewers can see each persona quickly.',
      'Each card says, in one sentence, what that role can and cannot do. The role decides which buttons are unlocked later.',
      'A line tells the reader the real CMS uses the normal Datta Vani login and checks the role on the server, so nobody thinks this screen is the real one.',
    ],
  },
  {
    id: '02', title: 'Library (staging)', group: 'Screens', journeys: ['J1', 'J2', 'J7'], href: '/library',
    draw: (
      <Frame env="staging" nav="Library">
        <Row><H>Library</H><N n={1} /><span className="ml-auto flex items-center gap-1"><N n={2} /><B kind="primary">+ New bedtime story</B></span></Row>
        <L dim>Everything on staging, where all editing happens.</L>
        <Row className="mt-2 gap-0 border-b border-neutral-300">
          {['All', 'Epics', 'Bedtime stories'].map((t, i) => <span key={t} className={cx('border-b-2 px-2 py-1', i === 0 ? 'border-neutral-800' : 'border-transparent')}><L b={i === 0}>{t}</L></span>)}
        </Row>
        <Box className="mt-2 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_.8fr_.6fr_.6fr_.8fr_.8fr_.8fr_.9fr] gap-2 border-b border-neutral-300 bg-neutral-100 px-2 py-1">
            {['NAME', 'STATUS', 'STAGING', 'PROD', 'EN', 'TE', 'KN', 'CHECKS'].map((h) => <L key={h} dim>{h}</L>)}
          </div>
          {([
            ['Ramayana', 'In review', true, true, [100, 72, 40], '3 errors'],
            ['Mahabharatam', 'Draft', false, true, [100, 30, 0], '9 errors'],
            ['Book of Datta', 'Approved', true, true, [100, 100, 100], '✓ Passes'],
            ['The kind deer', 'Draft', false, null, [100, 100, 100], '✓ Passes'],
          ] as const).map(([name, st, s, p, cov, chk], i) => (
            <div key={name} className="grid grid-cols-[1.4fr_.8fr_.6fr_.6fr_.8fr_.8fr_.8fr_.9fr] items-center gap-2 border-b border-neutral-200 px-2 py-1.5 last:border-0">
              <div><L b>{name}</L><div><T w="w-16" /></div></div>
              <span><P kind={st === 'Approved' ? 'solid' : 'outline'}>{st}</P></span>
              <span className="flex items-center gap-1"><Sw on={s} />{i === 0 && <N n={3} />}</span>
              <span>{p === null ? <L dim>Not yet</L> : <Sw on={p} />}</span>
              {cov.map((v, k) => <span key={k} className="flex items-center gap-1"><Bar v={v} />{i === 1 && k === 1 && <N n={4} />}</span>)}
              <span className="flex items-center gap-1">{chk.startsWith('✓') ? <P kind="solid">{chk}</P> : <P kind="striped">{chk}</P>}{i === 0 && <N n={5} />}</span>
            </div>
          ))}
        </Box>
        <div className="mt-1"><L dim>Coverage = share of chunks with text and approved audio in the required voices.</L></div>
      </Frame>
    ),
    notes: [
      'This is Praveen’s first scenario (J1): one table answers “where does everything stand?” in five seconds.',
      'The only primary button on the screen. For a Content Manager on production it stays visible but locked, with the reason.',
      'Two separate on/off columns: on in the staging app, and on in production. Mixing them up is the most expensive mistake, so they never share a column.',
      'One coverage bar per language, counting text plus approved audio. A low Telugu bar points straight at the book that is holding Telugu back.',
      'Error count and which languages have errors. Errors block approve, promote and switching on; the number makes that cost visible early.',
    ],
  },
  {
    id: '03', title: 'Library (production)', group: 'Screens', journeys: ['J1', 'J6', 'J8'], href: '/library', tip: 'Switch the top bar to Production.',
    draw: (
      <Frame env="production" nav="Library">
        <Row><H>Library</H><N n={1} /><span className="ml-auto flex items-center gap-1"><N n={2} /><B kind="locked" why="Edit on staging. Production is view-only.">+ New bedtime story</B></span></Row>
        <L dim>What is in production right now, and what families can see.</L>
        <Box className="mt-2 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_.9fr_.8fr_.8fr_.8fr_1.2fr] gap-2 border-b border-neutral-300 bg-neutral-100 px-2 py-1">
            {['NAME', 'FAMILIES SEE IT', 'EN', 'TE', 'KN', 'LANGUAGES ON'].map((h) => <L key={h} dim>{h}</L>)}
          </div>
          {([['Ramayana', true, [100, 60, 10], [1, 1, 0]], ['Mahabharatam', true, [100, 20, 0], [1, 0, 0]], ['Book of Datta', false, [100, 100, 100], [1, 0, 0]]] as const).map(([name, on, cov, langs], i) => (
            <div key={name} className="grid grid-cols-[1.4fr_.9fr_.8fr_.8fr_.8fr_1.2fr] items-center gap-2 border-b border-neutral-200 px-2 py-1.5 last:border-0">
              <L b>{name}</L>
              <span className="flex items-center gap-1"><Sw on={on} />{i === 2 && <N n={3} />}</span>
              {cov.map((v, k) => <Bar key={k} v={v} />)}
              <span className="flex items-center gap-1">{['EN', 'TE', 'KN'].map((l, k) => <P key={l} kind={langs[k] ? 'solid' : 'dashed'}>{l}</P>)}{i === 0 && <N n={4} />}</span>
            </div>
          ))}
        </Box>
      </Frame>
    ),
    notes: [
      'A striped banner and a striped env switch appear on every production screen. You can never forget which database you are looking at.',
      'Locked, not hidden. The reason is written on the button so nobody wonders whether the feature exists.',
      'A freshly promoted book shows “off”: promote never switches anything on. The Super Admin turns it on as a separate, deliberate step.',
      'Languages are switched on one by one. A language that is off falls back to English in the app.',
    ],
  },
  {
    id: '04', title: 'Editor — book root', group: 'Screens', journeys: ['J1', 'J5', 'J6'], href: '/edit', tip: 'Open a book from the Library first.',
    draw: (
      <Frame env="staging" nav="Editor">
        <div className="-m-3">
          <EditorHead title="Ramayana" lang="English" status={<P>In review</P>}
            actions={<><B>Validation <P kind="solid">3</P></B><B kind="locked" why="Only a Super Admin can approve">Approve</B><span className="flex items-center gap-1"><N n={1} /><B kind="locked" why="Approve it first">Promote to production</B></span></>}
            switches={<span className="flex items-center gap-1"><Sw on label="On in the staging app" /><N n={2} /></span>} />
          <div className="flex">
            <div className="relative"><Tree sel="Book" marks={['▾ Bala Kanda']} /><span className="absolute top-8 right-1"><N n={3} /></span></div>
            <div className="flex-1 space-y-2 p-3">
              <Row><L b>Book</L><T w="w-40" /></Row>
              <L dim>BOOK NAME</L><In />
              <L dim>DESCRIPTION</L><In rows={3} />
              <div className="grid grid-cols-3 gap-2">
                {['Sections 4', 'Chapters 18', 'Chunks 412'].map((s) => <Box key={s} className="p-2"><L>{s}</L></Box>)}
              </div>
              <Row><L dim>Media base path: content_media/epics/books/1/</L><N n={4} /></Row>
            </div>
          </div>
        </div>
      </Frame>
    ),
    notes: [
      'One workflow button at a time, in order: Send for review → Approve → Promote. Buttons a role can’t use stay visible, locked, with a one-line reason.',
      'The root’s switch controls the whole book. On staging it only affects the staging app that testers use.',
      'The tree shows the real hierarchy: book → section → chapter → scene → chunk, plus the chapter quiz. A dot marks branches with errors in this language, so you can follow dots down to the problem.',
      'Media paths are fixed and shown, because the app builds every file URL from one base path. Nobody types a path.',
    ],
  },
  {
    id: '05', title: 'Editor — chunk with audio rows (Telugu)', group: 'Screens', journeys: ['J2', 'J3', 'J7'], href: '/edit', tip: 'Start J2 or J3 from the Journeys page.',
    draw: (
      <Frame env="staging" nav="Editor">
        <div className="-m-3">
          <EditorHead title="Ramayana" status={<P>In review</P>} actions={<B>Validation <P kind="solid">3</P></B>} />
          <div className="flex">
            <Tree sel="Chunk 2" />
            <div className="flex-1 space-y-2 p-3">
              <L b>Bala Kanda › The prince is born › Scene 1 › Chunk 2</L>
              <Row><L dim>SENTENCE · TELUGU</L><N n={1} /></Row>
              <Source />
              <Row className="items-start"><In rows={2} /><N n={2} /></Row>
              <Row className="pt-1"><L dim>AUDIO AND TRANSCRIPT · TELUGU</L><N n={3} /></Row>
              <Box className="divide-y divide-neutral-200">
                <AudioRow voice="female" state="stale" n={4} />
                <AudioRow voice="male" state="draft" n={5} />
                <AudioRow voice="child" state="optional" />
              </Box>
              <Row><L dim>…/chunks/2/te/body/female/audio.mp3 · transcript.json</L><N n={6} /></Row>
            </div>
          </div>
        </div>
      </Frame>
    ),
    notes: [
      'The English sentence sits above the Telugu box, always. Translation is done by people; the CMS shows the source and never translates.',
      'Saving happens when you click outside the box. Every save is logged with before and after.',
      'Each voice (female, male, child) has an audio file and a word-timing transcript, made together as a pair.',
      'Changing the words marks that language’s audio as out of date, because the old recording no longer matches. The fix is right there on the row: Regenerate or Upload.',
      'A new or uploaded file arrives as a draft. You play it (words highlight from the transcript), then Approve or Reject. Nothing goes current without a listen.',
      'The file path is shown, not edited. Child is optional, so “missing” there is a warning, not an error.',
    ],
  },
  {
    id: '06', title: 'Editor — quiz translation (Kannada)', group: 'Screens', journeys: ['J4'], href: '/edit', tip: 'Start J4 from the Journeys page.',
    draw: (
      <Frame env="staging" nav="Editor">
        <div className="-m-3">
          <EditorHead title="Ramayana" lang="Kannada" status={<P>Draft</P>} actions={<B>Validation <P kind="solid">2</P></B>} />
          <div className="flex">
            <Tree sel="◇ Quiz" />
            <div className="flex-1 p-3">
              <L b>The prince is born › Quiz</L>
              <div><L dim>Translate the words only. The correct answer and option order follow English.</L></div>
              <div className="mt-2 grid grid-cols-[120px_1fr] gap-3">
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((q) => (
                    <Box key={q} className={cx('p-1.5', q === 2 && 'border-neutral-800')}>
                      <Row><L b={q === 2}>Q{q} · MCQ</L>{q === 2 && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neutral-800" role="img" aria-label="missing Kannada" />}{q === 2 && <N n={1} />}</Row>
                      {q === 2 ? <L dim>no Kannada text</L> : <T w="w-16" />}
                    </Box>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Row><L dim>QUESTION TYPE</L><span className="rounded border border-neutral-300 bg-neutral-100 px-1.5"><L dim>Multiple choice ▾</L></span><N n={2} /></Row>
                  <L dim>QUESTION · KANNADA</L>
                  <Source /><In missing />
                  <Row><L dim>OPTIONS · KANNADA</L><N n={3} /></Row>
                  {['A', 'B', 'C'].map((o) => (
                    <div key={o} className="grid grid-cols-[18px_1fr] items-center gap-1">
                      <L b>{o === 'B' ? '●' : '○'}</L>
                      <div className="space-y-0.5"><Source /><In missing={o !== 'A'} /></div>
                    </div>
                  ))}
                  <L dim>HINT · KANNADA</L><Source /><In missing />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Frame>
    ),
    notes: [
      'A dot on each question with missing Kannada, so the translator works down the list.',
      'Question type is set in English and greyed out here. A translator can’t accidentally change the structure.',
      'Every option shows its English above. The correct answer (●) and the option order are locked to English, so the quiz is fair in every language.',
    ],
  },
  {
    id: '07', title: 'Editor — validation panel open', group: 'Screens', journeys: ['J5', 'J7'], href: '/edit', tip: 'Start J5 from the Journeys page.',
    draw: (
      <Frame env="staging" nav="Editor">
        <div className="-m-3">
          <EditorHead title="The brave star" lang="English" status={<P>Draft</P>}
            actions={<><B kind="primary">Validation <P kind="outline">1</P></B><span className="flex items-center gap-1"><N n={4} /><B>Send for review</B></span></>} />
          <div className="flex">
            <Tree sel="Chunk 2" marks={['▾ Scene 1', 'Chunk 2']} />
            <div className="flex-1 space-y-2 p-3">
              <Row><L b>Scene 1 › Chunk 2</L><N n={3} /></Row>
              <In rows={2} />
              <Box className="divide-y divide-neutral-200"><AudioRow voice="female" state="approved" /><AudioRow voice="male" state="missing" /></Box>
            </div>
            <div className="w-[190px] shrink-0 space-y-2 border-l border-neutral-300 bg-white p-2">
              <Row><L b>Validation</L><span className="ml-auto"><L>✕</L></span></Row>
              <Row className="items-start"><L dim>Errors block approve, promote and switching on. Warnings don’t.</L><N n={1} /></Row>
              {[['English', [['✕', 'male voice missing', 'Scene 1 › Chunk 2'], ['!', 'child voice missing', 'Scene 1 › Chunk 2']]], ['Telugu', []], ['Kannada', [['!', 'description missing', 'Story']]]].map(([lang, list]) => (
                <div key={lang as string}>
                  <Row><L b>{lang as string}</L>{(list as string[][]).length === 0 && <P kind="solid">✓ Passes</P>}</Row>
                  {(list as string[][]).map(([lvl, msg, where], k) => (
                    <div key={k} className={cx('mt-1 flex gap-1 rounded border p-1', lvl === '✕' ? 'border-neutral-700' : 'border-neutral-300')}>
                      <L b>{lvl}</L>
                      <div className="min-w-0"><L b={lvl === '✕'}>{msg}</L><div><L dim>{where}</L></div></div>
                      {lang === 'English' && k === 0 && <N n={2} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    ),
    notes: [
      'Two levels only. Errors (✕) block approve, promote and switching on. Warnings (!) are for a second look. The rule is written at the top so nobody has to guess.',
      'Every issue says what is wrong and where. Clicking it opens that exact chunk, in that language.',
      'The editor jumps to the chunk and the tree marks its branch, so the fix is one click away: here, Regenerate on the missing male voice.',
      'Send for review is allowed with warnings but the Super Admin can’t approve while English has errors.',
    ],
  },
  {
    id: '08', title: 'Editor — production read-only', group: 'Screens', journeys: ['J6', 'J8'], href: '/edit', tip: 'Open a book, then switch the top bar to Production.',
    draw: (
      <Frame env="production" role="Super Admin" nav="Editor">
        <div className="-m-3">
          <EditorHead title="Book of Datta" prod
            actions={<B>Validation <P kind="outline">✓</P></B>}
            switches={<>
              <span className="flex items-center gap-1"><Sw on={false} label="Families can see it" /><N n={2} /></span>
              <span className="flex items-center gap-1"><Sw on={false} label="Telugu on" /><Sw on={false} label="Kannada on" /><N n={3} /></span>
              <L dim>English is the fallback: a language that is off shows English.</L>
            </>} />
          <div className="flex">
            <Tree sel="Book" />
            <div className="flex-1 space-y-2 p-3">
              <Row className="rounded border border-neutral-400 bg-neutral-100 px-2 py-1"><L b>Read-only.</L><L>Edit on staging, then promote.</L><N n={1} /></Row>
              <L dim>BOOK NAME</L><In ro />
              <L dim>DESCRIPTION</L><In ro rows={3} />
              <Row><L dim>CONTENT MANAGER SEES:</L><Sw on={false} locked label="Families can see it" /><N n={4} /></Row>
              <B kind="locked" why="Only a Super Admin can switch content on or off">Switch on</B>
            </div>
          </div>
        </div>
      </Frame>
    ),
    notes: [
      'Production text fields are read-only for everyone, including the Super Admin. A note at the top says where editing happens instead.',
      'The book’s switch decides if families see it. Only a Super Admin can flip it, and not while English has errors.',
      'Each translated language has its own switch. It stays locked until that language is complete in production.',
      'For a Content Manager (J8) the same switches are visible but locked, with the reason. They learn the rule from the screen, not from a manual.',
    ],
  },
  {
    id: '09', title: 'New bedtime story', group: 'Screens', journeys: ['J7'], href: '/library', tip: 'Press “+ New bedtime story” in the Library.',
    draw: (
      <Frame env="staging" nav="Editor">
        <div className="-m-3">
          <div className="border-b border-neutral-300 bg-white px-3 py-2">
            <L dim>Library › Bedtime story</L>
            <Row className="mt-1"><H>Untitled story</H><P>Draft</P><span className="ml-auto flex gap-1.5"><B>Validation <P kind="solid">6</P></B><B>Send for review</B></span></Row>
            <Row className="mt-1"><Sw on={false} label="On in the staging app" /><N n={1} /></Row>
          </div>
          <div className="flex">
            <div className="w-[120px] shrink-0 space-y-0.5 border-r border-neutral-300 bg-white p-2">
              <div className="rounded-sm bg-neutral-200 px-1"><L b>Story</L></div>
              <div className="pl-2"><L>▸ Scene 1</L></div>
              <Row className="pl-2"><L dim>no scenes yet</L></Row>
            </div>
            <div className="flex-1 space-y-2 p-3">
              <L dim>STORY TITLE</L><In missing><L dim>Add story title</L></In>
              <L dim>DESCRIPTION</L><In missing rows={2}><L dim>Add description</L></In>
              <div className="grid grid-cols-[90px_1fr] gap-3">
                <div><L dim>COVER</L><Img label="no image" className="mt-1 aspect-[3/4]" /><div className="mt-1"><B>Upload</B></div></div>
                <div className="space-y-2">
                  <Row><L dim>THEMES</L><N n={2} /></Row>
                  <Row className="flex-wrap gap-1">{['✓ Courage', 'Kindness', 'Devotion', 'Friendship'].map((t) => <P key={t} kind={t.startsWith('✓') ? 'solid' : 'outline'}>{t}</P>)}</Row>
                  <L dim>CHARACTERS</L>
                  <Row className="flex-wrap gap-1">{['Dhruva', 'Narada', '✓ Tataji'].map((t) => <P key={t} kind={t.startsWith('✓') ? 'solid' : 'outline'}>{t}</P>)}</Row>
                </div>
              </div>
              <Row><L dim>SCENES</L><span className="ml-auto flex items-center gap-1"><N n={3} /><B>+ Add scene</B></span></Row>
              <Box dashed className="p-2"><L dim>Each scene: portrait + landscape image, then chunks (one sentence each) with audio per voice.</L></Box>
              <Row><L dim>No quiz for bedtime stories.</L><N n={4} /></Row>
            </div>
          </div>
        </div>
      </Frame>
    ),
    notes: [
      'A new story is created as a draft and switched off. It can’t reach families by accident.',
      'Themes and characters are picked from shared lists, not typed, so spelling and translations stay consistent across stories.',
      'Scenes and chunks reuse the same panels as the epics (W05), so there is only one way to add text and audio to learn.',
      'Bedtime stories have no quizzes (meeting decision). The screen says so instead of leaving a confusing gap.',
    ],
  },
  {
    id: '10', title: 'Promote 1 — Match', group: 'Promote wizard', journeys: ['J6'], href: '/promote', tip: 'Start J6 from the Journeys page so a book is selected.',
    draw: (
      <PromoteFrame at={0} why="Confirm the matches first" n={4}>
        <Row><L b>Match staging to production</L><N n={1} /></Row>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Box className="p-2"><L dim>STAGING</L><div><L b>Ramayana</L></div><L dim>id st-0187</L></Box>
          <L>→</L>
          <Box className="p-2"><L dim>PRODUCTION</L><div><L b>Ramayana</L></div><L dim>id pr-0042 · live, on</L></Box>
        </div>
        <Row className="mt-2"><L>408 of 412 chunks matched · 4 new</L><N n={2} /></Row>
        <Row className="mt-2"><span className="h-3 w-3 rounded-sm border border-neutral-600" /><L b>These matches are right</L><N n={3} /></Row>
      </PromoteFrame>
    ),
    notes: [
      'IDs differ between staging and production, so the CMS matches by name, then chapters, scenes and chunks by text and order.',
      'Counts, not a wall of rows. “New” means it will be created; nothing is ever deleted.',
      'A person confirms the match once. It is saved and reused next time.',
      'Next stays locked until the box is ticked, and says why.',
    ],
  },
  {
    id: '11', title: 'Promote 2 — Changes', group: 'Promote wizard', journeys: ['J6'], href: '/promote',
    draw: (
      <PromoteFrame at={1}>
        <L b>What will change</L>
        <Row className="mt-2"><L dim>LANGUAGES TO PROMOTE</L><N n={1} /></Row>
        <Row className="mt-1 flex-wrap">
          <Box className="px-2 py-1"><L>☑ English (always)</L></Box>
          <Box className="px-2 py-1"><L>☑ Telugu</L></Box>
          <Box className="px-2 py-1"><Row><L dim>☐ Kannada</L><P kind="striped">2 errors</P></Row></Box>
        </Row>
        <Box className="mt-2">
          <div className="grid grid-cols-4 border-b border-neutral-200 px-2 py-1">{['LANGUAGE', 'NEW', 'CHANGED', 'UNCHANGED'].map((h) => <L key={h} dim>{h}</L>)}</div>
          {[['English', 4, 0, 408], ['Telugu', 4, 37, 371]].map((r) => <div key={r[0]} className="grid grid-cols-4 px-2 py-1">{r.map((c, i) => <L key={i} b={i === 0}>{String(c)}</L>)}</div>)}
        </Box>
        <Row className="mt-2"><L>82 files · 0 production rows deleted · IDs kept</L><N n={2} /></Row>
        <Box className="mt-2 p-2">
          <Row><P>changed</P><L dim>Telugu · Bala Kanda › Scene 1 › Chunk 2</L><N n={3} /></Row>
          <div className="mt-1 space-y-1"><div className="flex items-center gap-1"><L dim>before</L><span className="h-2 w-40 bg-neutral-300 [background-image:linear-gradient(transparent_45%,#737373_45%,#737373_55%,transparent_55%)]" /></div><div className="flex items-center gap-1"><L dim>after</L><T w="w-44" dark /></div></div>
        </Box>
      </PromoteFrame>
    ),
    notes: [
      'Languages with errors can’t be ticked, and say why. English always goes. This is how Telugu ships without waiting for Kannada.',
      'The numbers that matter for safety: files copied, rows deleted (always 0), IDs kept.',
      'Each change shows before (struck through) and after, per language, so the Super Admin reviews real words, not counts only.',
    ],
  },
  {
    id: '12', title: 'Promote 3 — Checks', group: 'Promote wizard', journeys: ['J6'], href: '/promote',
    draw: (
      <PromoteFrame at={2} why="1 check failed" n={3}>
        <Row><L b>The 17 pre-promote checks</L><N n={1} /></Row>
        <L dim>A failed check stops the promote and nothing is written. Warnings don’t block.</L>
        <div className="mt-2 space-y-0.5">
          {[['✓', 'Super Admin, staging → production, production writable'], ['✕', 'Passes validation in every language being promoted'], ['✓', 'Every media file exists and every transcript parses'], ['✓', 'Zero deletions of production rows or files'], ['…', 'A dry run of this exact plan completed cleanly'], ['!', 'Change size is normal and the item is not live']].map(([s, t], i) => (
            <div key={i} className={cx('flex items-center gap-2 rounded-sm px-1.5 py-0.5', i % 2 === 0 && 'bg-neutral-100')}>
              <L dim>{[1, 2, 3, 7, 11, 17][i]}</L><L b>{s}</L><L b={s === '✕'}>{t}</L>
              {s === '✕' && <span className="ml-auto flex items-center gap-1"><L b>Kannada: 2 errors</L><N n={2} /></span>}
              {s === '…' && <span className="ml-auto"><L dim>step 4</L></span>}
              {s === '!' && <span className="ml-auto"><L dim>warning only</L></span>}
            </div>
          ))}
          <L dim>… 11 more rows</L>
        </div>
      </PromoteFrame>
    ),
    notes: [
      'All 17 checks from Dattu’s CMS plan, in one numbered list, each passed (✓), failed (✕), warning (!) or still to come (…).',
      'A failed check says exactly what failed and where. The way out is Back (untick Kannada) or fixing it in the editor.',
      'Next is locked while any check fails. The button says how many.',
    ],
  },
  {
    id: '13', title: 'Promote 4 — Dry run', group: 'Promote wizard', journeys: ['J6'], href: '/promote',
    draw: (
      <PromoteFrame at={3}>
        <Row><L b>Dry run</L><N n={1} /></Row>
        <L dim>Runs the exact plan without writing anything.</L>
        <div className="mt-2 space-y-0.5">
          {['✓ Plan rebuilt: unchanged since review', '✓ Would copy 82 files, hash-checked', '✓ Would update 408 rows in place and create 4', '✓ Would delete 0 rows and 0 files', '✓ Visibility unchanged: stays on'].map((t) => <div key={t}><L>{t}</L></div>)}
        </div>
        <Row className="mt-2 rounded border border-neutral-500 px-2 py-1"><L b>Clean. Nothing was written.</L><N n={2} /></Row>
      </PromoteFrame>
    ),
    notes: [
      'The dry run proves the plan works before anything is touched. The lines appear one by one, so it feels like a real check, not a formality.',
      'A clear “nothing was written” message removes the fear of pressing the button.',
    ],
  },
  {
    id: '14', title: 'Promote 5 — Confirm', group: 'Promote wizard', journeys: ['J6'], href: '/promote',
    draw: (
      <PromoteFrame at={4} next="Promote now" why="Type the name and “production” exactly" n={3}>
        <L b>Confirm</L>
        <Row className="mt-1"><L>Promoting English, Telugu · 82 files · live item, stays on</L><N n={1} /></Row>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div><L>Type <b>Ramayana</b></L><In><L>Ramay|</L></In></div>
          <div><Row><L>Type <b>production</b></L><N n={2} /></Row><In><span /></In></div>
        </div>
      </PromoteFrame>
    ),
    notes: [
      'One sentence sums up what is about to happen: which languages, how many files, and whether it is live.',
      'Typing the book name and the word “production” makes the Super Admin stop and read. A click alone is too easy.',
      'The final button stays locked until both are typed exactly, and says so.',
    ],
  },
  {
    id: '15', title: 'Promote 6 — Result', group: 'Promote wizard', journeys: ['J6', 'J9'], href: '/promote',
    draw: (
      <PromoteFrame at={5}>
        <L b>Promoted</L>
        <div className="mt-1 space-y-0.5">{['✓ Snapshot of production rows saved', '✓ Copying 82 files', '✓ Writing rows in one transaction', '✓ Verifying files, paths and hashes', '✓ Asked the app to refresh its cache'].map((t) => <div key={t}><L>{t}</L></div>)}</div>
        <Box className="mt-2 p-2">
          <Row><L b>Updated in place. It was already on, so families see the English changes within ~10 min.</L><N n={1} /></Row>
          <Row className="mt-1"><L>Telugu arrived switched off. Switch it on in production when ready.</L><N n={2} /></Row>
          <Row className="mt-2 flex-wrap"><B kind="primary">Open in production</B><span className="flex items-center gap-1"><B>Revert this promote</B><N n={3} /></span><B kind="ghost">Back to library</B></Row>
        </Box>
      </PromoteFrame>
    ),
    notes: [
      'The result says in plain words what families will see and when.',
      'New languages always arrive switched off. The next step (switch on, W08) is the primary button.',
      'Revert uses the snapshot taken at the start. Nothing is destructive without a way back. Every step is in the Activity log.',
    ],
  },
  {
    id: '16', title: 'Activity', group: 'Screens', journeys: ['J9'], href: '/activity',
    draw: (
      <Frame env="staging" nav="Activity">
        <Row><H>Activity</H><N n={1} /></Row>
        <L dim>Every change: who, what, before and after, which environment, and when. Nothing here can be edited.</L>
        <Row className="mt-2">
          <span className="flex overflow-hidden rounded border border-neutral-500">{['all', 'staging', 'production'].map((e, i) => <span key={e} className={cx('px-1.5 font-mono text-[11px]', i === 0 ? 'bg-neutral-800 font-bold text-white' : 'text-neutral-600')}>{e}</span>)}</span>
          <In w="w-44"><L dim>Search actions, items, people</L></In>
          <L dim>24 entries</L><N n={2} />
        </Row>
        <Box className="mt-2 divide-y divide-neutral-200">
          {[['2 min ago', 'Super Admin', 'Switched Telugu on', 'production', false], ['12 min ago', 'Super Admin', 'Promoted to production', 'production', false], ['1 h ago', 'Content Manager', 'Edited Telugu sentence', 'staging', true]].map(([t, who, what, env, diff], i) => (
            <div key={i} className="grid grid-cols-[90px_1fr] gap-2 p-2">
              <div><L b>{t as string}</L><div><L dim>{who as string}</L></div></div>
              <div>
                <Row><L b>{what as string}</L><P kind={env === 'production' ? 'striped' : 'outline'}>{env as string}</P>{i === 0 && <N n={3} />}</Row>
                <L dim>Ramayana · Bala Kanda › Scene 1 › Chunk 2</L>
                {diff && <div className="mt-1 space-y-1 rounded bg-neutral-100 p-1.5"><Row><L dim>BEFORE</L><T w="w-40" /></Row><Row><L dim>AFTER</L><T w="w-44" dark /></Row><N n={4} /></div>}
              </div>
            </div>
          ))}
        </Box>
      </Frame>
    ),
    notes: [
      'One log for both environments. It is append-only: nothing on this screen can be changed or deleted.',
      'Filter by environment and search by action, item or person. That covers “who changed this sentence?” and “what went live today?”.',
      'Production entries use the same striped mark as the production banner, so they stand out in a long list.',
      'Text edits keep the before and after, so a wrong change can be found and put back by hand.',
    ],
  },
  // ---------- component sheets ----------
  {
    id: '17', title: 'Audio row states', group: 'Component sheets', journeys: ['J2', 'J3', 'J5'],
    draw: (
      <div className="space-y-2 rounded-md border-2 border-neutral-700 bg-neutral-50 p-3">
        {([['approved', 'Approved — text, audio and transcript match.'], ['draft', 'Draft — new file waiting for a listen.'], ['stale', 'Out of date — the words changed after recording.'], ['missing', 'Missing — required voice (female, male).'], ['optional', 'Missing — optional voice (child). A warning only.']] as const).map(([s, d], i) => (
          <div key={s}>
            <Row><N n={i + 1} /><L dim>{d}</L></Row>
            <Box className="mt-1"><AudioRow voice={s === 'optional' ? 'child' : 'female'} state={s} /></Box>
          </div>
        ))}
        <div>
          <Row><N n={6} /><L dim>Busy — while regenerating, the button shows progress and can’t be pressed twice.</L></Row>
          <Box className="mt-1"><Row className="px-2 py-1.5"><span className="w-12"><L b>male</L></span><P kind="dashed">✕ Missing</P><span className="ml-auto"><B kind="locked">◌ Generating…</B></span></Row></Box>
        </div>
      </div>
    ),
    notes: [
      'Approved: solid pill. The only state that counts toward coverage.',
      'Draft: the row offers exactly two choices, Approve or Reject, after Play.',
      'Out of date: striped pill (the same “look here” pattern as production). Regenerate and Upload stay on the row.',
      'Missing, required: dashed pill. Counts as a validation error.',
      'Missing, optional: dashed and labelled “optional”. Counts as a warning, not an error.',
      'Each state uses a different shape and word, never colour alone, so it works for colour-blind users and in greyscale print.',
    ],
  },
  {
    id: '18', title: 'Buttons', group: 'Component sheets', journeys: ['J5', 'J6', 'J8'],
    draw: (
      <div className="space-y-3 rounded-md border-2 border-neutral-700 bg-neutral-50 p-3">
        <Row className="flex-wrap items-start gap-4">
          <div className="space-y-1"><Row><N n={1} /><L dim>primary</L></Row><B kind="primary">Promote to production</B></div>
          <div className="space-y-1"><Row><N n={2} /><L dim>secondary</L></Row><B>Send for review</B></div>
          <div className="space-y-1"><Row><N n={3} /><L dim>ghost</L></Row><B kind="ghost">Back to library</B></div>
          <div className="space-y-1"><Row><N n={4} /><L dim>danger</L></Row><B kind="danger">Revert this promote</B></div>
        </Row>
        <div className="space-y-1">
          <Row><N n={5} /><L dim>locked with reason</L></Row>
          <Row className="flex-wrap items-start gap-4">
            <B kind="locked" why="Only a Super Admin can promote">Promote to production</B>
            <B kind="locked" why="Approve it first">Promote to production</B>
            <B kind="locked" why="Add the Telugu sentence first">↻ Regenerate</B>
          </Row>
        </div>
        <Row className="flex-wrap gap-4">
          <div className="space-y-1"><L dim>hover</L><span className="block rounded ring-2 ring-neutral-300"><B>Send for review</B></span></div>
          <div className="space-y-1"><Row><N n={6} /><L dim>focus (keyboard)</L></Row><span className="block rounded ring-2 ring-indigo ring-offset-2"><B>Send for review</B></span></div>
          <div className="space-y-1"><L dim>busy</L><B kind="locked">◌ Running…</B></div>
        </Row>
      </div>
    ),
    notes: [
      'Primary: one per screen, for the next step in the flow.',
      'Secondary: other useful actions. Most buttons are this.',
      'Ghost: leaving or navigating (Back, Cancel, Play).',
      'Danger: reverting a promote. Never a hard delete; the CMS has none.',
      'Locked with reason: the button stays where it is, shows a lock, and says why in plain words (as a tooltip in the hi-fi). This is the most important pattern in the CMS.',
      'Every button has a visible keyboard focus ring.',
    ],
  },
  {
    id: '19', title: 'On/off switch', group: 'Component sheets', journeys: ['J6', 'J8'],
    draw: (
      <div className="space-y-3 rounded-md border-2 border-neutral-700 bg-neutral-50 p-3">
        <Row className="flex-wrap gap-6">
          <div className="space-y-1"><Row><N n={1} /><L dim>off</L></Row><Sw on={false} label="Families can see it" /></div>
          <div className="space-y-1"><L dim>on</L><Sw on label="Families can see it" /></div>
          <div className="space-y-1"><Row><N n={2} /><L dim>locked, with reason</L></Row><Sw on={false} locked label="Telugu on" /><div><L dim>“Telugu is not complete in production yet”</L></div></div>
        </Row>
        <Row className="flex-wrap gap-6">
          <div className="space-y-1"><Row><N n={3} /><L dim>in a table (read-only)</L></Row><Row><Sw on /><L>On</L><Sw on={false} /><L>Off</L></Row></div>
          <div className="space-y-1"><Row><N n={4} /><L dim>per language</L></Row><Row><P kind="solid">EN</P><P kind="solid">TE</P><P kind="dashed">KN</P></Row></div>
        </Row>
      </div>
    ),
    notes: [
      'The label says what the switch means for families (“Families can see it”), not a technical word like is_active.',
      'Locked switches look faded, show a lock, and give the reason.',
      'In tables the switch is a read-only state with the word On/Off next to it, so it is never only a shape.',
      'Language state in tables uses solid (on) and dashed (off) language codes.',
    ],
  },
  {
    id: '20', title: 'Status pills', group: 'Component sheets', journeys: ['J1', 'J5', 'J6'],
    draw: (
      <div className="space-y-3 rounded-md border-2 border-neutral-700 bg-neutral-50 p-3">
        <div className="space-y-1"><Row><N n={1} /><L dim>workflow status</L></Row><Row><P>Draft</P><L>→</L><P>In review</P><L>→</L><P kind="solid">Approved</P></Row></div>
        <div className="space-y-1"><Row><N n={2} /><L dim>validation</L></Row><Row><P kind="striped">3 errors</P><P kind="solid">✓ Passes</P><P kind="dashed">! 2 warnings</P></Row></div>
        <div className="space-y-1"><Row><N n={3} /><L dim>environment</L></Row><Row><P>staging</P><P kind="striped">production</P><P kind="striped">Production · read-only</P></Row></div>
        <div className="space-y-1"><Row><N n={4} /><L dim>change kind (promote)</L></Row><Row><P>new</P><P kind="dashed">changed</P></Row></div>
      </div>
    ),
    notes: [
      'Status moves one way: Draft → In review → Approved. Editing an approved item sends it back to Draft.',
      'Validation pills always carry a word and a count, never only a colour.',
      'Production is always striped (warning colour in the hi-fi), wherever it appears.',
      'Pills in the promote changes list say whether a chunk is new or changed.',
    ],
  },
];
