'use client';
// The chunk panel: one sentence, and per voice its audio + word-timing transcript (regenerate, upload, play, approve, reject).
import { useEffect, useRef, useState } from 'react';
import { type Audio, type Chunk, type Lang, type NodeOf, type Voice, LANG_NAME, REQUIRED, VOICES, audioPath, wordTimings } from '@/lib/domain/content';
import { act } from '@/lib/store';
import { type Ctx, H, TextField, langAttr } from './Panels';
import { Button, Icon, type IconName, Pill, cx, toast } from './ui';

// Audio is simulated: the browser's speech synthesis reads the sentence (pitch tells the voices apart) while the
// fake transcript timings drive the word highlight.
const PITCH: Record<Voice, number> = { female: 1.15, male: 0.75, child: 1.6 };
const HIGHLIGHT_TICK_MS = 60;
const FAKE_GENERATE_MS = 1400; // long enough to show the loading state
const WAVE_BARS = 56;

function usePlayer() {
  const [playing, setPlaying] = useState<{ key: string; idx: number; silent: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const stop = () => { window.clearInterval(timer.current); window.speechSynthesis?.cancel(); setPlaying(null); };
  useEffect(() => stop, []);
  const start = (key: string, text: string, lang: Lang, voice: Voice) => {
    stop();
    const words = wordTimings(text);
    const synth = window.speechSynthesis;
    const v = synth?.getVoices().find((x) => x.lang.toLowerCase().startsWith(lang));
    if (synth && v) {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang; u.pitch = PITCH[voice]; u.rate = 0.95;
      synth.speak(u);
    }
    const t0 = performance.now();
    setPlaying({ key, idx: 0, silent: !v });
    timer.current = window.setInterval(() => {
      const t = (performance.now() - t0) / 1000;
      const idx = words.findIndex((w) => t < w.end);
      if (idx < 0) stop(); else setPlaying((p) => (p ? { ...p, idx } : p));
    }, HIGHLIGHT_TICK_MS);
  };
  return { playing, start, stop };
}

const STATE: Record<Audio['state'], { tone: 'leaf' | 'indigo' | 'amber' | 'danger' | 'neutral'; label: string; icon: IconName }> = {
  current: { tone: 'leaf', label: 'Approved', icon: 'check' },
  draft: { tone: 'indigo', label: 'Draft · listen, then approve', icon: 'clock' },
  stale: { tone: 'amber', label: 'Out of date · text changed', icon: 'alert' },
  missing: { tone: 'danger', label: 'Missing', icon: 'error' },
};

export function ChunkPanel({ ctx, n }: { ctx: Ctx; n: NodeOf<'chunk'> }) {
  const c = n.obj;
  const { lang } = ctx;
  const text = c.text[lang] ?? '';
  const player = usePlayer();
  const words = wordTimings(text);
  const hasAudio = Object.values(c.audio[lang] ?? {}).some((a) => a?.state === 'current' || a?.state === 'draft');
  const needs = VOICES.filter((v) => ['stale', 'missing', 'draft'].includes(c.audio[lang]?.[v]?.state ?? 'missing') && REQUIRED.includes(v)).length;
  return (
    <div className="max-w-3xl">
      <H type="chunk" lang={ctx.lang} kind="Chunk" sub="One sentence. Each voice has an audio file and a word-timing transcript, made as a pair.">{n.crumb}</H>
      <TextField ctx={ctx} id={n.id} label="Sentence" value={c.text} multiline
        savedSub={hasAudio ? `Its ${LANG_NAME[lang]} audio is now out of date. Regenerate or upload each voice.` : undefined}
        onCommit={(v, before) => act.editChunkText(ctx.match, n.id, lang, v, before)} />

      {player.playing && (
        <div className="mt-4 animate-fade-up rounded-xl border border-indigo/25 bg-tint px-4 py-3" aria-live="polite">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-deep">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo" aria-hidden />
            Now playing · word highlighting from the transcript{player.playing.silent && ` · no ${LANG_NAME[lang]} voice in this browser, timing only`}
          </div>
          <p lang={langAttr(lang)} className="text-lg leading-relaxed">
            {words.map((w, i) => <span key={i} className={cx('rounded px-0.5 transition-colors duration-150', i === player.playing!.idx && 'bg-indigo text-white')}>{w.word} </span>)}
          </p>
        </div>
      )}

      <div className="mt-8 mb-2 flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Audio and transcript · {LANG_NAME[lang]}</h3>
        {text && (needs ? <Pill tone="amber" icon="alert">{needs} required voice{needs > 1 ? 's need' : ' needs'} attention</Pill> : <Pill tone="leaf" icon="check">Required voices approved</Pill>)}
      </div>
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        {VOICES.map((v) => <VoiceRow key={v} ctx={ctx} chunk={c} voice={v} media={n.media!} player={player} words={words.length} />)}
      </div>
      <p className="mt-2 text-xs text-muted">Female and male voices are required; child is optional. A changed sentence marks its audio out of date. Waveforms are simulated.</p>
    </div>
  );
}

/** Bar heights (0..1) for a fake waveform: an FNV-1a hash of the seed drives a small PRNG, so the same text and voice
 *  always draw the same shape; a sine envelope makes it swell in the middle like speech. */
function waveBars(seed: string): number[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: WAVE_BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const env = Math.sin((i / (WAVE_BARS - 1)) * Math.PI) * 0.6 + 0.4;
    return Math.max(0.12, (((h >>> 0) % 100) / 100) * env);
  });
}

