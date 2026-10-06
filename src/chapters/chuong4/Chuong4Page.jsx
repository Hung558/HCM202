import { useEffect, useMemo, useState } from 'react'
import data from './data.json'
import raw from './Chương IV.txt?raw'
import { parseChapter } from './contentParser.js'
import { checkAchievements, pickSession, summarize } from './quiz.js'
import { loadState, saveState } from './storage.js'
import Content from './Content.jsx'
import Quiz from './Quiz.jsx'
import ChapterShell from '../_fun/ChapterShell.jsx'
import Hero from '../_fun/Hero.jsx'
import { burst, pt } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

const doc = parseChapter(raw)
const byId = new Map(data.scenarios.map((s) => [s.id, s]))
// Điểm hiển thị = điểm hồ sơ + thưởng chuỗi 3 câu (trường xp của summarize)
const scoreOf = (records) => summarize(records, data.scenarios, data).xp

// Mỗi "đơn vị" đọc là một item có nội dung riêng, hoặc một mục con của item
const units = doc.sections.flatMap((sec, si) =>
  sec.items.flatMap((it) => [
    ...(it.paragraphs.length ? [{ id: it.id, si, sec, marker: it.marker, title: it.title, parent: null, paragraphs: it.paragraphs }] : []),
    ...it.children.map((c) => ({ id: c.id, si, sec, marker: c.marker, title: c.title, parent: `${it.marker ?? ''} ${it.title}`, paragraphs: c.paragraphs })),
  ]),
)

// Mục đã đọc (riêng chương IV); lịch sử lượt chơi giữ nguyên key cũ trong storage.js
const READ_KEY = 'hcm202_c4'
const loadRead = () => {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '{}').read ?? []
  } catch {
    return []
  }
}

const TABS = [
  { id: 'content', label: 'Kiến thức' },
  { id: 'quiz', label: 'Trắc nghiệm tình huống' },
]
const TAB_TIPS = { content: 'Đọc từng mục, bấm “Đã đọc” để tô xanh mục lục.', quiz: 'Mỗi hồ sơ là một tình huống thật. Chọn cách xử lý đúng nhé!' }
const TIPS = ['XP được cộng chung cho cả 6 chương.', 'Đúng 3 câu liên tiếp được cộng điểm thưởng!', 'Mỗi lượt chọn hồ sơ chưa gặp trước.']
const IDLE = { phase: 'intro', session: [], qi: 0, pick: null, records: [], t0: 0, t1: 0, qStart: 0 }

export default function Chuong4Page() {
  const [tab, setTab] = useState('content')
  const [ui, setUi] = useState(0)
  const [read, setRead] = useState(loadRead)
  const [store, setStore] = useState(loadState) // { history, bookmarks }
  const [run, setRun] = useState(IDLE)

  useEffect(() => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify({ read }))
    } catch {
      // không lưu được: vẫn dùng trong phiên này
    }
  }, [read])
  useEffect(() => saveState(store), [store])

  const sum = summarize(run.records, data.scenarios, data)
  const everBadges = useMemo(() => {
    const out = {}
    for (const h of store.history) for (const { badge, earned } of checkAchievements(data.badges, h.answers, byId, scoreOf(h.answers))) if (earned) out[badge.id] = true
    return out
  }, [store.history])

  function changeTab(id) {
    setTab(id)
    say(TAB_TIPS[id])
  }

  // pool: bộ tình huống theo chủ đề (từ "Luyện ngay"); không có thì ưu tiên hồ sơ chưa gặp
  function start(pool) {
    const seen = store.history.flatMap((h) => h.answers.map((a) => a.scenarioId))
    const session = pickSession(pool ?? data.scenarios, data.sessionSize, pool ? [] : seen)
    const now = Date.now()
    setRun({ ...IDLE, phase: 'play', session, t0: now, qStart: now })
    setTab('quiz')
    play('stamp')
    say('Mở hồ sơ số 1. Đọc kỹ tình huống nhé!')
    window.scrollTo({ top: 0 })
  }

  function pick(i, e) {
    const sc = run.session[run.qi]
    if (run.pick !== null) return
    const rec = { scenarioId: sc.id, selectedIndex: i, isCorrect: i === sc.correctAnswer, timeMs: Date.now() - run.qStart }
    const records = [...run.records, rec]
    setRun((r) => ({ ...r, pick: i, records }))
    if (!rec.isCorrect) {
      play('bad')
      say('Chưa đúng. Đọc giải thích và câu hỏi gợi mở nhé.')
      return
    }
    let streak = 0
    for (let k = records.length - 1; k >= 0 && records[k].isCorrect; k--) streak++
    const bonus = streak % 3 === 0
    play('ok')
    const p = pt(e)
    burst(p.x, p.y, 24 + (bonus ? 30 : 0))
    award(`c4-sc-${sc.id}`, 15, e)
    say(bonus ? 'Chuỗi 3 câu! Điểm thưởng 🔥' : `Xử lý chuẩn! +${sc.points} điểm.`)
  }

  function next() {
    if (run.qi + 1 < run.session.length) {
      play('stamp')
      setRun((r) => ({ ...r, qi: r.qi + 1, pick: null, qStart: Date.now() }))
      return
    }
    const s = summarize(run.records, data.scenarios, data)
    setRun((r) => ({ ...r, phase: 'done', t1: Date.now() }))
    setStore((st) => ({
      ...st,
      history: [...st.history, { sessionId: Date.now(), date: new Date().toISOString(), score: s.score, accuracy: s.accuracy, timeMs: s.timeMs, answers: run.records, weakTopics: s.weakTopics }],
    }))
    play('win')
    setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 3, 70), 100)
    window.scrollTo({ top: 0 })
  }

  return (
    <ChapterShell num="IV" tabs={TABS} tab={tab} onTab={changeTab} tips={TIPS}>
      <Hero num="IV" eyebrow={`Chương IV · ${data.feature}`} title={data.title}>
        {doc.intro?.bullets?.length > 0 && (
          <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-2.5">
            {doc.intro.bullets.map((b) => (
              <div key={b.label} className="rounded-[18px] border border-on-dark/12 bg-on-dark/6 px-4 py-3.5">
                <p className="text-[12px] font-extrabold tracking-[.1em] text-gold uppercase">{b.label}</p>
                <p className="mt-1.5 text-[13.5px] leading-[1.55] text-on-dark/82">{b.text}</p>
              </div>
            ))}
          </div>
        )}
      </Hero>

      {tab === 'content' && <Content doc={doc} units={units} scenarios={data.scenarios} ui={ui} setUi={setUi} read={read} setRead={setRead} onPractice={start} />}
      {tab === 'quiz' && (
        <Quiz data={data} run={run} sum={sum} everBadges={everBadges} hasHistory={store.history.length > 0} onStart={start} onPick={pick} onNext={next} onKnow={() => (changeTab('content'), window.scrollTo({ top: 0 }))} />
      )}
    </ChapterShell>
  )
}
