import { useSyncExternalStore } from 'react'
import { tone } from './sfx.js'
import { burst, floatXp, pt } from './fx.js'

// XP chung của cả 6 chương + lời nói của linh vật. Lưu ở localStorage key `hcm202_game` = { xp, earned, sound }.
const KEY = 'hcm202_game'

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { xp: Number(s.xp) || 0, earned: s.earned && typeof s.earned === 'object' ? s.earned : {}, sound: s.sound !== false }
  } catch {
    return { xp: 0, earned: {}, sound: true }
  }
}

let game = { ...load(), msg: '', msgN: 0, bubble: false }
const subs = new Set()

function set(patch) {
  game = { ...game, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify({ xp: game.xp, earned: game.earned, sound: game.sound }))
  } catch {
    // bị chặn lưu: vẫn chơi được trong phiên này
  }
  subs.forEach((f) => f())
}

export function useGame() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => game,
  )
}

export const levelOf = (xp) => Math.floor(xp / 100) + 1

export function play(kind) {
  if (game.sound) tone(kind)
}

export function toggleSound() {
  set({ sound: !game.sound })
  if (game.sound) tone('tap')
}

export function say(msg) {
  set({ msg, msgN: game.msgN + 1, bubble: true })
}

export function hideBubble() {
  set({ bubble: false })
}

// Mỗi key chỉ cộng một lần (vd. `c1-fc-<id>`). e: sự kiện chuột để biết chỗ bay chữ "+N XP".
export function award(key, amount, e) {
  if (game.earned[key]) return false
  const before = levelOf(game.xp)
  const p = pt(e)
  set({ xp: game.xp + amount, earned: { ...game.earned, [key]: true } })
  floatXp(p.x, p.y, amount)
  const after = levelOf(game.xp)
  if (after > before) {
    setTimeout(() => {
      play('win')
      burst(window.innerWidth / 2, 90, 50)
      say(`Lên cấp! Bạn đã đạt Lv${after}.`)
    }, 300)
  }
  return true
}
