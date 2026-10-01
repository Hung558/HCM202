// Trang Chương IV: header chương LUÔN hiển thị, dưới nó là thanh tab, dưới nữa là panel.
// - Chỉ panel thay đổi khi chuyển tab — header và thanh tab không bao giờ biến mất/di chuyển
//   (header + tab bar gộp thành một khối sticky full-width với divider căng hết trang).
// - Tab mặc định: Scenario Quiz; tab chọn cuối lưu localStorage (readSavedTab/saveTab).
// - Kiến thức lazy: panel chỉ mount ở lần MỞ TAB ĐẦU TIÊN; file txt chỉ parse khi đó
//   (cache trong ChapterContent). Quiz giữ mounted (hidden) để không mất tiến độ.
// - Chiều cao khối sticky đo bằng ResizeObserver → CSS variables --header-height /
//   --tabs-height dùng chung cho mục lục sticky và anchor scroll.
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import ChapterHeader from './components/ChapterHeader.jsx'
import ChapterTabs from './components/ChapterTabs.jsx'
import ScenarioQuiz from './components/ScenarioQuiz.jsx'
import { TAB_CONTENT, TAB_QUIZ, readSavedTab, saveTab } from './constants.js'

// Lazy: bundle Kiến thức (parser + txt) chỉ được nạp khi lần đầu mở tab
const ChapterContentLazy = lazy(() => import('./components/ChapterContent.jsx'))

export default function Chuong4Page() {
  const [tab, setTab] = useState(readSavedTab) // mặc định Scenario Quiz nếu chưa có lưu
  // nếu tab đã lưu là Kiến thức thì mount panel luôn (tránh tab active mà panel rỗng)
  const [contentMounted, setContentMounted] = useState(readSavedTab() === TAB_CONTENT)

  // Đo động chiều cao 2 hàng sticky → CSS variables cho sidebar & scroll-margin
  const headerRowRef = useRef(null)
  const tabsRowRef = useRef(null)
  const [sticky, setSticky] = useState({ header: 0, tabs: 0 })
  useEffect(() => {
    const measure = () =>
      setSticky({
        header: headerRowRef.current?.offsetHeight ?? 0,
        tabs: tabsRowRef.current?.offsetHeight ?? 0,
      })
    measure()
    const ro = new ResizeObserver(measure)
    if (headerRowRef.current) ro.observe(headerRowRef.current)
    if (tabsRowRef.current) ro.observe(tabsRowRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const changeTab = useCallback((next) => {
    setTab(next)
    if (next === TAB_CONTENT) setContentMounted(true) // lazy: chỉ mount từ lần mở đầu tiên
    saveTab(next)
  }, [])

  return (
    <main className="min-h-screen" style={{ '--header-height': `${sticky.header}px`, '--tabs-height': `${sticky.tabs}px` }}>
      {/* ===== Vùng full-width: header + tabs + divider =====
          Ngoài max-w container — divider & nền blur căng hết chiều rộng trang. */}
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto max-w-[1180px] px-5">
          <div
            className="flex items-center justify-between gap-6 pt-6 pb-3"
          >
            {/* Header bên trái */}
            <div ref={headerRowRef} className="shrink-0">
              <ChapterHeader />
            </div>

            {/* Tabs bên phải */}
            <div ref={tabsRowRef} className="shrink-0">
              <ChapterTabs
                tab={tab}
                onTabChange={changeTab}
              />
            </div>
          </div>
        </div>
        {/* Divider là con TRỰC TIẾP của wrapper full-width → không bị giới hạn max-width */}
        <div className="h-px bg-line" />
      </div>

      {/* ===== Vùng nội dung (đúng max-w cũ) — chỉ panel theo tab thay đổi =====
          Không đặt padding-bottom ở đây (làm ngắn vùng sticky của mục lục);
          padding đáy nằm trong từng panel. mt-5 = 20px divider → nội dung. */}
      <div className="mx-auto mt-5 max-w-[1180px] px-5">
        <div role="tabpanel" hidden={tab !== TAB_QUIZ} className="pb-20">
          <ScenarioQuiz />
        </div>
        {contentMounted && (
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
        )}
      </div>
    </main>
  )
}
