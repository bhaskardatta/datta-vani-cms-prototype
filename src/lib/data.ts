// Sample data for the CMS prototype. Everything here is fake and lives in the browser.
import {
  type Audio, type AudioState, type Book, type Chunk, type Item, type Lang, type Status, type Story, type Text, type Voice, LANGS, isLangMap,
} from './domain/content';
import type { DB } from './domain/publishing';

// ---------- builders ----------
const T = (en: string, te?: string, kn?: string): Text => ({ en, ...(te ? { te } : {}), ...(kn ? { kn } : {}) });
const cur = (): Audio => ({ state: 'current', source: 'generated' });
type Gap = [Lang, Voice, AudioState];
function chunk(id: string, text: Text, gaps: Gap[] = []): Chunk {
  const audio: Chunk['audio'] = {};
  for (const l of LANGS) if (text[l]) audio[l] = { female: cur(), male: cur(), child: cur() };
  for (const [l, v, state] of gaps) (audio[l] ??= {})[v] = state === 'missing' ? { state } : { state, source: 'generated' };
  return { id, text, audio };
}
const img = { portrait: 'portrait.webp', landscape: 'landscape.webp' };
const TF = [T('True', 'నిజం', 'ಸರಿ'), T('False', 'తప్పు', 'ತಪ್ಪು')];

