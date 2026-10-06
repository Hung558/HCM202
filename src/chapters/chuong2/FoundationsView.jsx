import { useState } from 'react'
import { motion } from 'framer-motion'
import { award, play, useGame } from '../_fun/useGame.js'

// Mỗi trụ (pillar) là một màu nhãn riêng
const PAL = ['bg-cream text-primary-dark', 'bg-success-soft text-success', 'bg-ink text-gold']

// Mục I · "Bộ rễ": ba trụ cơ sở, mỗi ý mở ra khi bấm (+5 XP lần đầu).
export default function FoundationsView({ foundations, onNext }) {
  const { earned } = useGame()
  const [open, setOpen] = useState({})

  return (
    <>
      <div className="mt-9 flex flex-col items-center gap-2 text-center">
        <p className="eyebrow">Mục I · Bộ rễ của cây tư tưởng</p>
        <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.02em]">{foundations.title}</h2>
        <p className="max-w-[620px] text-[15.5px] leading-[1.6] text-ink-soft">{foundations.subtitle}</p>
      </div>

      {/* Gốc cây chia ra các rễ */}
      <div aria-hidden="true" className="relative mt-7 flex flex-col items-center">
        <div className="h-[70px] w-[18px] rounded-t-[10px] bg-[#7A5236]" />
        <div className="h-2.5 w-[min(760px,92%)] rounded-[10px] bg-[#7A5236]" />
        <div className="flex w-[min(760px,92%)] justify-between">
          {foundations.pillars.map((p) => (
            <div key={p.id} className="h-[34px] w-2 rounded-b-md bg-[#7A5236]" />
          ))}
        </div>
      </div>

      <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-4">
        {foundations.pillars.map((p, pi) => {
          const readN = p.items.filter((_, ii) => earned[`c2-f-${pi}-${ii}`]).length
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.08, duration: 0.5, ease: [0.3, 1.3, 0.5, 1] }}
              className="rounded-3xl border border-line bg-white p-[22px]"
            >
              <div className="flex items-center justify-between gap-2.5">
                <span className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold ${PAL[pi % PAL.length]}`}>{p.badge}</span>
                <span className="text-[12.5px] font-bold text-muted">
                  {readN}/{p.items.length} đã đọc
                </span>
              </div>
              <h3 className="mt-3.5 text-[22px] font-extrabold tracking-[-0.01em]">{p.title}</h3>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-muted">{p.subtitle}</p>
              <div className="mt-4 flex flex-col gap-2">
                {p.items.map((it, ii) => {
                  const key = `${pi}-${ii}`
                  const isOpen = !!open[key]
                  const read = !!earned[`c2-f-${key}`]
                  return (
                    <div key={key} className={`overflow-hidden rounded-[18px] border transition-colors duration-[250ms] ${isOpen ? 'border-line bg-cream' : 'border-transparent bg-paper'}`}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          play('tap')
                          if (!isOpen) award(`c2-f-${key}`, 5, e)
                          setOpen((o) => ({ ...o, [key]: !isOpen }))
                        }}
                        className="flex min-h-14 w-full items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <span
                          className={`grid size-[30px] shrink-0 place-items-center rounded-full text-[13px] font-extrabold transition-all duration-[250ms] ${
                            read ? 'bg-success text-on-dark' : 'bg-white text-primary'
                          }`}
                        >
                          {read ? '✓' : ii + 1}
                        </span>
                        <span className="flex-1 text-[15px] leading-[1.35] font-bold">{it.heading}</span>
                        <span aria-hidden="true" className={`shrink-0 text-[18px] text-faint transition-transform duration-[250ms] ${isOpen ? 'rotate-180' : ''}`}>
                          ⌄
                        </span>
                      </button>
                      {isOpen && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4 pl-[58px] text-[14.5px] leading-[1.7] text-pretty text-ink-soft"
                        >
                          {it.content}
                        </motion.p>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-7 flex justify-center">
        <button type="button" onClick={onNext} className="min-h-[52px] rounded-full bg-primary px-[26px] text-[15px] font-extrabold text-on-dark transition-colors hover:bg-primary-dark">
          Xem cây mọc lên: quá trình hình thành →
        </button>
      </div>
    </>
  )
}
