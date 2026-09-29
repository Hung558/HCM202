import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import data from './data.json'
import { READ_KEY, load, pad, save } from './utils.js'

const LORA = { fontFamily: "'Lora', serif" }

export default function Content({ onNext }) {
  const sections = data.content
  const [active, setActive] = useState(0)
  const [read, setRead] = useState(() => load(READ_KEY, {}))
  const cur = sections[active]
  const readCount = sections.filter((s) => read[s.id]).length
  const isLast = active === sections.length - 1

  const select = (i) => {
    setActive(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleRead = () => {
    const next = { ...read, [cur.id]: !read[cur.id] }
    setRead(next)
    save(READ_KEY, next)
  }

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-10">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[760px]">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#B4322A]">{data.chapter} · Học bài</p>
          <h1 className="mt-2.5 text-balance text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
            {data.chapterTitle}
          </h1>
        </div>
        <div className="min-w-[200px] rounded-[18px] border border-[#E6DFD3] bg-white px-[18px] py-4">
          <div className="flex justify-between text-[13px] font-medium text-[#7A7063]">
            <span>Tiến độ học</span>
            <span className="font-bold text-[#1F1B16]">
              {readCount}/{sections.length}
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#EFE9DF]">
            <motion.div
              className="h-full rounded-full bg-[#B4322A]"
              animate={{ width: `${(readCount / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-7">
        <aside className="flex max-w-[340px] flex-[1_1_260px] flex-col gap-2 md:sticky md:top-[88px]">
          {sections.map((s, i) => {
            const on = i === active
            return (
              <button
                key={s.id}
                onClick={() => select(i)}
                aria-current={on ? 'true' : undefined}
                className={`flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left transition-colors ${on ? 'bg-[#1F1B16] text-[#FFF8EC]' : 'border border-[#E6DFD3] bg-white hover:border-[#CFC4B3]'}`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${on ? 'bg-[#B4322A] text-[#FFF8EC]' : 'bg-[#F5F1EA] text-[#B4322A]'}`}
                >
                  {s.numeral}
                </span>
                <span className="flex-1 text-sm font-semibold leading-snug">
                  {s.title.replace('Tư tưởng Hồ Chí Minh về', 'Về')}
                </span>
                {read[s.id] && (
                  <span className={`text-xs font-bold ${on ? 'text-[#F2C06B]' : 'text-[#2F7D4F]'}`}>Đã học</span>
                )}
              </button>
            )
          })}
          <button
            onClick={onNext}
            className="mt-3 flex items-center justify-between rounded-2xl bg-[#F2C06B] p-4 text-left text-sm font-bold text-[#1F1B16] hover:bg-[#EDB453]"
          >
            Bắt đầu rèn luyện <ArrowRight className="size-4" />
          </button>
        </aside>

        <AnimatePresence mode="wait">
          <motion.article
            key={cur.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="flex min-w-0 flex-[3_1_520px] flex-col gap-4"
          >
            <div className="rounded-3xl border border-[#E6DFD3] bg-white p-[clamp(22px,4vw,40px)]">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold tracking-[0.1em] text-[#B4322A]">PHẦN {cur.numeral}</span>
                <span className="h-px flex-1 bg-[#EFE9DF]" />
              </div>
              <h2 className="mt-3 text-balance text-[clamp(24px,3vw,34px)] font-extrabold leading-tight tracking-[-0.015em]">
                {cur.title}
              </h2>
              <p
                style={LORA}
                className="mt-[22px] text-pretty rounded-2xl bg-[#FBF3E4] px-[22px] py-5 text-lg italic leading-relaxed text-[#4A3F31]"
              >
                {cur.summary}
              </p>
            </div>

            {cur.parts.map((p, i) => (
              <div
                key={p.title}
                className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 rounded-[20px] border border-[#E6DFD3] bg-white px-[clamp(20px,3vw,32px)] py-6"
              >
                <span className="text-[28px] font-extrabold leading-none text-[#E59A2F]">{pad(i + 1)}</span>
                <div>
                  <h3 className="text-lg font-bold leading-snug">{p.title}</h3>
                  <ul className="mt-3.5 flex flex-col gap-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-pretty text-[15.5px] leading-[1.65] text-[#3D352B]">
                        <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#B4322A]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              {active > 0 && (
                <button
                  onClick={() => select(active - 1)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D9CFBF] px-[18px] text-sm font-semibold hover:bg-white"
                >
                  <ArrowLeft className="size-4" /> Phần trước
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={toggleRead}
                aria-pressed={!!read[cur.id]}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-[18px] text-sm font-semibold ${read[cur.id] ? 'border-[#BFE0CB] bg-[#E8F5ED] text-[#2F7D4F]' : 'border-[#D9CFBF] bg-white'}`}
              >
                {read[cur.id] ? (
                  <>
                    <Check className="size-4" strokeWidth={3} /> Đã học xong
                  </>
                ) : (
                  'Đánh dấu đã học'
                )}
              </button>
              <button
                onClick={isLast ? onNext : () => select(active + 1)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#B4322A] px-5 text-sm font-semibold text-[#FFF8EC] hover:bg-[#8A1F19]"
              >
                {isLast ? 'Sang Sổ tay rèn luyện' : 'Phần tiếp'} <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  )
}
