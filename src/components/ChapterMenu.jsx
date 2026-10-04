import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { House, Menu, X } from 'lucide-react'
import { CHAPTERS } from './chapters.js'

const LEAVE_MS = 200

// Chọn chương khác: đóng bảng + làm mờ trang hiện tại rồi mới chuyển, trang mới tự hiện dần (index.css).
function leaveTo(e, href, close) {
  // giữ hành vi mặc định khi mở tab mới (Ctrl/Cmd/Shift/chuột giữa)
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  close()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    location.href = href
    return
  }
  const fade = document.getElementById('root')?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: LEAVE_MS,
    easing: 'ease-in',
    fill: 'forwards',
  })
  // bấm Back quay lại (trang lấy từ bfcache) thì bỏ trạng thái mờ
  window.addEventListener('pageshow', () => fade?.cancel(), { once: true })
  setTimeout(() => (location.href = href), LEAVE_MS)
}

// Nút ☰ đặt bên trái logo chương: mở bảng danh sách 6 chương trượt ra từ bên trái.
// Render qua portal vì nav có backdrop-blur → `fixed` bên trong nav bị giới hạn trong nav.
export default function ChapterMenu({ current }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // khóa cuộn trang khi bảng đang mở
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Danh sách chương"
        aria-expanded={open}
        title="Chọn chương khác"
        className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-line-strong"
      >
        <Menu className="size-[18px]" aria-hidden="true" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50 font-sans text-ink" role="dialog" aria-modal="true" aria-label="Danh sách chương">
              <motion.div
                className="absolute inset-0 bg-ink/40"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.aside
                className="absolute inset-y-0 left-0 flex w-[min(360px,88vw)] flex-col border-r border-line bg-paper"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <p className="eyebrow">Học phần HCM202</p>
                    <p className="mt-1 text-[17px] font-extrabold">Các chương</p>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Đóng"
                    className="grid size-10 place-items-center rounded-full border border-line-strong transition-colors hover:bg-white"
                  >
                    <X className="size-[18px]" aria-hidden="true" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3">
                  <ul className="flex flex-col gap-1">
                    {CHAPTERS.map((c) => {
                      const on = c.num === current
                      return (
                        <li key={c.num}>
                          <a
                            href={c.href}
                            onClick={(e) => (on ? (e.preventDefault(), setOpen(false)) : leaveTo(e, c.href, () => setOpen(false)))}
                            aria-current={on ? 'page' : undefined}
                            className={`grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 rounded-2xl px-3 py-3 transition-colors duration-150 ${
                              on ? 'bg-ink text-on-dark' : 'hover:bg-cream'
                            }`}
                          >
                            <span className={`font-serif text-[24px] leading-none italic ${on ? 'text-gold' : 'text-primary'}`}>{c.num}</span>
                            <span className="flex flex-col gap-1">
                              <span className="text-[14px] leading-snug font-bold">{c.title}</span>
                              <span className={`text-[12.5px] ${on ? 'text-on-dark/70' : 'text-muted'}`}>
                                {on ? 'Đang học · ' : ''}
                                {c.method}
                              </span>
                            </span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </nav>

                <div className="border-t border-line p-3">
                  <a href="/" onClick={(e) => leaveTo(e, '/', () => setOpen(false))} className="btn btn-outline w-full justify-center">
                    <House className="size-4" aria-hidden="true" /> Về trang chủ
                  </a>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
