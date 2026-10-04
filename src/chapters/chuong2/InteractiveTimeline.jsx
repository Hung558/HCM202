import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Search,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Quote,
  Sparkles,
  Layers,
  Columns2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  X
} from 'lucide-react'
import ChapterTabBar from '../../components/ChapterTabBar.jsx'
import ChapterMenu from '../../components/ChapterMenu.jsx'

const TABS = [
  { id: 'foundations', label: 'I. Cơ sở hình thành', icon: Layers },
  { id: 'timeline', label: 'II. Quá trình hình thành & phát triển', icon: Clock },
  { id: 'significance', label: 'III. Giá trị tư tưởng', icon: Sparkles },
]

import data from './data.json'
import EventModal from './EventModal.jsx'
import PeriodFilter from './PeriodFilter.jsx'
import FoundationsView from './FoundationsView.jsx'
import SignificanceView from './SignificanceView.jsx'
import QuickQuizModal from './QuickQuizModal.jsx'
import { getEventImage } from './imageRegistry.js'

// Sử dụng bộ giải mã ảnh tư liệu lịch sử chuẩn hóa
const resolveEventImage = getEventImage

// Cấu hình 3 mục lớn chuẩn xác theo giáo trình môn Tư tưởng Hồ Chí Minh
const SECTIONS = {
  foundations: {
    key: 'foundations',
    eyebrow: 'CHƯƠNG II · MỤC I: CƠ SỞ HÌNH THÀNH',
    title: 'Cơ sở hình thành Tư tưởng Hồ Chí Minh',
    subtitle: 'Ba trụ cột cốt lõi: Cơ sở thực tiễn (Việt Nam & Thế giới), Cơ sở lý luận (Truyền thống dân tộc, Tinh hoa văn hóa nhân loại, Chủ nghĩa Mác - Lênin) và Nhân tố chủ quan Hồ Chí Minh.'
  },
  timeline: {
    key: 'timeline',
    eyebrow: 'CHƯƠNG II · MỤC II: QUÁ TRÌNH HÌNH THÀNH & PHÁT TRIỂN',
    title: 'Quá trình hình thành và phát triển Tư tưởng Hồ Chí Minh',
    subtitle: 'Trục thời gian tương tác qua 5 thời kỳ lịch sử (trước 1911 – 1969) với 28 mốc sự kiện và tư liệu lịch sử được xác thực.'
  },
  significance: {
    key: 'significance',
    eyebrow: 'CHƯƠNG II · MỤC III: GIÁ TRỊ TƯ TƯỞNG',
    title: 'Giá trị Tư tưởng Hồ Chí Minh',
    subtitle: 'Tầm vóc lịch sử đối với sự nghiệp cách mạng Việt Nam và đối với sự phát triển tiến bộ của nhân loại.'
  }
}

