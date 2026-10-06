import { useEffect, useRef } from 'react'
import { MotionConfig } from 'framer-motion'
import ChapterMenu from '../../components/ChapterMenu.jsx'
import ChapterTabBar from '../../components/ChapterTabBar.jsx'
import SiteFooter from '../../components/SiteFooter.jsx'
import Mascot from './Mascot.jsx'
import XpPill from './XpPill.jsx'
import { animate } from './fx.js'
import { toggleSound, useGame } from './useGame.js'

// Khung chung của 6 chương: header dính (☰, logo, XP, âm thanh, tab), vùng nội dung, linh vật, footer.
// Đổi tab thì cuộn lên đầu và nội dung hiện dần (opacity .4→1, trượt 16px).
export default function ChapterShell({ num, tabs, tab, onTab, tips, mascot = true, children }) {
  const { sound } = useGame()
  const mainRef = useRef(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) return void (first.current = false)
    animate(mainRef.current, [{ opacity: 0.4, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' })
  }, [tab])

  function change(id) {
    if (id === tab) return
    onTab(id)
    window.scrollTo({ top: 0 })
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-3 px-5 py-2.5">
            <ChapterMenu current={num} />
            <a href="/" title="Về trang chủ" className="flex items-center gap-2.5 text-ink">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-[15px] font-extrabold text-on-dark">{num}</span>
              <span className="text-[15px] font-extrabold whitespace-nowrap max-sm:sr-only">Chương {num}</span>
            </a>
            <XpPill />
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="min-h-10 rounded-full border border-line-strong px-3.5 text-[13px] font-bold whitespace-nowrap text-ink-soft transition-colors hover:bg-white"
            >
              ♪<span className="max-sm:hidden"> {sound ? 'Bật' : 'Tắt'}</span>
            </button>
            {tabs?.length > 1 && <ChapterTabBar tabs={tabs} value={tab} onChange={change} label={`Nội dung chương ${num}`} />}
          </div>
        </header>

        <main ref={mainRef} className="mx-auto max-w-[1180px] px-5 pt-8 pb-[140px]">
          {children}
        </main>

        <SiteFooter current={num} />
        {mascot && <Mascot tips={tips} />}
      </div>
    </MotionConfig>
  )
}