// ---------- Ramayana: hand-written, with planted problems ----------
function ramayana(): Book {
  return {
    kind: 'book', id: 'r', match: 'ramayana', num: 1, status: 'in_review', active: false,
    langOn: { en: true, te: false, kn: false }, updatedAt: '2026-11-15T06:20:00.000Z',
    name: T('Ramayana', 'రామాయణం', 'ರಾಮಾಯಣ'),
    description: T('The story of Prince Rama, told for young readers.', 'యువ పాఠకుల కోసం శ్రీరాముని కథ.', 'ಯುವ ಓದುಗರಿಗಾಗಿ ಶ್ರೀರಾಮನ ಕಥೆ.'),
    sections: [
      {
        id: 'r-s1', title: T('Bala Kanda', 'బాల కాండ', 'ಬಾಲ ಕಾಂಡ'),
        chapters: [
          {
            id: 'r-s1-c1', title: T('The King of Ayodhya', 'అయోధ్య రాజు', 'ಅಯೋಧ್ಯೆಯ ರಾಜ'),
            content: T('King Dasharatha longs for children and prays with his whole heart.', 'దశరథ మహారాజు సంతానం కోసం మనస్ఫూర్తిగా ప్రార్థిస్తాడు.', 'ದಶರಥ ಮಹಾರಾಜನು ಮಕ್ಕಳಿಗಾಗಿ ಮನಃಪೂರ್ವಕವಾಗಿ ಪ್ರಾರ್ಥಿಸುತ್ತಾನೆ.'),
            takeaway: T('Sincere prayer is always heard.', 'మనస్ఫూర్తి ప్రార్థన తప్పక ఫలిస్తుంది.', 'ಮನಃಪೂರ್ವಕ ಪ್ರಾರ್ಥನೆ ಫಲಿಸುತ್ತದೆ.'),
            ask: T('Tataji, why did the king feel sad?', 'తాతాజీ, రాజు ఎందుకు బాధపడ్డాడు?'),
            scenes: [
              {
                id: 'r-s1-c1-sc1', ...img, chunks: [
                  chunk('r-s1-c1-sc1-k1', T('Long ago, King Dasharatha ruled the city of Ayodhya.', 'చాలా కాలం క్రితం, దశరథ మహారాజు అయోధ్య నగరాన్ని పాలించాడు.', 'ಬಹಳ ಹಿಂದೆ, ದಶರಥ ಮಹಾರಾಜನು ಅಯೋಧ್ಯೆ ನಗರವನ್ನು ಆಳುತ್ತಿದ್ದನು.')),
                  chunk('r-s1-c1-sc1-k2', T('He was a kind and just king.', 'అతను దయగల, న్యాయమైన రాజు.', 'ಅವನು ದಯಾಳು ಮತ್ತು ನ್ಯಾಯವಂತ ರಾಜನಾಗಿದ್ದನು.')),
                  chunk('r-s1-c1-sc1-k3', T('But he had no children, and this made him sad.', 'కానీ అతనికి పిల్లలు లేరు, అది అతనికి బాధ కలిగించింది.')),
                ],
              },
              {
                id: 'r-s1-c1-sc2', ...img, chunks: [
                  chunk('r-s1-c1-sc2-k1', T('The king prayed for children with all his heart.', 'రాజు మనస్ఫూర్తిగా సంతానం కోసం ప్రార్థించాడు.', 'ರಾಜನು ಮನಃಪೂರ್ವಕವಾಗಿ ಮಕ್ಕಳಿಗಾಗಿ ಪ್ರಾರ್ಥಿಸಿದನು.')),
                  chunk('r-s1-c1-sc2-k2', T('Soon, four sons were born: Rama, Lakshmana, Bharata and Shatrughna.', 'త్వరలోనే నలుగురు కుమారులు జన్మించారు: రాముడు, లక్ష్మణుడు, భరతుడు, శత్రుఘ్నుడు.', 'ಶೀಘ್ರದಲ್ಲೇ ನಾಲ್ವರು ಪುತ್ರರು ಜನಿಸಿದರು: ರಾಮ, ಲಕ್ಷ್ಮಣ, ಭರತ ಮತ್ತು ಶತ್ರುಘ್ನ.'), [['te', 'male', 'missing']]),
                ],
              },
            ],
            quiz: {
              id: 'r-s1-c1-q', questions: [
                { id: 'r-s1-c1-q1', type: 'mcq', prompt: T('Who ruled Ayodhya?', 'అయోధ్యను ఎవరు పాలించారు?', 'ಅಯೋಧ್ಯೆಯನ್ನು ಯಾರು ಆಳುತ್ತಿದ್ದರು?'), options: [T('King Dasharatha', 'దశరథ మహారాజు', 'ದಶರಥ ಮಹಾರಾಜ'), T('King Janaka', 'జనక మహారాజు', 'ಜನಕ ಮಹಾರಾಜ'), T('Ravana', 'రావణుడు', 'ರಾವಣ')], answer: 0, hint: T('He was Rama’s father.', 'ఆయన రాముని తండ్రి.', 'ಅವನು ರಾಮನ ತಂದೆ.') },
                { id: 'r-s1-c1-q2', type: 'tf', prompt: T('Dasharatha had many children at first.', 'మొదట్లో దశరథునికి చాలా మంది పిల్లలు ఉన్నారు.', 'ಮೊದಲು ದಶರಥನಿಗೆ ಅನೇಕ ಮಕ್ಕಳಿದ್ದರು.'), options: TF, answer: 1, hint: T('Read the first scene again.', 'మొదటి దృశ్యాన్ని మళ్ళీ చదవండి.', 'ಮೊದಲ ದೃಶ್ಯವನ್ನು ಮತ್ತೆ ಓದಿ.') },
                { id: 'r-s1-c1-q3', type: 'fill', prompt: T('Rama had ___ brothers.', 'రామునికి ___ మంది సోదరులు.'), options: [T('three', 'ముగ్గురు')], answer: 0, hint: T('Count the sons, then leave out Rama.', 'కుమారులను లెక్కించి, రాముడిని వదిలేయండి.') },
              ],
            },
          },
          {
            id: 'r-s1-c2', title: T('Rama and Sage Vishwamitra', 'రాముడు మరియు విశ్వామిత్ర మహర్షి', 'ರಾಮ ಮತ್ತು ವಿಶ್ವಾಮಿತ್ರ ಮಹರ್ಷಿ'),
            content: T('Sage Vishwamitra asks for young Rama’s help to protect the forest.', 'అడవిని రక్షించడానికి విశ్వామిత్ర మహర్షి రాముని సహాయం కోరారు.', 'ಕಾಡನ್ನು ರಕ್ಷಿಸಲು ವಿಶ್ವಾಮಿತ್ರ ಮಹರ್ಷಿಗಳು ರಾಮನ ಸಹಾಯ ಕೇಳಿದರು.'),
            takeaway: T('Courage means helping others even when it is hard.', 'కష్టమైనా ఇతరులకు సహాయం చేయడమే ధైర్యం.', 'ಕಷ್ಟವಾದರೂ ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡುವುದೇ ಧೈರ್ಯ.'),
            ask: T('Tataji, why did the sage choose Rama?', 'తాతాజీ, మహర్షి రాముడినే ఎందుకు ఎంచుకున్నారు?', 'ತಾತಾಜಿ, ಮಹರ್ಷಿಗಳು ರಾಮನನ್ನೇ ಏಕೆ ಆರಿಸಿದರು?'),
            scenes: [
              {
                id: 'r-s1-c2-sc1', ...img, chunks: [
                  chunk('r-s1-c2-sc1-k1', T('One day, Sage Vishwamitra came to the palace.', 'ఒక రోజు, విశ్వామిత్ర మహర్షి రాజభవనానికి వచ్చారు.', 'ಒಂದು ದಿನ, ವಿಶ್ವಾಮಿತ್ರ ಮಹರ್ಷಿಗಳು ಅರಮನೆಗೆ ಬಂದರು.'), [['te', 'female', 'stale']]),
                  chunk('r-s1-c2-sc1-k2', T('He asked the king to send Rama with him to protect the forest.', 'అడవిని రక్షించడానికి రాముడిని తనతో పంపమని రాజును అడిగారు.'), [['te', 'child', 'missing']]),
                ],
              },
            ],
            quiz: {
              id: 'r-s1-c2-q', questions: [
                { id: 'r-s1-c2-q1', type: 'mcq', prompt: T('Who came to the palace?', 'రాజభవనానికి ఎవరు వచ్చారు?', 'ಅರಮನೆಗೆ ಯಾರು ಬಂದರು?'), options: [T('Sage Vishwamitra', 'విశ్వామిత్ర మహర్షి', 'ವಿಶ್ವಾಮಿತ್ರ ಮಹರ್ಷಿ'), T('Sage Vasishtha', 'వశిష్ఠ మహర్షి', 'ವಸಿಷ್ಠ ಮಹರ್ಷಿ')], answer: 0, hint: T('He needed help with the forest.', 'ఆయనకు అడవి కోసం సహాయం కావాలి.', 'ಅವರಿಗೆ ಕಾಡಿಗಾಗಿ ಸಹಾಯ ಬೇಕಿತ್ತು.') },
              ],
            },
          },
        ],
      },
      {
        id: 'r-s2', title: T('Ayodhya Kanda', 'అయోధ్య కాండ'),
        chapters: [
          {
            id: 'r-s2-c1', title: T('Rama Leaves for the Forest', 'రాముడు అడవికి వెళ్ళాడు'),
            content: T('Rama keeps his father’s promise and leaves Ayodhya for fourteen years.', 'తండ్రి మాట నిలబెట్టడానికి రాముడు పద్నాలుగు సంవత్సరాలు అయోధ్యను వదిలి వెళ్ళాడు.'),
            takeaway: T('Keeping a promise is a sign of a good heart.', 'మాట నిలబెట్టుకోవడం మంచి మనసుకు గుర్తు.'),
            ask: T('Tataji, why did Rama agree to leave?', 'తాతాజీ, రాముడు వెళ్ళడానికి ఎందుకు ఒప్పుకున్నాడు?'),
            scenes: [
              {
                id: 'r-s2-c1-sc1', ...img, chunks: [
                  chunk('r-s2-c1-sc1-k1', T('Rama heard that he must leave Ayodhya.', 'రాముడు అయోధ్యను వదిలి వెళ్ళాలని విన్నాడు.')),
                  chunk('r-s2-c1-sc1-k2', T('He smiled and said, “I will keep my father’s word.”')),
                ],
              },
            ],
            quiz: {
              id: 'r-s2-c1-q', questions: [
                { id: 'r-s2-c1-q1', type: 'tf', prompt: T('Rama was angry when he had to leave.', 'వెళ్ళవలసి వచ్చినప్పుడు రాముడు కోపంగా ఉన్నాడు.'), options: TF, answer: 1, hint: T('Look at how Rama answered.', 'రాముడు ఎలా జవాబిచ్చాడో చూడండి.') },
              ],
            },
          },
        ],
      },
    ],
  };
}

