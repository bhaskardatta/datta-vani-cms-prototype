// Validation context: the policy that turns an item into a list of Issues.
// Errors block approve, promote and switching on. Warnings do not.
import { type Item, type Lang, type NodeInfo, type Text, LANG_NAME, LANGS, REQUIRED, VOICES, nodes } from './content';
import { started } from './localization';

export type Issue = { level: 'error' | 'warning'; lang: Lang; node: string; where: string; msg: string };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function validate(it: Item): Issue[] {
  const ns = nodes(it);
  const out: Issue[] = [];
  for (const l of LANGS) {
    const add = (level: Issue['level'], n: NodeInfo, msg: string) => out.push({ level, lang: l, node: n.id, where: n.crumb, msg });
    if (!started(it, l)) { add('warning', ns[0], `${LANG_NAME[l]} not started`); continue; }
    const need = (n: NodeInfo, txt: Text | undefined, what: string) => { if (!txt?.[l]?.trim()) add('error', n, `${what} missing`); };
    const en = l === 'en'; // language-independent checks are reported once, under English
    for (const n of ns) {
      switch (n.type) {
        case 'book': need(n, n.obj.name, 'Book name'); need(n, n.obj.description, 'Description'); break;
        case 'story': {
          const o = n.obj;
          need(n, o.name, 'Story title'); need(n, o.description, 'Description');
          if (en && !o.cover) add('error', n, 'Cover image missing');
          if (en && !o.themes.length) add('error', n, 'Needs at least one theme');
          if (en && !o.characters.length) add('error', n, 'Needs at least one character');
          if (en && !o.scenes.length) add('error', n, 'Needs at least one scene');
          break;
        }
        case 'section': need(n, n.obj.title, 'Section title'); break;
        case 'chapter': {
          const o = n.obj;
          need(n, o.title, 'Chapter title'); need(n, o.content, 'Chapter text'); need(n, o.takeaway, 'Key takeaway'); need(n, o.ask, 'Ask-Tataji question');
          if (en && !o.scenes.length) add('error', n, 'Needs at least one scene');
          if (en && !o.quiz) add('error', n, 'No quiz linked');
          break;
        }
        case 'quiz':
          if (en && !n.obj.questions.length) add('error', n, 'Quiz has no questions');
          n.obj.questions.forEach((q, i) => {
            if (!q.prompt[l]?.trim()) add('error', n, `Question ${i + 1}: question text missing`);
            if (q.options.some((op) => !op[l]?.trim())) add('error', n, `Question ${i + 1}: an answer option is missing`);
            if (en && q.options.length < 1) add('error', n, `Question ${i + 1}: needs answer options`);
          });
          break;
        case 'scene':
          if (en && !n.obj.portrait) add('error', n, 'Portrait image missing');
          if (en && !n.obj.landscape) add('error', n, 'Landscape image missing');
          if (en && !n.obj.chunks.length) add('error', n, 'Needs at least one chunk');
          break;
        case 'chunk': {
          const o = n.obj;
          need(n, o.text, 'Text');
          if (o.text[l]?.trim()) for (const v of VOICES) {
            const st = o.audio[l]?.[v]?.state ?? 'missing', level = REQUIRED.includes(v) ? 'error' : 'warning';
            if (st === 'missing') add(level, n, `${cap(v)} voice: audio missing`);
            if (st === 'draft') add(level, n, `${cap(v)} voice: draft waiting for approval`);
            if (st === 'stale') add(level, n, `${cap(v)} voice: out of date, the text changed`);
          }
          break;
        }
      }
    }
  }
  return out;
}

export const errorsIn = (issues: Issue[], l: Lang) => issues.filter((i) => i.lang === l && i.level === 'error').length;