// Honest stand-in for a waveform: stable pseudo-random bars from the text and voice.
function Waveform({ seed, progress, state }: { seed: string; progress: number | null; state: Audio['state'] }) {
  const bars = waveBars(seed);
  const base = state === 'stale' ? 'bg-amber/35' : state === 'draft' ? 'bg-indigo/35' : 'bg-line-strong';
  return (
    <div aria-hidden className="flex h-8 min-w-0 flex-1 items-center gap-px sm:gap-[2px]">
      {bars.map((b, i) => (
        <span key={i} className={cx('w-full rounded-full transition-colors duration-150', progress !== null && i / bars.length <= progress ? 'bg-indigo' : base)} style={{ height: `${b * 100}%` }} />
      ))}
    </div>
  );
}

function VoiceRow({ ctx, chunk, voice, media, player, words }: { ctx: Ctx; chunk: Chunk; voice: Voice; media: string; player: ReturnType<typeof usePlayer>; words: number }) {
  const { lang, block, match } = ctx;
  const a: Audio = chunk.audio[lang]?.[voice] ?? { state: 'missing' };
  const text = chunk.text[lang] ?? '';
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const key = `${chunk.id}-${lang}-${voice}`;
  const isPlaying = player.playing?.key === key;
  const required = REQUIRED.includes(voice);
  const st = a.state === 'missing' && !required ? { tone: 'neutral' as const, label: 'Missing (optional)', icon: 'info' as IconName } : STATE[a.state];
  const noText = !text ? `Add the ${LANG_NAME[lang]} sentence first` : null;
  const timings = wordTimings(text);
  const secs = timings.at(-1)?.end ?? 0;
  const name = voice[0].toUpperCase() + voice.slice(1);
  return (
    <div role="group" aria-label={`${name} voice`} className="px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-bg font-display text-sm font-bold text-muted" aria-hidden>{name[0]}</span>
        <div className="min-w-[110px]">
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-muted">{required ? 'Required' : 'Optional'}</div>
        </div>
        <Pill tone={st.tone} icon={st.icon}>{st.label}</Pill>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          {a.state === 'draft' ? (
            <>
              <Button size="sm" variant="primary" icon="check" blocked={block}
                onClick={() => { if (act.audio(match, chunk.id, lang, voice, 'approve')) toast(`${name} voice approved`, { sub: `${LANG_NAME[lang]} audio and transcript are now current.` }); }}>Approve</Button>
              <Button size="sm" icon="x" blocked={block}
                onClick={() => { if (act.audio(match, chunk.id, lang, voice, 'reject')) toast('Draft rejected', { tone: 'info', sub: 'The previous state is back.' }); }}>Reject</Button>
            </>
          ) : (
            <>
              <Button size="sm" icon="refresh" blocked={block ?? noText} loading={busy}
                onClick={() => {
                  setBusy(true);
                  window.setTimeout(() => { const ok = act.audio(match, chunk.id, lang, voice, 'regenerate'); setBusy(false); if (ok) toast(`${name} voice draft ready`, { sub: 'Play it, then approve or reject.' }); }, FAKE_GENERATE_MS);
                }}>
                {busy ? 'Generating…' : 'Regenerate'}
              </Button>
              <Button size="sm" icon="upload" blocked={block ?? noText} disabled={busy} onClick={() => file.current?.click()}>Upload</Button>
              <input ref={file} type="file" accept="audio/*" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  // accept="audio/*" only filters the picker; a dropped or forced file can still be anything.
                  if (f && !f.type.startsWith('audio/')) toast(`${f.name} is not an audio file`, { tone: 'danger', sub: 'Upload an MP3, WAV or other audio recording.' });
                  else if (f && act.audio(match, chunk.id, lang, voice, 'upload', f.name)) toast(`Uploaded ${f.name}`, { sub: 'A transcript was made from it as a draft.' });
                  e.target.value = '';
                }} />
            </>
          )}
        </div>
      </div>

      {a.state === 'missing' ? (
        <div className="mt-3 flex h-11 items-center justify-center rounded-lg border border-dashed border-line-strong text-xs text-muted">
          {noText ?? 'No audio yet: regenerate it from the text, or upload a recording'}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-bg px-2 py-1.5 sm:gap-3">
          <button type="button" aria-pressed={isPlaying} disabled={!text} onClick={() => (isPlaying ? player.stop() : player.start(key, text, lang, voice))}
            aria-label={isPlaying ? `Stop ${voice} voice` : `Play ${voice} voice`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-indigo-deep active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:h-11 pointer-coarse:w-11">
            <Icon name={isPlaying ? 'stop' : 'play'} size={13} />
          </button>
          <Waveform seed={key + text} state={a.state} progress={isPlaying ? (player.playing!.idx + 1) / Math.max(1, words) : null} />
          <span className="w-10 shrink-0 text-right font-mono text-xs text-muted tabular-nums max-sm:hidden">0:{String(Math.round(secs)).padStart(2, '0')}</span>
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
            className={cx('flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors duration-200 pointer-coarse:h-11', open ? 'bg-surface text-indigo shadow-xs' : 'text-muted hover:bg-surface hover:text-ink')}>
            <Icon name="list" size={13} />Transcript
          </button>
        </div>
      )}
      {a.state !== 'missing' && (
        <p className="mt-1.5 pl-1 text-xs text-muted">{a.source === 'uploaded' ? `Uploaded ${a.file ?? ''}` : 'Generated by the audio script'}</p>
      )}

      {open && a.state !== 'missing' && (
        <div className="mt-2 animate-fade-up rounded-lg border border-line p-3">
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {timings.map((w, i) => (
              <span key={i} className={cx('rounded px-1.5 py-0.5 ring-1 transition-colors duration-150', isPlaying && i === player.playing!.idx ? 'bg-indigo text-white ring-indigo' : 'bg-bg ring-line')}>
                <span lang={langAttr(lang)}>{w.word}</span> <span className={isPlaying && i === player.playing!.idx ? 'text-white/80' : 'text-muted'}>{w.start}–{w.end}s</span>
              </span>
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] break-all text-muted">{audioPath(media, lang, voice, 'audio.mp3')}<br />{audioPath(media, lang, voice, 'transcript.json')}</p>
        </div>
      )}
    </div>
  );
}
