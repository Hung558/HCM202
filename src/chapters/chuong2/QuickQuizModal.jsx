import { useRef, useState } from 'react'
import Modal from '../_fun/Modal.jsx'
import { burst, pt, shake } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

const START = { qi: 0, pick: null, answers: [], done: false }

// "Đố nhanh": lần lượt từng câu, đúng thì confetti (+20 XP), sai thì khung rung; cuối cùng chấm sao.
export default function QuickQuizModal({ open, quiz, onClose }) {
  const [s, setS] = useState(START)
  const boxRef = useRef(null)
  const q = quiz[Math.min(s.qi, quiz.length - 1)]
  const answered = s.pick !== null
  const score = s.answers.filter(Boolean).length
  const ok = answered && s.pick === q.answer
  const stars = score >= quiz.length ? 3 : score >= Math.ceil(quiz.length * 0.6) ? 2 : score >= 1 ? 1 : 0

  function pick(i, e) {
    if (answered) return
    const right = i === q.answer
    setS((x) => ({ ...x, pick: i, answers: [...x.answers, right] }))
    if (right) {
      play('ok')
      const p = pt(e)
      burst(p.x, p.y, 26)
      award(`c2-q-${q.id}`, 20, e)
      say('Chuẩn luôn!')
    } else {
      play('bad')
      shake(boxRef.current)
      say('Chưa đúng, đọc giải thích nhé.')
    }
  }

  function next() {
    if (s.qi + 1 < quiz.length) return setS((x) => ({ ...x, qi: x.qi + 1, pick: null }))
    setS((x) => ({ ...x, done: true }))
    if (score >= Math.ceil(quiz.length * 0.6)) {
      play('win')
      setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, 70), 100)
    }
  }

  return (
    <Modal ref={boxRef} open={open} onClose={onClose} label="Đố nhanh" width={700} closeClass="bg-paper">
      <div className="p-[clamp(20px,3vw,32px)]">
        {!s.done ? (
          <>
            <p className="eyebrow pr-12">
              Đố nhanh · Câu {s.qi + 1} / {quiz.length}
            </p>
            <div className="mt-3 flex gap-[5px] pr-[50px]" aria-hidden="true">
              {quiz.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                    i < s.answers.length ? (s.answers[i] ? 'bg-success' : 'bg-primary') : i === s.qi ? 'bg-amber' : 'bg-track'
                  }`}
                />
              ))}
            </div>
            <h2 className="mt-[18px] text-[clamp(19px,2.3vw,23px)] leading-[1.4] font-extrabold text-pretty">{q.question}</h2>
            <div className="mt-[18px] flex flex-col gap-2.5">
              {q.options.map((t, i) => {
                const right = i === q.answer
                const picked = s.pick === i
                const look = answered && right ? 'border-success bg-success-soft' : answered && picked ? 'border-primary bg-[#FBEDEB]' : answered ? 'border-line bg-white opacity-50' : 'border-line bg-white hover:translate-x-1'
                const badge = answered && right ? 'bg-success text-on-dark' : answered && picked ? 'bg-primary text-on-dark' : 'bg-paper'
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={answered}
                    onClick={(e) => pick(i, e)}
                    className={`flex min-h-14 w-full items-center gap-3.5 rounded-[18px] border-[1.5px] px-4 py-3 text-left text-[15px] leading-normal transition-all duration-[250ms] ${look}`}
                  >
                    <span className={`grid size-[34px] shrink-0 place-items-center rounded-xl font-extrabold ${badge}`}>{'ABCD'[i]}</span>
                    <span>{t}</span>
                  </button>
                )
              })}
            </div>
            {answered && (
              <div className={`mt-4 rounded-[20px] px-5 py-[18px] ${ok ? 'bg-success-soft' : 'bg-[#FBEDEB]'}`} role="status">
                <p className={`text-[18px] font-extrabold ${ok ? 'text-success' : 'text-primary'}`}>{ok ? 'Chính xác!' : 'Chưa đúng rồi'}</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.65]">{q.explanation}</p>
                <button type="button" onClick={next} className="btn btn-dark mt-3.5">
                  {s.qi + 1 >= quiz.length ? 'Xem kết quả' : 'Câu tiếp'} →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-2.5 text-center">
            <div className="text-[54px] tracking-[8px] text-amber" aria-label={`${stars} trên 3 sao`}>
              {'★'.repeat(stars) + '☆'.repeat(3 - stars)}
            </div>
            <h2 className="mt-2 text-[30px] font-extrabold">{stars === 3 ? 'Xuất sắc!' : stars === 2 ? 'Làm tốt lắm!' : 'Cố gắng thêm nhé!'}</h2>
            <p className="mt-2 text-[16px] text-ink-soft">
              Bạn trả lời đúng {score} / {quiz.length} câu.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <button type="button" onClick={() => setS(START)} className="min-h-12 rounded-full bg-primary px-6 text-[15px] font-extrabold text-on-dark">
                Chơi lại
              </button>
              <button type="button" onClick={onClose} className="min-h-12 rounded-full border border-line-strong bg-white px-6 text-[15px] font-bold">
                Quay lại cây
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
