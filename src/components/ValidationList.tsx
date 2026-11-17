'use client';
// The validation list in the editor: errors and warnings per language, current language first. Clicking one jumps to it.
import { type Lang, LANG_NAME, LANGS } from '@/lib/domain/content';
import { type Issue, errorsIn } from '@/lib/domain/validation';
import { act } from '@/lib/store';
import { Icon, Pill, cx } from './ui';

export function ValidationList({ issues, lang, selected, onPick }: { issues: Issue[]; lang: Lang; selected: string; onPick: (i: Issue) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Validation</h2>
        <button type="button" onClick={() => act.issues(false)} aria-label="Close validation" title="Close (Esc)"
          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-bg hover:text-ink pointer-coarse:h-11 pointer-coarse:w-11">
          <Icon name="x" />
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">Errors block approve, promote and switching on. Warnings don’t. Click one to jump to it.</p>
      {[lang, ...LANGS.filter((l) => l !== lang)].map((l) => {
        const list = issues.filter((i) => i.lang === l);
        const e = errorsIn(list, l);
        return (
          <div key={l} className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              {LANG_NAME[l]}
              {list.length === 0
                ? <Pill tone="leaf" icon="check">Passes</Pill>
                : <span className="text-xs font-normal text-muted">{e} error{e === 1 ? '' : 's'} · {list.length - e} warning{list.length - e === 1 ? '' : 's'}</span>}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {list.map((i) => (
                <li key={`${i.node}:${i.msg}`}>
                  <button type="button" onClick={() => onPick(i)}
                    className={cx('group flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors duration-200',
                      i.node === selected && i.lang === lang ? 'border-indigo/40 bg-tint' : 'border-line hover:border-indigo/30 hover:bg-tint/50')}>
                    <Icon name={i.level === 'error' ? 'error' : 'alert'} size={15} className={cx('mt-0.5', i.level === 'error' ? 'text-danger' : 'text-amber')} />
                    <span className="min-w-0 flex-1">
                      <span className="sr-only">{i.level}: </span>
                      <span className="font-medium">{i.msg}</span>
                      <span className="block truncate text-xs text-muted">{i.where}</span>
                    </span>
                    <Icon name="arrowRight" size={13} className="mt-1 text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
