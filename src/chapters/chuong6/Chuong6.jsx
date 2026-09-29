import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Content from './Content.jsx'
import Tracker from './Tracker.jsx'
import { EMPTY, TRACKER_KEY, load, save, streak } from './utils.js'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Lora:ital,wght@1,500&display=swap'

const TABS = [
  { id: 'content', label: 'Học bài' },
  { id: 'tracker', label: 'Rèn luyện' },
]

// Chương VI: tab Học bài (mặc định) + tab Rèn luyện
export default function Chuong6() {
  const [tab, setTab] = useState('content')
  const [tracker, setTracker] = useState(() => load(TRACKER_KEY, EMPTY))

  // Font chỉ nạp cho chương 6, không đụng CSS chung
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_URL}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_URL
    document.head.appendChild(link)
  }, [])

  useEffect(() => save(TRACKER_KEY, tracker), [tracker])

  const go = (id) => {
    setTab(id)
    window.scrollTo({ top: 0 })
  }

  return (
    <main
      className="min-h-screen bg-[#F5F1EA] text-[#1F1B16] antialiased"
      style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}
    >
      <nav className="sticky top-0 z-10 border-b border-[#E6DFD3] bg-[#F5F1EA]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
          <a href="/" title="Về trang chủ" className="flex items-center gap-2.5 text-[#1F1B16]">
            <span className="grid size-9 place-items-center rounded-[10px] bg-[#B4322A] text-[15px] font-extrabold text-[#FFF8EC]">
              VI
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold">Chương 6</span>
              <span className="text-xs text-[#7A7063]">Tư tưởng Hồ Chí Minh</span>
            </span>
          </a>

          <div className="ml-auto flex gap-1 rounded-full bg-[#EBE4D8] p-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => go(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`relative min-h-[40px] rounded-full px-[18px] text-sm font-semibold transition-colors ${tab === id ? 'text-[#FFF8EC]' : 'text-[#5C5347] hover:text-[#1F1B16]'}`}
              >
                {tab === id && <motion.span layoutId="tab-bg" className="absolute inset-0 rounded-full bg-[#1F1B16]" />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#E6DFD3] bg-white px-3.5 py-2 text-sm font-semibold">
            <span className="size-2 rounded-full bg-[#E59A2F]" />
            {streak(tracker.log)} ngày liên tiếp
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'content' ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === 'content' ? 24 : -24 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'content' ? (
            <Content onNext={() => go('tracker')} />
          ) : (
            <Tracker state={tracker} setState={setTracker} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
