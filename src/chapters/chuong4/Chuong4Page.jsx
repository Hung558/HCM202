// Trang Chương IV: header chương LUÔN hiển thị, dưới nó là thanh tab, dưới nữa là panel.
// - Chỉ panel thay đổi khi chuyển tab — header và thanh tab không bao giờ biến mất/di chuyển
//   (header + tab bar gộp thành một khối sticky full-width với divider căng hết trang).
// - Mở chương luôn vào tab Kiến thức. Kiến thức tách bundle riêng (lazy);
//   Quiz giữ mounted (hidden) để không mất tiến độ khi chuyển tab.
// - Chiều cao khối sticky đo bằng ResizeObserver → CSS variables --header-height /
//   --tabs-height dùng chung cho mục lục sticky và anchor scroll.
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, ClipboardList, Loader2 } from 'lucide-react'
import ChapterHeader from './components/ChapterHeader.jsx'
import ChapterTabBar from '../../components/ChapterTabBar.jsx'
import ScenarioQuiz from './components/ScenarioQuiz.jsx'
import { TAB_CONTENT, TAB_QUIZ } from './constants.js'

const TABS = [
  { id: TAB_CONTENT, label: 'Kiến thức', icon: BookOpen },
  { id: TAB_QUIZ, label: 'Trắc nghiệm tình huống', icon: ClipboardList },
]

// Lazy: bundle Kiến thức (parser + txt) tách riêng khỏi bundle Quiz
const ChapterContentLazy = lazy(() => import('./components/ChapterContent.jsx'))

export default function Chuong4Page() {
  const [tab, setTab] = useState(TAB_CONTENT) // luôn mở tab Kiến thức trước

  // Đo động chiều cao thanh sticky (logo + tabs, có thể xuống 2 dòng trên điện thoại)
  // → CSS variables cho sidebar & scroll-margin. Cả thanh tính vào --header-height.
  const navRowRef = useRef(null)
  const [sticky, setSticky] = useState({ header: 0, tabs: 0 })
  useEffect(() => {
    const measure = () => setSticky({ header: navRowRef.current?.offsetHeight ?? 0, tabs: 0 })
    measure()
    const ro = new ResizeObserver(measure)
    if (navRowRef.current) ro.observe(navRowRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const changeTab = useCallback((next) => setTab(next), [])

  return (
    <main className="min-h-screen" style={{ '--header-height': `${sticky.header}px`, '--tabs-height': `${sticky.tabs}px` }}>
      {/* ===== Vùng full-width: header + tabs + divider =====
          Ngoài max-w container — divider & nền blur căng hết chiều rộng trang. */}
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-md">
        <div ref={navRowRef} className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
          {/* Header bên trái */}
          <ChapterHeader />

          {/* Tabs bên phải */}
          <ChapterTabBar tabs={TABS} value={tab} onChange={changeTab} label="Nội dung chương IV" />
        </div>
        {/* Divider là con TRỰC TIẾP của wrapper full-width → không bị giới hạn max-width */}
        <div className="h-px bg-line" />
      </div>

      {/* ===== Vùng nội dung (đúng max-w cũ) — chỉ panel theo tab thay đổi =====
          Không đặt padding-bottom ở đây (làm ngắn vùng sticky của mục lục);
          padding đáy nằm trong từng panel. mt-5 = 20px divider → nội dung. */}
      <div className="mx-auto mt-5 max-w-[1180px] px-5">
        <div role="tabpanel" hidden={tab !== TAB_CONTENT} className="pb-20">
          <Suspense
            fallback={
              <div className="flex flex-col items-center gap-3 py-20 text-muted">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-[13.5px] font-semibold">Đang tải nội dung chương…</p>
              </div>
            }
          >
            <ChapterContentLazy topOffset={sticky.header + sticky.tabs + 1} />
          </Suspense>
        </div>
        <div role="tabpanel" hidden={tab !== TAB_QUIZ} className="pb-20">
          <ScenarioQuiz />
        </div>
      </div>
    </main>
  )
}