// ---------- the other three books: generated sample text ----------
function sampleBook(key: string, num: number, name: Text, description: Text, sections: Text[], teChapters: number, knChapters: number, status: Status): Book {
  let sentence = 0;
  return {
    kind: 'book', id: key, match: key, num, status, active: false, langOn: { en: true, te: false, kn: false },
    updatedAt: '2026-11-14T12:00:00.000Z', name, description,
    sections: sections.map((title, si) => {
      const s = `${key}-s${si + 1}`;
      return {
        id: s, title: pick(title, si * 2 + 1 <= teChapters, si * 2 + 1 <= knChapters),
        chapters: [1, 2].map((ci) => {
          const n = si * 2 + ci, c = `${s}-c${ci}`, te = n <= teChapters, kn = n <= knChapters;
          const L = (en: string, teS: string, knS: string) => T(en, te ? teS : undefined, kn ? knS : undefined);
          return {
            id: c,
            title: L(`Chapter ${n}`, `అధ్యాయం ${n}`, `ಅಧ್ಯಾಯ ${n}`),
            content: L(`Sample chapter text ${n} for ${name.en}.`, `నమూనా అధ్యాయ పాఠం ${n}.`, `ಮಾದರಿ ಅಧ್ಯಾಯ ಪಠ್ಯ ${n}.`),
            takeaway: L(`Sample key takeaway ${n}.`, `నమూనా ముఖ్య సందేశం ${n}.`, `ಮಾದರಿ ಮುಖ್ಯ ಸಂದೇಶ ${n}.`),
            ask: L(`Sample Ask-Tataji question ${n}?`, `నమూనా తాతాజీ ప్రశ్న ${n}?`, `ಮಾದರಿ ತಾತಾಜಿ ಪ್ರಶ್ನೆ ${n}?`),
            scenes: [1, 2].map((sc) => ({
              id: `${c}-sc${sc}`, ...img,
              chunks: [1, 2].map((k) => {
                sentence++;
                return chunk(`${c}-sc${sc}-k${k}`, L(`${name.en}: sample sentence ${sentence}.`, `నమూనా వాక్యం ${sentence}.`, `ಮಾದರಿ ವಾಕ್ಯ ${sentence}.`));
              }),
            })),
            quiz: {
              id: `${c}-q`, questions: [
                { id: `${c}-q1`, type: 'mcq' as const, prompt: L(`Sample question ${n}?`, `నమూనా ప్రశ్న ${n}?`, `ಮಾದರಿ ಪ್ರಶ್ನೆ ${n}?`), options: [1, 2, 3].map((o) => L(`Option ${o}`, `ఎంపిక ${o}`, `ಆಯ್ಕೆ ${o}`)), answer: 0, hint: L('Sample hint.', 'నమూనా సూచన.', 'ಮಾದರಿ ಸುಳಿವು.') },
                { id: `${c}-q2`, type: 'tf' as const, prompt: L(`Sample true-or-false statement ${n}.`, `నమూనా నిజం-తప్పు వాక్యం ${n}.`, `ಮಾದರಿ ಸರಿ-ತಪ್ಪು ವಾಕ್ಯ ${n}.`), options: TF.map((o) => L(o.en!, o.te!, o.kn!)), answer: 0, hint: L('Sample hint.', 'నమూనా సూచన.', 'ಮಾದರಿ ಸುಳಿವು.') },
              ],
            },
          };
        }),
      };
    }),
  };
}
const pick = (t: Text, te: boolean, kn: boolean): Text => T(t.en!, te ? t.te : undefined, kn ? t.kn : undefined);

