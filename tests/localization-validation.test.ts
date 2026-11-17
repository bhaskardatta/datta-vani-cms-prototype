import { describe, expect, it } from 'vitest';
import { editChunkText } from '../src/lib/domain/content';
import { coverage, fallback, say, started } from '../src/lib/domain/localization';
import { errorsIn, validate } from '../src/lib/domain/validation';
import { chunk, fresh, ramayana, staging } from './helpers';

describe('localization', () => {
  it('fallback shows English when a language has no text; say does not', () => {
    expect(fallback({ en: 'Hi', te: 'నమస్తే' }, 'te')).toBe('నమస్తే');
    expect(fallback({ en: 'Hi' }, 'kn')).toBe('Hi');
    expect(say({ en: 'Hi' }, 'kn')).toBe('');
  });

  it('coverage counts chunks with text and approved audio in every required voice', () => {
    const r = ramayana(fresh());
    expect(coverage(r, 'en')).toBe(1);
    expect(coverage(r, 'te')).toBeCloseTo(6 / 9); // one male voice missing, one female stale, one chunk untranslated
    expect(coverage(r, 'kn')).toBeCloseTo(5 / 9);
  });

  it('an optional voice (child) does not lower coverage', () => {
    const r = ramayana(fresh());
    chunk(r, 'r-s1-c1-sc1-k1').audio.te!.child = { state: 'missing' };
    expect(coverage(r, 'te')).toBeCloseTo(6 / 9);
  });

  it('a language with no text has not started and has zero coverage', () => {
    const gita = staging(fresh(), 'gita');
    expect(started(gita, 'te')).toBe(false);
    expect(started(gita, 'en')).toBe(true);
    expect(coverage(gita, 'te')).toBe(0);
  });
});

describe('validation policy', () => {
  it('a language that has not started is one warning, not a page of errors', () => {
    const issues = validate(staging(fresh(), 'gita'));
    expect(issues.filter((i) => i.lang === 'te')).toEqual([expect.objectContaining({ level: 'warning', msg: 'Telugu not started' })]);
    expect(errorsIn(issues, 'te')).toBe(0);
  });

  it('a fully translated book passes in every language', () => {
    const issues = validate(staging(fresh(), 'datta'));
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
  });

  it('finds the planted Telugu problems in Ramayana, each pointing at its chunk', () => {
    const issues = validate(ramayana(fresh())).filter((i) => i.lang === 'te');
    const at = (node: string) => issues.filter((i) => i.node === node).map((i) => `${i.level}: ${i.msg}`);
    expect(at('r-s1-c1-sc2-k2')).toEqual(['error: Male voice: audio missing']);
    expect(at('r-s1-c2-sc1-k1')).toEqual(['error: Female voice: out of date, the text changed']);
    expect(at('r-s1-c2-sc1-k2')).toEqual(['warning: Child voice: audio missing']); // child is optional
    expect(at('r-s2-c1-sc1-k2')).toEqual(['error: Text missing']);
    expect(errorsIn(validate(ramayana(fresh())), 'en')).toBe(0);
  });

  it('quiz text and every answer option are needed in each started language', () => {
    const issues = validate(ramayana(fresh())).filter((i) => i.lang === 'kn' && i.node === 'r-s1-c1-q');
    expect(issues.map((i) => i.msg)).toEqual(['Question 3: question text missing', 'Question 3: an answer option is missing']);
  });

  it('every chapter of an epic needs a quiz (FR-QUIZ-04)', () => {
    const r = ramayana(fresh());
    delete r.sections[0].chapters[0].quiz;
    expect(validate(r)).toContainEqual(expect.objectContaining({ level: 'error', lang: 'en', node: 'r-s1-c1', msg: 'No quiz linked' }));
  });

  it('reports language-independent problems once, under English', () => {
    const issues = validate(staging(fresh(), 'clever-crow'));
    const msgs = (l: string) => issues.filter((i) => i.lang === l && i.level === 'error').map((i) => i.msg);
    expect(msgs('en')).toEqual(expect.arrayContaining([
      'Cover image missing', 'Needs at least one character', 'Landscape image missing', 'Female voice: audio missing', 'Male voice: audio missing',
    ]));
    expect(issues).toContainEqual(expect.objectContaining({ level: 'warning', msg: 'Child voice: audio missing' }));
    expect(msgs('te')).toEqual([]);
  });

  it('editing text turns approved audio into errors until it is redone', () => {
    const r = ramayana(fresh());
    const before = errorsIn(validate(r), 'en');
    editChunkText(chunk(r, 'r-s1-c1-sc1-k1'), 'en', 'Long ago, a good king ruled Ayodhya.');
    expect(errorsIn(validate(r), 'en')).toBe(before + 2); // female and male; child is a warning
  });
});
