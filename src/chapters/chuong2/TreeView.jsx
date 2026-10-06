import { useRef, useState, useSyncExternalStore } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { getEventImage } from './imageRegistry.js'
import { filterEvents } from './events.js'
import { play, useGame } from '../_fun/useGame.js'

// Màn ≤760px: thân cây dời sang trái, nhánh chỉ mọc bên phải
const MQ = '(max-width: 760px)'
const useNarrow = () =>
  useSyncExternalStore(
    (f) => {
      const m = window.matchMedia(MQ)
      m.addEventListener('change', f)
      return () => m.removeEventListener('change', f)
    },
    () => window.matchMedia(MQ).matches,
  )

const VIEW = { once: true, margin: '0px 0px -12% 0px' }

// Mục II · Cây thời gian: thân cây lớn dần theo vị trí cuộn, mỗi sự kiện mọc thành một nhánh xen kẽ trái/phải.
export default function TreeView({ periods, events, period, setPeriod, q, setQ, onOpen, onQuiz, onNext }) {
  const { earned } = useGame()
  const narrow = useNarrow()
  const treeRef = useRef(null)
  const [reached, setReached] = useState(-1) // chỉ số sự kiện xa nhất đã lộ ra
  const { scrollYProgress } = useScroll({ target: treeRef, offset: ['start 72%', 'end 72%'] })
  const grow = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const list = filterEvents(events, period, q)
  const rows = []
  periods.forEach((p) => {
    const evs = list.filter((e) => e.periodId === p.id)
    if (evs.length) rows.push({ stage: p, count: evs.length }, ...evs.map((e) => ({ e })))
  })
  const ordered = rows.filter((r) => r.e).map((r) => r.e)
  const curYear = reached >= 0 ? ordered[Math.min(reached, ordered.length - 1)]?.year : null

  const chips = [{ id: 'all', label: `Tất cả · ${events.length}`, title: 'Tất cả thời kỳ' }, ...periods.map((p) => ({ id: p.id, label: `${p.badge} · ${p.shortTitle}`, title: p.title }))]
  const trunkLeft = narrow ? '22px' : '50%'
  let side = 0

  return (
    <>
      <div className="z-20 mt-6 flex flex-wrap items-center gap-2 rounded-[22px] border border-line bg-paper/95 p-2.5 backdrop-blur-sm sm:sticky sm:top-[72px]">
        <div className="flex min-w-0 flex-[1_1_520px] gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Lọc theo thời kỳ">
          {chips.map((c) => {
            const on = period === c.id
            return (
              <button
                key={c.id}
                type="button"
                title={c.title}
                aria-pressed={on}
                onClick={() => {
                  play('tap')
                  setPeriod(c.id)
                  setReached(-1)
                }}
                className={`min-h-10 shrink-0 rounded-full border px-3.5 text-[13px] font-bold whitespace-nowrap transition-all duration-200 ${
                  on ? 'border-primary bg-primary text-on-dark' : 'border-line-strong bg-white text-ink-soft'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm sự kiện, địa danh…"
          aria-label="Tìm sự kiện"
          className="min-h-10 flex-[1_1_200px] rounded-full border border-line-strong bg-white px-4 text-[14px] text-ink outline-none focus:border-primary"
        />
        <button type="button" onClick={onQuiz} className="min-h-10 shrink-0 rounded-full bg-ink px-4 text-[13px] font-bold whitespace-nowrap text-on-dark">
          Đố nhanh ★
        </button>
      </div>

      <div ref={treeRef} className="relative mt-10 overflow-x-clip pt-[60px]">
        <div aria-hidden="true" className="absolute top-0 bottom-0 -ml-2 w-4 rounded-2xl bg-track" style={{ left: trunkLeft }} />
        <motion.div
          aria-hidden="true"
          className="absolute top-0 -ml-2 w-4 rounded-2xl bg-[linear-gradient(180deg,#5E8C4A_0px,#7A5236_90px,#6A4630_100%)] motion-reduce:!h-full"
          style={{ left: trunkLeft, height: grow }}
        />
        {/* Mầm cây trên ngọn */}
        <div aria-hidden="true" className="absolute -top-[18px] size-12 -translate-x-1/2" style={{ left: trunkLeft }}>
          <span className="absolute top-1.5 left-0 h-[15px] w-6 rounded-[100%_0] bg-[#5E8C4A]" />
          <span className="absolute top-1.5 right-0 h-[15px] w-6 rounded-[0_100%] bg-[#7FAE6A]" />
          <span className="absolute bottom-0 left-4 h-[26px] w-4 rounded-[8px_8px_4px_4px] bg-[#7A5236]" />
        </div>

        <ol className="relative flex flex-col gap-[18px]">
          {rows.map((r) => {
            const cols = narrow ? 'grid-cols-[0px_44px_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)]'
            if (r.stage) {
              const p = r.stage
              return (
                <li key={p.id} className={`grid items-center ${cols}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={VIEW}
                    transition={{ duration: 0.55, ease: [0.3, 1.3, 0.5, 1] }}
                    className={`col-span-full flex pt-[26px] pb-2 ${narrow ? 'justify-start' : 'justify-center'}`}
                  >
                    <div className="relative flex max-w-[640px] items-start gap-3.5 rounded-[26px] bg-ink px-5 py-4 text-on-dark">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-[16px] font-extrabold text-ink">{p.number}</span>
                      <span className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold tracking-[.12em] text-gold uppercase">
                          {p.timeSpan} · {r.count} sự kiện
                        </span>
                        <span className="text-[16.5px] leading-[1.35] font-extrabold">{p.title}</span>
                        <span className="text-[13.5px] leading-[1.55] text-on-dark/78">{p.core}</span>
                      </span>
                    </div>
                  </motion.div>
                </li>
              )
            }
            const e = r.e
            const idx = ordered.indexOf(e)
            const left = !narrow && side++ % 2 === 0
            const seen = !!earned[`c2-ev-${e.id}`]
            const img = getEventImage(e)
            return (
              <li key={e.id} className={`grid items-center ${cols}`}>
                <div className="relative z-[1] col-start-2 row-start-1 flex justify-center">
                  <motion.span
                    initial={{ scale: 0.3, backgroundColor: '#D9CFBF' }}
                    whileInView={{ scale: 1, backgroundColor: seen ? '#E59A2F' : '#5E8C4A' }}
                    viewport={VIEW}
                    transition={{ duration: 0.45, ease: [0.3, 1.6, 0.5, 1] }}
                    className="size-7 rounded-full border-[5px] border-paper"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, x: left ? -34 : 34, scale: 0.94 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={VIEW}
                  onViewportEnter={() => setReached((n) => Math.max(n, idx))}
                  transition={{ duration: 0.6, ease: [0.25, 1.1, 0.4, 1] }}
                  className={`row-start-1 flex min-w-0 items-center ${left ? 'col-start-1 flex-row-reverse' : 'col-start-3 flex-row'}`}
                >
                  <div aria-hidden="true" className="relative h-1.5 w-9 shrink-0 rounded bg-[#7A5236]">
                    <span className={`absolute -top-3.5 left-2.5 h-3 w-[19px] -rotate-[18deg] rounded-[100%_0] transition-colors duration-300 ${seen ? 'bg-amber' : 'bg-[#5E8C4A]'}`} />
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => onOpen(e.id, ev)}
                    className={`min-w-0 max-w-[470px] flex-1 overflow-hidden rounded-[22px] border bg-white text-left transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-amber ${seen ? 'border-gold' : 'border-line'}`}
                  >
                    {img && <span className="block h-[140px] bg-track bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }} role="img" aria-label={e.imageCaption || e.title} />}
                    <span className="block px-5 py-[18px]">
                      <span className="flex flex-wrap items-center justify-between gap-2.5">
                        <span className="text-[24px] font-extrabold tracking-[-0.02em] text-amber">{e.date}</span>
                        <span className="rounded-full bg-cream px-2.5 py-1 text-[11.5px] font-bold text-primary-dark">{e.tag}</span>
                      </span>
                      <span className="mt-2 block text-[17px] leading-[1.35] font-extrabold tracking-[-0.01em] text-pretty">{e.title}</span>
                      <span className="mt-2 block text-[14px] leading-[1.6] text-pretty text-ink-soft">{e.shortDesc}</span>
                      <span className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                        <span className="text-[12.5px] font-semibold text-muted">⌖ {e.location}</span>
                        <span className="text-[12.5px] font-extrabold text-primary">{seen ? 'Đã xem ✓' : 'Mở chi tiết →'}</span>
                      </span>
                    </span>
                  </button>
                </motion.div>
              </li>
            )
          })}
        </ol>
        {!list.length && <p className="py-8 text-center font-semibold text-muted">Không tìm thấy sự kiện phù hợp.</p>}

        {/* Hết thân cây: tán cây kết trái */}
        {list.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.3, 1.3, 0.5, 1] }}
            className={`relative flex pt-[30px] ${narrow ? 'justify-start' : 'justify-center'}`}
          >
            <button type="button" onClick={onNext} className="relative h-[230px] w-[300px] max-w-full">
              <span aria-hidden="true" className="absolute top-[30px] left-5 size-[130px] rounded-full bg-[#5E8C4A]" />
              <span aria-hidden="true" className="absolute top-[30px] right-5 size-[130px] rounded-full bg-[#7FAE6A]" />
              <span aria-hidden="true" className="absolute top-0 left-[75px] size-[150px] rounded-full bg-[#6A9C57]" />
              <span aria-hidden="true" className="absolute top-[52px] left-16 size-5 rounded-full bg-primary" />
              <span aria-hidden="true" className="absolute top-[78px] right-[70px] size-[18px] rounded-full bg-amber" />
              <span aria-hidden="true" className="absolute top-[26px] left-[142px] size-4 rounded-full bg-gold" />
              <span className="absolute inset-x-0 bottom-0 text-center text-[15px] leading-[1.4] font-extrabold">
                Cây đã kết trái
                <br />
                <span className="text-[13.5px] font-bold text-primary">Xem giá trị tư tưởng →</span>
              </span>
            </button>
          </motion.div>
        )}
      </div>

      {curYear && (
        <div className="fixed bottom-5 left-5 z-30 flex items-center gap-2.5 rounded-full bg-ink py-2.5 pr-[18px] pl-3 text-[13.5px] font-semibold text-on-dark max-sm:bottom-3 max-sm:left-3" aria-live="polite">
          <span className="size-2.5 rounded-full bg-[#7FAE6A]" />
          Cây đã lớn tới <span className="text-[16px] font-extrabold text-gold">{curYear}</span>
        </div>
      )}
    </>
  )
}
