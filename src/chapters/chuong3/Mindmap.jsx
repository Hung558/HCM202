import { useEffect, useState } from 'react'
import map from './data.json'
import know from './knowledge.json'
import quiz from './quiz.json'
import Knowledge from './Knowledge.jsx'
import MapView from './MapView.jsx'
import Review from './Review.jsx'
import { flatten, freshRun } from './utils.js'
import ChapterShell from '../_fun/ChapterShell.jsx'
import Hero from '../_fun/Hero.jsx'
import { award, play, say, useGame } from '../_fun/useGame.js'

// Tiến độ riêng chương III: ý ghi nhớ đã đánh dấu + ý đã xem trên sơ đồ
const KEY = 'hcm202_c3'
const ROOT = map.root.id
const nodes = flatten(map.root)
const keysTotal = know.sections.reduce((a, x) => a + x.key.length, 0)

function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { keys: p.keys ?? {}, seen: p.seen ?? { [ROOT]: true } }
  } catch {
    return { keys: {}, seen: { [ROOT]: true } }
  }
}

const TABS = [
  { id: 'knowledge', label: 'Kiến thức' },
  { id: 'mindmap', label: 'Sơ đồ tư duy' },
  { id: 'review', label: 'Ôn tập' },
]
const TAB_TIPS = {
  knowledge: 'Đọc từng phần, cuối phần có khung ghi nhớ nhanh.',
  mindmap: 'Chạm nút + để bung nhánh, chạm ý để xem nội dung.',
  review: 'Trả lời liên tiếp đúng để giữ chuỗi lửa 🔥!',
}
const TIPS = ['XP được cộng chung cho cả 6 chương.', 'Mở hết các nhánh sơ đồ để nhận XP.', 'Chuỗi đúng càng dài càng vui!']

export default function Mindmap() {
  const { earned } = useGame()
  const [tab, setTab] = useState('knowledge')
  const [prog, setProg] = useState(load)
  const [open, setOpen] = useState({})
  const [sel, setSel] = useState(ROOT)
  const [run, setRun] = useState(() => freshRun())

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prog))
    } catch {
      // không lưu được: vẫn dùng trong phiên này
    }
  }, [prog])

  function changeTab(id) {
    setTab(id)
    say(TAB_TIPS[id])
  }
  const go = (id) => {
    changeTab(id)
    window.scrollTo({ top: 0 })
  }

  function visit(id, e) {
    play('pop')
    setSel(id)
    setProg((p) => ({ ...p, seen: { ...p.seen, [id]: true } }))
    award(`c3-m-${id}`, 3, e)
  }

  const keysN = Object.values(prog.keys).filter(Boolean).length
  const seenN = nodes.filter((x) => prog.seen[x.n.id]).length
  const qDone = quiz.questions.filter((q) => earned[`c3-q-${q.id}`]).length
  const stats = [
    { v: `${keysN}/${keysTotal}`, l: 'ý ghi nhớ' },
    { v: `${seenN}/${nodes.length}`, l: 'ý trên sơ đồ' },
    { v: `${qDone}/${quiz.questions.length}`, l: 'câu đã đúng' },
  ]

  return (
    <ChapterShell num="III" tabs={TABS} tab={tab} onTab={changeTab} tips={TIPS}>
      <Hero num="III" eyebrow={know.eyebrow} title={know.title} intro={know.intro}>
        <div className="mt-[22px] flex flex-wrap gap-2.5">
          {stats.map((st) => (
            <div key={st.l} className="flex items-center gap-2.5 rounded-[18px] border border-on-dark/14 bg-on-dark/7 px-4 py-2.5">
              <span className="text-[22px] font-extrabold text-gold">{st.v}</span>
              <span className="text-[13px] font-semibold text-on-dark/80">{st.l}</span>
            </div>
          ))}
        </div>
      </Hero>

      {tab === 'knowledge' && (
        <Knowledge
          sections={know.sections}
          keys={prog.keys}
          toggleKey={(k) => setProg((p) => ({ ...p, keys: { ...p.keys, [k]: !p.keys[k] } }))}
          onMap={(i) => {
            const id = map.root.children[i]?.id ?? ROOT
            setOpen((o) => ({ ...o, [id]: true }))
            setSel(id)
            setProg((p) => ({ ...p, seen: { ...p.seen, [id]: true } }))
            go('mindmap')
          }}
          onQuiz={(i) => {
            setRun(freshRun(know.sections[i].id))
            go('review')
          }}
        />
      )}
      {tab === 'mindmap' && <MapView map={map} open={open} setOpen={setOpen} sel={sel} seen={prog.seen} onVisit={visit} />}
      {tab === 'review' && <Review questions={quiz.questions} sections={know.sections} run={run} setRun={setRun} onKnow={() => go('knowledge')} />}
    </ChapterShell>
  )
}
