import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Quote, BookOpen, ChevronLeft, ChevronRight, Award, Image as ImageIcon } from 'lucide-react'
import { getEventImage } from './imageRegistry.js'

// Sử dụng bộ giải mã ảnh tư liệu lịch sử chuẩn hóa
const resolveEventImage = getEventImage

export default function EventModal({ event, onClose, onPrev, onNext, hasPrev, hasNext }) {
  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  // Ngăn chặn cuộn trang phía dưới khi modal mở
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!event) return null

  const eventImageSrc = resolveEventImage(event)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Lớp nền mờ mờ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1F1B16]/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Khung nội dung modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="card relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Nút đóng góc trên */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:bg-cream hover:border-line-strong"
            aria-label="Đóng chi tiết"
          >
            <X className="size-5" />
          </button>

          {/* Phần đầu Modal */}
          <div className="pr-12">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-bold text-primary">
                <Calendar className="size-3.5" />
                {event.date}
              </span>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-on-dark">
                {event.tag}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <MapPin className="size-3.5 text-amber" />
                  {event.location}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">
              {event.title}
            </h2>
          </div>

          <div className="my-5 border-t border-line" />

          {/* Nội dung chi tiết */}
          <div className="space-y-6">
            {/* Hình ảnh tư liệu lịch sử (nếu có) */}
            {eventImageSrc && (
              <div className="rounded-2xl overflow-hidden border border-line bg-cream/40 p-3 space-y-2 flex flex-col items-center">
                <img
                  src={eventImageSrc}
                  alt={event.title}
                  className="max-h-[380px] w-auto max-w-full object-contain rounded-xl"
                  loading="lazy"
                />
                {event.imageCaption && (
                  <p className="text-xs text-muted text-center italic px-2 py-1">
                    {event.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Khối trích dẫn lời Bác hoặc danh ngôn lịch sử */}
            {event.quotes && (
              <div className="bg-cream rounded-2xl p-5 border-l-4 border-amber">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber">
                  <Quote className="size-4" />
                  <span>Lời dạy & Trích dẫn bất hủ</span>
                </div>
                <p className="font-serif italic text-ink text-[16px] sm:text-[17px] leading-relaxed">
                  "{event.quotes}"
                </p>
              </div>
            )}

            {/* Bối cảnh và diễn biến lịch sử */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                Bối cảnh & Diễn biến lịch sử
              </h3>
              <p className="text-ink-soft text-[15.5px] leading-[1.65] text-justify whitespace-pre-line">
                {event.detailDesc}
              </p>
            </div>

            {/* Ý nghĩa đối với bước phát triển tư tưởng */}
            <div className="rounded-2xl border border-line bg-paper/60 p-5">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-ink">
                <Award className="size-5 text-primary" />
                <span>Ý nghĩa đối với bước phát triển Tư tưởng Hồ Chí Minh</span>
              </div>
              <p className="text-ink-soft text-[15.5px] leading-[1.65]">
                {event.significance}
              </p>
            </div>

            {/* Tác phẩm / Văn kiện tiêu biểu nếu có */}
            {event.works && (
              <div className="flex items-start gap-3 rounded-2xl bg-paper p-4 border border-line">
                <BookOpen className="size-5 text-amber shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-0.5">
                    Tác phẩm / Văn kiện liên quan
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {event.works}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Phần chân modal: Chuyển mốc trước / sau và nút đóng */}
          <div className="mt-8 pt-5 border-t border-line flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={`btn btn-outline py-2 px-3 text-xs ${!hasPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Mốc sự kiện trước (Phím mũi tên trái)"
              >
                <ChevronLeft className="size-4" />
                <span>Mốc trước</span>
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className={`btn btn-outline py-2 px-3 text-xs ${!hasNext ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Mốc sự kiện tiếp theo (Phím mũi tên phải)"
              >
                <span>Mốc sau</span>
                <ChevronRight className="size-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn btn-dark py-2 px-5 text-xs font-semibold"
            >
              Đóng cửa sổ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
