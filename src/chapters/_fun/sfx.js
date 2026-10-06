// Âm thanh ngắn tạo bằng WebAudio (không cần file âm thanh). Bật/tắt qua play() trong useGame.js.
const SEQ = {
  ok: [[660, 0], [880, 0.09], [1175, 0.18]],
  bad: [[220, 0], [180, 0.12]],
  tap: [[520, 0]],
  flip: [[440, 0], [660, 0.04]],
  pop: [[740, 0], [990, 0.05]],
  pick: [[600, 0], [800, 0.04]],
  tick: [[1000, 0]],
  stamp: [[180, 0], [360, 0.04]],
  win: [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.3]],
  lose: [[392, 0], [330, 0.15], [262, 0.3]],
  off: [[400, 0]],
}
const TRIANGLE = ['bad', 'lose', 'stamp']

let ac
export function tone(kind) {
  try {
    ac ??= new (window.AudioContext || window.webkitAudioContext)()
    const now = ac.currentTime
    for (const [f, t] of SEQ[kind] ?? [[500, 0]]) {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = TRIANGLE.includes(kind) ? 'triangle' : 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, now + t)
      g.gain.exponentialRampToValueAtTime(0.16, now + t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.18)
      o.connect(g)
      g.connect(ac.destination)
      o.start(now + t)
      o.stop(now + t + 0.2)
    }
  } catch {
    // trình duyệt không hỗ trợ WebAudio: im lặng
  }
}
