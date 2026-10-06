import { useEffect, useRef } from 'react'
import { animate } from './fx.js'
import { levelOf, useGame } from './useGame.js'

// Viên XP trên header: "Lv n", "x XP", thanh tiến độ tới cấp sau. Nảy nhẹ mỗi lần được cộng XP.
export default function XpPill() {
  const { xp } = useGame()
  const ref = useRef(null)
  const prev = useRef(xp)

  useEffect(() => {
    if (xp > prev.current) animate(ref.current, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 360 })
    prev.current = xp
  }, [xp])

  return (
    <div ref={ref} title="XP chung của 6 chương" className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pr-3.5 pl-1">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-gold text-[12px] font-extrabold">Lv{levelOf(xp)}</span>
      <span className="flex min-w-[84px] flex-col gap-[3px]">
        <span className="text-[12px] font-bold whitespace-nowrap text-ink-soft">
          {xp} XP
        </span>
        <span className="h-1.5 overflow-hidden rounded-full bg-track" role="progressbar" aria-label="XP tới cấp sau" aria-valuemin={0} aria-valuemax={100} aria-valuenow={xp % 100}>
          <span className="block h-full rounded-full bg-amber transition-[width] duration-500" style={{ width: `${xp % 100}%` }} />
        </span>
      </span>
    </div>
  )
}
