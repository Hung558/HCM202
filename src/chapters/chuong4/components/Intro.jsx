// Màn giới thiệu: tiêu đề chương, mô tả, số tình huống, nút bắt đầu,
// thanh thống kê học tập dài hạn (hoàn thành %, đúng %, thời gian TB, chủ đề mạnh/yếu, lỗi gần đây).
import { motion } from 'framer-motion'
import { Check, Clock, History, Play, RotateCcw, Target } from 'lucide-react'
import { formatTime } from '../quiz.js'

export default function Intro({ data, analytics, onStart, onReset, attempts }) {
  const hasHistory = attempts > 0
  return (
    <section className="flex flex-col gap-5">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-[26px]">
        <p className="eyebrow">Chương IV · Trắc nghiệm tình huống</p>
        <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
          Trắc nghiệm tình huống
        </h1>
        <p className="mt-3.5 max-w-[640px] text-pretty text-[15.5px] leading-[1.65] text-ink-soft">{data.intro}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={onStart} className="btn btn-primary">
            <Play className="size-4" /> {hasHistory ? 'Chơi lượt mới' : 'Bắt đầu lượt chơi'}
          </button>
          {hasHistory && (
            <span className="text-[13.5px] text-muted">
              Đã có {attempts} lượt · sẽ ưu tiên {Math.min(data.sessionSize, data.scenarios.length - 0)} tình huống chưa hỏi
            </span>
          )}
        </div>
      </motion.section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
            <History className="size-3.5" /> Số lượt
          </p>
          <p className="mt-1.5 text-[24px] font-extrabold leading-none">{attempts}</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
            <Target className="size-3.5" /> Hoàn thành
          </p>
          <p className="mt-1.5 text-[24px] font-extrabold leading-none">{analytics.completionPct}%</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
            <Check className="size-3.5" /> Tỷ lệ đúng
          </p>
          <p className="mt-1.5 text-[24px] font-extrabold leading-none">{analytics.correctPct}%</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
            <Clock className="size-3.5" /> Thời gian TB
          </p>
          <p className="mt-1.5 text-[24px] font-extrabold leading-none">{formatTime(analytics.avgTimeMs)}</p>
        </div>
      </section>

      {hasHistory && (
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="card px-4 py-3.5">
            <p className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-success">Chủ đề vững</p>
            {analytics.strongTopics.length === 0 ? (
              <p className="mt-1.5 text-[13.5px] text-muted">Chưa có dữ liệu</p>
            ) : (
              <ul className="mt-1.5 flex flex-col gap-1">
                {analytics.strongTopics.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft">
                    <span className="size-1.5 rounded-full bg-success" /> {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card px-4 py-3.5">
            <p className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-primary">Chủ đề yếu</p>
            {analytics.weakTopics.length === 0 ? (
              <p className="mt-1.5 text-[13.5px] text-muted">Chưa có dữ liệu</p>
            ) : (
              <ul className="mt-1.5 flex flex-col gap-1">
                {analytics.weakTopics.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft">
                    <span className="size-1.5 rounded-full bg-primary" /> {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {hasHistory && analytics.recentMistakes.length > 0 && (
        <section className="card p-[22px]">
          <p className="eyebrow">Sai gần đây</p>
          <ul className="mt-2.5 grid gap-2">
            {analytics.recentMistakes.map(({ scenario }) => (
              <li key={scenario.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper/60 px-4 py-2.5">
                <span className="min-w-0 truncate text-[14px] font-semibold">{scenario.title}</span>
                <span className="shrink-0 text-[12.5px] font-semibold text-primary">{scenario.referenceTopic}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasHistory && (
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-faint hover:text-primary"
          >
            <RotateCcw className="size-3.5" /> Xóa toàn bộ dữ liệu học tập
          </button>
        </div>
      )}
    </section>
  )
}
