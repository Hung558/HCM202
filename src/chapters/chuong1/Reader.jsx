import { useState } from 'react'
import { motion } from 'framer-motion'
import ContentBlocks from './ContentBlocks.jsx'
import { normalizeSearch } from './progress.js'
import { award, play } from '../_fun/useGame.js'
import { scrollToOnMobile } from '../_fun/fx.js'

// Tab Nội dung: "Đường học" (vòng tiến độ, tìm không dấu, mục lục chấm tròn) + một phần mỗi lần.
export default function Reader({ ui, sections, cards, activeId, readIds, onSelect, onToggleRead, onOpenCards, onWatch }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState({}) // câu tự kiểm tra đang lật
  const si = Math.max(0, sections.findIndex((s) => s.id === activeId))
  const sec = sections[si]
  const done = readIds.includes(sec.id)
  const nRead = sections.filter((s) => readIds.includes(s.id)).length
  const pct = Math.round((nRead / sections.length) * 100)
  const nq = normalizeSearch(q)

  const go = (i) => {
    if (i < 0 || i >= sections.length) return
    play('tap')
    onSelect(sections[i].id)
    scrollToOnMobile('c1-article')
  }

  return (
    <div className="mt-7 flex flex-wrap items-start gap-6">
      <aside className="max-w-full flex-[1_1_280px] rounded-3xl border border-line bg-white p-5 md:sticky md:top-[84px]">
        <div className="flex items-center gap-3.5">
          <div
            className="grid size-16 shrink-0 place-items-center rounded-full transition-all duration-500"
            style={{ background: `conic-gradient(#E59A2F ${pct * 3.6}deg, #EFE9DF 0)` }}
            role="progressbar"
            aria-label="Tiến độ đọc chương"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div className="grid size-12 place-items-center rounded-full bg-white text-[14px] font-extrabold">{pct}%</div>
          </div>
          <div>
            <p className="text-[16px] font-extrabold">Đường học</p>
            <p className="mt-0.5 text-[13px] font-semibold text-muted">
              {nRead}/{sections.length} phần đã đọc
            </p>
          </div>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm trong bài, không cần dấu"
          aria-label="Tìm trong bài"
          className="mt-4 min-h-11 w-full rounded-[14px] border border-line-strong bg-paper px-3.5 text-[14px] text-ink outline-none focus:border-primary"
        />
        <nav aria-label="Mục lục" className="relative mt-3.5 flex flex-col gap-1">
          <span aria-hidden="true" className="absolute top-3.5 bottom-3.5 left-[19px] w-[3px] rounded-[3px] bg-track" />
          {sections.map((s, i) => {
            const isDone = readIds.includes(s.id)
            const on = i === si
            const match = !nq || normalizeSearch(`${s.searchText ?? ''} ${s.title}`).includes(nq)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-current={on ? 'step' : undefined}
                className={`relative flex min-h-12 w-full items-center gap-3 rounded-[14px] py-1.5 pr-2.5 pl-1.5 text-left transition-[background,opacity] duration-200 hover:bg-cream ${on ? 'bg-cream' : ''} ${match ? '' : 'opacity-35'}`}
              >
                <span
                  className={`grid size-[30px] shrink-0 place-items-center rounded-full border-2 text-[12px] font-extrabold transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] ${
                    isDone ? 'border-success bg-success text-on-dark' : on ? 'scale-[1.12] border-primary bg-primary text-on-dark' : 'border-line-strong bg-white text-muted'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </span>
                <span className={`text-[14px] leading-[1.35] ${on ? 'font-extrabold' : 'font-semibold'}`}>{s.title}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <motion.article
        id="c1-article"
        key={sec.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="min-w-0 flex-[999_1_480px] scroll-mt-32 rounded-[28px] border border-line bg-white p-[clamp(22px,3.4vw,40px)]"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[28px] font-extrabold text-amber">{String(si + 1).padStart(2, '0')}</span>
          {sec.estimatedReadMinutes > 0 && <span className="rounded-full bg-paper px-3 py-1.5 text-[12.5px] font-bold text-muted">{sec.estimatedReadMinutes} phút đọc</span>}
          {done && <span className="rounded-full bg-success-soft px-3 py-1.5 text-[12.5px] font-extrabold text-success">✓ Đã đọc</span>}
        </div>
        <h2 className="mt-2.5 text-[clamp(24px,3vw,32px)] leading-[1.15] font-extrabold tracking-[-0.02em]">{sec.title}</h2>
        {sec.summary && <p className="mt-2 text-[15.5px] leading-[1.6] text-muted">{sec.summary}</p>}

        <ContentBlocks blocks={sec.blocks} onOpenCards={onOpenCards} />

        {sec.selfCheckQuestions?.length > 0 && (
          <div className="mt-7">
            <p className="text-[12.5px] font-extrabold tracking-[.14em] text-primary uppercase">Tự kiểm tra · chạm để lật</p>
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3">
              {sec.selfCheckQuestions.map((sq, k) => {
                const key = `${sec.id}-${k}`
                const isOpen = !!open[key]
                const answer = sq.answerFlashcardIds.map((id) => cards.find((c) => c.id === id)?.back).filter(Boolean).join(' ')
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isOpen}
                    onClick={(e) => {
                      play('flip')
                      if (!isOpen) award(`c1-sq-${key}`, 5, e)
                      setOpen((o) => ({ ...o, [key]: !isOpen }))
                    }}
                    className={`min-h-[120px] rounded-[20px] border-[1.5px] border-dashed p-[18px] text-left transition-all duration-[350ms] ease-[cubic-bezier(.3,1.2,.4,1)] ${
                      isOpen ? 'border-ink bg-ink text-on-dark' : 'border-line-strong bg-white text-ink'
                    }`}
                  >
                    <span className="block text-[12px] font-extrabold opacity-70">{isOpen ? 'Gợi ý trả lời' : `Câu ${k + 1}`}</span>
                    <span className={`mt-1.5 block text-[15px] leading-[1.55] ${isOpen ? 'font-medium' : 'font-bold'}`}>{isOpen ? answer : sq.question}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-2.5 border-t border-line pt-5">
          <button
            type="button"
            aria-pressed={done}
            onClick={(e) => onToggleRead(sec.id, e)}
            className={`min-h-12 rounded-full px-5 text-[14.5px] font-extrabold text-on-dark transition-colors ${done ? 'bg-success' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {done ? '✓ Đã đọc · đọc lại' : ui.completionButtonLabel}
          </button>
          {sec.relatedFlashcardIds?.length > 0 && (
            <button type="button" onClick={() => onOpenCards(sec.relatedFlashcardIds, sec.title)} className="min-h-12 rounded-full border border-line-strong bg-white px-[18px] text-[14px] font-bold">
              {ui.reviewButtonLabel}
            </button>
          )}
          {sec.relatedVideoIds?.length > 0 && (
            <button type="button" onClick={() => onWatch(sec.relatedVideoIds[0])} className="min-h-12 rounded-full border border-line-strong bg-white px-[18px] text-[14px] font-bold">
              ▶ {ui.videoButtonLabel}
            </button>
          )}
          <span className="flex-1" />
          <button type="button" onClick={() => go(si - 1)} disabled={si === 0} className="min-h-12 rounded-full border border-line-strong bg-white px-4 text-[14px] font-bold disabled:opacity-35">
            ← {ui.previousLabel}
          </button>
          <button type="button" onClick={() => go(si + 1)} disabled={si === sections.length - 1} className="min-h-12 rounded-full bg-ink px-4 text-[14px] font-bold text-on-dark disabled:opacity-35">
            {ui.nextLabel} →
          </button>
        </div>
      </motion.article>
    </div>
  )
}
