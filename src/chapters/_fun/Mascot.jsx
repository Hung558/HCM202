import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import mascotImg from './mascot.webp'
import { animate } from './fx.js'
import { hideBubble, play, say, useGame } from './useGame.js'

// Linh vật ở góc phải dưới (không bị bảng danh sách chương bên trái che). Nói qua say(); bong bóng tự ẩn sau 5 giây.
// Bấm vào linh vật: đang nói thì ẩn bong bóng, không thì nói một mẹo ngẫu nhiên trong `tips`.
// Ảnh: Klee (Genshin Impact, HoYoverse), fan art có chữ ký họa sĩ trên ảnh — chỉ dùng cho sản phẩm học tập, không thương mại.
export default function Mascot({ tips = [] }) {
  const { msg, msgN, bubble } = useGame()
  const ref = useRef(null)

  useEffect(() => {
    if (!msgN) return undefined
    animate(ref.current, [{ transform: 'none' }, { transform: 'translateY(-14px) rotate(6deg)' }, { transform: 'none' }], {
      duration: 420,
      easing: 'cubic-bezier(.3,1.5,.5,1)',
    })
    const t = setTimeout(hideBubble, 5000)
    return () => clearTimeout(t)
  }, [msgN])

  function poke() {
    if (bubble) return hideBubble()
    play('tap')
    if (tips.length) say(tips[Math.floor(Math.random() * tips.length)])
  }

  return (
    <div className="pointer-events-none fixed right-2 bottom-2 z-[35] flex flex-row-reverse items-end gap-1">
      <button ref={ref} type="button" onClick={poke} aria-label="Linh vật: bấm để nghe mẹo học" className="pointer-events-auto w-[96px] shrink-0 cursor-pointer max-sm:w-[78px]">
        {/* bồng bềnh nhẹ; tự tắt khi bật giảm chuyển động (MotionConfig ở ChapterShell) */}
        <motion.img
          src={mascotImg}
          alt=""
          draggable="false"
          width={248}
          height={240}
          className="block h-auto w-full select-none"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </button>
      {bubble && msg && (
        <div role="status" className="pointer-events-none mb-16 max-w-[min(240px,60vw)] rounded-[18px_18px_4px_18px] border-[1.5px] border-ink bg-white px-3.5 py-2.5 text-[13px] leading-[1.45] font-semibold text-ink max-sm:mb-12">
          {msg}
        </div>
      )}
    </div>
  )
}