export default function InteractiveTimeline() {
  // Trạng thái tab chính: 'foundations' (Mục I) | 'timeline' (Mục II) | 'significance' (Mục III)
  const [activeTab, setActiveTab] = useState('foundations')

  // Trạng thái chế độ xem timeline: 'split' (chia đôi màn hình - dễ nhìn nhất) | 'grid' (lưới thẻ toàn cảnh)
  const [layoutMode, setLayoutMode] = useState('split')

  // Trạng thái bộ lọc thời kỳ
  const [selectedPeriodId, setSelectedPeriodId] = useState('all')

  // Trạng thái tìm kiếm từ khóa
  const [searchQuery, setSearchQuery] = useState('')

  // Mốc sự kiện đang được chọn để hiển thị chi tiết ở cột phải (chế độ Split View)
  const [selectedEventId, setSelectedEventId] = useState(data.events[0]?.id || 'ev-01')

  // Modal chi tiết đầy đủ khi người dùng muốn phóng to toàn màn hình
  const [modalEvent, setModalEvent] = useState(null)

  // Modal trắc nghiệm
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  const listContainerRef = useRef(null)

  // Danh sách sự kiện đã lọc
  const filteredEvents = useMemo(() => {
    return data.events.filter((event) => {
      const matchPeriod =
        selectedPeriodId === 'all' || event.periodId === selectedPeriodId

      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchPeriod

      return (
        matchPeriod &&
        (event.title.toLowerCase().includes(query) ||
          event.shortDesc.toLowerCase().includes(query) ||
          event.detailDesc.toLowerCase().includes(query) ||
          event.date.toLowerCase().includes(query) ||
          (event.location && event.location.toLowerCase().includes(query)) ||
          (event.works && event.works.toLowerCase().includes(query)) ||
          (event.quotes && event.quotes.toLowerCase().includes(query)))
      )
    })
  }, [selectedPeriodId, searchQuery])

  // Tự động chọn mốc đầu tiên của danh sách đã lọc nếu mốc hiện tại không còn nằm trong bộ lọc
  useEffect(() => {
    if (filteredEvents.length > 0) {
      const exists = filteredEvents.some((e) => e.id === selectedEventId)
      if (!exists) {
        setSelectedEventId(filteredEvents[0].id)
      }
    }
  }, [filteredEvents, selectedEventId])

  // Sự kiện đang được chọn để hiển thị chi tiết
  const currentEvent = useMemo(() => {
    return (
      filteredEvents.find((e) => e.id === selectedEventId) ||
      filteredEvents[0] ||
      data.events[0]
    )
  }, [filteredEvents, selectedEventId])

  // Vị trí của sự kiện hiện tại trong danh sách đã lọc
  const currentIndex = useMemo(() => {
    return filteredEvents.findIndex((e) => e.id === currentEvent?.id)
  }, [filteredEvents, currentEvent])

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < filteredEvents.length - 1

  const handlePrev = () => {
    if (hasPrev) {
      const prevEvent = filteredEvents[currentIndex - 1]
      setSelectedEventId(prevEvent.id)
      scrollEventIntoView(prevEvent.id)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      const nextEvent = filteredEvents[currentIndex + 1]
      setSelectedEventId(nextEvent.id)
      scrollEventIntoView(nextEvent.id)
    }
  }

  // Tự động cuộn danh sách bên trái đến mốc đang chọn
  const scrollEventIntoView = (eventId) => {
    const el = document.getElementById(`timeline-item-${eventId}`)
    if (el && listContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  // Bấm phím mũi tên lên / xuống để chuyển mốc khi ở chế độ Split
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'timeline' || layoutMode !== 'split' || modalEvent || isQuizOpen) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, layoutMode, modalEvent, isQuizOpen, hasPrev, hasNext, currentIndex, filteredEvents])

  // Thống kê số lượng sự kiện theo thời kỳ
  const eventCountByPeriod = useMemo(() => {
    const counts = {}
    data.periods.forEach((p) => {
      counts[p.id] = data.events.filter((e) => e.periodId === p.id).length
    })
    return counts
  }, [])

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-amber selection:text-ink">
      {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG (NAVIGATION BAR) */}
      <nav className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
          <ChapterMenu current="II" />
          <a href="/" title="Về trang chủ" className="flex items-center gap-2.5 text-ink">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-dark">II</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold">Chương II</span>
              <span className="text-xs text-muted">Tư tưởng Hồ Chí Minh</span>
            </span>
          </a>
          <ChapterTabBar tabs={TABS} value={activeTab} onChange={setActiveTab} label="Nội dung chương II" />
          {/* Nút mở Quiz trắc nghiệm */}
          <button
            type="button"
            onClick={() => setIsQuizOpen(true)}
            className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold hover:border-line-strong sm:inline-flex"
            title="Mở bài ôn tập trắc nghiệm nhanh"
          >
            <Award className="size-4 text-amber" />
            Ôn tập trắc nghiệm
          </button>
        </div>
      </nav>

      {/* 2. NỘI DUNG CHÍNH (MAIN CONTAINER) */}
      <main className="mx-auto max-w-[1180px] px-5 pt-5 pb-16">
        {/* HEADER PHÂN MỤC CHUẨN GIÁO TRÌNH */}
        <header className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-xs">{SECTIONS[activeTab].eyebrow}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {SECTIONS[activeTab].title}
              </h1>
              <p className="text-ink-soft text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                {SECTIONS[activeTab].subtitle}
              </p>
            </div>

            {/* Chuyển đổi chế độ xem: Chia đôi (Master-Detail) vs Lưới toàn cảnh (Grid) */}
            {activeTab === 'timeline' && (
              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="flex items-center rounded-full bg-white border border-line p-0.5 shadow-none">
                  <button
                    onClick={() => setLayoutMode('split')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      layoutMode === 'split'
                        ? 'bg-ink text-on-dark'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                    title="Bố cục chia đôi màn hình: Cực kỳ dễ nhìn, xem chi tiết ngay không cần cuộn trang dài"
                  >
                    <Columns2 className="size-3.5" />
                    <span>Dễ nhìn (Chia đôi)</span>
                  </button>

                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      layoutMode === 'grid'
                        ? 'bg-ink text-on-dark'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                    title="Xem dạng lưới toàn cảnh các thẻ"
                  >
                    <LayoutGrid className="size-3.5" />
                    <span>Lưới toàn cảnh</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="btn btn-outline text-xs font-semibold py-1 px-3 min-h-[34px] sm:hidden"
                >
                  <Award className="size-3.5 text-amber" />
                  <span>Ôn tập</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 3. KHU VỰC NỘI DUNG THEO TAB */}
        {activeTab === 'timeline' && (
          <section className="space-y-3.5">
            {/* Thanh tìm kiếm & Bộ lọc 5 thời kỳ */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <PeriodFilter
                  periods={data.periods}
                  selectedPeriodId={selectedPeriodId}
                  onSelectPeriod={setSelectedPeriodId}
                  totalEventsCount={data.events.length}
                  eventCountByPeriod={eventCountByPeriod}
                />
              </div>

              {/* Ô tìm kiếm nhỏ gọn */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Tìm năm, sự kiện, địa danh, tác phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[34px] rounded-full border border-line bg-white pl-8 pr-7 text-xs text-ink placeholder:text-muted focus:border-line-strong focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* BỐ CỤC 1: MASTER - DETAIL (CHIA ĐÔI MÀN HÌNH - DỄ NHÌN NHẤT) */}
            {layoutMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* CỘT TRÁI (4/12): Danh sách mốc lịch sử gọn gàng, có scroll riêng */}
                <div className="lg:col-span-4 card p-3 bg-white border border-line flex flex-col h-[580px]">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-line text-xs font-semibold text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-primary" />
                      <span>Các mốc lịch sử ({filteredEvents.length})</span>
                    </span>
                    <span className="text-[11px] text-faint hidden sm:inline">
                      Dùng phím ↑ ↓
                    </span>
                  </div>

                  {/* Danh sách các mốc lịch sử cuộn bên trong */}
                  <div
                    ref={listContainerRef}
                    className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin"
                  >
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event, idx) => {
                        const isSelected = event.id === currentEvent?.id
                        const periodInfo = data.periods.find((p) => p.id === event.periodId)

                        return (
                          <div
                            key={event.id}
                            id={`timeline-item-${event.id}`}
                            onClick={() => setSelectedEventId(event.id)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all duration-150 border text-left flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-ink text-on-dark border-ink shadow-none'
                                : 'bg-paper/40 hover:bg-paper border-line text-ink'
                            }`}
                          >
                            <span
                              className={`grid size-6 shrink-0 place-items-center rounded-lg text-[11px] font-black ${
                                isSelected
                                  ? 'bg-amber text-ink'
                                  : 'bg-white border border-line text-muted'
                              }`}
                            >
                              {idx + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span
                                  className={`text-[12px] font-bold tracking-wide uppercase ${
                                    isSelected ? 'text-gold' : 'text-primary'
                                  }`}
                                >
                                  {event.date}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full truncate ${
                                    isSelected
                                      ? 'bg-white/20 text-on-dark'
                                      : 'bg-cream text-amber font-bold'
                                  }`}
                                >
                                  {periodInfo?.shortTitle}
                                </span>
                              </div>

                              <h4
                                className={`text-[13.5px] font-semibold leading-snug truncate ${
                                  isSelected ? 'text-on-dark' : 'text-ink'
                                }`}
                              >
                                {event.title}
                              </h4>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-10 text-xs text-muted">
                        Không tìm thấy sự kiện nào phù hợp.
                      </div>
                    )}
                  </div>
                </div>

                {/* CỘT PHẢI (8/12): Chi tiết mốc đang chọn (Hiển thị cố định, không phải mở modal) */}
                <div className="lg:col-span-8 card p-5 sm:p-7 bg-white border border-line flex flex-col justify-between min-h-[580px]">
                  {currentEvent ? (
                    <div className="space-y-4">
                      {/* Hàng điều hướng trên cùng của chi tiết */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base sm:text-lg text-primary uppercase">
                            {currentEvent.date}
                          </span>
                          <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-amber">
                            {currentEvent.tag}
                          </span>
                          {currentEvent.location && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted">
                              <MapPin className="size-3 text-amber shrink-0" />
                              <span className="truncate">{currentEvent.location}</span>
                            </span>
                          )}
                        </div>

                        {/* Nút mốc trước / mốc sau */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handlePrev}
                            disabled={!hasPrev}
                            className={`p-1.5 rounded-full border border-line bg-paper hover:bg-cream transition-colors ${
                              !hasPrev ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Mốc trước (Phím mũi tên lên)"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <span className="text-xs font-semibold text-muted px-1.5">
                            {currentIndex + 1} / {filteredEvents.length}
                          </span>
                          <button
                            onClick={handleNext}
                            disabled={!hasNext}
                            className={`p-1.5 rounded-full border border-line bg-paper hover:bg-cream transition-colors ${
                              !hasNext ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Mốc sau (Phím mũi tên xuống)"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tiêu đề sự kiện */}
                      <h2 className="text-xl sm:text-2xl font-extrabold text-ink leading-snug">
                        {currentEvent.title}
                      </h2>

                      {/* Ảnh tư liệu lịch sử (nếu có) */}
                      {resolveEventImage(currentEvent) && (
                        <div className="rounded-2xl overflow-hidden border border-line bg-cream/40 p-2 space-y-1.5 flex flex-col items-center">
                          <img
                            src={resolveEventImage(currentEvent)}
                            alt={currentEvent.title}
                            className="max-h-[320px] w-auto max-w-full object-contain rounded-xl"
                            loading="lazy"
                          />
                          {currentEvent.imageCaption && (
                            <p className="text-[11.5px] text-muted text-center italic px-2 py-0.5">
                              {currentEvent.imageCaption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Khối trích dẫn lời Bác hoặc câu nói lịch sử */}
                      {currentEvent.quotes && (
                        <div className="bg-cream rounded-2xl p-4 border-l-4 border-amber">
                          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-amber">
                            <Quote className="size-3.5" />
                            <span>Lời dạy & Trích dẫn bất hủ</span>
                          </div>
                          <p className="font-serif italic text-ink text-[15px] sm:text-[16px] leading-relaxed">
                            "{currentEvent.quotes}"
                          </p>
                        </div>
                      )}

                      {/* Bối cảnh lịch sử chi tiết */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                          Bối cảnh & Diễn biến lịch sử
                        </h4>
                        <p className="text-ink-soft text-[14.5px] sm:text-[15px] leading-relaxed text-justify">
                          {currentEvent.detailDesc}
                        </p>
                      </div>

                      {/* Ý nghĩa đối với tư tưởng */}
                      <div className="rounded-2xl border border-line bg-paper/50 p-4 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-ink">
                          <Award className="size-4 text-primary" />
                          <span>Ý nghĩa đối với bước phát triển tư tưởng Hồ Chí Minh</span>
                        </div>
                        <p className="text-ink-soft text-xs sm:text-[13.5px] leading-relaxed pl-6">
                          {currentEvent.significance}
                        </p>
                      </div>

                      {/* Tác phẩm / Văn kiện nếu có */}
                      {currentEvent.works && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-paper p-3 border border-line text-xs">
                          <BookOpen className="size-4 text-amber shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-muted block mb-0.5">
                              Tác phẩm / Văn kiện liên quan:
                            </span>
                            <span className="font-medium text-ink">
                              {currentEvent.works}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Thanh điều khiển cuối cột chi tiết */}
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-line text-xs">
                    <span className="text-muted">
                      Mẹo: Nhấp vào các mốc bên trái để đổi nội dung ngay lập tức
                    </span>

                    <button
                      onClick={() => setModalEvent(currentEvent)}
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                    >
                      <span>Mở toàn màn hình</span>
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* BỐ CỤC 2: LƯỚI THẺ TINH GỌN (COMPACT GRID) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {filteredEvents.map((event) => {
                  const periodInfo = data.periods.find((p) => p.id === event.periodId)

                  return (
                    <div
                      key={event.id}
                      onClick={() => setModalEvent(event)}
                      className="card p-3.5 transition-all duration-150 hover:border-line-strong hover:bg-white cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {resolveEventImage(event) && (
                          <div className="mb-2.5 rounded-xl overflow-hidden border border-line bg-paper max-h-[140px]">
                            <img
                              src={resolveEventImage(event)}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-extrabold text-xs sm:text-sm text-primary">
                            {event.date}
                          </span>
                          <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-amber">
                            {periodInfo?.shortTitle}
                          </span>
                        </div>

                        <h3 className="text-[14.5px] font-bold text-ink group-hover:text-primary transition-colors leading-snug mb-1 line-clamp-1">
                          {event.title}
                        </h3>

                        <p className="text-ink-soft text-xs leading-relaxed line-clamp-2">
                          {event.shortDesc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-line/50 text-[11.5px]">
                        <span className="text-muted truncate max-w-[200px]">
                          {event.location || ''}
                        </span>
                        <span className="font-bold text-primary group-hover:underline inline-flex items-center gap-0.5">
                          <span>Chi tiết</span>
                          <ArrowUpRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CƠ SỞ HÌNH THÀNH (FOUNDATIONS) */}
        {activeTab === 'foundations' && (
          <FoundationsView foundations={data.foundations} />
        )}

        {/* TAB 3: GIÁ TRỊ TƯ TƯỞNG (SIGNIFICANCE) */}
        {activeTab === 'significance' && (
          <SignificanceView significance={data.significance} />
        )}

        {/* 4. MODAL CHI TIẾT SỰ KIỆN PHÓNG TO */}
        {modalEvent && (
          <EventModal
            event={modalEvent}
            onClose={() => setModalEvent(null)}
            onPrev={() => {
              const idx = filteredEvents.findIndex((e) => e.id === modalEvent.id)
              if (idx > 0) setModalEvent(filteredEvents[idx - 1])
            }}
            onNext={() => {
              const idx = filteredEvents.findIndex((e) => e.id === modalEvent.id)
              if (idx < filteredEvents.length - 1) setModalEvent(filteredEvents[idx + 1])
            }}
            hasPrev={filteredEvents.findIndex((e) => e.id === modalEvent.id) > 0}
            hasNext={
              filteredEvents.findIndex((e) => e.id === modalEvent.id) <
              filteredEvents.length - 1
            }
          />
        )}

        {/* 5. MODAL ÔN TẬP TRẮC NGHIỆM */}
        <QuickQuizModal
          quizData={data.quiz}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line bg-paper py-5">
        <div className="mx-auto flex max-w-[1180px] flex-col sm:flex-row items-center justify-between gap-3 px-5 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">Chương II: Tư tưởng Hồ Chí Minh</span>
            <span>·</span>
            <span>Cơ sở, quá trình hình thành và phát triển</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" className="hover:text-ink transition-colors">
              Trang chủ
            </a>
            <span>·</span>
            <a href="/chuong1.html" className="hover:text-ink transition-colors">
              Chương I
            </a>
            <span>·</span>
            <span className="text-ink font-semibold">Chương II</span>
            <span>·</span>
            <a href="/chuong3.html" className="hover:text-ink transition-colors">
              Chương III
            </a>
            <span>·</span>
            <a href="/chuong6.html" className="hover:text-ink transition-colors">
              Chương VI
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
