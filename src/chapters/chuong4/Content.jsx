import { useState } from 'react'
import { motion } from 'framer-motion'
import { matchScenariosByTopic } from './quiz.js'
import { burst, pt, scrollToOnMobile } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

// Mỗi section một màu: đỏ / vàng / tối
const SC = [
  { toc: 'text-primary', card: 'bg-primary text-on-dark', blob: 'bg-gold/[.22]', mark: 'text-gold' },
  { toc: 'text-[#8A5A12]', card: 'bg-gold text-ink', blob: 'bg-primary/15', mark: 'text-primary' },
  { toc: 'text-success', card: 'bg-ink text-on-dark', blob: 'bg-success/40', mark: 'text-gold' },
]
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
const sectionShort = (t) => t.replace('TƯ TƯỞNG HỒ CHÍ MINH VỀ ', '').toLowerCase().replace(/^./, (c) => c.toUpperCase())

// Tab Kiến thức: mục lục nhóm theo section + một "đơn vị" (item hoặc mục con) mỗi lần.
export default function Content({ doc, units, scenarios, ui, setUi, read, setRead, onPractice }) {
  const [q, setQ] = useState('')
  const nq = norm(q.trim())
  const u = units[Math.min(ui, units.length - 1)]
  const pal = SC[u.si % SC.length]
  const done = read.includes(u.id)
  const nRead = units.filter((x) => read.includes(x.id)).length
  const words = u.paragraphs.reduce((a, p) => a + p.text.split(/\s+/).length, 0)
  const scen = matchScenariosByTopic(scenarios, `${u.title} ${u.parent ?? ''}`)

  const go = (i) => {
    if (i < 0 || i >= units.length) return
    play('tap')
    setUi(i)
    scrollToOnMobile('c4-article')
  }

  function toggleRead(e) {
    if (done) return setRead(read.filter((x) => x !== u.id))
    play('ok')
    award(`c4-r-${u.id}`, 8, e)
    const p = pt(e)
    burst(p.x, p.y, 20)
    setRead([...read, u.id])
    say(nRead + 1 === units.length ? 'Bạn đã đọc hết chương IV!' : 'Xong một mục, tiếp nào!')
  }

  return (
    <div className="mt-7 flex flex-wrap items-start gap-6">
      <aside className="max-w-full flex-[1_1_280px] max-h-[360px] overflow-auto rounded-3xl border border-line bg-white p-[18px] md:sticky md:top-[84px] md:max-h-[calc(100vh-110px)]">
        <div className="flex items-center justify-between gap-2.5">
          <p className="text-[16px] font-extrabold">Mục lục</p>
          <span className="text-[12.5px] font-bold text-muted">
            {nRead}/{units.length}
          </span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-track" role="progressbar" aria-label="Tiến độ đọc" aria-valuemin={0} aria-valuemax={units.length} aria-valuenow={nRead}>
          <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${Math.round((nRead / units.length) * 100)}%` }} />
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo chủ đề…"
          aria-label="Tìm trong mục lục"
          className="mt-3.5 min-h-11 w-full rounded-[14px] border border-line-strong bg-paper px-3.5 text-[14px] outline-none focus:border-primary"
        />
        <nav aria-label="Mục lục chương IV" className="mt-3.5 flex flex-col gap-3.5">
          {doc.sections.map((sec, si) => (
            <div key={sec.id}>
              <p className={`mb-1.5 text-[11.5px] font-extrabold tracking-[.1em] uppercase ${SC[si % SC.length].toc}`}>
                {sec.marker} {sectionShort(sec.title)}
              </p>
              <div className="flex flex-col gap-[3px]">
                {units.map((x, i) => {
                  if (x.si !== si) return null
                  const isDone = read.includes(x.id)
                  const on = i === ui
                  const match = !nq || norm(`${x.title} ${x.paragraphs.map((p) => p.text).join(' ')}`).includes(nq)
                  return (
                    <button
                      key={x.id}
                      type="button"
                      aria-current={on ? 'step' : undefined}
                      onClick={() => go(i)}
                      className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left hover:bg-cream ${on ? 'bg-cream' : ''} ${match ? '' : 'opacity-30'}`}
                    >
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-on-dark ${isDone ? 'bg-success' : on ? 'bg-primary' : 'bg-line-strong'}`}>{isDone ? '✓' : ''}</span>
                      <span className={`text-[13.5px] leading-[1.35] ${on ? 'font-extrabold' : 'font-semibold'}`}>
                        {x.marker} {x.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <motion.article
        id="c4-article"
        key={u.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex min-w-0 flex-[999_1_480px] scroll-mt-32 flex-col gap-4"
      >
        <div className={`relative overflow-hidden rounded-[28px] p-[clamp(22px,3vw,32px)] ${pal.card}`}>
          <span aria-hidden="true" className={`absolute -top-[30px] -right-[30px] size-[150px] rounded-full ${pal.blob}`} />
          <p className="relative text-[12.5px] font-extrabold tracking-[.12em] uppercase opacity-85">
            {u.sec.marker} {u.sec.title}
          </p>
          {u.parent && <p className="relative mt-2.5 text-[14px] font-bold opacity-85">{u.parent}</p>}
          <h2 className="relative mt-1.5 text-[clamp(24px,3vw,32px)] leading-[1.2] font-extrabold tracking-[-0.02em]">
            <span className={pal.mark}>{u.marker}</span> {u.title}
          </h2>
          <p className="relative mt-2.5 text-[13px] font-bold opacity-75">
            Mục {ui + 1} / {units.length} · khoảng {Math.max(1, Math.round(words / 200))} phút đọc
          </p>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[28px] border border-line bg-white p-[clamp(22px,3.4vw,40px)]">
          {u.paragraphs.map((p, i) => {
            if (p.type === 'li')
              return (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-paper px-4 py-3.5">
                  <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-[15.5px] leading-[1.7]">{p.text}</span>
                </div>
              )
            const m = p.type === 'ol' && p.text.match(/^(\(\d+\))\s*(.*)$/s)
            if (m)
              return (
                <div key={i} className="flex items-start gap-3.5 rounded-[18px] bg-cream px-[18px] py-4">
                  <span className="grid h-10 min-w-10 shrink-0 place-items-center rounded-xl bg-amber px-2 text-[15px] font-extrabold">{m[1]}</span>
                  <span className="text-[15.5px] leading-[1.7]">{m[2]}</span>
                </div>
              )
            return (
              <p key={i} className="text-[16px] leading-[1.85] text-pretty">
                {p.text}
              </p>
            )
          })}
        </div>

        {scen.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-ink px-[22px] py-5 text-on-dark">
            <span aria-hidden="true" className="grid size-[52px] shrink-0 place-items-center rounded-2xl bg-gold text-[20px] font-extrabold text-ink">
              ?
            </span>
            <span className="min-w-[200px] flex-1">
              <span className="block text-[16px] font-extrabold">Có {scen.length} tình huống luyện tập về chủ đề này</span>
              <span className="text-[13.5px] text-on-dark/75">{[...new Set(scen.map((x) => x.referenceTopic))].join(' · ')}</span>
            </span>
            <button type="button" onClick={() => onPractice(scen)} className="min-h-[46px] rounded-full bg-gold px-5 text-[14px] font-extrabold text-ink">
              Luyện ngay →
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            aria-pressed={done}
            onClick={toggleRead}
            className={`min-h-12 rounded-full px-5 text-[14.5px] font-extrabold text-on-dark transition-colors ${done ? 'bg-success' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {done ? '✓ Đã đọc · bỏ đánh dấu' : 'Đã đọc mục này'}
          </button>
          <span className="flex-1" />
          <button type="button" onClick={() => go(ui - 1)} disabled={ui === 0} className="min-h-12 rounded-full border border-line-strong bg-white px-4 text-[14px] font-bold disabled:opacity-35">
            ← Mục trước
          </button>
          <button type="button" onClick={() => go(ui + 1)} disabled={ui === units.length - 1} className="min-h-12 rounded-full bg-ink px-4 text-[14px] font-bold text-on-dark disabled:opacity-35">
            Mục tiếp →
          </button>
        </div>
      </motion.article>
    </div>
  )
}
