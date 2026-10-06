import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { burst, pt, reduced } from '../_fun/fx.js'
import { award, play } from '../_fun/useGame.js'

const EASE = [0.4, 0, 0.2, 1]
const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })

// Tab Kiến thức: cả 4 phần nối tiếp nhau; mục lục bên trái tự tô sáng phần/mục đang đọc khi cuộn (scroll-spy).
export default function Knowledge({ sections, keys, toggleKey, onMap, onQuiz }) {
  const [open, setOpen] = useState({}) // ý trong danh sách đang mở
  const [activeId, setActiveId] = useState(sections[0].id)
  const lockRef = useRef(false)
  const activeSec = sections.find((s) => s.id === activeId || s.subsections.some((x) => x.id === activeId))

  // Bấm mục lục: khoá scroll-spy tới khi cuộn xong, để mục lục không nhảy qua các phần ở giữa
  function select(id) {
    play('tap')
    setActiveId(id)
    lockRef.current = true
    const unlock = () => {
      lockRef.current = false
      clearTimeout(timer)
      window.removeEventListener('scrollend', unlock)
    }
    // ponytail: Safari chưa có scrollend → mở khoá sau 1.2s; cuộn rất xa có thể mở khoá sớm
    const timer = setTimeout(unlock, 1200)
    window.addEventListener('scrollend', unlock)
    scrollToId(id)
  }

  // Theo dõi phần đang đọc: phần/mục con cuối cùng có đầu đã cuộn qua vạch ngay dưới header
  useEffect(() => {
    const ids = sections.flatMap((s) => [s.id, ...s.subsections.map((x) => x.id)])
    let raf = 0
    const spy = () => {
      raf = 0
      if (lockRef.current) return
      const line = 140
      let cur = ids[0]
      for (const id of ids) if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= line) cur = id
      setActiveId(cur)
    }
    const onScroll = () => (raf ||= requestAnimationFrame(spy))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [sections])

  return (
    <>
      {/* Điện thoại: thanh chip cuộn ngang */}
      <nav aria-label="Mục lục chương" className="-mx-5 mt-7 overflow-x-auto px-5 lg:hidden">
        <ul className="flex w-max gap-2 pb-1">
          {sections.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => select(x.id)}
                aria-current={activeSec?.id === x.id ? 'true' : undefined}
                className={`min-h-11 rounded-full px-4 text-[14px] font-bold whitespace-nowrap ${activeSec?.id === x.id ? 'bg-ink text-on-dark' : 'border border-line-strong bg-white text-ink'}`}
              >
                Phần {x.number}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 grid items-start gap-6 lg:mt-7 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Mục lục: phần đang đọc nền đen, các mục con xổ ra bên dưới */}
        <aside className="sticky top-[84px] hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
          <nav aria-label="Mục lục chương" className="card p-3">
            <p className="px-3 pt-2 pb-1 text-[13px] font-semibold text-muted">Mục lục</p>
            <ul className="grid gap-1">
              {sections.map((x) => {
                const on = activeSec?.id === x.id
                return (
                  <li key={x.id}>
                    <button
                      type="button"
                      onClick={() => select(x.id)}
                      aria-current={on ? 'true' : undefined}
                      className={`relative flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] leading-snug font-bold transition-colors duration-200 ${on ? 'text-on-dark' : 'text-ink hover:bg-cream'}`}
                    >
                      {on && <motion.span layoutId="c3-toc-active" className="absolute inset-0 rounded-xl bg-ink" transition={{ duration: 0.3, ease: EASE }} />}
                      <span className={`relative transition-colors duration-200 ${on ? 'text-gold' : 'text-amber'}`}>{x.number}</span>
                      <span className="relative">{x.title}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="grid gap-0.5 overflow-hidden py-1 pl-3"
                        >
                          {x.subsections.map((sb) => {
                            const cur = activeId === sb.id
                            return (
                              <li key={sb.id}>
                                <button
                                  type="button"
                                  onClick={() => select(sb.id)}
                                  className={`relative flex w-full gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] leading-snug transition-colors duration-200 ${cur ? 'font-bold text-primary' : 'text-ink-soft hover:text-ink'}`}
                                >
                                  {cur && <motion.span layoutId="c3-toc-sub" className="absolute inset-0 rounded-lg bg-primary/10" transition={{ duration: 0.25, ease: EASE }} />}
                                  <span className="relative shrink-0 font-semibold">{sb.number}</span>
                                  <span className="relative line-clamp-2">{sb.title}</span>
                                </button>
                              </li>
                            )
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-10">
          {sections.map((sec, si) => (
            <motion.section
              key={sec.id}
              id={sec.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <div className="relative overflow-hidden rounded-[28px] bg-primary p-[clamp(22px,3vw,32px)] text-on-dark">
                <span aria-hidden="true" className="absolute -top-10 -right-10 size-[170px] rounded-full bg-gold/20" />
                <p className="relative text-[52px] leading-none font-extrabold text-gold">{sec.number}</p>
                <h2 className="relative mt-2.5 text-[clamp(23px,2.8vw,30px)] leading-[1.2] font-extrabold tracking-[-0.02em]">{sec.title}</h2>
                {sec.summary && <p className="relative mt-3 text-[15.5px] leading-[1.7] text-on-dark/90">{sec.summary}</p>}
              </div>

              {sec.subsections.map((sb) => (
                <section key={sb.id} id={sb.id} className="scroll-mt-24 rounded-3xl border border-line bg-white p-[clamp(20px,3vw,30px)]">
                  <div className="flex items-baseline gap-3">
                    <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-[15px] font-extrabold text-amber">{sb.number}</span>
                    <h3 className="text-[21px] font-extrabold tracking-[-0.01em]">{sb.title}</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-3.5">
                    {sb.blocks.map((b, bi) => {
                      if (b.type === 'p')
                        return (
                          <p key={bi} className="text-[15.5px] leading-[1.8] text-pretty">
                            {b.text}
                          </p>
                        )
                      if (b.type === 'quote')
                        return (
                          <figure key={bi} className="flex gap-3.5 rounded-[20px] bg-cream px-[22px] py-[18px]">
                            <span aria-hidden="true" className="font-serif text-[48px] leading-[.8] text-primary">
                              “
                            </span>
                            <span className="flex flex-col gap-1.5">
                              <blockquote className="font-serif text-[17px] leading-[1.6] italic">{b.text}</blockquote>
                              {b.source && <figcaption className="text-[12.5px] font-extrabold text-muted">— {b.source}</figcaption>}
                            </span>
                          </figure>
                        )
                      if (b.type === 'list')
                        return (
                          <ol key={bi} className="flex flex-col gap-2">
                            {b.items.map((it, ii) => {
                              const key = `${sb.id}-${bi}-${ii}`
                              const isOpen = !!open[key]
                              return (
                                <li key={key} className={`rounded-[18px] border transition-colors duration-[250ms] ${isOpen ? 'border-line bg-cream' : 'border-transparent bg-paper'}`}>
                                  <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={(e) => {
                                      play('tap')
                                      if (!isOpen) award(`c3-k-${key}`, 2, e)
                                      setOpen((o) => ({ ...o, [key]: !isOpen }))
                                    }}
                                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3.5 text-left"
                                  >
                                    <span className={`grid size-[30px] shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-on-dark ${isOpen ? 'bg-primary' : 'bg-amber'}`}>{ii + 1}</span>
                                    <span className="flex-1 text-[15px] leading-[1.45] font-bold">{it.term}</span>
                                    <span aria-hidden="true" className={`shrink-0 text-[18px] text-faint transition-transform duration-[250ms] ${isOpen ? 'rotate-180' : ''}`}>
                                      ⌄
                                    </span>
                                  </button>
                                  {isOpen && it.text && <p className="px-[18px] pb-4 pl-[58px] text-[14.5px] leading-[1.7] text-ink-soft">{it.text}</p>}
                                </li>
                              )
                            })}
                          </ol>
                        )
                      return null
                    })}
                  </div>
                </section>
              ))}

              <div className="rounded-[28px] bg-ink p-[clamp(20px,3vw,28px)] text-on-dark">
                <p className="text-[12.5px] font-extrabold tracking-[.14em] text-gold uppercase">Ghi nhớ nhanh · chạm để đánh dấu đã nhớ</p>
                <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-2.5">
                  {sec.key.map((t, j) => {
                    const key = `${sec.id}-${j}`
                    const on = !!keys[key]
                    return (
                      <button
                        key={key}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={(e) => {
                          play(on ? 'tap' : 'ok')
                          if (!on) {
                            award(`c3-key-${key}`, 5, e)
                            const p = pt(e)
                            burst(p.x, p.y, 14)
                          }
                          toggleKey(key)
                        }}
                        className={`flex items-start gap-3 rounded-[18px] border-[1.5px] p-4 text-left transition-all duration-300 ease-[cubic-bezier(.3,1.3,.5,1)] ${
                          on ? 'scale-[1.02] border-gold bg-gold/[.14]' : 'border-on-dark/15 bg-on-dark/5'
                        }`}
                      >
                        <span className={`grid size-[26px] shrink-0 place-items-center rounded-lg border-2 border-gold text-[14px] font-extrabold text-ink ${on ? 'bg-gold' : ''}`}>{on ? '✓' : ''}</span>
                        <span className="text-[14px] leading-[1.55]">{t}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-[18px] flex flex-wrap gap-2.5">
                  <button type="button" onClick={() => onMap(si)} className="min-h-[46px] rounded-full bg-gold px-[18px] text-[14px] font-extrabold text-ink">
                    Xem trên sơ đồ
                  </button>
                  <button type="button" onClick={() => onQuiz(si)} className="min-h-[46px] rounded-full border border-on-dark/30 px-[18px] text-[14px] font-bold hover:bg-on-dark/10">
                    Ôn tập phần này →
                  </button>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </>
  )
}
