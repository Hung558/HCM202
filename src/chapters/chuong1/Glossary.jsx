import { useEffect, useRef, useState } from 'react'
import Sources from './Sources.jsx'
import { normalizeSearch } from './progress.js'
import { animate } from '../_fun/fx.js'
import { award, play } from '../_fun/useGame.js'

// Tab Từ điển: ô tìm (không dấu), các thuật ngữ dạng viên thuốc; panel tối bên phải hiện định nghĩa.
export default function Glossary({ glossary, termId, onTerm, onOpenCards }) {
  const [q, setQ] = useState('')
  const panelRef = useRef(null)
  const nq = normalizeSearch(q)
  const all = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'vi'))
  const list = all.filter((t) => !nq || normalizeSearch([t.searchText, t.term, ...(t.aliases ?? [])].join(' ')).includes(nq))
  const sel = glossary.find((t) => t.id === termId)

  useEffect(() => {
    if (termId) animate(panelRef.current, [{ transform: 'scale(.96) rotate(-1deg)', opacity: 0.5 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.3,1.4,.5,1)' })
  }, [termId])

  const pick = (id, e) => {
    play('tap')
    if (e) award(`c1-g-${id}`, 2, e)
    onTerm(id)
  }

  return (
    <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-6">
      <div className="min-w-0">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm thuật ngữ, gõ không dấu cũng được"
          aria-label="Tìm thuật ngữ"
          className="min-h-[52px] w-full rounded-full border-[1.5px] border-ink bg-white px-[22px] text-[15.5px] text-ink outline-none focus:border-primary"
        />
        <p className="mx-1.5 mt-2.5 text-[13px] font-semibold text-muted" aria-live="polite">
          {list.length} / {glossary.length} thuật ngữ
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {list.map((t) => {
            const on = t.id === termId
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={(e) => pick(t.id, e)}
                className={`min-h-11 rounded-full border-[1.5px] px-4 text-[14px] font-bold transition-all duration-[250ms] ease-[cubic-bezier(.3,1.5,.5,1)] hover:-translate-y-[3px] hover:-rotate-1 ${
                  on ? '-translate-y-[3px] -rotate-[1.5deg] border-primary bg-primary text-on-dark' : 'border-line bg-white text-ink'
                }`}
              >
                {t.term}
              </button>
            )
          })}
        </div>
        {!list.length && <p className="m-4 text-muted">Không tìm thấy thuật ngữ phù hợp.</p>}
      </div>

      <div ref={panelRef} aria-live="polite" className="relative overflow-hidden rounded-[28px] bg-ink p-[clamp(22px,3vw,32px)] text-on-dark md:sticky md:top-[84px]">
        <span aria-hidden="true" className="absolute -top-[50px] -right-[50px] size-[180px] rounded-full bg-primary/50" />
        {sel ? (
          <div className="relative">
            <p className="text-[12px] font-extrabold tracking-[.14em] text-gold uppercase">Thuật ngữ</p>
            <h2 className="mt-2 text-[clamp(26px,3vw,34px)] font-extrabold tracking-[-0.02em]">{sel.term}</h2>
            {sel.aliases?.length > 0 && <p className="mt-1.5 text-[13px] font-semibold text-on-dark/60">Còn gọi: {sel.aliases.join(', ')}</p>}
            <p className="mt-4 text-[16.5px] leading-[1.7]">{sel.definition}</p>
            <Sources citations={sel.citations} className="text-on-dark/55" />
            {sel.relatedTermIds?.length > 0 && (
              <>
                <p className="mt-[18px] mb-2 text-[12px] font-extrabold tracking-[.1em] text-on-dark/60 uppercase">Liên quan</p>
                <div className="flex flex-wrap gap-1.5">
                  {sel.relatedTermIds
                    .map((id) => glossary.find((z) => z.id === id))
                    .filter(Boolean)
                    .map((z) => (
                      <button key={z.id} type="button" onClick={() => pick(z.id)} className="min-h-10 rounded-full border border-on-dark/25 px-3.5 text-[13px] font-bold hover:bg-on-dark/10">
                        {z.term}
                      </button>
                    ))}
                </div>
              </>
            )}
            {sel.relatedFlashcardIds?.length > 0 && (
              <button type="button" onClick={() => onOpenCards(sel.relatedFlashcardIds, sel.term)} className="mt-5 min-h-12 rounded-full bg-gold px-5 text-[14px] font-extrabold text-ink">
                Ôn {sel.relatedFlashcardIds.length} thẻ liên quan →
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <p className="text-[20px] font-extrabold">Chọn một thuật ngữ</p>
            <p className="mt-2 text-[14.5px] leading-[1.6] text-on-dark/75">Định nghĩa, các thuật ngữ liên quan và thẻ ôn tập sẽ hiện ở đây.</p>
          </div>
        )}
      </div>
    </div>
  )
}
