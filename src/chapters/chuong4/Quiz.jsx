// Chương IV – Trắc nghiệm tình huống: component gốc điều phối toàn bộ tính năng.
// Màn hình: giới thiệu → chơi (10 câu) → kết quả → ôn tập. Dữ liệu mock từ data.json,
// sau này nối API chỉ cần thay chỗ nạp data và lưu kết quả.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, SkipForward } from 'lucide-react'
import data from './data.json'
import { analytics, pickSession, rankFor, reflectiveQuestion, summarize } from './quiz.js'
import { clearState, loadState, saveState } from './storage.js'
import Intro from './components/Intro.jsx'
import Progress from './components/Progress.jsx'
import ScenarioCard from './components/ScenarioCard.jsx'
import ExplanationModal from './components/ExplanationModal.jsx'
import Result from './components/Result.jsx'
import Review from './components/Review.jsx'

const KEY_TO_INDEX = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 }

// active: false khi panel bị ẩn (đang ở tab Kiến thức) → không bắt phím tắt.
export default function Quiz({ active = true }) {
  const [state, setState] = useState(loadState) // { history, bookmarks }
  const [screen, setScreen] = useState('intro') // intro | play | result | review
  const [session, setSession] = useState([]) // tình huống của lượt hiện tại
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [records, setRecords] = useState([]) // đáp án của lượt này
  const [summary, setSummary] = useState(null)
  const questionStart = useRef(0)

  useEffect(() => saveState(state), [state])

  const stats = useMemo(() => analytics(state, data), [state])
  const seenIds = useMemo(() => state.history.flatMap((h) => h.answers.map((a) => a.scenarioId)), [state])
  const current = session[qIndex]
  const scrollUp = () => window.scrollTo({ top: 0 })

  const start = useCallback(() => {
    setSession(pickSession(data.scenarios, data.sessionSize, seenIds))
    setQIndex(0)
    setSelected(null)
    setRevealed(false)
    setRecords([])
    setSummary(null)
    questionStart.current = Date.now()
    setScreen('play')
    scrollUp()
  }, [seenIds])

  const finish = useCallback((list) => {
    const sum = summarize(list, data.scenarios, data)
    setSummary(sum)
    setState((s) => ({
      ...s,
      history: [
        ...s.history,
        {
          sessionId: Date.now(),
          date: new Date().toISOString(),
          score: sum.score,
          accuracy: sum.accuracy,
          timeMs: sum.timeMs,
          answers: list,
          weakTopics: sum.weakTopics,
        },
      ],
    }))
    setScreen('result')
    scrollUp()
  }, [])

  const answer = useCallback(() => {
    if (!current || revealed || selected === null) return
    setRecords((r) => [
      ...r,
      { scenarioId: current.id, selectedIndex: selected, isCorrect: selected === current.correctAnswer, timeMs: Date.now() - questionStart.current },
    ])
    setRevealed(true)
  }, [current, revealed, selected])

  const skip = useCallback(() => {
    if (!current || revealed) return
    setRecords((r) => [...r, { scenarioId: current.id, selectedIndex: null, isCorrect: false, timeMs: Date.now() - questionStart.current }])
    setRevealed(true)
  }, [current, revealed])

  const next = useCallback(() => {
    if (qIndex + 1 >= session.length) {
      finish(records)
      return
    }
    setQIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
    questionStart.current = Date.now()
    scrollUp()
  }, [finish, qIndex, records, session.length])

  const quit = useCallback(() => {
    if (records.length > 0) finish(records)
    else setScreen('intro')
    scrollUp()
  }, [finish, records])

  // Bàn phím: A–D / 1–4 chọn đáp án, Enter nộp bài hoặc tiếp tục
  useEffect(() => {
    if (screen !== 'play' || !active) return
    const onKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (revealed) next()
        else answer()
        return
      }
      const k = e.key.toLowerCase()
      if (!revealed && k in KEY_TO_INDEX) setSelected(KEY_TO_INDEX[k])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, answer, next, revealed, screen])

  const toggleBookmark = useCallback((id) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id],
    }))
  }, [])

  const reset = useCallback(() => {
    if (window.confirm('Xóa toàn bộ lịch sử học tập?')) {
      clearState()
      setState({ history: [], bookmarks: [] })
      setScreen('intro')
      scrollUp()
    }
  }, [])

  return (
    <section>
      {/* Nhận diện chương + tab nằm ở header trang (Chuong4Page); ở đây chỉ còn
          nút Thoát và thanh tiến độ khi đang chơi */}
      {screen === 'play' && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Progress current={qIndex + 1} total={session.length} />
          <button onClick={quit} className="btn btn-outline !min-h-[36px] px-3 text-[12.5px]">
            <LogOut className="size-3.5" /> Thoát
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={screen + String(qIndex)}
          initial={{ opacity: 0, y: screen === 'play' ? 12 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {screen === 'intro' && (
            <Intro data={data} analytics={stats} attempts={state.history.length} onStart={start} onReset={reset} />
          )}

          {screen === 'play' && current && (
            <section className="flex flex-col gap-4">
              <ScenarioCard
                scenario={current}
                questionNo={qIndex + 1}
                selected={selected}
                onSelect={setSelected}
                revealed={revealed}
                bookmarked={state.bookmarks.includes(current.id)}
                onToggleBookmark={toggleBookmark}
                difficulties={data.difficulties}
              />
              {!revealed && (
                <div className="flex flex-wrap gap-3">
                  <button onClick={answer} disabled={selected === null} className="btn btn-primary disabled:opacity-50">
                    Nộp đáp án
                  </button>
                  <button onClick={skip} className="btn btn-outline">
                    <SkipForward className="size-4" /> Bỏ qua
                  </button>
                </div>
              )}
            </section>
          )}

          {screen === 'result' && summary && (
            <Result
              data={data}
              summary={summary}
              rank={rankFor(data, summary.score)}
              reflective={reflectiveQuestion(data, session[records.length - 1] ?? session[0])}
              attempts={state.history.length - 1}
              onPlayAgain={start}
              onReview={() => {
                setScreen('review')
                scrollUp()
              }}
            />
          )}

          {screen === 'review' && (
            <Review
              data={data}
              records={records}
              byId={new Map(data.scenarios.map((s) => [s.id, s]))}
              bookmarks={state.bookmarks}
              onToggleBookmark={toggleBookmark}
              onBack={() => {
                setScreen('result')
                scrollUp()
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {screen === 'play' && current && (
        <ExplanationModal
          open={revealed}
          isCorrect={selected === current.correctAnswer}
          correctText={current.options[current.correctAnswer]}
          explanation={current.explanation}
          referenceTopic={current.referenceTopic}
          onContinue={next}
        />
      )}
    </section>
  )
}
