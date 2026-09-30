// Nhãn độ khó: Dễ (xanh), Trung bình (vàng), Khó (đỏ) – theo bảng màu theme chung.
const STYLES = {
  green: 'bg-success-soft text-success',
  amber: 'bg-amber/15 text-amber',
  red: 'bg-primary/10 text-primary',
}

export default function DifficultyBadge({ difficulty, difficulties }) {
  const info = difficulties?.[difficulty]
  if (!info) return null
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${STYLES[info.color] ?? STYLES.amber}`}
      title={`Độ khó: ${info.label}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {info.label}
    </span>
  )
}
