import { useEffect, useRef, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Check, Clock3, GripVertical, Play, RotateCcw, Trophy } from 'lucide-react'
import data from './data.json'
import { matchPair, secondsLeft, shuffle } from './game.js'

export default function MatchingGame() {
  const [mode, setMode] = useState('timed')
  const [status, setStatus] = useState('ready')
  const [order, setOrder] = useState(() => shuffle(data.pairs))
  const [matched, setMatched] = useState([])
  const [selected, setSelected] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [remaining, setRemaining] = useState(data.timeLimitSeconds)
  const [message, setMessage] = useState('Chọn chế độ rồi bắt đầu. Bạn cần ghép đúng cả 4 cặp.')
  const deadline = useRef(null)
  const running = status === 'playing'
  const finished = status === 'won' || status === 'timeout'
  const available = order.filter((pair) => !matched.includes(pair.id))
  const selectedPair = data.pairs.find((pair) => pair.id === selected)

  useEffect(() => {
    if (!running || mode !== 'timed') return
    const tick = () => {
      const left = secondsLeft(deadline.current)
      setRemaining(left)
      if (left === 0) {
        setStatus('timeout')
        setSelected(null)
        setMessage('Hết giờ! Xem lời giải bên dưới rồi thử lại nhé.')
      }
    }
    tick()
    const timer = window.setInterval(tick, 200)
    return () => window.clearInterval(timer)
  }, [running, mode])

  function start() {
    setOrder(shuffle(data.pairs))
    setMatched([])
    setSelected(null)
    setAttempts(0)
    setRemaining(data.timeLimitSeconds)
    deadline.current = mode === 'timed' ? Date.now() + data.timeLimitSeconds * 1000 : null
    setStatus('playing')
    setMessage('Đã bắt đầu! Kéo thẻ vào năm, hoặc chọn thẻ rồi chọn năm tương ứng.')
  }

  function changeMode(value) {
    setMode(value)
    setStatus('ready')
    setMatched([])
    setSelected(null)
    setAttempts(0)
    setRemaining(data.timeLimitSeconds)
    deadline.current = null
    setMessage('Đã đổi chế độ và đặt lại lượt chơi. Bấm Bắt đầu chơi khi bạn sẵn sàng.')
  }

  function match(id, year) {
    if (!running) return
    if (mode === 'timed' && secondsLeft(deadline.current) === 0) {
      setRemaining(0)
      setStatus('timeout')
      setSelected(null)
      setMessage('Hết giờ! Xem lời giải bên dưới rồi thử lại nhé.')
      return
    }
    const result = matchPair(data.pairs, matched, id, year)
    if (result === 'ignored') return
    setAttempts((count) => count + 1)
    if (result === 'wrong') {
      setMessage(`Chưa đúng: ${data.pairs.find((pair) => pair.id === id).organization} không ứng với năm ${year}. Hãy thử một mốc khác.`)
      return
    }
    const next = [...matched, id]
    setMatched(next)
    setSelected(null)
    if (next.length === data.pairs.length) {
      setStatus('won')
      if (mode === 'timed') setRemaining(secondsLeft(deadline.current))
      setMessage('Chính xác! Bạn đã hoàn thành cả 4 cặp. Khám phá ý nghĩa từng mốc bên dưới.')
    } else setMessage(`Chính xác! Đã ghép ${next.length}/4 cặp. Tiếp tục nhé.`)
  }

  return (
    <section aria-label="Trò chơi ghép nối">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="card p-[22px]">
          <p className="eyebrow">04 dấu mốc · 01 hành trình đoàn kết</p>
          <h2 className="mt-3 text-[22px] font-extrabold tracking-[-0.01em]">Đưa tổ chức về đúng năm</h2>
          <p id="matching-help" className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">Kéo tên tổ chức ở cột phải vào mốc năm ở cột trái. Bạn cũng có thể bấm chọn một tổ chức rồi bấm vào năm; dùng Tab và Enter hoặc Space khi thao tác bằng bàn phím.</p>
          <fieldset className="mt-5 flex flex-wrap gap-3">
            <legend className="mb-2 text-sm font-semibold">Chế độ chơi</legend>
            {[['timed', 'Thử thách 60 giây'], ['practice', 'Luyện tập tự do']].map(([value, label]) => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-4 text-sm"><input type="radio" name="chuong5-mode" value={value} checked={mode === value} onChange={() => changeMode(value)} />{label}</label>)}
          </fieldset>
          <button className="btn btn-primary mt-5" onClick={start}>{status === 'ready' ? <Play className="size-4" /> : <RotateCcw className="size-4" />}{status === 'ready' ? 'Bắt đầu chơi' : 'Chơi lại'}</button>
          <p className="mt-3 text-xs leading-relaxed text-muted">Ghép sai được thử lại. Chơi lại hoặc đổi chế độ sẽ xóa kết quả lượt hiện tại. Đồng hồ vẫn chạy khi chuyển sang Học bài.</p>
        </div>
        <div className="rounded-3xl bg-ink p-6 text-on-dark">
          <div className="flex items-center gap-2 text-sm text-on-dark/80"><Clock3 className="size-4" />{mode === 'timed' ? 'Thời gian còn lại' : 'Không giới hạn thời gian'}</div>
          <p role="timer" aria-label={mode === 'timed' ? `Còn ${remaining} giây` : 'Không giới hạn'} className={`mt-3 text-5xl font-extrabold tabular-nums ${remaining <= 10 && mode === 'timed' ? 'text-gold' : ''}`}>{mode === 'timed' ? `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}` : '∞'}</p>
          <div className="mt-7 flex items-center justify-between text-sm"><span>Đã ghép đúng</span><strong>{matched.length} / {data.pairs.length}</strong></div>
          <div role="progressbar" aria-label="Tiến độ ghép nối" aria-valuemin={0} aria-valuemax={data.pairs.length} aria-valuenow={matched.length} className="mt-3 h-2 overflow-hidden rounded-full bg-on-dark/20"><div className="h-full rounded-full bg-amber transition-[width]" style={{ width: `${matched.length / data.pairs.length * 100}%` }} /></div>
          <p className="mt-4 text-sm text-on-dark/80">{attempts} lượt ghép · {attempts - matched.length} lượt chưa đúng</p>
        </div>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className={`my-5 min-h-14 rounded-2xl border p-4 text-sm leading-relaxed ${status === 'won' ? 'border-success bg-success-soft text-success' : 'border-line bg-cream text-ink-soft'}`}>{message}</p>
      {selectedPair && running && <p className="mb-4 text-sm font-semibold text-primary">Đang chọn: {selectedPair.organization}. Chọn năm phù hợp ở cột trái.</p>}
      <DragDropContext onDragStart={() => setSelected(null)} onDragEnd={({ draggableId, destination }) => { if (destination?.droppableId.startsWith('year-')) match(draggableId, Number(destination.droppableId.slice(5))) }} dragHandleUsageInstructions="Nhấn Space để nhấc thẻ, dùng phím mũi tên để di chuyển và Space để thả. Nhấn Escape để hủy. Hoặc dùng nút Chọn tổ chức rồi chọn năm.">
        <div className="grid grid-cols-2 gap-3 sm:gap-6" aria-describedby="matching-help">
          <div className="min-w-0"><h3 className="mb-3 text-sm font-bold text-muted">01 · Năm thành lập</h3>
            <div className="space-y-3">{data.pairs.map((pair) => {
              const done = matched.includes(pair.id)
              return <Droppable key={pair.id} droppableId={`year-${pair.year}`} isDropDisabled={!running || done}>
                {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={`min-h-32 rounded-2xl border-2 border-dashed p-3 sm:p-5 ${done ? 'border-success bg-success-soft' : snapshot.isDraggingOver ? 'border-primary bg-primary/10' : 'border-line-strong bg-white'}`}>
                  <button disabled={!running || done || !selected} onClick={() => match(selected, pair.year)} aria-label={`Ghép tổ chức đã chọn vào năm ${pair.year}`} className="min-h-11 w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-primary">
                    <span className={`flex items-center justify-between gap-1 text-[clamp(22px,4vw,30px)] font-extrabold ${done ? 'text-success' : 'text-amber'}`}>{pair.year}{done && <Check className="size-5 shrink-0" aria-hidden="true" />}</span>
                    <span className="mt-1 block break-words text-xs leading-relaxed text-ink-soft sm:text-sm">{done ? pair.organization : selected ? 'Bấm để ghép vào đây' : 'Thả tổ chức vào đây'}</span>
                  </button>{provided.placeholder}
                </div>}
              </Droppable>
            })}</div>
          </div>
          <div className="min-w-0"><h3 className="mb-3 text-sm font-bold text-muted">02 · Tên tổ chức</h3>
            <Droppable droppableId="bank" isDropDisabled>
              {(provided) => <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-48 space-y-3">
                {available.map((pair, index) => <Draggable key={pair.id} draggableId={pair.id} index={index} isDragDisabled={!running}>
                  {(drag, snapshot) => <div ref={drag.innerRef} {...drag.draggableProps} className={`min-h-32 rounded-2xl border p-3 sm:p-5 ${selected === pair.id || snapshot.isDragging ? 'border-primary bg-cream' : 'border-line bg-white'} ${!running ? 'opacity-60' : ''}`}>
                    <div {...drag.dragHandleProps} aria-label={`Kéo ${pair.organization}`} className="flex min-h-11 items-start gap-2 rounded-lg text-sm font-bold leading-relaxed focus-visible:outline-2 focus-visible:outline-primary"><GripVertical className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" /><span className="break-words">{pair.organization}</span></div>
                    <button disabled={!running} aria-pressed={selected === pair.id} onClick={() => setSelected(selected === pair.id ? null : pair.id)} className="mt-2 min-h-11 rounded-full border border-line-strong px-3 text-xs font-semibold hover:bg-paper disabled:cursor-not-allowed">{selected === pair.id ? 'Bỏ chọn' : 'Chọn tổ chức'}</button>
                  </div>}
                </Draggable>)}{provided.placeholder}
                {available.length === 0 && <div className="rounded-2xl bg-success-soft p-6 text-center text-success"><Trophy className="mx-auto mb-3 size-8" /><p className="text-sm font-semibold">Tất cả đã về đúng vị trí!</p></div>}
              </div>}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
      {finished && <section className="card mt-6 p-[22px]" aria-label="Kết quả và lời giải">
        <h2 className="flex items-center gap-3 text-[22px] font-extrabold"><Trophy className="size-6 text-amber" />{status === 'won' ? 'Hoàn thành thử thách!' : 'Cùng ôn lại các dấu mốc'}</h2>
        <p className="mt-3 text-ink-soft">Bạn ghép đúng {matched.length}/{data.pairs.length} cặp sau {attempts} lượt. {status === 'won' && mode === 'timed' ? `Thời gian thực hiện: ${data.timeLimitSeconds - remaining} giây.` : ''}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{data.pairs.map((pair) => <div key={pair.id} className="rounded-2xl bg-paper p-5"><p className="text-xs font-semibold text-muted">{matched.includes(pair.id) ? 'Đã ghép đúng' : 'Chưa ghép được'}</p><p className="mt-2 text-xl font-extrabold text-primary">{pair.year}</p><h3 className="mt-2 font-bold">{pair.organization}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{pair.explanation}</p></div>)}</div>
      </section>}
    </section>
  )
}
