import { useEffect, useRef } from 'react'
import { animate } from '../_fun/fx.js'
import { play } from '../_fun/useGame.js'
import { flatten } from './utils.js'

// Khung sơ đồ 1100×760: kéo để di chuyển, lăn chuột để phóng to/thu nhỏ. Tâm ở (550,380); 4 nhánh lớn quanh tâm, ý con bay ra khi mở nhánh.
const W = 1100
const H = 760
const CX = 550
const CY = 380
const LEVEL = ['Chủ đề trung tâm', 'Nhánh lớn', 'Ý nhỏ']
const MIN = 0.4
const MAX = 2

// Đường nối "vẽ ra" bằng scaleX 0→1
function Line({ x1, y1, x2, y2, show, color, h, delay = 0 }) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return (
    <div
      aria-hidden="true"
      className="absolute rounded-[3px] motion-reduce:transition-none"
      style={{
        left: x1,
        top: y1,
        width: len,
        height: h,
        marginTop: -1,
        background: color,
        transformOrigin: '0 50%',
        transform: `rotate(${deg}deg) scaleX(${show ? 1 : 0})`,
        transition: `transform .5s cubic-bezier(.3,.9,.3,1) ${delay}ms, background .3s`,
      }}
    />
  )
}

export default function MapView({ map, open, setOpen, sel, seen, onVisit }) {
  const panelRef = useRef(null)
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  // Vị trí/tỉ lệ sơ đồ giữ trong ref và gán thẳng vào style, để kéo/zoom không render lại cả sơ đồ
  const view = useRef({ x: 0, y: 0, s: 1 })
  const drag = useRef(null)
  const dragged = useRef(false)
  const all = flatten(map.root)
  const selN = all.find((x) => x.n.id === sel) ?? all[0]
  const nSeen = all.filter((x) => seen[x.n.id]).length
  const ch = map.root.children
  const angs = ch.length === 4 ? [-140, -40, 40, 140] : ch.map((_, i) => -90 + (i * 360) / ch.length)

  const apply = () => {
    const { x, y, s } = view.current
    canvasRef.current.style.transform = `translate(${x}px,${y}px) scale(${s})`
  }
  // Thu vừa khung và đặt tâm sơ đồ vào giữa
  const fit = () => {
    const el = boxRef.current
    const s = Math.min(1, el.clientWidth / W, el.clientHeight / H)
    view.current = { s, x: (el.clientWidth - W * s) / 2, y: (el.clientHeight - H * s) / 2 }
    apply()
  }
  // Phóng to/thu nhỏ quanh điểm (mx, my) trong khung, giữ điểm đó đứng yên
  const zoomAt = (mx, my, f) => {
    const o = view.current
    const s = Math.min(MAX, Math.max(MIN, o.s * f))
    view.current = { s, x: mx - ((mx - o.x) * s) / o.s, y: my - ((my - o.y) * s) / o.s }
    apply()
  }
  const zoomCenter = (f) => zoomAt(boxRef.current.clientWidth / 2, boxRef.current.clientHeight / 2, f)

  useEffect(() => {
    fit()
    // Lăn chuột trong khung thì zoom sơ đồ thay vì cuộn trang (cần passive: false để chặn cuộn)
    const el = boxRef.current
    const onWheel = (e) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Kéo để di chuyển; chỉ "bắt" con trỏ khi đã kéo quá 4px để bấm vào các ý vẫn hoạt động
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    drag.current = { px: e.clientX, py: e.clientY, x: view.current.x, y: view.current.y, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.px
    const dy = e.clientY - d.py
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 4) return
      d.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    view.current = { ...view.current, x: d.x + dx, y: d.y + dy }
    apply()
  }
  const onPointerUp = () => {
    dragged.current = !!drag.current?.moved
    drag.current = null
  }

  useEffect(() => {
    animate(panelRef.current, [{ transform: 'scale(.96)', opacity: 0.5 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.3,1.4,.5,1)' })
  }, [sel])

  const lines = []
  const kids = []
  const branches = ch.map((c, i) => {
    const a = (angs[i] * Math.PI) / 180
    const x = CX + Math.cos(a) * 270
    const y = CY + Math.sin(a) * 200
    const isOpen = !!open[c.id]
    const active = sel === c.id || c.children?.some((k) => k.id === sel)
    lines.push(<Line key={`l-${c.id}`} x1={CX} y1={CY} x2={x} y2={y} show color={active ? '#B4322A' : '#D9CFBF'} h={4} />)
    c.children?.forEach((k, j) => {
      const n = c.children.length
      const aa = a + (j - (n - 1) / 2) * 0.42
      const tx = CX + Math.cos(aa) * 470
      const ty = CY + Math.sin(aa) * 318
      const delay = isOpen ? j * 70 : 0
      const on = sel === k.id
      lines.push(<Line key={`l-${k.id}`} x1={x} y1={y} x2={tx} y2={ty} show={isOpen} color={on ? '#B4322A' : '#E59A2F'} h={2.5} delay={delay} />)
      kids.push(
        <button
          key={k.id}
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={(e) => onVisit(k.id, e)}
          className={`absolute z-[4] min-h-[58px] w-[170px] rounded-2xl border-[1.5px] px-3 py-2.5 text-center text-[13px] leading-[1.4] font-bold text-ink motion-reduce:transition-none ${
            on ? 'border-primary bg-gold' : seen[k.id] ? 'border-amber bg-cream' : 'border-line-strong bg-white'
          }`}
          style={{
            left: isOpen ? tx : x,
            top: isOpen ? ty : y,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            transform: `translate(-50%,-50%) scale(${isOpen ? (on ? 1.08 : 1) : 0.3})`,
            transition: `left .55s cubic-bezier(.3,1.2,.4,1) ${delay}ms, top .55s cubic-bezier(.3,1.2,.4,1) ${delay}ms, opacity .35s ${delay}ms, transform .45s ${delay}ms, background .25s`,
          }}
        >
          {k.short || k.label}
        </button>,
      )
    })
    const on = sel === c.id
    return (
      <div key={c.id} className="absolute z-[5] flex -translate-1/2 flex-col items-center gap-1.5" style={{ left: x, top: y }}>
        <button
          type="button"
          onClick={(e) => {
            onVisit(c.id, e)
            if (!isOpen) setOpen((o) => ({ ...o, [c.id]: true }))
          }}
          className={`flex min-h-[70px] w-[190px] flex-col items-center gap-0.5 rounded-[22px] border-2 px-3.5 py-2.5 transition-all duration-300 ease-[cubic-bezier(.3,1.3,.4,1)] hover:scale-[1.06] ${
            on ? 'scale-[1.05] bg-primary text-on-dark' : 'bg-white text-ink'
          } ${active ? 'border-primary' : 'border-line-strong'}`}
        >
          <span className={`text-[12px] font-extrabold ${on ? 'text-gold' : 'text-amber'}`}>
            {String(i + 1).padStart(2, '0')} · {c.children?.length ?? 0} ý
          </span>
          <span className="text-[15px] leading-[1.25] font-extrabold">{c.short}</span>
        </button>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Thu' : 'Mở'} nhánh ${c.short}`}
          onClick={() => {
            play('tap')
            setOpen((o) => ({ ...o, [c.id]: !isOpen }))
          }}
          className={`grid size-[34px] place-items-center rounded-full border-[1.5px] border-line-strong bg-white text-[16px] font-extrabold transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
        >
          +
        </button>
      </div>
    )
  })

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            play('pop')
            setOpen(Object.fromEntries(ch.map((c) => [c.id, true])))
          }}
          className="btn btn-dark text-[13.5px] font-bold"
        >
          Mở tất cả nhánh
        </button>
        <button
          type="button"
          onClick={() => {
            play('tap')
            setOpen({})
          }}
          className="btn btn-outline bg-white text-[13.5px] font-bold"
        >
          Thu gọn
        </button>
        <span className="text-[13.5px] font-semibold text-muted">{map.intro}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-5">
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(e) => {
            // vừa kéo xong thì không tính là bấm vào ý
            if (dragged.current) {
              e.stopPropagation()
              dragged.current = false
            }
          }}
          className="relative h-[560px] min-w-0 flex-[999_1_560px] cursor-grab touch-none overflow-hidden rounded-[28px] border border-line bg-white bg-[radial-gradient(#E6DFD3_1.2px,transparent_1.2px)] bg-size-[24px_24px] select-none active:cursor-grabbing max-sm:h-[420px]"
        >
          <div ref={canvasRef} className="absolute top-0 left-0 origin-top-left" style={{ width: W, height: H }}>
            {lines}
            <span aria-hidden="true" className="absolute size-[250px] -translate-1/2 rounded-full border-[1.5px] border-dashed border-line-strong" style={{ left: CX, top: CY }} />
            <button
              type="button"
              onClick={(e) => onVisit(map.root.id, e)}
              className={`absolute z-[3] flex size-[210px] -translate-1/2 flex-col items-center justify-center rounded-full border-4 bg-ink p-6 text-center text-on-dark ${sel === map.root.id ? 'border-gold' : 'border-ink'}`}
              style={{ left: CX, top: CY }}
            >
              <span className="text-[11.5px] font-bold tracking-[.14em] text-gold">CHỦ ĐỀ</span>
              <span className="mt-1.5 text-[17px] leading-[1.3] font-extrabold">{map.root.short || map.root.label}</span>
            </button>
            {kids}
            {branches}
          </div>

          {/* Nút zoom cho chuột không có bánh xe và màn cảm ứng */}
          <div className="absolute right-3 bottom-3 z-10 flex flex-col overflow-hidden rounded-2xl border border-line bg-white" onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => zoomCenter(1.25)} aria-label="Phóng to" title="Phóng to" className="grid size-11 place-items-center border-b border-line text-[18px] font-extrabold last:border-b-0 hover:bg-cream">
              +
            </button>
            <button type="button" onClick={() => zoomCenter(0.8)} aria-label="Thu nhỏ" title="Thu nhỏ" className="grid size-11 place-items-center border-b border-line text-[18px] font-extrabold last:border-b-0 hover:bg-cream">
              −
            </button>
            <button type="button" onClick={() => fit()} aria-label="Vừa khung" title="Vừa khung" className="grid size-11 place-items-center border-b border-line text-[18px] font-extrabold last:border-b-0 hover:bg-cream">
              ⤢
            </button>
          </div>
          <p className="pointer-events-none absolute bottom-3 left-4 text-[12px] font-semibold text-faint max-sm:hidden">Kéo để di chuyển · lăn chuột để phóng to</p>
        </div>

        <div ref={panelRef} aria-live="polite" className="relative max-w-full flex-[1_1_300px] overflow-hidden rounded-[28px] bg-ink p-[clamp(20px,3vw,28px)] text-on-dark md:sticky md:top-[84px]">
          <span aria-hidden="true" className="absolute -top-[50px] -right-[50px] size-[170px] rounded-full bg-primary/55" />
          <p className="relative text-[12px] font-extrabold tracking-[.14em] text-gold uppercase">{LEVEL[Math.min(selN.lv, 2)]}</p>
          <h2 className="relative mt-2 text-[23px] leading-[1.25] font-extrabold tracking-[-0.01em]">{selN.n.label}</h2>
          <p className="relative mt-3.5 text-[15px] leading-[1.7] text-on-dark/88">{selN.n.detail}</p>
          {selN.n.quote && <p className="relative mt-4 rounded-[18px] bg-on-dark px-[18px] py-4 font-serif text-[16px] leading-[1.6] text-ink italic">“{selN.n.quote}”</p>}
          <p className="relative mt-4 text-[12.5px] font-bold text-on-dark/60">
            Đã khám phá {nSeen} / {all.length} ý
          </p>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-on-dark/12">
            <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${Math.round((nSeen / all.length) * 100)}%` }} />
          </div>
        </div>
      </div>
    </>
  )
}