// ---------- bedtime stories ----------
function stories(): Story[] {
  const base = { kind: 'story' as const, active: false, langOn: { en: true, te: false, kn: false }, updatedAt: '2026-11-13T15:30:00.000Z' };
  return [
    {
      ...base, id: 'deer', match: 'kind-deer', num: 1, status: 'ready', cover: 'cover.webp',
      name: T('The Kind Deer', 'దయగల జింక', 'ದಯಾಳು ಜಿಂಕೆ'),
      description: T('A gentle deer helps a tired hunter find his way.', 'అలసిపోయిన వేటగాడికి ఒక సాధువైన జింక దారి చూపిస్తుంది.', 'ದಣಿದ ಬೇಟೆಗಾರನಿಗೆ ಸಾಧು ಜಿಂಕೆ ದಾರಿ ತೋರಿಸುತ್ತದೆ.'),
      themes: ['Kindness', 'Friendship'], characters: ['Deer', 'Hunter'],
      scenes: [
        { id: 'deer-sc1', ...img, chunks: [
          chunk('deer-sc1-k1', T('A gentle deer lived at the edge of a forest.', 'ఒక అడవి అంచున ఒక సాధువైన జింక నివసించేది.', 'ಕಾಡಿನ ಅಂಚಿನಲ್ಲಿ ಒಂದು ಸಾಧು ಜಿಂಕೆ ವಾಸವಾಗಿತ್ತು.')),
          chunk('deer-sc1-k2', T('Every morning, she shared her water with the birds.', 'ప్రతి ఉదయం, అది తన నీటిని పక్షులతో పంచుకునేది.', 'ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ, ಅದು ತನ್ನ ನೀರನ್ನು ಹಕ್ಕಿಗಳೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳುತ್ತಿತ್ತು.')),
        ] },
        { id: 'deer-sc2', ...img, chunks: [
          chunk('deer-sc2-k1', T('One day, a tired hunter came looking for help.', 'ఒక రోజు, అలసిపోయిన ఒక వేటగాడు సహాయం కోసం వచ్చాడు.', 'ಒಂದು ದಿನ, ದಣಿದ ಬೇಟೆಗಾರನೊಬ್ಬ ಸಹಾಯ ಕೇಳಿಕೊಂಡು ಬಂದನು.')),
          chunk('deer-sc2-k2', T('The deer showed him the way to the river.', 'జింక అతనికి నదికి దారి చూపించింది.', 'ಜಿಂಕೆ ಅವನಿಗೆ ನದಿಗೆ ದಾರಿ ತೋರಿಸಿತು.')),
        ] },
      ],
    },
    {
      ...base, id: 'dhruva', match: 'dhruva', num: 2, status: 'draft', cover: 'cover.webp',
      name: T('Little Dhruva’s Prayer'), description: T('A young prince learns to pray with a steady heart.'),
      themes: ['Devotion', 'Courage'], characters: ['Dhruva', 'Narada'],
      scenes: [
        { id: 'dhruva-sc1', ...img, chunks: [
          chunk('dhruva-sc1-k1', T('Dhruva was a little prince who wanted to sit on his father’s lap.')),
          chunk('dhruva-sc1-k2', T('Sage Narada taught him to pray with a steady heart.'), [['en', 'male', 'missing']]),
        ] },
      ],
    },
    {
      ...base, id: 'crow', match: 'clever-crow', num: 3, status: 'draft',
      name: T('The Clever Crow'), description: T('A thirsty crow finds a way to reach the water.'),
      themes: ['Wisdom'], characters: [],
      scenes: [
        { id: 'crow-sc1', portrait: 'portrait.webp', chunks: [
          chunk('crow-sc1-k1', T('On a hot day, a thirsty crow found a pot with a little water.'), [['en', 'female', 'missing'], ['en', 'male', 'missing'], ['en', 'child', 'missing']]),
        ] },
      ],
    },
  ];
}

