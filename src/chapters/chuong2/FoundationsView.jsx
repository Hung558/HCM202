import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, BookOpen, User, Sparkles, ChevronRight, Check } from 'lucide-react'

export default function FoundationsView({ foundations }) {
  const [activePillar, setActivePillar] = useState('all')

  const pillars = foundations?.pillars || []
  const filteredPillars =
    activePillar === 'all'
      ? pillars
      : pillars.filter((p) => p.id === activePillar)

  return (
    <div className="space-y-6 pt-2">
      {/* Tabs lọc 3 trụ cột */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-[#EBE4D8] p-1.5">
          <button
            onClick={() => setActivePillar('all')}
            className={`min-h-[40px] rounded-full px-4 text-xs sm:text-sm font-semibold transition-all ${
              activePillar === 'all'
                ? 'bg-ink text-on-dark'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            Tất cả 3 trụ cột
          </button>
          {pillars.map((pillar) => (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(pillar.id)}
              className={`min-h-[40px] rounded-full px-4 text-xs sm:text-sm font-semibold transition-all ${
                activePillar === pillar.id
                  ? 'bg-ink text-on-dark'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {pillar.title.split('.')[1] || pillar.title}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách 3 trụ cột */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPillars.map((pillar, index) => {
          const getIcon = () => {
            if (pillar.id === 'practical') return <Globe className="size-5 text-primary" />
            if (pillar.id === 'theoretical') return <BookOpen className="size-5 text-amber" />
            return <User className="size-5 text-success" />
          }

          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="card p-6 sm:p-8 space-y-6"
            >
              {/* Header của trụ cột */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-paper border border-line">
                    {getIcon()}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-ink">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted">
                      {pillar.subtitle}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-primary border border-line-strong">
                  {pillar.badge}
                </span>
              </div>

              {/* Các tiểu mục chi tiết trong trụ cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {pillar.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className={`rounded-2xl p-5 border border-line space-y-2.5 ${
                      pillar.id === 'theoretical' && itemIdx === 2
                        ? 'bg-cream md:col-span-2 border-primary/30'
                        : 'bg-paper/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-ink text-on-dark text-xs font-bold">
                        {itemIdx + 1}
                      </span>
                      <h4 className="font-bold text-ink text-[16px]">
                        {item.heading}
                      </h4>
                    </div>

                    <p className="text-ink-soft text-[15px] leading-[1.65] text-justify">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Đúc kết quan trọng của trụ cột */}
              {pillar.id === 'theoretical' && (
                <div className="bg-ink text-on-dark rounded-2xl p-5 sm:p-6 space-y-2">
                  <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="size-4" />
                    <span>Luận điểm then chốt của Bác</span>
                  </div>
                  <p className="font-serif italic text-sm sm:text-base leading-relaxed text-on-dark/95">
                    "Học thuyết Khổng Tử có ưu điểm là sự tu dưỡng đạo đức cá nhân. Tôn giáo Giêxu có ưu điểm là lòng nhân ái cao cả. Chủ nghĩa Mác có ưu điểm là phương pháp làm việc biện chứng. Chủ nghĩa Tôn Dật Tiên có ưu điểm là chính sách của nó phù hợp với điều kiện nước ta... Họ đều muốn mưu hạnh phúc cho loài người, mưu phúc lợi cho xã hội... Tôi cố gắng làm học trò nhỏ của các vị ấy."
                  </p>
                  <p className="text-xs text-faint text-right">
                    — Hồ Chí Minh
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
