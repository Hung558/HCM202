import { useEffect, useRef, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { matchPair, secondsLeft, shuffle } from './game.js'
import { animate, burst, centerOf, shake } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

const IDLE = { phase: 'idle', order: [], matched: [], sel: null, miss: 0, wrong: {}, deadline: 0, t0: 0, t1: 0 }

// Ghép nối: kéo mảnh (tổ chức) thả vào năm, hoặc chạm/Enter mảnh rồi chạm/Enter năm.
// Luật trong game.js: đúng thì khoá cặp, sai không trừ giờ, hết giờ không ghi điểm.
export default function MatchingGame({ pairs, timeLimit, stats, onFinish }) {
  const [mode, setMode] = useState('timed')
  const [g, setG] = useState(IDLE)
  const [over, setOver] = useState(null) // năm đang được kéo qua
  const [now, setNow] = useState(0)
  const slotRefs = useRef({})
  const ended = useRef(false) // chặn kết thúc hai lần (hết giờ đúng lúc ghép cặp cuối)
  const finishRef = useRef(null)
  const timed = mode === 'timed'
  const total = pairs.length

  // Đồng hồ chạy theo mốc kết thúc thật (vẫn đúng khi chuyển tab)
  useEffect(() => {
    finishRef.current = finish
  })
  useEffect(() => {
    if (g.phase !== 'play') return undefined
    const tick = () => {
      const t = Date.now()
      setNow(t)
      if (timed && secondsLeft(g.deadline, t) === 0) finishRef.current(false)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [g.phase, g.deadline, timed])

  function start() {
    const t = Date.now()
    ended.current = false
    setG({ ...IDLE, phase: 'play', order: shuffle(pairs.map((p) => p.id)), deadline: t + timeLimit * 1000, t0: t })
    setNow(t)
    play('pick')
    say(timed ? `Bắt đầu! Bạn có ${timeLimit} giây.` : 'Luyện tập tự do, không giới hạn thời gian.')
  }

  function finish(won) {
    if (ended.current) return
    ended.current = true
    const t1 = Date.now()
    const dur = Math.round((t1 - g.t0) / 1000)
    setG((x) => ({ ...x, phase: 'over', t1, sel: null }))
    const record = onFinish(won, dur, mode)
    if (won) {
      play('win')
      setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 3, 80), 80)
      say(record ? `Kỷ lục mới: ${dur} giây!` : `Đoàn kết là sức mạnh! Ghép đủ cả ${total} cặp.`)
    } else {
      play('lose')
      say('Hết giờ rồi! Xem giải thích rồi thử lại nhé.')
    }
  }

  function match(id, year, e) {
    const expired = timed && secondsLeft(g.deadline) === 0
    const res = matchPair(pairs, g.matched, id, year, expired)
    if (res === 'ignored') return
    const el = slotRefs.current[year]
    if (res === 'correct') {
      const matched = [...g.matched, id]
      setG((x) => ({ ...x, matched, sel: null }))
      play('ok')
      const p = centerOf(el)
      award(`c5-${id}`, 15, e ?? { clientX: p.x, clientY: p.y - 40 })
      burst(p.x, p.y - 40, 26)
      animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.3,1.5,.5,1)' })
      const pair = pairs.find((p) => p.id === id)
      if (matched.length === total) setTimeout(() => finish(true), 450)
      else say(`Chính xác! ${pair.organization} – ${year}.`)
    } else {
      setG((x) => ({ ...x, miss: x.miss + 1, sel: null, wrong: { ...x.wrong, [id]: true } }))
      play('bad')
      shake(el)
      say('Chưa khớp, không bị trừ giờ đâu. Thử năm khác!')
    }
  }

  const select = (id) => {
    play('pick')
    setG((x) => ({ ...x, sel: x.sel === id ? null : id }))
  }
  const quit = () => {
    play('tap')
    setG(IDLE)
  }

  const years = pairs.map((p) => p.year).sort((a, b) => a - b)
  const remain = secondsLeft(g.deadline, now)
  const elapsed = Math.round(((g.phase === 'over' ? g.t1 : now) - g.t0) / 1000)
  const won = g.phase === 'over' && g.matched.length === total
  const modeLabel = timed ? `Thử thách ${timeLimit} giây` : 'Luyện tập tự do'

  if (g.phase === 'idle')
    return (
      <div className="mt-7 flex flex-wrap items-stretch gap-5">
        <div className="relative flex-[2_1_440px] overflow-hidden rounded-[30px] bg-primary p-[clamp(24px,4vw,40px)] text-on-dark">
          <span aria-hidden="true" className="absolute -right-[70px] -bottom-[70px] size-[240px] rounded-full bg-gold/20" />
          <p className="relative text-[12.5px] font-extrabold tracking-[.14em] text-gold uppercase">Ghép nối lịch sử Mặt trận</p>
          <h2 className="relative mt-2.5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-extrabold">Nối mỗi tổ chức với năm ra đời</h2>
          <p className="relative mt-3 max-w-[540px] text-[15.5px] leading-[1.65] text-on-dark/90">
            Kéo mảnh ghép vào đúng năm, hoặc chạm mảnh rồi chạm năm. Ghép sai không bị trừ giờ, cứ thử lại. Ghép đúng thì cặp đó được khoá lại.
          </p>
          <div role="radiogroup" aria-label="Chế độ chơi" className="relative mt-5 flex w-fit flex-wrap gap-2 rounded-full bg-ink/25 p-[5px]">
            {[
              ['timed', `Thử thách ${timeLimit} giây`],
              ['free', 'Luyện tập tự do'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={mode === id}
                onClick={() => {
                  play('tap')
                  setMode(id)
                }}
                className={`min-h-11 rounded-full px-[18px] text-[14px] font-extrabold transition-all duration-200 ${mode === id ? 'bg-on-dark text-ink' : 'text-on-dark'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={start} className="relative mt-[22px] block min-h-14 rounded-full bg-gold px-8 text-[16px] font-extrabold text-ink transition-transform hover:scale-[1.04]">
            Bắt đầu chơi →
          </button>
        </div>
        <div className="flex flex-[1_1_300px] flex-col gap-3 rounded-[30px] border border-line bg-white p-[22px]">
          <p className="text-[16px] font-extrabold">Kỷ lục của bạn</p>
          <div className="flex gap-2.5">
            <div className="flex-1 rounded-[20px] bg-cream p-4">
              <div className="text-[30px] font-extrabold text-primary">{stats.best ? `${stats.best}s` : '—'}</div>
              <div className="text-[13px] font-semibold text-muted">Nhanh nhất · {timeLimit} giây</div>
            </div>
            <div className="flex-1 rounded-[20px] bg-paper p-4">
              <div className="text-[30px] font-extrabold">{stats.plays}</div>
              <div className="text-[13px] font-semibold text-muted">Lượt đã chơi</div>
            </div>
          </div>
          <p className="text-[13px] leading-[1.6] text-muted">Lượt luyện tập tự do không tính vào kỷ lục thời gian.</p>
        </div>
      </div>
    )

  if (g.phase === 'over')
    return (
      <>
        <div className={`relative mt-7 overflow-hidden rounded-[30px] p-[clamp(24px,4vw,40px)] text-center text-on-dark ${won ? 'bg-success' : 'bg-primary'}`} role="status">
          <span aria-hidden="true" className="absolute -top-[60px] -left-[60px] size-[200px] rounded-full bg-gold/[.18]" />
          <p className="relative text-[12.5px] font-extrabold tracking-[.14em] text-gold uppercase">{modeLabel}</p>
          <h2 className="relative mt-2 text-[clamp(28px,3.8vw,42px)] font-extrabold">{won ? `Ghép đủ ${total} cặp!` : 'Hết giờ!'}</h2>
          <p className="relative mt-2.5 text-[16px]">
            {won
              ? `Hoàn thành trong ${elapsed} giây · sai ${g.miss} lần${timed && stats.best === elapsed ? ' · kỷ lục mới!' : ''}`
              : `Bạn ghép đúng ${g.matched.length} / ${total} cặp. Xem giải thích bên dưới.`}
          </p>
          <div className="relative mt-5 flex flex-wrap justify-center gap-2.5">
            <button type="button" onClick={start} className="min-h-12 rounded-full bg-gold px-6 text-[15px] font-extrabold text-ink">
              Chơi lại
            </button>
            <button type="button" onClick={quit} className="min-h-12 rounded-full border border-on-dark/40 px-6 text-[15px] font-bold">
              Đổi chế độ
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3">
          {[...pairs]
            .sort((a, b) => a.year - b.year)
            .map((p) => {
              const ok = g.matched.includes(p.id)
              return (
                <div key={p.id} className="flex flex-col gap-2 rounded-3xl border border-line bg-white p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[26px] font-extrabold text-primary">{p.year}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-extrabold ${ok ? 'bg-success-soft text-success' : 'bg-[#FBEDEB] text-primary'}`}>
                      {ok ? (g.wrong[p.id] ? 'Đúng sau khi thử lại' : 'Đúng ngay') : 'Chưa ghép'}
                    </span>
                  </div>
                  <p className="text-[16px] leading-[1.35] font-extrabold">{p.organization}</p>
                  <p className="text-[14px] leading-[1.65] text-ink-soft">{p.explanation}</p>
                </div>
              )
            })}
        </div>
      </>
    )

  const frac = timed ? remain / timeLimit : 1
  const ringC = !timed ? '#2F7D4F' : remain <= 10 ? '#B4322A' : '#E59A2F'
  const pieces = g.order.filter((id) => !g.matched.includes(id)).map((id) => pairs.find((p) => p.id === id))

  return (
    <DragDropContext
      onDragStart={(s) => setG((x) => ({ ...x, sel: s.draggableId }))}
      onDragUpdate={(u) => setOver(u.destination?.droppableId.startsWith('y-') ? Number(u.destination.droppableId.slice(2)) : null)}
      onDragEnd={(r) => {
        setOver(null)
        if (r.destination?.droppableId.startsWith('y-')) match(r.draggableId, Number(r.destination.droppableId.slice(2)))
      }}
    >
      <div className="mt-7 flex flex-wrap items-center gap-3.5">
        <div
          className="grid size-[72px] shrink-0 place-items-center rounded-full transition-[background] duration-300"
          style={{ background: `conic-gradient(${ringC} ${frac * 360}deg, #EFE9DF 0)` }}
          role="timer"
          aria-label={timed ? `Còn ${remain} giây` : 'Không giới hạn thời gian'}
        >
          <div className={`grid size-14 place-items-center rounded-full bg-paper text-[18px] font-extrabold ${timed && remain <= 10 ? 'text-primary' : ''}`}>{timed ? `${remain}s` : '∞'}</div>
        </div>
        <div className="min-w-[200px] flex-1">
          <p className="text-[17px] font-extrabold" aria-live="polite">
            {g.matched.length} / {total} cặp đã ghép
          </p>
          <p className="mt-0.5 text-[13.5px] font-semibold text-muted">
            {modeLabel} · sai {g.miss} lần
          </p>
        </div>
        <button type="button" onClick={quit} className="btn btn-outline bg-white text-[13.5px] font-bold">
          Đổi chế độ
        </button>
      </div>

      <div className="mt-5 rounded-[28px] bg-ink p-5">
        <p className="mb-3 text-[12px] font-extrabold tracking-[.14em] text-gold uppercase">Mảnh ghép · kéo hoặc chạm để chọn</p>
        <Droppable droppableId="tray" direction="horizontal" isDropDisabled>
          {(dp) => (
            <div ref={dp.innerRef} {...dp.droppableProps} className="flex min-h-14 flex-wrap gap-2.5">
              {pieces.map((p, i) => {
                const sel = g.sel === p.id
                return (
                  <Draggable key={p.id} draggableId={p.id} index={i}>
                    {(dr, snap) => (
                      <div
                        ref={dr.innerRef}
                        {...dr.draggableProps}
                        {...dr.dragHandleProps}
                        role="button"
                        aria-pressed={sel}
                        aria-label={`Mảnh ghép: ${p.organization}. Enter để chọn, rồi chọn năm.`}
                        onClick={() => select(p.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            select(p.id)
                          }
                        }}
                        className="outline-none"
                      >
                        <span
                          className={`relative flex min-h-[54px] cursor-grab items-center rounded-2xl pr-[22px] pl-[30px] text-[15px] font-extrabold text-ink transition-all duration-[250ms] ease-[cubic-bezier(.3,1.4,.5,1)] select-none ${
                            sel || snap.isDragging ? '-translate-y-[5px] -rotate-2 scale-[1.04] bg-gold outline-2 outline-offset-[3px] outline-gold' : 'bg-on-dark'
                          }`}
                        >
                          <span aria-hidden="true" className="absolute top-1/2 -left-[9px] -mt-[9px] size-[18px] rounded-full bg-ink" />
                          {p.organization}
                        </span>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {dp.placeholder}
              {!pieces.length && <span className="flex items-center text-[15px] font-extrabold text-gold">Đã ghép đủ, xem kết quả bên dưới!</span>}
            </div>
          )}
        </Droppable>
      </div>

      <div className="relative mt-[22px]">
        <div aria-hidden="true" className="absolute top-[52px] right-5 left-5 h-1.5 rounded-md bg-line max-[520px]:hidden" />
        <div
          aria-hidden="true"
          className="absolute top-[52px] left-5 h-1.5 rounded-md bg-success transition-[width] duration-500 ease-[cubic-bezier(.3,1.2,.4,1)] max-[520px]:hidden"
          style={{ width: `calc((100% - 40px) * ${g.matched.length / total})` }}
        />
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5">
          {years.map((y) => {
            const p = pairs.find((z) => z.year === y)
            const done = g.matched.includes(p.id)
            const hot = over === y
            const armed = g.sel && !done
            return (
              <Droppable key={y} droppableId={`y-${y}`} isDropDisabled={done}>
                {(dp) => (
                  <div ref={dp.innerRef} {...dp.droppableProps}>
                    <div
                      ref={(el) => (slotRefs.current[y] = el)}
                      role="button"
                      tabIndex={0}
                      aria-label={done ? `${y}: ${p.organization}` : `Năm ${y}${armed ? ', Enter để thả mảnh đã chọn' : ''}`}
                      onClick={(e) => g.sel && match(g.sel, y, e)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && g.sel) {
                          e.preventDefault()
                          match(g.sel, y, e)
                        }
                      }}
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <div
                        className={`grid size-[110px] place-items-center rounded-full border-4 text-[28px] font-extrabold tracking-[-0.02em] transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] ${
                          done ? 'border-success bg-success text-on-dark' : hot ? 'scale-[1.08] border-primary bg-primary text-on-dark' : armed ? 'border-primary bg-white' : 'border-line-strong bg-white'
                        }`}
                      >
                        {y}
                      </div>
                      <div
                        className={`flex min-h-[86px] w-full items-center justify-center rounded-[20px] border-[1.5px] px-3.5 py-3 text-center transition-all duration-300 ${
                          done ? 'border-success bg-success-soft' : hot ? 'border-dashed border-primary bg-cream' : 'border-dashed border-line-strong bg-white'
                        }`}
                      >
                        {done ? (
                          <span className="text-[14.5px] leading-[1.35] font-extrabold text-success">✓ {p.organization}</span>
                        ) : (
                          <span className="text-[13.5px] font-bold text-faint">{armed ? 'Chạm để thả vào đây' : 'Thả mảnh ghép'}</span>
                        )}
                      </div>
                    </div>
                    <span className="hidden">{dp.placeholder}</span>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </div>
    </DragDropContext>
  )
}
