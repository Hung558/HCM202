import { useEffect, useRef } from 'react'
import { animate } from './fx.js'
import { hideBubble, play, say, useGame } from './useGame.js'

// "Bé Sen" vẽ bằng CSS ở góc trái dưới. Nói qua say() trong useGame.js; bong bóng tự ẩn sau 5 giây.
// Bấm vào Bé Sen: đang nói thì ẩn bong bóng, không thì nói một mẹo ngẫu nhiên trong `tips`.
export default function Mascot({ tips = [] }) {
  const { msg, msgN, bubble } = useGame()
  const ref = useRef(null)

  useEffect(() => {
    if (!msgN) return undefined
    animate(ref.current, [{ transform: 'none' }, { transform: 'translateY(-14px) rotate(-6deg)' }, { transform: 'none' }], {
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
    <div className="pointer-events-none fixed bottom-3 left-3 z-[35] flex origin-bottom-left scale-[.72] items-end gap-1.5">
      <button ref={ref} type="button" onClick={poke} aria-label="Bé Sen: bấm để nghe mẹo học" title="Bé Sen" className="pointer-events-auto relative size-[60px] shrink-0 cursor-pointer">
        <span className="absolute top-0 left-1.5 h-7 w-5 -rotate-[24deg] rounded-[50%_50%_40%_40%] bg-amber" />
        <span className="absolute top-0 right-1.5 h-7 w-5 rotate-[24deg] rounded-[50%_50%_40%_40%] bg-amber" />
        <span className="absolute top-[9px] left-1 h-[49px] w-[52px] rounded-full border-[3px] border-ink bg-gold" />
        <span className="absolute top-7 left-[19px] h-[9px] w-[7px] rounded-full bg-ink" />
        <span className="absolute top-7 left-[34px] h-[9px] w-[7px] rounded-full bg-ink" />
        <span className="absolute top-[38px] left-[23px] h-[7px] w-3.5 rounded-[0_0_50%_50%] border-b-[3px] border-ink" />
      </button>
      {bubble && msg && (
        <div role="status" className="pointer-events-none mb-[26px] max-w-[min(260px,58vw)] rounded-[18px_18px_18px_4px] border-[1.5px] border-ink bg-white px-3.5 py-2.5 text-[13.5px] leading-[1.45] font-semibold text-ink">
          {msg}
        </div>
      )}
    </div>
  )
}
