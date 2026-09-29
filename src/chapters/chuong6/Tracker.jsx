import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, RotateCcw, X } from 'lucide-react'
import data from './data.json'
import { EMPTY, dayKey, lastDays, pad, streak } from './utils.js'

const LORA = { fontFamily: "'Lora', serif" }
const heat = (n) => (n === 0 ? '#3A342C' : n < 3 ? '#7A4A2A' : n < 6 ? '#E59A2F' : '#F2C06B')

// state/setState được giữ ở Chuong6.jsx (để nav hiện streak); key localStorage: hcm-chuong6-tracker
export default function Tracker({ state, setState }) {
  const [quoteIdx, setQuoteIdx] = useState(() => new Date().getDate() % data.quotes.length)
  const today = dayKey()
  const done = state.log[today] ?? []

  const toggle = (id) =>
    setState((s) => {
      const cur = s.log[today] ?? []
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      return { ...s, log: { ...s.log, [today]: next } }
    })

  const addCustom = (vid, text) =>
    setState((s) => ({ ...s, custom: { ...s.custom, [vid]: [...(s.custom[vid] ?? []), text] } }))

  const removeCustom = (vid, text) =>
    setState((s) => ({
      ...s,
      custom: { ...s.custom, [vid]: s.custom[vid].filter((t) => t !== text) },
      log: { ...s.log, [today]: (s.log[today] ?? []).filter((x) => x !== `${vid}:${text}`) },
    }))

  const setNote = (text) => setState((s) => ({ ...s, notes: { ...s.notes, [today]: text } }))

  const reset = () => {
    if (confirm('Xóa toàn bộ dữ liệu sổ tay?')) setState(EMPTY)
  }

  const total = data.virtues.reduce((n, v) => n + v.suggestions.length + (state.custom[v.id]?.length ?? 0), 0)
  const frac = total ? Math.min(done.length / total, 1) : 0
  const quote = data.quotes[quoteIdx]
  const week = lastDays(7)
  const todayLabel = new Date().toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-5 pb-20 pt-10">
      <header className="max-w-[680px]">
        <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#B4322A]">{todayLabel}</p>
        <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
          {data.title}
        </h1>
        <p className="mt-3.5 text-pretty text-base leading-relaxed text-[#5C5347]">{data.intro}</p>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        <button
          onClick={() => setQuoteIdx((i) => (i + 1) % data.quotes.length)}
          title="Bấm để xem câu khác"
          className="flex min-h-[200px] min-w-0 flex-col justify-between gap-[18px] rounded-3xl bg-[#B4322A] px-[30px] py-7 text-left text-[#FFF8EC] sm:col-span-2"
        >
          <span className="text-xs font-bold tracking-[0.12em] text-[#F2C06B]">LỜI BÁC DẠY · BẤM ĐỂ ĐỔI</span>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quoteIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-[18px]"
            >
              <p style={LORA} className="text-pretty text-[clamp(19px,2.2vw,24px)] italic leading-normal">
                “{quote.text}”
              </p>
              <footer className="text-[13px] text-[#F6D9C9]">— {quote.source}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </button>

        <div className="grid grid-rows-2 gap-4">
          <div className="flex items-center justify-between rounded-[20px] border border-[#E6DFD3] bg-white px-5 py-[18px]">
            <div>
              <p className="text-[13px] font-medium text-[#7A7063]">Việc tốt hôm nay</p>
              <p className="mt-1 text-4xl font-extrabold leading-tight">
                <motion.span key={done.length} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="inline-block">
                  {done.length}
                </motion.span>
                <span className="text-lg font-semibold text-[#A89C8B]">/{total}</span>
              </p>
            </div>
            <div
              className="grid size-14 place-items-center rounded-full transition-all"
              style={{ background: `conic-gradient(#B4322A ${frac * 360}deg, #EFE9DF 0)` }}
            >
              <div className="grid size-[42px] place-items-center rounded-full bg-white text-xs font-bold">
                {Math.round(frac * 100)}%
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-[#1F1B16] px-5 py-[18px] text-[#FFF8EC]">
            <div className="flex justify-between text-[13px] font-medium text-[#BDB2A2]">
              <span>7 ngày gần nhất</span>
              <span className="font-bold text-[#F2C06B]">{streak(state.log)} ngày chuỗi</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-[5px]">
              {week.map((d, i) => {
                const n = state.log[dayKey(d)]?.length ?? 0
                return (
                  <div key={dayKey(d)} title={`${n} việc`} className="flex flex-col items-center gap-1">
                    <div
                      className="aspect-square w-full max-w-[30px] rounded-[7px]"
                      style={{
                        background: heat(n),
                        outline: i === week.length - 1 ? '1.5px solid #FFF8EC' : 'none',
                        outlineOffset: 2,
                      }}
                    />
                    <span className="text-[10px] text-[#9C9080]">{d.toLocaleDateString('vi', { weekday: 'narrow' })}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
        {data.virtues.map((v, i) => (
          <VirtueCard
            key={v.id}
            virtue={v}
            index={i}
            custom={state.custom[v.id] ?? []}
            done={done}
            onToggle={toggle}
            onAdd={(text) => addCustom(v.id, text)}
            onRemove={(text) => removeCustom(v.id, text)}
          />
        ))}

        <div className="flex flex-col gap-3 rounded-[22px] border border-[#EEDFC4] bg-[#FBF3E4] p-[22px]">
          <h2 className="text-[22px] font-extrabold">Tự soi, tự sửa</h2>
          <p className="text-[13.5px] leading-normal text-[#7A6A52]">
            Nhật ký ngắn cho hôm nay, chỉ lưu trên máy của bạn.
          </p>
          <textarea
            value={state.notes[today] ?? ''}
            onChange={(e) => setNote(e.target.value)}
            rows={7}
            placeholder="Hôm nay mình đã làm tốt điều gì? Điều gì cần sửa?"
            className="w-full flex-1 resize-none rounded-[14px] border border-[#EEDFC4] bg-[#FFFDF8] p-3.5 text-[14.5px] leading-relaxed outline-none focus:border-[#E59A2F]"
          />
        </div>
      </section>

      <section className="mt-3">
        <h2 className="mb-3.5 text-2xl font-extrabold tracking-[-0.01em]">Nguyên tắc tu dưỡng đạo đức</h2>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {data.principles.map((p, i) => (
            <li key={p.name} className="flex flex-col gap-2.5 rounded-[20px] border border-[#E6DFD3] bg-white p-[22px]">
              <span className="text-[32px] font-extrabold leading-none text-[#B4322A]">{pad(i + 1)}</span>
              <h3 className="text-[16.5px] font-bold leading-snug">{p.name}</h3>
              <p className="text-pretty text-sm leading-relaxed text-[#6B6155]">{p.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-3 flex justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-[#A89C8B] hover:text-[#B4322A]"
        >
          <RotateCcw className="size-3.5" /> Xóa dữ liệu sổ tay
        </button>
      </footer>
    </div>
  )
}

function VirtueCard({ virtue, index, custom, done, onToggle, onAdd, onRemove }) {
  const [text, setText] = useState('')
  const actions = [
    ...virtue.suggestions.map((t) => ({ text: t, custom: false })),
    ...custom.map((t) => ({ text: t, custom: true })),
  ]
  const doneCount = actions.filter((a) => done.includes(`${virtue.id}:${a.text}`)).length

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (t && !actions.some((a) => a.text === t)) onAdd(t)
    setText('')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex flex-col gap-3.5 rounded-[22px] border border-[#E6DFD3] bg-white p-[22px]"
    >
      <div className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-[#FBF3E4] text-[15px] font-extrabold text-[#B4322A]">
          {pad(index + 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[22px] font-extrabold tracking-[-0.01em]">{virtue.name}</h2>
            <span className="text-[13px] font-bold text-[#7A7063]">
              {doneCount}/{actions.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFE9DF]">
            <motion.div
              className="h-full rounded-full bg-[#E59A2F]"
              animate={{ width: `${actions.length ? (doneCount / actions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-pretty text-[13.5px] leading-relaxed text-[#6B6155]">{virtue.meaning}</p>

      <ul className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {actions.map((a) => {
            const id = `${virtue.id}:${a.text}`
            const checked = done.includes(id)
            return (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5"
              >
                <button
                  onClick={() => onToggle(id)}
                  aria-pressed={checked}
                  className={`flex min-h-[44px] flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${checked ? 'border-[#BFE0CB] bg-[#EEF7F1] text-[#6B8F78] line-through' : 'border-[#EFE9DF] bg-[#FAF8F4] hover:border-[#D9CFBF] hover:bg-white'}`}
                >
                  <span
                    className={`grid size-[22px] shrink-0 place-items-center rounded-[7px] transition-colors ${checked ? 'bg-[#2F7D4F]' : 'border-2 border-[#CFC4B3] bg-white'}`}
                  >
                    {checked && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="size-3.5 text-white" strokeWidth={3} />
                      </motion.span>
                    )}
                  </span>
                  <span>{a.text}</span>
                </button>
                {a.custom && (
                  <button
                    onClick={() => onRemove(a.text)}
                    aria-label={`Xóa "${a.text}"`}
                    className="grid size-11 place-items-center rounded-[10px] text-[#A89C8B] hover:bg-[#FBEAE8] hover:text-[#B4322A]"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <form onSubmit={submit} className="mt-auto flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thêm việc của riêng bạn…"
          className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-dashed border-[#D9CFBF] bg-transparent px-3 text-sm outline-none focus:border-solid focus:border-[#B4322A]"
        />
        <button
          type="submit"
          aria-label="Thêm"
          className="grid w-11 place-items-center rounded-xl bg-[#1F1B16] text-[#FFF8EC] hover:bg-black"
        >
          <Plus className="size-4" />
        </button>
      </form>
    </motion.article>
  )
}
