'use client';
import { useState } from 'react';
import { type NodeOf, type QType, type Question, type Quiz, LANG_NAME, QTYPE_NAME } from '@/lib/domain/content';
import { act } from '@/lib/store';
import { type Ctx, H, TextField } from './Panels';
import { Button, Dot, Label, Notice, Pill, cx, toast } from './ui';

const TF = [{ en: 'True', te: 'నిజం', kn: 'ಸರಿ' }, { en: 'False', te: 'తప్పు', kn: 'ತಪ್ಪು' }];

export function QuizPanel({ ctx, n }: { ctx: Ctx; n: NodeOf<'quiz'> }) {
  const quiz = n.obj;
  const [qi, setQi] = useState(0);
  const i = Math.min(qi, quiz.questions.length - 1);
  const q: Question | undefined = quiz.questions[i];
  const { lang, block, match } = ctx;
  const en = lang === 'en';
  const editQ = (fn: (q: Question) => void, action: string, before?: string, after?: string) =>
    act.edit(match, quiz.id, (z: Quiz) => fn(z.questions[i]), { action, before, after });
  const missing = (x: Question) => !x.prompt[lang]?.trim() || x.options.some((o) => !o[lang]?.trim());

  return (
    <div className="max-w-4xl">
      <H type="quiz" lang={lang} kind="Quiz" sub={en ? 'Questions children answer after the chapter.' : undefined}>{n.crumb}</H>
      {!en && (
        <Notice tone="indigo" icon="info" className="-mt-2 mb-6">
          Translate the words only. The question type, the correct answer and the option order follow English.
        </Notice>
      )}
      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <ul className="space-y-1.5">
            {quiz.questions.map((x, k) => (
              <li key={x.id}>
                <button type="button" onClick={() => setQi(k)} aria-current={k === i}
                  className={cx('w-full min-w-0 rounded-xl border px-3 py-2.5 text-left text-sm shadow-xs transition-[border-color,background-color] duration-200',
                    k === i ? 'border-indigo bg-tint ring-1 ring-indigo/20' : 'border-line bg-surface hover:border-indigo/40')}>
                  <span className={cx('flex items-center gap-2 text-xs font-semibold', k === i ? 'text-indigo-deep' : 'text-muted')}>
                    <span className="font-mono">Q{k + 1}</span> · {QTYPE_NAME[x.type]}
                    {missing(x) && <span className="ml-auto"><Dot tone="danger" label={`${LANG_NAME[lang]} text missing`} /></span>}
                  </span>
                  <span lang={x.prompt[lang] && !en ? lang : undefined} className={cx('mt-0.5 block truncate', !x.prompt[lang] && 'text-coral-deep italic')}>{x.prompt[lang] || `no ${LANG_NAME[lang]} text`}</span>
                </button>
              </li>
            ))}
          </ul>
          <Button size="sm" icon="plus" className="mt-3 w-full" blocked={block ?? (en ? null : 'Add questions in English first')}
            onClick={() => {
              act.edit(match, quiz.id, (z: Quiz) => { z.questions.push({ id: `${z.id}-n${Date.now().toString(36)}`, type: 'mcq', prompt: {}, options: [{}, {}], answer: 0, hint: {} }); }, { action: 'Added a quiz question' });
              setQi(quiz.questions.length);
              toast('Question added', { sub: 'Write it in English, then translate.' });
            }}>
            Add question
          </Button>
        </div>

        {q && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="qtype">Question type</Label>
              <select id="qtype" value={q.type} disabled={!!block || !en} title={block ?? (!en ? 'The type is set in English' : undefined)}
                onChange={(e) => {
                  const t = e.target.value as QType;
                  editQ((x) => { x.type = t; if (t === 'tf') { x.options = structuredClone(TF); x.answer = 0; } }, 'Changed question type', QTYPE_NAME[q.type], QTYPE_NAME[t]);
                }}
                className="h-10 max-w-full rounded-lg border border-line bg-surface px-3 text-sm shadow-xs pointer-coarse:h-11 transition-colors duration-200 enabled:hover:border-indigo/40 disabled:cursor-not-allowed disabled:bg-bg disabled:text-muted disabled:shadow-none">
                {(Object.keys(QTYPE_NAME) as QType[]).map((t) => <option key={t} value={t}>{QTYPE_NAME[t]}</option>)}
              </select>
            </div>
            <TextField ctx={ctx} id={`${q.id}-p`} label="Question" value={q.prompt} multiline
              onCommit={(v, b) => editQ((x) => { x.prompt[lang] = v; }, `Edited ${LANG_NAME[lang]} quiz question`, b, v)} />

            <fieldset>
              <legend className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                {q.type === 'fill' || q.type === 'anagram' ? 'Answer' : q.type === 'match' ? 'Pairs (left = right)' : 'Options · pick the correct one'}
              </legend>
              <div className="space-y-2.5">
                {q.options.map((o, k) => (
                  <div key={k} className="flex items-start gap-3">
                    {q.options.length > 1 && (
                      <label className="contents pointer-coarse:-my-1 pointer-coarse:grid pointer-coarse:h-11 pointer-coarse:w-11 pointer-coarse:shrink-0 pointer-coarse:place-items-center">
                      <input type="radio" name={`ans-${q.id}`} checked={q.answer === k} disabled={!!block || !en} aria-label={`Option ${k + 1} is correct`}
                        title={block ?? (!en ? 'The correct answer is set in English' : undefined)}
                        onChange={() => editQ((x) => { x.answer = k; }, 'Changed correct answer', `Option ${q.answer + 1}`, `Option ${k + 1}`)}
                        className="mt-3 h-4 w-4 accent-[var(--color-indigo)] pointer-coarse:mt-0" />
                      </label>
                    )}
                    <div className="flex-1">
                      <TextField ctx={ctx} compact id={`${q.id}-o${k}`} label={`Option ${k + 1}`} value={o}
                        onCommit={(v, b) => editQ((x) => { x.options[k][lang] = v; }, `Edited ${LANG_NAME[lang]} quiz option`, b, v)} />
                    </div>
                    {q.answer === k && q.options.length > 1 && <Pill tone="leaf" icon="check" className="mt-2">Correct</Pill>}
                  </div>
                ))}
              </div>
              {en && (q.type === 'mcq' || q.type === 'match') && (
                <Button size="sm" variant="ghost" icon="plus" className="mt-2" blocked={block} onClick={() => editQ((x) => { x.options.push({}); }, 'Added a quiz option')}>Add option</Button>
              )}
            </fieldset>

            <TextField ctx={ctx} id={`${q.id}-h`} label="Hint" value={q.hint}
              onCommit={(v, b) => editQ((x) => { x.hint[lang] = v; }, `Edited ${LANG_NAME[lang]} quiz hint`, b, v)} />
          </div>
        )}
      </div>
    </div>
  );
}
