import { useState } from 'react'
import { motion } from 'framer-motion'
import data from './data.json'
import Hero from '../_fun/Hero.jsx'
import { burst, pt } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

// Màu thẻ tiêu đề theo phần: đỏ / vàng / xanh rêu / nâu
const PAL = [
  { box: 'bg-primary text-on-dark', blob: 'bg-gold/[.22]', num: 'bg-primary text-on-dark' },
  { box: 'bg-gold text-ink', blob: 'bg-primary/16', num: 'bg-gold text-ink' },
  { box: 'bg-[#2F5E46] text-on-dark', blob: 'bg-gold/20', num: 'bg-[#2F5E46] text-on-dark' },
  { box: 'bg-[#3A2F25] text-on-dark', blob: 'bg-amber/30', num: 'bg-[#3A2F25] text-on-dark' },
]
const C = data.content
const shortTitle = (t) => t.replace('Tư tưởng Hồ Chí Minh về ', '').replace(/^./, (c) => c.toUpperCase())

// Tab Học bài: hero tối có 4 thẻ phần; thẻ tiêu đề phần; các nội dung là accordion 2 cột.
export default function Content({ read, setRead, onDone }) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState({ 0: true })
  const x = C[active]
  const pal = PAL[active % PAL.length]
  const isRead = !!read[x.id]
  const readN = C.filter((c) => read[c.id]).length
  const quoteSum = /^["“]/.test(x.summary)

  const go = (i) => {
    play('tap')
    setActive(i)
    setOpen({ 0: true })
  }

  function toggleRead(e) {
    if (!isRead) {
      play('ok')
      award(`c6-r-${x.id}`, 10, e)
      const p = pt(e)
      burst(p.x, p.y, 24, 'petal')
      say(readN + 1 === C.length ? 'Học xong cả 4 phần! Sang Rèn luyện thôi.' : `Đã học phần ${x.numeral}.`)
    }
    setRead({ ...read, [x.id]: !isRead })
  }

  return (
    <>
      <Hero num="VI" eyebrow={`${data.chapter} · Học bài`} title={data.chapterTitle}>
        <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-2.5">
          {C.map((c, i) => {
            const on = i === active
            const rd = !!read[c.id]
            return (
              <button
                key={c.id}
                type="button"
                aria-current={on ? 'step' : undefined}
                onClick={() => go(i)}
                className={`relative min-h-[110px] overflow-hidden rounded-[22px] border-[1.5px] px-[18px] py-4 text-left transition-all duration-300 ease-[cubic-bezier(.3,1.3,.5,1)] ${
                  on ? '-translate-y-1 border-gold bg-gold text-ink' : rd ? 'border-success bg-on-dark/5' : 'border-on-dark/14 bg-on-dark/5'
                }`}
              >
                <span aria-hidden="true" className="absolute -right-1.5 -bottom-[26px] text-[84px] leading-none font-extrabold opacity-16">
                  {c.numeral}
                </span>
                <span className="relative flex justify-between gap-2 text-[12px] font-extrabold tracking-[.1em]">
                  <span>PHẦN {c.numeral}</span>
                  <span>{rd ? '✓ ĐÃ HỌC' : `${c.parts.length} NỘI DUNG`}</span>
                </span>
                <span className="relative mt-2.5 block text-[15.5px] leading-[1.3] font-extrabold">{shortTitle(c.title)}</span>
              </button>
            )
          })}
        </div>
      </Hero>

      <motion.div key={x.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: 'easeOut' }} className="mt-6 flex flex-col gap-4">
        <div className={`relative overflow-hidden rounded-[28px] p-[clamp(22px,3.4vw,36px)] ${pal.box}`}>
          <span aria-hidden="true" className={`absolute -top-10 -right-10 size-[180px] rounded-full ${pal.blob}`} />
          <p className="relative text-[12.5px] font-extrabold tracking-[.14em] uppercase opacity-85">
            Phần {x.numeral} · {x.parts.length} nội dung
          </p>
          <h2 className="relative mt-2.5 text-[clamp(24px,3vw,34px)] leading-[1.15] font-extrabold tracking-[-0.02em]">{x.title}</h2>
          <p className={`relative mt-3.5 max-w-[820px] text-[16.5px] leading-[1.7] ${quoteSum ? 'font-serif italic' : ''}`}>{x.summary}</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] items-start gap-3.5">
          {x.parts.map((p, i) => {
            const isOpen = !!open[i]
            return (
              <div key={p.title} className={`overflow-hidden rounded-3xl border-[1.5px] bg-white transition-colors duration-300 ${isOpen ? 'border-amber' : 'border-line'}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={(e) => {
                    play('tap')
                    if (!isOpen) award(`c6-p-${x.id}-${i}`, 2, e)
                    setOpen((o) => ({ ...o, [i]: !isOpen }))
                  }}
                  className={`flex min-h-[72px] w-full items-center gap-3.5 px-5 py-[18px] text-left transition-colors duration-[250ms] ${isOpen ? 'bg-cream' : 'bg-white'}`}
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] text-[15px] font-extrabold transition-all duration-300 ${isOpen ? pal.num : 'bg-paper text-primary'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-[16.5px] leading-[1.3] font-extrabold">{p.title}</span>
                  <span className="shrink-0 text-[12px] font-bold text-muted">{p.points.length} ý</span>
                  <span aria-hidden="true" className={`grid size-[30px] shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong font-extrabold transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2.5 px-5 pt-1 pb-5">
                    {p.points.map((t) => (
                      <li key={t} className="flex items-start gap-3 rounded-2xl bg-paper px-4 py-3.5">
                        <span aria-hidden="true" className="mt-[9px] size-2 shrink-0 rounded-full bg-amber" />
                        <span className="text-[15px] leading-[1.75] text-pretty">{t}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-pressed={isRead}
            onClick={toggleRead}
            className={`min-h-[50px] rounded-full px-[22px] text-[14.5px] font-extrabold text-on-dark transition-colors ${isRead ? 'bg-success' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {isRead ? '✓ Đã học · bỏ đánh dấu' : 'Đánh dấu đã học phần này'}
          </button>
          <span className="text-[13.5px] font-bold text-muted">
            Tiến độ {readN}/{C.length}
          </span>
          <span className="flex-1" />
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="min-h-[50px] rounded-full border border-line-strong bg-white px-[18px] text-[14px] font-bold disabled:opacity-35">
            ← Phần trước
          </button>
          <button
            type="button"
            onClick={() => {
              if (active === C.length - 1) return onDone()
              go(active + 1)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="min-h-[50px] rounded-full bg-ink px-[22px] text-[14.5px] font-extrabold text-on-dark"
          >
            {active === C.length - 1 ? 'Sang Rèn luyện' : 'Phần tiếp theo'} →
          </button>
        </div>
      </motion.div>
    </>
  )
}