// Production copy: English only, live, every id different (prefixed "p-").
function toProd(it: Item): Item {
  const walk = (o: unknown): unknown => {
    if (Array.isArray(o)) return o.map(walk);
    if (o && typeof o === 'object') {
      if (isLangMap(o)) return 'en' in o ? { en: walk((o as Text).en) } : {};
      return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === 'id' ? `p-${v}` : walk(v)]));
    }
    return o;
  };
  const p = walk(it) as Item;
  p.active = true;
  p.langOn = { en: true, te: false, kn: false };
  return p;
}

export function seed(): DB {
  const staging: Item[] = [
    ramayana(),
    sampleBook('mbh', 2, T('Mahabharatam', 'మహాభారతం', 'ಮಹಾಭಾರತ'), T('The great epic of the Kuru family.', 'కురు వంశపు మహా ఇతిహాసం.', 'ಕುರು ವಂಶದ ಮಹಾಕಾವ್ಯ.'),
      [T('Adi Parva', 'ఆది పర్వం', 'ಆದಿ ಪರ್ವ'), T('Sabha Parva', 'సభా పర్వం', 'ಸಭಾ ಪರ್ವ')], 2, 0, 'draft'),
    sampleBook('datta', 3, T('Book of Datta', 'దత్త గ్రంథం', 'ದತ್ತ ಗ್ರಂಥ'), T('Stories of Lord Datta and his teachings.', 'దత్త భగవానుని కథలు, బోధనలు.', 'ದತ್ತ ಭಗವಂತನ ಕಥೆಗಳು ಮತ್ತು ಬೋಧನೆಗಳು.'),
      [T('The Birth of Datta', 'దత్తాత్రేయుని జననం', 'ದತ್ತಾತ್ರೇಯರ ಜನನ'), T('The Twenty-Four Teachers', 'ఇరవై నాలుగు గురువులు', 'ಇಪ್ಪತ್ತನಾಲ್ಕು ಗುರುಗಳು')], 4, 4, 'ready'),
    sampleBook('gita', 4, T('Bhagavad Gita lessons'), T('Short lessons from the Bhagavad Gita.'), [T('Arjuna’s Doubt'), T('The Path of Action')], 0, 0, 'draft'),
    ...stories(),
  ];
  // Production: the 4 books and the first story are live in English; the rest are new.
  const production = staging.filter((i) => i.kind === 'book' || i.match === 'kind-deer').map(toProd);
  // Make production's Ramayana an older version, so promote has real changes to show.
  const pr = production[0] as Book;
  pr.sections[0].chapters[0].scenes[0].chunks[1].text.en = 'He was a kind and fair king.';
  pr.sections[0].chapters[0].scenes[1].chunks.pop();
  for (const i of staging) { i.active = i.match === 'ramayana' || i.match === 'datta'; }

  return {
    staging, production, snapshots: {},
    themes: ['Kindness', 'Friendship', 'Devotion', 'Courage', 'Honesty', 'Wisdom'],
    characters: ['Deer', 'Hunter', 'Dhruva', 'Narada', 'Crow', 'Owl'],
    audit: [
      { id: 'a4', at: '2026-11-15T06:20:00.000Z', who: 'Content Manager', env: 'staging', action: 'Sent for review', target: 'Ramayana' },
      { id: 'a3', at: '2026-11-15T06:11:00.000Z', who: 'Content Manager', env: 'staging', action: 'Edited Telugu text', target: 'Ramayana › The King of Ayodhya › Scene 1 › Chunk 1', before: 'చాలా కాలం క్రితం దశరథుడు అయోధ్యను పాలించాడు.', after: 'చాలా కాలం క్రితం, దశరథ మహారాజు అయోధ్య నగరాన్ని పాలించాడు.' },
      { id: 'a2', at: '2026-11-14T12:30:00.000Z', who: 'Super Admin', env: 'staging', action: 'Approved', target: 'Book of Datta' },
      { id: 'a1', at: '2026-11-14T04:00:00.000Z', who: 'Super Admin', env: 'staging', action: 'Refreshed staging from production', target: 'All content', detail: 'Staging wiped and cloned from production, so both start identical.' },
      // Production history behind the seeded production state: The Kind Deer was promoted (English), then switched on.
      { id: 'p3', at: '2026-11-10T09:05:00.000Z', who: 'Super Admin', env: 'production', action: 'Switched on', target: 'The Kind Deer', before: 'Off', after: 'On', detail: 'Families see the change within about 10 minutes (cache refresh).' },
      { id: 'p2', at: '2026-11-10T08:50:00.000Z', who: 'Super Admin', env: 'production', action: 'Promoted to production', target: 'The Kind Deer', detail: 'English · created, switched off' },
      { id: 'p1', at: '2026-11-08T11:30:00.000Z', who: 'Super Admin', env: 'production', action: 'Promoted to production', target: 'Ramayana', detail: 'English · updated in place, visibility unchanged' },
    ],
  };
}
