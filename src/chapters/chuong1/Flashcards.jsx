import { useEffect, useState } from 'react'
import data from './data.json'
import { currentTime, rateCard } from './progress.js'
import { getChapterResources, learningStorageKey, loadLearningProgress, saveLearningProgress, toggleCompleted } from './learning-progress.js'
import Reader from './Reader.jsx'
import VideoLibrary from './VideoLibrary.jsx'
import Deck from './Deck.jsx'
import Glossary from './Glossary.jsx'
import ChapterShell from '../_fun/ChapterShell.jsx'
import Hero from '../_fun/Hero.jsx'
import { burst, pt } from '../_fun/fx.js'
import { award, play, say } from '../_fun/useGame.js'

const STORAGE_KEY = `hcm202:chuong1:progress:${data.metadata.id}`
const cards = [...data.flashcards].sort((a, b) => a.order - b.order)
const categories = [...data.categories].sort((a, b) => a.order - b.order)
const { chapter, sections, videos } = getChapterResources(data)
const TABS = [...data.ui.tabs].filter((t) => t.enabled).sort((a, b) => a.order - b.order)
const LEARN_KEY = learningStorageKey(chapter.id)
const storage = { getItem: (k) => localStorage.getItem(k), setItem: (k, v) => localStorage.setItem(k, v) }

const TAB_TIPS = {
  content: 'Đọc từng phần, bấm “Đã đọc” để đánh dấu đường học.',
  videos: 'Xem video bài giảng, xong nhớ bấm Đã xem nhé.',
  flashcards: 'Lật thẻ, tự chấm mình đã thuộc chưa!',
  glossary: 'Gõ không dấu cũng tìm được thuật ngữ.',
}
const TIPS = ['XP được cộng chung cho cả 6 chương.', 'Thẻ đến hạn luôn xuất hiện trước thẻ mới.', 'Phím Space để lật thẻ đó!', 'Đọc xong mỗi phần được +10 XP.']

function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  } catch {
    return {}
  }
}

