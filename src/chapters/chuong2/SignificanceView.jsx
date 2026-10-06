import { useState } from 'react'
import { burst, pt } from '../_fun/fx.js'
import { award, play } from '../_fun/useGame.js'

const PAL = [
  { box: 'bg-primary', blob: 'bg-gold/20', tag: 'bg-gold text-ink', pt: 'bg-on-dark/10', ptOn: 'bg-on-dark/[.18]' },
  { box: 'bg-ink', blob: 'bg-amber/[.18]', tag: 'bg-amber text-ink', pt: 'bg-on-dark/[.07]', ptOn: 'bg-on-dark/[.14]' },
]
const FRUITS = ['#F2C06B', '#E59A2F', '#7FAE6A', '#F2C06B', '#E59A2F']

// Mục III · "Trái ngọt": mỗi mảng ý nghĩa là một thẻ màu, chạm từng quả để "hái" (mở ý, +5 XP, lá bay).
export default function SignificanceView({ significance, onQuiz }) {
  const [open, setOpen] = useState({})

  return (
    <>
      <div className="mt-9 flex flex-col items-center gap-2 text-center">
        <p className="eyebrow">Mục III · Trái ngọt của cây tư tưởng</p>
        <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.02em]">{significance.title}</h2>
        <p className="max-w-[640px] text-[15.5px] leading-[1.6] text-ink-soft">{significance.subtitle}</p>
      </div>
      <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] items-start gap-[18px]">
        {significance.domains.map((dm, di) => {
          const c = PAL[di % PAL.length]
          return (
            <div key={dm.id ?? di} className={`relative overflow-hidden rounded-[30px] p-[clamp(22px,3vw,32px)] text-on-dark ${c.box}`}>
              <span aria-hidden="true" className={`absolute -top-[50px] -right-[50px] size-[180px] rounded-full ${c.blob}`} />
              <span className={`relative rounded-full px-3 py-1.5 text-[12px] font-extrabold ${c.tag}`}>{dm.tag}</span>
              <h3 className="relative mt-3.5 text-[24px] font-extrabold tracking-[-0.01em]">{dm.title}</h3>
              <div className="relative mt-[18px] flex flex-col gap-2.5">
                {dm.points.map((p, k) => {
                  const key = `${di}-${k}`
                  const isOpen = !!open[key]
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        play(isOpen ? 'tap' : 'pop')
                        if (!isOpen) {
                          award(`c2-s-${key}`, 5, e)
                          const q = pt(e)
                          burst(q.x, q.y, 14, 'leaf')
                        }
                        setOpen((o) => ({ ...o, [key]: !isOpen }))
                      }}
                      className={`flex items-start gap-3.5 rounded-[20px] p-4 text-left transition-[transform,background] duration-200 hover:translate-x-1 ${isOpen ? c.ptOn : c.pt}`}
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-extrabold text-ink transition-transform duration-[400ms] ease-[cubic-bezier(.3,1.6,.5,1)] ${isOpen ? 'scale-[1.12]' : ''}`}
                        style={{ background: FRUITS[k % FRUITS.length] }}
                      >
                        {String(k + 1).padStart(2, '0')}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-[16px] leading-[1.35] font-extrabold">{p.title}</span>
                        {isOpen ? <span className="text-[14.5px] leading-[1.65] opacity-90">{p.desc}</span> : <span className="text-[12.5px] font-bold opacity-70">Chạm để hái quả →</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3 rounded-[26px] border border-line bg-white p-5 text-center">
        <span className="text-[15px] font-bold">Hái hết trái rồi? Thử ôn lại cả chương nhé.</span>
        <button type="button" onClick={onQuiz} className="min-h-12 rounded-full bg-ink px-5 text-[14px] font-extrabold text-on-dark">
          Đố nhanh ★
        </button>
      </div>
    </>
  )
}
