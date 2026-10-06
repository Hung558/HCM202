import { useEffect, useRef, useState } from 'react'
import data from './data.json'
import { useConfirm } from '../../components/useConfirm.jsx'
import { EMPTY, dayKey, lastDays, streak } from './utils.js'
import { animate, burst, centerOf, petalRain } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

// Màu con dấu của 5 đức tính
const SEAL = ['#B4322A', '#C77A12', '#2F7D4F', '#8A1F19', '#5C4A8A']
// Ô nhiệt 7 ngày theo số việc tốt: 0 / ≤2 / ≤5 / ≤9 / >9
const heat = (n) => (n === 0 ? '#3A332B' : n <= 2 ? '#7A4A2C' : n <= 5 ? '#B4322A' : n <= 9 ? '#E59A2F' : '#F2C06B')
const actsOf = (v, custom) => [...v.suggestions.map((t) => ({ t, c: false })), ...(custom[v.id] ?? []).map((t) => ({ t, c: true }))]

// Tab Rèn luyện — "Sổ tay": câu trích, việc tốt hôm nay, 7 ngày gần nhất, 5 đức tính có con dấu, nhật ký, nguyên tắc.
// state = { custom, log, notes } giữ ở Chuong6.jsx; key localStorage: hcm-chuong6-tracker
export default function Tracker({ state, setState }) {
  const [today] = useState(() => dayKey())
  const [week] = useState(() => lastDays(7))
  const [todayLabel] = useState(() => new Date().toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' }))
  const [qi, setQi] = useState(() => new Date().getDate())
  const [drafts, setDrafts] = useState({})
  const [confirm, confirmDialog] = useConfirm()
  const quoteRef = useRef(null)
  const countRef = useRef(null)
  const sealRefs = useRef({})

  const done = state.log[today] ?? []
  const total = data.virtues.reduce((n, v) => n + actsOf(v, state.custom).length, 0)
  const doneN = data.virtues.reduce((n, v) => n + actsOf(v, state.custom).filter((a) => done.includes(`${v.id}:${a.t}`)).length, 0)
  const frac = total ? doneN / total : 0
  const quote = data.quotes[qi % data.quotes.length]
  const note = state.notes[today] ?? ''

  // Số việc tốt nảy lên khi tăng
  const prevN = useRef(doneN)
  useEffect(() => {
    if (doneN > prevN.current) animate(countRef.current, [{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.3,1.5,.5,1)' })
    prevN.current = doneN
  }, [doneN])

  function toggle(v, t, e) {
    const key = `${v.id}:${t}`
    const on = done.includes(key)
    const next = on ? done.filter((k) => k !== key) : [...done, key]
    setState((s) => ({ ...s, log: { ...s.log, [today]: next } }))
    if (on) return play('off')
    play('ok')
    award(`c6-${today}-${key}`, 5, e)
    const full = (x) => actsOf(x, state.custom).every((a) => next.includes(`${x.id}:${a.t}`))
    if (!full(v)) return say(`Thêm một việc tốt cho “${v.name}”!`)
    // Đủ việc của đức tính: con dấu "cộp" + cánh hoa
    setTimeout(() => {
      play('stamp')
      const el = sealRefs.current[v.id]
      animate(el, [{ transform: 'rotate(-10deg) scale(2.2)', opacity: 0 }, { transform: 'rotate(-10deg) scale(.9)', opacity: 1, offset: 0.7 }, { transform: 'rotate(-10deg) scale(1)' }], { duration: 420, easing: 'ease-out' })
      const p = centerOf(el)
      burst(p.x, p.y, 28, 'petal')
      if (data.virtues.every(full)) {
        play('win')
        setTimeout(() => petalRain(80), 200)
        say('Trọn vẹn cả 5 đức tính hôm nay. Tuyệt vời!')
      } else say(`Cộp! Đã đóng dấu “${v.name}” hôm nay.`)
    }, 120)
  }

  function addCustom(v) {
    const t = (drafts[v.id] ?? '').trim()
    setDrafts((d) => ({ ...d, [v.id]: '' }))
    const cur = state.custom[v.id] ?? []
    if (!t || v.suggestions.includes(t) || cur.includes(t)) return
    play('tap')
    setState((s) => ({ ...s, custom: { ...s.custom, [v.id]: [...cur, t] } }))
  }

  // Xoá việc tự thêm khỏi danh sách và khỏi mọi ngày trong log
  function removeCustom(v, t) {
    const key = `${v.id}:${t}`
    setState((s) => ({
      ...s,
      custom: { ...s.custom, [v.id]: (s.custom[v.id] ?? []).filter((x) => x !== t) },
      log: Object.fromEntries(Object.entries(s.log).map(([d, list]) => [d, list.filter((k) => k !== key)])),
    }))
  }

  async function reset() {
    const ok = await confirm({
      title: 'Xóa toàn bộ dữ liệu sổ tay?',
      message: 'Các việc đã đánh dấu, việc tự thêm và nhật ký trên máy này sẽ bị xóa. Không hoàn tác được.',
      confirmLabel: 'Xóa dữ liệu',
    })
    if (!ok) return
    setState(EMPTY)
    say('Đã xóa dữ liệu sổ tay. Bắt đầu lại nào!')
  }

  return (
    <>
      {confirmDialog}
      <section className="flex flex-wrap items-stretch gap-4">
        <div className="flex flex-[2_1_460px] flex-col gap-3.5">
          <div>
            <p className="text-[13px] font-extrabold tracking-[.12em] text-primary uppercase">{todayLabel}</p>
            <h1 className="mt-2 text-[clamp(30px,4.4vw,48px)] leading-[1.08] font-extrabold tracking-[-0.02em]">{data.title}</h1>
            <p className="mt-3 max-w-[640px] text-[15.5px] leading-[1.65] text-ink-soft">{data.intro}</p>
          </div>
          <div className="flex-1 [perspective:800px]">
            <button
              ref={quoteRef}
              type="button"
              aria-label="Đổi câu trích dẫn"
              onClick={() => {
                play('tap')
                setQi((n) => n + 1)
                animate(quoteRef.current, [{ transform: 'rotateX(18deg) scale(.97)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.3,1.3,.5,1)' })
              }}
              className="relative h-full min-h-[180px] w-full overflow-hidden rounded-[28px] bg-primary p-[clamp(22px,3vw,30px)] text-left text-on-dark"
            >
              <span aria-hidden="true" className="absolute top-1.5 right-[22px] font-serif text-[140px] leading-none text-gold/25">
                ”
              </span>
              <span className="relative block font-serif text-[clamp(19px,2.2vw,24px)] leading-normal text-pretty italic" aria-live="polite">
                “{quote.text}”
              </span>
              <span className="relative mt-4 flex flex-wrap justify-between gap-2.5 text-[13px] text-[#F6D9C9]">
                <span>— {quote.source}</span>
                <span className="font-bold">
                  {(qi % data.quotes.length) + 1}/{data.quotes.length} · chạm để đổi
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-[1_1_300px] flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-line bg-white p-5">
            <div>
              <p className="text-[13px] font-semibold text-muted">Việc tốt hôm nay</p>
              <p className="mt-1 text-[40px] leading-none font-extrabold">
                <span ref={countRef} className="inline-block">
                  {doneN}
                </span>
                <span className="text-[18px] text-faint">/{total}</span>
              </p>
            </div>
            <div
              className="grid size-[76px] place-items-center rounded-full transition-[background] duration-[400ms]"
              style={{ background: `conic-gradient(#B4322A ${frac * 360}deg, #EFE9DF 0)` }}
              role="progressbar"
              aria-label="Việc tốt hôm nay"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={doneN}
            >
              <div className="grid size-[58px] place-items-center rounded-full bg-white text-[14px] font-extrabold">{Math.round(frac * 100)}%</div>
            </div>
          </div>
          <div className="flex-1 rounded-3xl bg-ink p-5 text-on-dark">
            <div className="flex justify-between gap-2.5 text-[13px] font-semibold text-[#BDB2A2]">
              <span>7 ngày gần nhất</span>
              <span className="font-extrabold text-gold">🔥 {streak(state.log)} ngày chuỗi</span>
            </div>
            <ol className="mt-3.5 grid grid-cols-7 gap-1.5">
              {week.map((d, i) => {
                const n = (state.log[dayKey(d)] ?? []).length
                return (
                  <li key={dayKey(d)} title={`${n} việc`} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`grid aspect-square w-full max-w-9 place-items-center rounded-[10px] text-[11px] font-extrabold text-ink transition-[background] duration-[400ms] ${i === 6 ? 'outline-[1.5px] outline-offset-2 outline-on-dark' : ''}`}
                      style={{ background: heat(n) }}
                    >
                      {n || ''}
                    </div>
                    <span className="text-[11px] font-bold text-[#9C9080]">{d.toLocaleDateString('vi', { weekday: 'narrow' })}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(min(330px,100%),1fr))] gap-4">
        {data.virtues.map((v, vi) => {
          const acts = actsOf(v, state.custom)
          const cnt = acts.filter((a) => done.includes(`${v.id}:${a.t}`)).length
          const full = acts.length > 0 && cnt === acts.length
          const col = SEAL[vi % SEAL.length]
          const sealC = cnt ? col : '#D9CFBF'
          return (
            <article key={v.id} className="relative flex flex-col gap-3.5 rounded-[26px] border-[1.5px] bg-white p-[22px] transition-colors duration-300" style={{ borderColor: full ? col : '#E6DFD3' }}>
              <div className="flex items-start gap-3.5">
                <div
                  ref={(el) => (sealRefs.current[v.id] = el)}
                  aria-hidden="true"
                  className="relative grid size-[74px] shrink-0 -rotate-10 place-items-center rounded-full border-[3.5px] transition-all duration-[350ms]"
                  style={{ borderColor: sealC, color: sealC, background: full ? 'rgba(180,50,42,.06)' : 'transparent' }}
                >
                  <span className="absolute inset-[5px] rounded-full border-[1.5px] border-dashed opacity-60" style={{ borderColor: sealC }} />
                  <span className="px-1.5 text-center leading-[1.05] font-extrabold" style={{ fontSize: v.name.length > 6 ? 11 : 17 }}>
                    {v.name}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-[24px] font-extrabold tracking-[-0.01em]">{v.name}</h2>
                    <span className="text-[13px] font-extrabold" style={{ color: full ? col : '#7A7063' }}>
                      {cnt}/{acts.length}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[#6B6155]">{v.meaning}</p>
                </div>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-track">
                <div className="h-full rounded-full transition-[width] duration-[450ms] ease-[cubic-bezier(.3,1.3,.4,1)]" style={{ width: `${acts.length ? (cnt / acts.length) * 100 : 0}%`, background: sealC }} />
              </div>
              <ul className="flex flex-col gap-2">
                {acts.map((a) => {
                  const on = done.includes(`${v.id}:${a.t}`)
                  return (
                    <li key={a.t} className={`flex items-center gap-1 rounded-2xl transition-colors duration-[250ms] ${on ? 'bg-paper' : ''}`}>
                      <button type="button" role="checkbox" aria-checked={on} onClick={(e) => toggle(v, a.t, e)} className="flex min-h-[52px] flex-1 items-center gap-3 px-3 py-2 text-left">
                        <span
                          className={`grid size-[26px] shrink-0 place-items-center rounded-lg border-2 text-[14px] font-extrabold text-on-dark transition-all duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] ${on ? 'scale-110 -rotate-6' : ''}`}
                          style={{ borderColor: on ? col : '#D9CFBF', background: on ? col : '#FFFFFF' }}
                        >
                          {on ? '✓' : ''}
                        </span>
                        <span className={`text-[14.5px] leading-[1.45] ${on ? 'font-semibold text-ink-soft' : 'font-medium'}`}>{a.t}</span>
                      </button>
                      {a.c && (
                        <button type="button" onClick={() => removeCustom(v, a.t)} aria-label={`Xoá việc: ${a.t}`} className="mr-1.5 grid size-10 shrink-0 place-items-center rounded-full text-[18px] text-faint hover:text-primary">
                          ×
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="flex gap-2">
                <input
                  value={drafts[v.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [v.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustom(v)
                    }
                  }}
                  placeholder="Thêm việc của riêng bạn…"
                  aria-label={`Thêm việc cho đức tính ${v.name}`}
                  className="min-h-[46px] min-w-0 flex-1 rounded-[14px] border border-line-strong bg-paper px-3.5 text-[14px] outline-none focus:border-primary"
                />
                <button type="button" onClick={() => addCustom(v)} aria-label={`Thêm việc cho ${v.name}`} className="size-[46px] shrink-0 rounded-[14px] bg-ink text-[22px] font-bold text-on-dark">
                  +
                </button>
              </div>
            </article>
          )
        })}

        <div className="flex flex-col gap-3 rounded-[26px] border border-[#EEDFC4] bg-cream p-[22px]">
          <h2 className="text-[22px] font-extrabold">Tự soi, tự sửa</h2>
          <p className="text-[13.5px] leading-[1.55] text-[#7A6A52]">Nhật ký ngắn cho hôm nay, chỉ lưu trên máy của bạn.</p>
          <textarea
            value={note}
            onChange={(e) => setState((s) => ({ ...s, notes: { ...s.notes, [today]: e.target.value } }))}
            onBlur={(e) => note.trim().length >= 20 && award(`c6-n-${today}`, 10, { clientX: e.target.getBoundingClientRect().left + 80, clientY: e.target.getBoundingClientRect().top + 20 })}
            placeholder="Hôm nay mình đã làm tốt điều gì? Điều gì cần sửa?"
            aria-label="Nhật ký tự soi, tự sửa hôm nay"
            className="min-h-[180px] w-full flex-1 resize-none rounded-2xl border border-[#EEDFC4] bg-[#FFFDF8] p-3.5 text-[14.5px] leading-[1.7] outline-none focus:border-amber"
          />
          <p className="text-[12.5px] font-bold text-faint">{note ? `${note.length} ký tự · đã lưu` : 'Chưa có ghi chú hôm nay'}</p>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3.5 text-[24px] font-extrabold tracking-[-0.01em]">Nguyên tắc tu dưỡng đạo đức</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3.5">
          {data.principles.map((p, i) => (
            <div key={p.name} className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-white p-[22px] transition-transform duration-[250ms] hover:-translate-y-1 hover:-rotate-[0.5deg]">
              <span className="text-[34px] leading-none font-extrabold text-primary">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-[16.5px] leading-[1.35] font-extrabold">{p.name}</h3>
              <p className="text-[14px] leading-[1.65] text-[#6B6155]">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-[22px] flex justify-center">
        <button type="button" onClick={reset} className="min-h-11 rounded-full px-4 text-[13px] font-bold text-faint hover:text-primary">
          ↺ Xóa dữ liệu sổ tay
        </button>
      </div>
    </>
  )
}
