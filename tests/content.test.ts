import { describe, expect, it } from 'vitest';
import { type Chunk, applyAudio, audioPath, editChunkText, nodes, wordTimings } from '../src/lib/domain/content';
import { chunk, fresh, ramayana, staging } from './helpers';

const K1 = 'r-s1-c1-sc1-k1'; // Ramayana chunk with text and current audio in all three languages

describe('content tree', () => {
  it('lists every node in tree order, with a media path on scenes and chunks', () => {
    const ns = nodes(ramayana(fresh()));
    expect(ns[0]).toMatchObject({ type: 'book', label: 'Ramayana', depth: 0 });
    expect(ns.filter((n) => n.type === 'chunk')).toHaveLength(9);
    expect(ns.find((n) => n.id === K1)).toMatchObject({
      crumb: 'The King of Ayodhya › Scene 1 › Chunk 1',
      media: 'content_media/daily_learnings/books/1/sections/1/chapters/1/scenes/1/chunks/1/',
    });
  });

  it('labels nodes in the chosen language and falls back to English', () => {
    const ns = nodes(ramayana(fresh()), 'kn');
    expect(ns.find((n) => n.id === 'r-s1')!.label).toBe('ಬಾಲ ಕಾಂಡ');
    expect(ns.find((n) => n.id === 'r-s2-c1')!.label).toBe('Rama Leaves for the Forest'); // no Kannada title yet
  });

  it('builds fixed media paths: English at the root, other languages in a folder', () => {
    expect(audioPath('m/', 'en', 'female', 'audio.mp3')).toBe('m/body/female/audio.mp3');
    expect(audioPath('m/', 'te', 'male', 'transcript.json')).toBe('m/te/body/male/transcript.json');
  });

  it('puts story media under the bedtime stories folder (FR-STORY-04)', () => {
    const story = nodes(staging(fresh(), 'dhruva'));
    expect(story.find((n) => n.id === 'dhruva-sc1-k1')!.media).toBe('content_media/bedtime_stories/stories/2/scenes/1/chunks/1/');
  });
});

describe('rule: changing chunk text marks that language’s audio out of date', () => {
  it('marks current and draft audio stale in the edited language only', () => {
    const c = chunk(ramayana(fresh()), K1);
    c.audio.te!.child = { state: 'draft', source: 'generated' };
    expect(editChunkText(c, 'te', 'కొత్త వాక్యం')).toBe(true);
    expect(c.text.te).toBe('కొత్త వాక్యం');
    expect(Object.values(c.audio.te!).map((a) => a!.state)).toEqual(['stale', 'stale', 'stale']);
    expect(Object.values(c.audio.en!).every((a) => a!.state === 'current')).toBe(true);
    expect(Object.values(c.audio.kn!).every((a) => a!.state === 'current')).toBe(true);
  });

  it('leaves missing audio as missing', () => {
    const c = chunk(ramayana(fresh()), 'r-s1-c1-sc2-k2'); // Telugu male voice is missing
    editChunkText(c, 'te', 'మార్చిన వాక్యం');
    expect(c.audio.te!.male!.state).toBe('missing');
    expect(c.audio.te!.female!.state).toBe('stale');
  });

  it('does nothing when the text did not really change', () => {
    const c = chunk(ramayana(fresh()), K1);
    expect(editChunkText(c, 'te', c.text.te!)).toBe(false);
    expect(c.audio.te!.female!.state).toBe('current');
  });
});

describe('audio lifecycle: regenerate or upload → draft → approve or reject', () => {
  const blank = (): Chunk => ({ id: 'x', text: { te: 'ఒక వాక్యం' }, audio: {} });

  it('regenerate makes a draft, approve makes it current', () => {
    const c = blank();
    applyAudio(c, 'te', 'female', 'regenerate');
    expect(c.audio.te!.female).toMatchObject({ state: 'draft', source: 'generated' });
    expect(applyAudio(c, 'te', 'female', 'approve')).toBe(true);
    expect(c.audio.te!.female).toEqual({ state: 'current', source: 'generated' });
  });

  it('upload keeps the file name through approval', () => {
    const c = blank();
    applyAudio(c, 'te', 'male', 'upload', 'take2.mp3');
    applyAudio(c, 'te', 'male', 'approve');
    expect(c.audio.te!.male).toEqual({ state: 'current', source: 'uploaded', file: 'take2.mp3' });
  });

  it('reject restores exactly what was there before, including an uploaded file', () => {
    const c = blank();
    c.audio.te = { female: { state: 'current', source: 'uploaded', file: 'studio.mp3' } };
    applyAudio(c, 'te', 'female', 'regenerate');
    applyAudio(c, 'te', 'female', 'reject');
    expect(c.audio.te!.female).toEqual({ state: 'current', source: 'uploaded', file: 'studio.mp3' });
  });

  it('reject after two drafts in a row goes back to the asset before the first draft', () => {
    const c = blank();
    c.audio.te = { female: { state: 'stale', source: 'generated' } };
    applyAudio(c, 'te', 'female', 'regenerate');
    applyAudio(c, 'te', 'female', 'upload', 'b.mp3');
    applyAudio(c, 'te', 'female', 'reject');
    expect(c.audio.te!.female!.state).toBe('stale');
  });

  it('approve and reject only work on a draft', () => {
    const c = blank();
    expect(applyAudio(c, 'te', 'female', 'approve')).toBe(false);
    expect(c.audio.te!.female).toBeUndefined();
    c.audio.te = { male: { state: 'stale', source: 'generated' } };
    expect(applyAudio(c, 'te', 'male', 'reject')).toBe(false);
    expect(c.audio.te!.male!.state).toBe('stale');
  });
});

describe('word timings (transcript)', () => {
  it('gives one entry per word, in order, without overlaps', () => {
    const w = wordTimings('  Long ago,   King Dasharatha ruled ');
    expect(w.map((x) => x.word)).toEqual(['Long', 'ago,', 'King', 'Dasharatha', 'ruled']);
    expect(w[0].start).toBe(0);
    for (let i = 0; i < w.length; i++) {
      expect(w[i].end).toBeGreaterThan(w[i].start);
      if (i) expect(w[i].start).toBeGreaterThan(w[i - 1].end);
    }
  });

  it('longer words take longer', () => {
    const [a, b] = wordTimings('a Dasharatha');
    expect(b.end - b.start).toBeGreaterThan(a.end - a.start);
  });

  it('returns nothing for empty text', () => {
    expect(wordTimings('   ')).toEqual([]);
  });
});
