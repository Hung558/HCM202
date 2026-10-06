import { useEffect, useRef } from 'react'
import Sources from './Sources.jsx'
import { getStudyQueue } from './progress.js'
import { animate, burst } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

const ST = {
  new: { label: 'Thẻ mới', cls: 'bg-paper text-ink-soft' },
  learning: { label: 'Đang học', cls: 'bg-cream text-primary-dark' },
  reviewing: { label: 'Đang ôn', cls: 'bg-success-soft text-success' },
}
const GRID = {
  new: 'bg-paper text-ink border-line',
  learning: 'bg-gold text-ink border-transparent',
  reviewing: 'bg-success text-on-dark border-transparent',
}
const statusOf = (rec) => (rec?.status === 'reviewing' || rec?.status === 'learning' ? rec.status : 'new')

// Tab Flashcards: chồng thẻ lật 3D, chấm "Cần ôn lại / Đã thuộc", thẻ bay sang hai bên; bên phải là số liệu + bản đồ bộ thẻ.
// deck = { cat, focus, early, done, cur, flip }: cat 'focus' = bộ thẻ mở từ bài đọc/từ điển; early = ôn sớm không chờ đến hạn.
export default function Deck({ cards, categories, reviewConfig: rc, progress, now, deck, setDeck, onRate }) {
  const flyRef = useRef(null)
  const busy = useRef(false)

  const pool = cards.filter((c) => (deck.cat === 'all' ? true : deck.cat === 'focus' ? deck.focus.includes(c.id) : c.categoryId === deck.cat))
  const queue = deck.early ? pool.filter((c) => !deck.done.includes(c.id)) : getStudyQueue(pool, progress, now)
  const card = (deck.cur && cards.find((c) => c.id === deck.cur)) || queue[0]
  const cat = card && categories.find((c) => c.id === card.categoryId)
  const st = card && ST[statusOf(progress[card.id])]
  const label = (action) => rc.buttons.find((b) => b.action === action)?.label

  function flip() {
    play('flip')
    setDeck((d) => ({ ...d, flip: !d.flip }))
  }

  // Space lật thẻ khi không đứng trong ô nhập / nút khác
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.target.closest?.('input,textarea,select,button,a,[role="button"]')) return
      e.preventDefault()
      play('flip')
      setDeck((d) => ({ ...d, flip: !d.flip }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setDeck])

  function rate(action, e) {
    if (!card || busy.current) return
    if (!deck.flip) {
      say('Lật thẻ xem mặt sau trước đã nhé!')
      flip()
      return
    }
    const rec = progress[card.id]
    const days = rc.knownIntervalsDays[Math.min(rec?.consecutiveKnown ?? 0, rc.knownIntervalsDays.length - 1)]
    if (action === 'known') {
      play('ok')
      award(`c1-fc-${card.id}`, 10, e)
      say(`Hẹn gặp lại thẻ này sau ${days} ngày!`)
    } else {
      play('bad')
      say(`Không sao, ${rc.againIntervalMinutes} phút nữa ôn lại.`)
    }
    const last = queue.length === 1 && queue[0].id === card.id
    const dir = action === 'known' ? 1 : -1
    const el = flyRef.current

    const apply = (out) => {
      onRate(card.id, action)
      setDeck((d) => ({ ...d, flip: false, cur: null, done: d.early ? [...d.done, card.id] : d.done, early: last ? false : d.early }))
      if (last) {
        play('win')
        burst(window.innerWidth / 2, window.innerHeight / 2, 60)
      }
      requestAnimationFrame(() => {
        out?.cancel()
        animate(el, [{ transform: 'translateY(24px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' })
        busy.current = false
      })
    }
    busy.current = true
    const out = animate(el, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${dir * 60}%) rotate(${dir * 10}deg)`, opacity: 0 }], {
      duration: 230,
      easing: 'ease-in',
      fill: 'forwards',
    })
    if (out) out.onfinish = () => apply(out)
    else apply(null)
  }

  const catDefs = [
    { id: 'all', name: 'Tất cả', n: cards.length },
    ...categories.map((c) => ({ id: c.id, name: c.name, n: cards.filter((f) => f.categoryId === c.id).length })),
    ...(deck.cat === 'focus' ? [{ id: 'focus', name: 'Bộ thẻ đã chọn', n: deck.focus.length }] : []),
  ]
  const stats = {
    nw: cards.filter((f) => !progress[f.id]).length,
    due: cards.filter((f) => progress[f.id] && Date.parse(progress[f.id].nextReviewAt) <= now).length,
    later: cards.filter((f) => progress[f.id] && Date.parse(progress[f.id].nextReviewAt) > now).length,
  }

  return (
    <>
      <div className="mt-7 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Lọc thẻ theo chủ đề">
        {catDefs.map((c) => {
          const on = deck.cat === c.id
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                play('tap')
                setDeck((d) => ({ ...d, cat: c.id, cur: null, flip: false, early: c.id === 'focus' ? d.early : false, done: [] }))
              }}
              className={`min-h-[42px] shrink-0 rounded-full border px-4 text-[13.5px] font-bold whitespace-nowrap transition-colors ${
                on ? 'border-primary bg-primary text-on-dark' : 'border-line-strong bg-white text-ink-soft hover:text-ink'
              }`}
            >
              {c.name} · {c.n}
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] items-start gap-7">
        <div className="min-w-0">
          {card ? (
            <>
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-[18px] rotate-[3.5deg] rounded-[28px] border border-line bg-cream" />
                <div aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-[9px] rotate-[1.6deg] rounded-[28px] border border-line bg-white" />
                <div ref={flyRef} className="relative [perspective:1400px]">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={deck.flip}
                    aria-roledescription="thẻ lật"
                    onClick={flip}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        flip()
                      }
                    }}
                    className="grid min-h-[420px] cursor-pointer rounded-[28px] transition-transform duration-[650ms] ease-[cubic-bezier(.3,.8,.3,1)] [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    style={{ transform: deck.flip ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    <div aria-hidden={deck.flip} className="flex flex-col rounded-[28px] border border-line bg-white p-7 [grid-area:1/1] [backface-visibility:hidden]">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold ${st.cls}`}>{st.label}</span>
                        <span className="text-right text-[12.5px] font-bold text-muted">{cat?.name}</span>
                      </div>
                      <div className="flex flex-1 items-center py-6">
                        <h2 className="text-[clamp(24px,3vw,34px)] leading-[1.2] font-extrabold tracking-[-0.02em] text-balance">{card.front}</h2>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13.5px] font-semibold text-faint">
                        <span className="grid size-7 place-items-center rounded-full border-[1.5px] border-dashed border-line-strong">↻</span>
                        Chạm để lật · phím Space
                      </div>
                    </div>
                    <div
                      aria-hidden={!deck.flip}
                      className="relative flex flex-col overflow-hidden rounded-[28px] bg-primary p-7 text-on-dark [grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                    >
                      <span aria-hidden="true" className="absolute -top-10 -right-10 size-40 rounded-full bg-gold/[.18]" />
                      <span className="relative text-[12px] font-extrabold tracking-[.12em] text-gold uppercase">{card.keywords?.join(' · ') || 'Đáp án'}</span>
                      <p className="relative flex flex-1 items-center py-5 text-[clamp(16px,1.8vw,19px)] leading-[1.6] font-medium text-pretty">{card.back}</p>
                      <span className="relative" onClick={(e) => e.stopPropagation()}>
                        <Sources citations={card.citations} className="text-on-dark/70" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-[34px] flex gap-2.5">
                <button
                  type="button"
                  aria-disabled={!deck.flip}
                  onClick={(e) => rate('again', e)}
                  className={`min-h-[52px] flex-1 rounded-full border-[1.5px] border-amber bg-white text-[15px] font-extrabold transition-opacity ${deck.flip ? '' : 'opacity-45'}`}
                >
                  {label('again')}
                </button>
                <button
                  type="button"
                  aria-disabled={!deck.flip}
                  onClick={(e) => rate('known', e)}
                  className={`min-h-[52px] flex-1 rounded-full bg-success text-[15px] font-extrabold text-on-dark transition-opacity ${deck.flip ? '' : 'opacity-45'}`}
                >
                  {label('known')} ✓
                </button>
              </div>
              <p className="mx-1 mt-3 text-center text-[13px] text-muted" aria-live="polite">
                {deck.flip ? 'Tự chấm: bạn đã nhớ đáp án chưa?' : `Còn ${queue.length} thẻ trong hàng đợi · lật thẻ để chấm điểm`}
              </p>
            </>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-2.5 rounded-[28px] bg-success-soft p-7 text-center">
              <div className="text-[54px] text-success">✓</div>
              <h2 className="text-[26px] font-extrabold text-success">Hết thẻ đến hạn!</h2>
              <p className="max-w-[360px] text-[15px] leading-[1.6]">
                Bạn đã ôn xong hàng đợi của nhóm này. Thẻ “{label('again')}” sẽ quay lại sau {rc.againIntervalMinutes} phút.
              </p>
              <button type="button" onClick={() => setDeck((d) => ({ ...d, early: true, done: [], cur: null }))} className="btn btn-dark mt-1.5">
                Ôn sớm cả nhóm
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-[20px] border border-line bg-white p-4">
              <div className="text-[28px] font-extrabold">{stats.nw}</div>
              <div className="text-[13px] font-semibold text-muted">Thẻ mới</div>
            </div>
            <div className="rounded-[20px] bg-cream p-4">
              <div className="text-[28px] font-extrabold text-primary">{stats.due}</div>
              <div className="text-[13px] font-semibold text-muted">Đến hạn ôn</div>
            </div>
            <div className="rounded-[20px] bg-success-soft p-4">
              <div className="text-[28px] font-extrabold text-success">{stats.later}</div>
              <div className="text-[13px] font-semibold text-success">Hẹn sau</div>
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-5">
            <p className="text-[16px] font-extrabold">Bản đồ bộ thẻ</p>
            <p className="mt-1 text-[13px] leading-normal text-muted">
              “{label('known')}” hẹn lại sau {rc.knownIntervalsDays.join(' · ')} ngày. Chạm một ô để mở thẻ.
            </p>
            <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(38px,1fr))] gap-1.5">
              {cards.map((f) => {
                const on = card?.id === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    title={f.front}
                    aria-label={`Thẻ ${f.order}: ${f.front}`}
                    aria-current={on || undefined}
                    onClick={() => {
                      play('tap')
                      setDeck((d) => ({ ...d, cur: f.id, flip: false }))
                    }}
                    className={`aspect-square min-h-[38px] rounded-[10px] border-2 text-[11px] font-extrabold transition-transform duration-[250ms] hover:scale-[1.12] ${GRID[statusOf(progress[f.id])]} ${
                      on ? 'scale-[1.12] !border-primary' : ''
                    }`}
                  >
                    {f.order}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-bold text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded border border-line-strong bg-paper" />
                Mới
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded bg-gold" />
                Đang học
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded bg-success" />
                Đang ôn
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
