import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Clock, BookOpen, Layers, ChevronDown, ChevronUp } from 'lucide-react'

export default function PeriodFilter({
  periods,
  selectedPeriodId,
  onSelectPeriod,
  totalEventsCount,
  eventCountByPeriod
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId)

  return (
    <div className="space-y-2.5">
      {/* Bộ nút bấm chọn thời kỳ (nhỏ gọn, cuộn ngang) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {/* Nút Tất cả */}
        <button
          onClick={() => onSelectPeriod('all')}
          className={`relative min-h-[38px] shrink-0 rounded-full px-3.5 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
            selectedPeriodId === 'all'
              ? 'text-on-dark'
              : 'text-ink-soft hover:text-ink bg-white border border-line hover:border-line-strong'
          }`}
        >
          {selectedPeriodId === 'all' && (
            <motion.span
              layoutId="period-active-pill"
              className="absolute inset-0 rounded-full bg-ink"
              transition={{ duration: 0.15 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Layers className="size-3.5" />
            <span>Tất cả</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                selectedPeriodId === 'all'
                  ? 'bg-amber text-ink font-bold'
                  : 'bg-paper text-muted'
              }`}
            >
              {totalEventsCount}
            </span>
          </span>
        </button>

        {/* Nút 5 thời kỳ */}
        {periods.map((period) => {
          const isSelected = selectedPeriodId === period.id
          const count = eventCountByPeriod[period.id] || 0

          return (
            <button
              key={period.id}
              onClick={() => onSelectPeriod(period.id)}
              className={`relative min-h-[38px] shrink-0 rounded-full px-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'text-on-dark'
                  : 'text-ink-soft hover:text-ink bg-white border border-line hover:border-line-strong'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="period-active-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ duration: 0.15 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <span className={isSelected ? 'text-gold' : 'text-amber'}>
                  {period.number}.
                </span>
                <span>{period.shortTitle}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                    isSelected
                      ? 'bg-amber text-ink font-bold'
                      : 'bg-paper text-muted'
                  }`}
                >
                  {count}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Thẻ tóm tắt thông tin thời kỳ được chọn (thiết kế mỏng nhẹ) */}
      {currentPeriod ? (
        <div className="card p-3 sm:p-3.5 bg-white border border-line">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-primary text-[11px] font-black text-on-dark">
                {currentPeriod.number}
              </span>
              <span className="font-bold text-xs sm:text-sm text-ink truncate">
                {currentPeriod.title}
              </span>
              <span className="text-[11px] font-semibold text-amber hidden md:inline-flex items-center gap-1 shrink-0">
                <Clock className="size-3" />
                {currentPeriod.timeSpan}
              </span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline shrink-0"
            >
              <span>{isExpanded ? 'Thu gọn' : 'Chi tiết thời kỳ'}</span>
              {isExpanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          </div>

          {/* Phần mở rộng nội dung thời kỳ */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-2.5 mt-2.5 border-t border-line text-xs sm:text-sm text-ink-soft space-y-1.5"
              >
                <div className="flex items-start gap-1.5 text-xs font-semibold text-primary">
                  <Compass className="size-3.5 shrink-0 mt-0.5" />
                  <span>Cốt lõi: {currentPeriod.core}</span>
                </div>
                <p className="leading-relaxed text-justify">
                  {currentPeriod.summary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  )
}
