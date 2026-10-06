// Hiệu ứng vẽ thẳng lên một lớp DOM phủ toàn màn hình (không qua React): confetti, cánh hoa, "+N XP", rung.
// Tất cả tự tắt khi người dùng bật "giảm chuyển động".
export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let layer
function getLayer() {
  if (!layer?.isConnected) {
    layer = document.createElement('div')
    layer.setAttribute('aria-hidden', 'true')
    Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '90', overflow: 'hidden' })
    document.body.appendChild(layer)
  }
  return layer
}

// Toạ độ từ sự kiện chuột/chạm; bấm bằng bàn phím thì lấy tâm nút; không có gì thì giữa màn hình.
export function pt(e) {
  if (e?.clientX) return { x: e.clientX, y: e.clientY }
  const r = e?.currentTarget?.getBoundingClientRect?.()
  if (r) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

export function centerOf(el) {
  const r = el?.getBoundingClientRect()
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : pt()
}

// Ba kiểu mảnh: giấy màu (mặc định), cánh hoa (Chương VI), lá cây (Chương II)
const KINDS = {
  confetti: { colors: ['#B4322A', '#E59A2F', '#F2C06B', '#2F7D4F'], h: 0.6, radius: '2px' },
  petal: { colors: ['#F4A9A0', '#F2C06B', '#FFFFFF', '#E59A2F'], h: 1.4, radius: '50% 50% 50% 0' },
  leaf: { colors: ['#5E8C4A', '#7FAE6A', '#6A9C57', '#E59A2F'], h: 0.65, radius: '100% 0' },
}

export function burst(x, y, n = 30, kind = 'confetti') {
  if (reduced()) return
  const box = getLayer()
  const k = KINDS[kind]
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span')
    const sz = 6 + Math.random() * 7
    Object.assign(s.style, {
      position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${sz}px`, height: `${sz * k.h}px`,
      background: k.colors[i % k.colors.length], borderRadius: k.radius,
    })
    box.appendChild(s)
    const a = Math.random() * Math.PI * 2
    const d = 70 + Math.random() * 160
    s.animate(
      [
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 140}px) rotate(${Math.random() * 600}deg)`, opacity: 0 },
      ],
      { duration: 1000 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).onfinish = () => s.remove()
  }
}

// Cánh hoa rơi từ mép trên màn hình (Chương VI, đủ cả 5 đức tính)
export function petalRain(n = 60) {
  if (reduced()) return
  for (let i = 0; i < n; i++) setTimeout(() => burst(Math.random() * window.innerWidth, -10, 1, 'petal'), i * 25)
}

export function floatXp(x, y, amount) {
  if (reduced()) return
  const s = document.createElement('span')
  s.textContent = `+${amount} XP`
  Object.assign(s.style, {
    position: 'absolute', left: `${x}px`, top: `${y}px`, fontWeight: '800', fontSize: '18px', color: '#E59A2F',
    whiteSpace: 'nowrap', textShadow: '0 1px 0 #FFF8EC',
  })
  getLayer().appendChild(s)
  s.animate(
    [
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%,-120%) scale(1.1)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%,-260%)', opacity: 0 },
    ],
    { duration: 1100, easing: 'ease-out' },
  ).onfinish = () => s.remove()
}

export function shake(el) {
  if (!el || reduced()) return
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }],
    { duration: 370 },
  )
}

// Chạy một hiệu ứng Web Animations nhỏ (nảy, trồi lên...) nếu được phép chuyển động
export function animate(el, keyframes, options) {
  if (!el || reduced()) return null
  return el.animate(keyframes, options)
}

// Màn hẹp (mục lục nằm trên bài): chọn mục xong thì cuộn tới đầu bài
export function scrollToOnMobile(id) {
  if (window.matchMedia('(min-width: 768px)').matches) return
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }))
}