export default function Flashcards() {
  const [tab, setTab] = useState(data.ui.defaultTabId ?? TABS[0].id)
  const [progress, setProgress] = useState(loadCards)
  const [learn, setLearn] = useState(() => loadLearningProgress(storage, LEARN_KEY, sections, videos))
  const [now, setNow] = useState(() => Date.now())
  const [deck, setDeck] = useState({ cat: 'all', focus: [], early: false, done: [], cur: null, flip: false })
  const [playing, setPlaying] = useState(null)
  const [termId, setTermId] = useState(null)
  const [storageError, setStorageError] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const lp = learn.progress
  const updateLearn = (changes) => {
    const next = { ...lp, ...changes }
    setLearn({ progress: next, error: saveLearningProgress(storage, LEARN_KEY, next) })
  }

  function changeTab(id) {
    setTab(id)
    setDeck((d) => ({ ...d, flip: false }))
    say(TAB_TIPS[id] ?? '')
  }

  function openCards(ids, label) {
    const valid = ids.filter((id) => cards.some((c) => c.id === id))
    if (!valid.length) return
    setDeck({ cat: 'focus', focus: valid, early: true, done: [], cur: valid[0], flip: false })
    setTab('flashcards')
    say(`Ôn ${valid.length} thẻ: ${label}.`)
    window.scrollTo({ top: 0 })
  }

  function rate(id, action) {
    const at = currentTime()
    const updated = rateCard(progress, id, action, at, data.reviewConfig)
    setProgress(updated)
    setNow(at)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      setStorageError('Trình duyệt không lưu được tiến độ. Các lựa chọn ôn tập có thể mất khi tải lại trang.')
    }
  }

  function toggleRead(id, e) {
    const done = lp.completedSectionIds.includes(id)
    updateLearn({ completedSectionIds: toggleCompleted(lp.completedSectionIds, id), lastSectionId: id })
    if (done) return
    play('ok')
    award(`c1-r-${id}`, 10, e)
    const p = pt(e)
    burst(p.x, p.y, 24)
    const n = sections.filter((s) => s.id === id || lp.completedSectionIds.includes(s.id)).length
    if (n === sections.length) {
      play('win')
      say('Bạn đã đi hết đường học. Tuyệt vời!')
    } else say(`Xong phần ${sections.findIndex((s) => s.id === id) + 1}! Sang phần tiếp nào.`)
  }

  function toggleWatched(id, e) {
    const done = lp.completedVideoIds.includes(id)
    updateLearn({ completedVideoIds: toggleCompleted(lp.completedVideoIds, id), lastVideoId: id })
    if (done) return
    play('ok')
    award(`c1-v-${id}`, 15, e)
    say('Đã xem xong một video. Giỏi lắm!')
  }

  // Nhiệm vụ của chương tự đánh dấu theo tiến độ
  const nRead = lp.completedSectionIds.length
  const nKnown = cards.filter((c) => progress[c.id]?.status === 'reviewing').length
  const objDone = [nRead >= 2, nRead >= 5, nRead === sections.length, lp.completedVideoIds.length > 0 && nKnown >= 5]

  return (
    <ChapterShell num="I" tabs={TABS} tab={tab} onTab={changeTab} tips={TIPS}>
      <Hero
        num="I"
        eyebrow="Chương I · Nhập môn"
        title={chapter.title}
        intro={chapter.overview}
        aside={
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-[12px] font-bold tracking-[.12em] text-on-dark/60 uppercase">Nhiệm vụ của chương · {chapter.estimatedReadMinutes} phút đọc</p>
            {chapter.learningObjectives.map((t, i) => (
              <div key={t} className="flex items-center gap-3 rounded-2xl border border-on-dark/12 bg-on-dark/6 px-3.5 py-3">
                <span
                  className={`grid size-[30px] shrink-0 place-items-center rounded-full text-[13px] font-extrabold transition-all duration-300 ${
                    objDone[i] ? 'bg-success text-on-dark' : 'bg-on-dark/12 text-gold'
                  }`}
                  aria-label={objDone[i] ? 'Đã xong' : `Nhiệm vụ ${i + 1}`}
                >
                  {objDone[i] ? '✓' : i + 1}
                </span>
                <span className="text-[14px] leading-[1.45] font-medium">{t}</span>
              </div>
            ))}
          </div>
        }
      />

      {(learn.error || storageError) && <p role="alert" className="mt-5 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">{learn.error || storageError}</p>}

      {tab === 'content' && (
        <Reader
          ui={data.ui.content}
          sections={sections}
          cards={cards}
          activeId={lp.lastSectionId ?? sections[0].id}
          readIds={lp.completedSectionIds}
          onSelect={(id) => updateLearn({ lastSectionId: id })}
          onToggleRead={toggleRead}
          onOpenCards={openCards}
          onWatch={(id) => {
            setPlaying(id)
            changeTab('videos')
            window.scrollTo({ top: 0 })
          }}
        />
      )}
      {tab === 'videos' && (
        <VideoLibrary
          videos={videos}
          sections={sections}
          ui={data.ui.videos}
          watchedIds={lp.completedVideoIds}
          playingId={playing}
          onPlay={(id) => {
            play('tap')
            setPlaying(id)
            updateLearn({ lastVideoId: id })
          }}
          onToggleWatched={toggleWatched}
        />
      )}
      {tab === 'flashcards' && (
        <Deck cards={cards} categories={categories} reviewConfig={data.reviewConfig} progress={progress} now={now} deck={deck} setDeck={setDeck} onRate={rate} />
      )}
      {tab === 'glossary' && <Glossary glossary={data.glossary} termId={termId} onTerm={setTermId} onOpenCards={openCards} />}
    </ChapterShell>
  )
}
