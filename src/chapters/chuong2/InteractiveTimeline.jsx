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
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  X,
  Image as ImageIcon
} from 'lucide-react'
import ChapterTabBar from '../../components/ChapterTabBar.jsx'
import ChapterMenu from '../../components/ChapterMenu.jsx'
import ChapterLogo from '../../components/ChapterLogo.jsx'
import SiteFooter from '../../components/SiteFooter.jsx'

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
    subtitle: 'Dòng thời gian tương tác qua 5 thời kỳ lịch sử (trước 1911 – 1969) với 28 mốc sự kiện và tư liệu lịch sử được xác thực. Nhấp vào từng mốc sự kiện để mở chi tiết đầy đủ.'
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

  // Trạng thái chế độ xem timeline: 'timeline' (dòng thời gian) | 'grid' (lưới thẻ toàn cảnh)
  const [layoutMode, setLayoutMode] = useState('timeline')

  // Trạng thái bộ lọc thời kỳ
  const [selectedPeriodId, setSelectedPeriodId] = useState('all')

  // Trạng thái tìm kiếm từ khóa
  const [searchQuery, setSearchQuery] = useState('')

  // Modal chi tiết đầy đủ khi người dùng muốn xem chi tiết mốc sự kiện
  const [modalEvent, setModalEvent] = useState(null)

  // Modal trắc nghiệm
  const [isQuizOpen, setIsQuizOpen] = useState(false)

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

  // Nhóm các sự kiện đã lọc theo từng thời kỳ lịch sử
  const groupedEvents = useMemo(() => {
    return data.periods
      .map((period) => ({
        period,
        events: filteredEvents.filter((e) => e.periodId === period.id)
      }))
      .filter((group) => group.events.length > 0)
  }, [filteredEvents])

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
          <ChapterLogo num="II" />
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

            {/* Chuyển đổi chế độ xem: Dòng thời gian (Timeline) vs Lưới toàn cảnh (Grid) */}
            {activeTab === 'timeline' && (
              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="flex items-center rounded-full bg-white border border-line p-0.5 shadow-none">
                  <button
                    onClick={() => setLayoutMode('timeline')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      layoutMode === 'timeline'
                        ? 'bg-ink text-on-dark'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                    title="Dạng dòng thời gian lịch sử trực quan theo 5 thời kỳ"
                  >
                    <Clock className="size-3.5" />
                    <span>Dòng thời gian</span>
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
          <section className="space-y-4">
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

            {/* BỐ CỤC 1: DẠNG DÒNG THỜI GIAN LỊCH SỬ (TIMELINE) */}
            {layoutMode === 'timeline' ? (
              <div className="space-y-8 pt-2">
                {groupedEvents.length > 0 ? (
                  groupedEvents.map((group) => (
                    <div key={group.period.id} className="space-y-4">
                      {/* Tiêu đề & Thông tin khái quát của Thời kỳ */}
                      <div className="rounded-2xl border border-line bg-paper/90 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-ink px-3 py-0.5 text-xs font-bold text-gold uppercase tracking-wider">
                              {group.period.badge}
                            </span>
                            <span className="font-extrabold text-sm sm:text-base text-primary">
                              {group.period.timeSpan}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-muted bg-white border border-line px-2.5 py-0.5 rounded-full">
                            {group.events.length} mốc lịch sử
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-ink leading-snug">
                          {group.period.title}
                        </h3>
                        <p className="text-ink-soft text-xs sm:text-sm mt-1 leading-relaxed">
                          {group.period.core}
                        </p>
                      </div>

                      {/* Trục dòng thời gian thẳng đứng */}
                      <div className="relative pl-7 sm:pl-11">
                        {/* Đường kẻ trục dọc nối liền các điểm */}
                        <div
                          className="absolute left-[13px] sm:left-[19px] top-4 bottom-4 w-0.5 bg-line-strong"
                          aria-hidden="true"
                        />

                        <div className="space-y-4">
                          {group.events.map((event) => {
                            const globalIdx =
                              data.events.findIndex((e) => e.id === event.id) + 1
                            const hasImage = Boolean(resolveEventImage(event))

                            return (
                              <div
                                key={event.id}
                                onClick={() => setModalEvent(event)}
                                className="relative group cursor-pointer"
                              >
                                {/* Điểm nút mốc trên trục (Node) */}
                                <div
                                  className="absolute left-[-15px] sm:left-[-21px] top-4 -translate-x-1/2 z-10 grid size-7 sm:size-8 place-items-center rounded-full border-2 border-line bg-white text-[11px] sm:text-xs font-black text-ink transition-all duration-200 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-white"
                                  title={`Mốc số ${globalIdx}: ${event.title}`}
                                >
                                  {globalIdx}
                                </div>

                                {/* Thẻ mốc sự kiện */}
                                <div className="card p-4 sm:p-5 bg-white border border-line rounded-2xl transition-all duration-200 hover:border-line-strong hover:bg-cream/15 hover:translate-x-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-extrabold text-sm sm:text-base text-primary uppercase tracking-wide">
                                        {event.date}
                                      </span>
                                      <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-amber">
                                        {event.tag}
                                      </span>
                                      {event.location && (
                                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                                          <MapPin className="size-3 text-amber shrink-0" />
                                          <span className="truncate max-w-[200px] sm:max-w-none">
                                            {event.location}
                                          </span>
                                        </span>
                                      )}
                                    </div>

                                    {hasImage && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-muted border border-line">
                                        <ImageIcon className="size-3 text-primary" />
                                        <span>Có ảnh tư liệu</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Nội dung mốc sự kiện */}
                                  <div className="flex gap-4 items-start">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-base sm:text-lg font-bold text-ink group-hover:text-primary transition-colors leading-snug mb-1.5">
                                        {event.title}
                                      </h4>

                                      <p className="text-ink-soft text-xs sm:text-[13.5px] leading-relaxed line-clamp-2">
                                        {event.shortDesc}
                                      </p>

                                      {event.quotes && (
                                        <div className="mt-2 border-l-2 border-amber/70 pl-2.5 py-0.5 text-xs font-serif italic text-muted line-clamp-1">
                                          "{event.quotes}"
                                        </div>
                                      )}
                                    </div>

                                    {/* Ảnh đại diện nhỏ trên thẻ nếu có */}
                                    {hasImage && (
                                      <div className="hidden sm:block shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-line bg-paper">
                                        <img
                                          src={resolveEventImage(event)}
                                          alt={event.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          loading="lazy"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Chân thẻ: Tác phẩm liên quan & Nút hành động */}
                                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-line/60 text-xs">
                                    <span className="text-[11.5px] text-muted italic truncate max-w-[220px] sm:max-w-md">
                                      {event.works ? `Tác phẩm: ${event.works}` : ''}
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:underline shrink-0 ml-auto">
                                      <span>Bấm xem chi tiết</span>
                                      <ArrowUpRight className="size-3.5" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card p-10 text-center bg-white border border-line">
                    <p className="text-sm font-medium text-muted">
                      Không tìm thấy mốc sự kiện nào phù hợp với bộ lọc hiện tại.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedPeriodId('all')
                      }}
                      className="mt-3 btn btn-outline text-xs font-semibold"
                    >
                      Đặt lại tìm kiếm
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* BỐ CỤC 2: LƯỚI THẺ TOÀN CẢNH (GRID) */
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
                          <span>Bấm xem chi tiết</span>
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

      <SiteFooter current="II" />
    </div>
  )
}
