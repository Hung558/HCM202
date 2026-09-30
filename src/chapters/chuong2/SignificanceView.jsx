import React from 'react'
import { motion } from 'framer-motion'
import { Flag, Globe2, Quote, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react'

export default function SignificanceView({ significance }) {
  const domains = significance?.domains || []

  return (
    <div className="space-y-6 pt-2">
      {/* Hai khối giá trị: Với Việt Nam & Với Nhân loại */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {domains.map((domain, index) => {
          const isVN = domain.id === 'vietnam'

          return (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="card p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-11 place-items-center rounded-2xl ${
                        isVN ? 'bg-primary text-on-dark' : 'bg-amber text-ink'
                      }`}
                    >
                      {isVN ? <Flag className="size-5" /> : <Globe2 className="size-5" />}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-ink">
                      {domain.title}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isVN
                        ? 'bg-cream text-primary border border-line-strong'
                        : 'bg-paper text-ink border border-line'
                    }`}
                  >
                    {domain.tag}
                  </span>
                </div>

                <div className="space-y-4 mt-6">
                  {domain.points.map((pt, ptIdx) => (
                    <div
                      key={ptIdx}
                      className="rounded-2xl border border-line bg-paper/50 p-4 space-y-1.5 transition-colors hover:border-line-strong"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`size-4 shrink-0 ${
                            isVN ? 'text-primary' : 'text-amber'
                          }`}
                        />
                        <h4 className="font-bold text-ink text-[15.5px]">
                          {pt.title}
                        </h4>
                      </div>
                      <p className="text-ink-soft text-[14.5px] leading-relaxed pl-6">
                        {pt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chú thích phía dưới */}
              <div
                className={`rounded-2xl p-4 text-xs ${
                  isVN
                    ? 'bg-cream border border-primary/20 text-ink-soft'
                    : 'bg-paper border border-line text-ink-soft'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1 text-ink">
                  {isVN ? (
                    <ShieldCheck className="size-4 text-primary" />
                  ) : (
                    <HeartHandshake className="size-4 text-amber" />
                  )}
                  <span>
                    {isVN ? 'Kim chỉ nam hành động' : 'Hòa bình & Hữu nghị'}
                  </span>
                </div>
                <p>
                  {isVN
                    ? 'Khi nào làm đúng với tư tưởng Hồ Chí Minh thì cách mạng thắng lợi. Tư tưởng Người trường tồn cùng sự phát triển của dân tộc.'
                    : '"Làm bạn với tất cả mọi nước dân chủ và không gây thù oán với một ai" — Hồ Chí Minh'}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Trích văn kiện Đại hội XII của Đảng */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="card p-6 sm:p-8 bg-ink text-on-dark space-y-4"
      >
        <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
          <Quote className="size-4" />
          <span>Văn kiện Đại hội đại biểu toàn quốc lần thứ XII của Đảng</span>
        </div>

        <p className="font-serif italic text-base sm:text-lg leading-relaxed text-on-dark/95">
          "Chủ tịch Hồ Chí Minh vĩ đại, lãnh tụ thiên tài của Đảng và nhân dân ta, người thầy vĩ đại của cách mạng Việt Nam, Anh hùng giải phóng dân tộc, Danh nhân văn hóa thế giới... Tư tưởng của Người, cùng với chủ nghĩa Mác - Lênin là nền tảng tư tưởng, kim chỉ nam cho hành động của Đảng và cách mạng Việt Nam, là tài sản tinh thần vô cùng to lớn và quý giá của Đảng và dân tộc ta, mãi mãi soi đường cho sự nghiệp cách mạng của Đảng và nhân dân ta."
        </p>

        <div className="text-right text-xs text-faint">
          — Trích Văn kiện Đại hội XII của Đảng Cộng sản Việt Nam
        </div>
      </motion.div>
    </div>
  )
}
