import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Thanh tab chung cho các chương (kiểu Chương 6): nhóm bo tròn nền be, tab đang chọn nền đen.
// Nền đen tự đo vị trí TRONG thanh (x, width) chứ không dùng layoutId: layoutId tính theo cả trang,
// nên đổi tab khi đang cuộn xa thì nền bay từ chỗ cũ xuống và hiện thanh cuộn.
export default function ChapterTabBar({ tabs, value, onChange, label, hideIconsOnMobile = false }) {
  const groupRef = useRef(null)
  const btnRefs = useRef({})
  const [pill, setPill] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = btnRefs.current[value]
      if (el) setPill({ x: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    // đo lại khi font tải xong / đổi cỡ màn hình làm nút đổi độ rộng
    const ro = new ResizeObserver(measure)
    ro.observe(groupRef.current)
    return () => ro.disconnect()
  }, [value])

  return (
    <div
      ref={groupRef}
      role="tablist"
      aria-label={label}
      className="relative ml-auto flex max-w-full gap-1 overflow-x-auto overflow-y-hidden rounded-full bg-[#EBE4D8] p-1"
    >
      {pill && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-1 left-0 rounded-full bg-ink"
          initial={false}
          animate={{ x: pill.x, width: pill.width }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        />
      )}
      {tabs.map(({ id, label: text, icon: Icon }) => (
        <button
          key={id}
          ref={(el) => (btnRefs.current[id] = el)}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`relative inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-[18px] text-sm font-semibold transition-colors ${
            value === id ? 'text-on-dark' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {Icon && <Icon className={`size-4 ${hideIconsOnMobile ? 'hidden sm:block' : ''}`} aria-hidden="true" />}
          <span>{text}</span>
        </button>
      ))}
    </div>
  )
}
