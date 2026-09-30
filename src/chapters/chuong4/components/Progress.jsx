// Thanh tiến độ dùng lại: hiển thị vị trí câu hiện tại trong lượt chơi.
import { motion } from 'framer-motion'

export default function Progress({ current, total }) {
  const pct = total ? (current / total) * 100 : 0
  return (
    <div className="flex items-center gap-3" aria-label={`Câu ${current} / ${total}`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-track" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
        <motion.div className="h-full rounded-full bg-amber" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.25 }} />
      </div>
      <span className="shrink-0 text-[13px] font-bold text-muted">
        Câu {Math.min(current, total)}/{total}
      </span>
    </div>
  )
}
