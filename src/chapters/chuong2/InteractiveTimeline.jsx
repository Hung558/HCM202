import { useCallback, useState } from 'react'
import data from './data.json'
import FoundationsView from './FoundationsView.jsx'
import TreeView from './TreeView.jsx'
import { filterEvents } from './events.js'
import SignificanceView from './SignificanceView.jsx'
import EventModal from './EventModal.jsx'
import QuickQuizModal from './QuickQuizModal.jsx'
import ChapterShell from '../_fun/ChapterShell.jsx'
import Hero from '../_fun/Hero.jsx'
import { award, play, say } from '../_fun/useGame.js'

const TABS = [
  { id: 'foundations', label: 'I. Cơ sở' },
  { id: 'timeline', label: 'II. Cây thời gian' },
  { id: 'significance', label: 'III. Giá trị' },
]
const TAB_TIPS = {
  foundations: 'Ba bộ rễ nuôi cây tư tưởng. Mở từng ý nhé!',
  timeline: 'Cuộn xuống đi, cây sẽ mọc theo bạn đó!',
  significance: 'Cây đã kết trái. Chạm để hái từng quả nào!',
}
const TIPS = ['Mỗi 100 XP bạn lên một cấp.', 'XP được cộng chung cho cả 6 chương.', 'Mở sự kiện có ảnh để xem tư liệu lịch sử.', 'Thử nút Đố nhanh ở Cây thời gian nhé!']

export default function InteractiveTimeline() {
  const [tab, setTab] = useState('foundations')
  const [period, setPeriod] = useState('all')
  const [q, setQ] = useState('')
  const [evId, setEvId] = useState(null)
  const [quizOpen, setQuizOpen] = useState(false)

  const list = filterEvents(data.events, period, q)
  const event = data.events.find((e) => e.id === evId)
  const index = list.findIndex((e) => e.id === evId)

  function changeTab(id) {
    setTab(id)
    say(TAB_TIPS[id])
  }
  const go = (id) => {
    changeTab(id)
    window.scrollTo({ top: 0 })
  }

  function openEvent(id, e) {
    const ev = data.events.find((x) => x.id === id)
    play('pop')
    setEvId(id)
    award(`c2-ev-${id}`, 5, e)
    say(`${ev.date}: ${ev.tag}.`)
  }

  const step = useCallback(
    (dir) => {
      const j = index + dir
      if (j < 0 || j >= list.length) return
      play('tap')
      setEvId(list[j].id)
      award(`c2-ev-${list[j].id}`, 5)
    },
    [index, list],
  )

  function openQuiz() {
    play('pop')
    setQuizOpen(true)
    say(`${data.quiz.length} câu hỏi, mỗi câu đúng +20 XP!`)
  }

  return (
    <ChapterShell num="II" tabs={TABS} tab={tab} onTab={changeTab} tips={TIPS}>
      <Hero
        num="II"
        eyebrow={data.header.eyebrow}
        title={data.header.title}
        intro={data.header.subtitle}
        deco={
          <div className="flex items-end gap-2.5 max-sm:scale-75">
            <span className="size-[22px] rounded-full bg-gold" />
            <span className="size-[50px] rounded-full bg-primary" />
          </div>
        }
      >
        <p className="mt-[18px] max-w-[760px] border-l-[3px] border-amber pl-4 font-serif text-[15.5px] leading-[1.7] text-pretty text-on-dark/72 italic">{data.header.intro}</p>
      </Hero>

      {tab === 'foundations' && <FoundationsView foundations={data.foundations} onNext={() => go('timeline')} />}
      {tab === 'timeline' && (
        <TreeView periods={data.periods} events={data.events} period={period} setPeriod={setPeriod} q={q} setQ={setQ} onOpen={openEvent} onQuiz={openQuiz} onNext={() => go('significance')} />
      )}
      {tab === 'significance' && <SignificanceView significance={data.significance} onQuiz={openQuiz} />}

      <EventModal event={event} period={event && data.periods.find((p) => p.id === event.periodId)} index={index} total={list.length} onClose={() => setEvId(null)} onStep={step} />
      <QuickQuizModal open={quizOpen} quiz={data.quiz} onClose={() => setQuizOpen(false)} />
    </ChapterShell>
  )
}
