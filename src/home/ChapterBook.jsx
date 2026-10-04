import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CHAPTERS } from '../components/chapters.js'
import { leaveTo, useOverlay } from '../components/overlay.js'

const EASE = [0.4, 0, 0.2, 1]
const STAR = {
  clipPath: 'polygon(50% 0%,61.8% 35.3%,100% 35.3%,69.1% 57.1%,80.9% 92.7%,50% 70.9%,19.1% 92.7%,30.9% 57.1%,0% 35.3%,38.2% 35.3%)',
}

// Nút "Vào học" ở trang chủ: mở một cuốn sách giữa màn hình.
// Trang trái là bìa học phần, trang phải là mục lục 6 chương (lật mở ra). Điện thoại chỉ hiện trang mục lục.
export default function ChapterBook({ className, children }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useOverlay(open, close, closeRef)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className={className}>
        {children}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50 grid place-items-center p-4 font-sans text-ink" role="dialog" aria-modal="true" aria-label="Mục lục học phần">
              <motion.div
                className="absolute inset-0 bg-ink/55"
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Bìa sách: viền đỏ sẫm bao quanh hai trang giấy */}
              <motion.div
                className="relative w-full max-w-[980px] rounded-[22px] bg-primary-dark p-2 sm:p-2.5"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Đóng"
                  className="absolute -top-3 -right-3 z-10 grid size-10 place-items-center rounded-full border border-line-strong bg-paper transition-colors hover:bg-white"
                >
                  <X className="size-[18px]" aria-hidden="true" />
                </button>

                <div className="grid h-[min(90vh,760px)] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[14px] [perspective:1800px] md:grid-cols-2">
                  {/* Trang trái: bìa học phần */}
                  <section className="relative hidden flex-col items-center justify-center gap-5 bg-cream px-10 py-12 text-center md:flex">
                    <span className="grid size-14 place-items-center rounded-[14px] bg-primary">
                      <span className="size-7 bg-gold" style={STAR} />
                    </span>
                    <p className="eyebrow">Học phần HCM202</p>
                    <h2 className="text-[38px] leading-[1.08] font-extrabold tracking-[-0.02em]">
                      Tư tưởng
                      <br />
                      Hồ Chí Minh
                    </h2>
                    <div className="flex items-center gap-3" aria-hidden="true">
                      <span className="h-px w-10 bg-line-strong" />
                      <span className="size-2 rotate-45 bg-amber" />
                      <span className="h-px w-10 bg-line-strong" />
                    </div>
                    <blockquote className="max-w-[340px]">
                      <p className="font-serif text-[18px] leading-[1.5] italic">
                        “Non sông Việt Nam có trở nên tươi đẹp hay không, chính là nhờ một phần lớn ở công học tập của các em.”
                      </p>
                      <p className="mt-3 text-[12px] font-bold tracking-[0.12em] text-muted uppercase">Chủ tịch Hồ Chí Minh · 1945</p>
                    </blockquote>
                    <span className="absolute bottom-5 font-serif text-[13px] text-faint italic">— i —</span>
                    {/* gáy sách */}
                    <span className="absolute inset-y-0 right-0 w-px bg-line-strong" aria-hidden="true" />
                  </section>

                  {/* Trang phải: mục lục, lật mở từ gáy sách */}
                  <motion.section
                    className="relative flex min-h-0 flex-col bg-[#FFFDF8] px-6 pt-7 pb-11 sm:px-9 md:origin-left"
                    initial={{ rotateY: -70, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -40, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
                  >
                    <p className="eyebrow">Mục lục</p>
                    <h3 className="mt-2 border-b-[3px] border-double border-line-strong pb-3.5 text-[26px] font-extrabold tracking-[-0.01em]">
                      Chọn chương để học
                    </h3>

                    <ol className="-mx-2 mt-1.5 min-h-0 overflow-y-auto [scrollbar-width:thin]">
                      {CHAPTERS.map((c, i) => (
                        <motion.li
                          key={c.num}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.05, duration: 0.25 }}
                          className="border-b border-dotted border-line-strong last:border-b-0"
                        >
                          <a
                            href={c.href}
                            onClick={(e) => leaveTo(e, c.href, close)}
                            className="group grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-cream"
                          >
                            <span className="font-serif text-[26px] leading-none text-primary italic">{c.num}</span>
                            <span className="flex flex-col gap-0.5">
                              <span className="text-[15px] leading-snug font-bold text-pretty">{c.title}</span>
                              <span className="text-[12.5px] text-muted">{c.method}</span>
                            </span>
                            <span className="text-[13px] font-semibold whitespace-nowrap text-faint transition-colors group-hover:text-primary">
                              Học →
                            </span>
                          </a>
                        </motion.li>
                      ))}
                    </ol>
                    <span className="absolute inset-x-0 bottom-5 text-center font-serif text-[13px] text-faint italic">— ii —</span>
                  </motion.section>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
