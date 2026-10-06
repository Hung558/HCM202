import { useRef } from 'react'
import { motion } from 'framer-motion'
import { burst, pt, shake } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'
import { freshRun } from './utils.js'

const shortTitle = (x) => `${x.number} · ${x.title.replace('Tư tưởng Hồ Chí Minh về ', '')}`

// Tab Ôn tập: lọc theo phần, thanh bước đúng/sai, huy hiệu "🔥 Chuỗi n"; đúng thì confetti (nhiều hơn khi chuỗi dài), sai thì rung.
export default function Review({ questions, sections, run, setRun, onKnow }) {
  const boxRef = useRef(null)
  const list = run.filter === 'all' ? questions : questions.filter((x) => x.section === run.filter)
  const q = list[Math.min(run.qi, list.length - 1)]
  const answered = run.pick !== null
  const good = answered && run.pick === q.answer
  const score = run.answers.filter((a) => a.ok).length
  const ratio = score / list.length
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : score > 0 ? 1 : 0

  const filters = [{ id: 'all', label: `Toàn bộ chương · ${questions.length}` }, ...sections.map((x) => ({ id: x.id, label: shortTitle(x) }))]

  function pick(i, e) {
    if (answered) return
    const ok = i === q.answer
    const streak = ok ? run.streak + 1 : 0
    setRun((r) => ({ ...r, pick: i, streak, best: Math.max(r.best, streak), answers: [...r.answers, { sec: q.section, ok }] }))
    if (ok) {
      play('ok')
      const p = pt(e)
      burst(p.x, p.y, 20 + streak * 4)
      award(`c3-q-${q.id}`, 15, e)
      say(streak >= 3 ? `Chuỗi ${streak} câu! Đang cháy 🔥` : 'Chính xác!')
    } else {
      play('bad')
      shake(boxRef.current)
      say('Mất chuỗi rồi, đọc giải thích nhé.')
    }
  }

  function next() {
    if (run.qi + 1 < list.length) return setRun((r) => ({ ...r, qi: r.qi + 1, pick: null }))
    setRun((r) => ({ ...r, done: true }))
    if (ratio >= 0.6) {
      play('win')
      setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, 70), 100)
    }
  }

  return (
    <>
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Lọc câu hỏi theo phần">
        {filters.map((f) => {
          const on = run.filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                play('tap')
                setRun(freshRun(f.id))
              }}
              className={`min-h-[42px] shrink-0 rounded-full border px-4 text-[13.5px] font-bold whitespace-nowrap ${on ? 'border-primary bg-primary text-on-dark' : 'border-line-strong bg-white text-ink-soft'}`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {!run.done ? (
        <motion.div
          key={`${run.filter}-${run.qi}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-auto mt-[18px] max-w-[820px]"
        >
          <div ref={boxRef} className="rounded-[28px] border border-line bg-white p-[clamp(20px,3vw,32px)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="eyebrow text-[12.5px]">
                Câu {run.qi + 1} / {list.length} · Mục {q.subsection}
              </span>
              <span
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-extrabold transition-all duration-300 ${
                  run.streak >= 3 ? 'bg-primary text-on-dark' : run.streak > 0 ? 'bg-cream text-ink-soft' : 'bg-paper text-ink-soft'
                }`}
              >
                🔥 Chuỗi {run.streak}
              </span>
            </div>
            <div className="mt-3.5 flex gap-1" aria-hidden="true">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                    i < run.answers.length ? (run.answers[i].ok ? 'bg-success' : 'bg-primary') : i === run.qi ? 'bg-amber' : 'bg-track'
                  }`}
                />
              ))}
            </div>
            <h2 className="mt-5 text-[clamp(19px,2.3vw,24px)] leading-[1.4] font-extrabold text-pretty">{q.question}</h2>
            <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-2.5">
              {q.options.map((t, i) => {
                const right = i === q.answer
                const picked = run.pick === i
                const look = answered && right ? 'border-success bg-success-soft' : answered && picked ? 'border-primary bg-[#FBEDEB]' : answered ? 'border-line bg-white opacity-50' : 'border-line bg-white hover:-translate-y-0.5'
                const badge = answered && right ? 'bg-success text-on-dark' : answered && picked ? 'bg-primary text-on-dark' : 'bg-paper'
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={answered}
                    onClick={(e) => pick(i, e)}
                    className={`flex min-h-16 w-full items-center gap-3.5 rounded-[18px] border-[1.5px] px-4 py-3 text-left text-[15px] leading-normal transition-all duration-[250ms] ${look}`}
                  >
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-extrabold ${badge}`}>{'ABCD'[i]}</span>
                    <span>{t}</span>
                  </button>
                )
              })}
            </div>
            {answered && (
              <div role="status" className={`mt-4 rounded-[20px] px-5 py-[18px] ${good ? 'bg-success-soft' : 'bg-[#FBEDEB]'}`}>
                <p className={`text-[18px] font-extrabold ${good ? 'text-success' : 'text-primary'}`}>{good ? 'Chính xác!' : 'Chưa đúng rồi'}</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.65]">{q.explanation}</p>
                <button type="button" onClick={next} className="btn btn-dark mt-3.5">
                  {run.qi + 1 >= list.length ? 'Xem kết quả' : 'Câu tiếp'} →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto mt-[18px] max-w-[820px] overflow-hidden rounded-[28px] bg-primary p-[clamp(24px,4vw,44px)] text-on-dark"
        >
          <span aria-hidden="true" className="absolute -top-[60px] -left-[60px] size-[200px] rounded-full bg-gold/[.18]" />
          <div className="relative text-center">
            <div className="text-[52px] tracking-[8px] text-gold" aria-label={`${stars} trên 3 sao`}>
              {'★'.repeat(stars) + '☆'.repeat(3 - stars)}
            </div>
            <h2 className="mt-2 text-[clamp(26px,3.4vw,36px)] font-extrabold">{stars === 3 ? 'Xuất sắc!' : stars === 2 ? 'Làm tốt lắm!' : 'Cố gắng thêm nhé!'}</h2>
            <p className="mt-2 text-[16px]">
              Đúng {score} / {list.length} câu · chuỗi dài nhất {run.best}
            </p>
          </div>
          <div className="relative mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-2.5">
            {sections.map((x) => {
              const a = run.answers.filter((z) => z.sec === x.id)
              return (
                a.length > 0 && (
                  <div key={x.id} className="rounded-[18px] bg-on-dark/10 p-3.5">
                    <p className="text-[12px] leading-[1.4] font-bold opacity-80">{shortTitle(x)}</p>
                    <p className="mt-1.5 text-[22px] font-extrabold text-gold">
                      {a.filter((z) => z.ok).length}/{a.length}
                    </p>
                  </div>
                )
              )
            })}
          </div>
          <div className="relative mt-[22px] flex flex-wrap justify-center gap-2.5">
            <button type="button" onClick={() => setRun(freshRun(run.filter))} className="min-h-12 rounded-full bg-gold px-6 text-[15px] font-extrabold text-ink">
              Làm lại
            </button>
            <button type="button" onClick={onKnow} className="min-h-12 rounded-full border border-on-dark/40 px-6 text-[15px] font-bold">
              Đọc lại kiến thức
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}
