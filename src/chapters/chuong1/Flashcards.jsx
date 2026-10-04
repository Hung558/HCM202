import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Check, Clock3, Layers3, RotateCcw, Search, Video } from 'lucide-react'
import data from './data.json'
import { currentTime, getStudyQueue, normalizeSearch, rateCard } from './progress.js'
import ContentVideoTab from './ContentVideoTab.jsx'
import Sources from './Sources.jsx'
import ChapterTabBar from '../../components/ChapterTabBar.jsx'
import styles from './Flashcards.module.css'

const STORAGE_KEY = `hcm202:chuong1:progress:${data.metadata.id}`
const cards = [...data.flashcards].sort((a, b) => a.order - b.order)
const categories = [...data.categories].sort((a, b) => a.order - b.order)

const TABS = [
  { id: 'content-video', label: 'Nội dung & Video', icon: Video },
  { id: 'cards', label: 'Thẻ ghi nhớ', icon: Layers3 },
  { id: 'dictionary', label: 'Từ điển thuật ngữ', icon: BookOpen },
]

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  } catch {
    return {}
  }
}

function formatReviewTime(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
  }).format(new Date(value))
}

export default function Flashcards() {
  const [tab, setTab] = useState('content-video')
  const [categoryId, setCategoryId] = useState('all')
  const [progress, setProgress] = useState(loadProgress)
  const [now, setNow] = useState(() => Date.now())
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedTermId, setSelectedTermId] = useState(null)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const visibleCards = categoryId === 'all' ? cards : cards.filter((card) => card.categoryId === categoryId)
  const queue = getStudyQueue(visibleCards, progress, now)
  const activeCard = visibleCards.find((card) => card.id === selectedCardId) || queue[0]
  const reviewedCount = cards.filter((card) => progress[card.id]?.reviewCount > 0).length
  const newCount = visibleCards.filter((card) => !progress[card.id]?.reviewCount).length
  const dueCount = queue.length - newCount
  const futureReviews = visibleCards.map((card) => progress[card.id]?.nextReviewAt)
    .filter((value) => value && new Date(value).getTime() > now)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  const selectedTerm = data.glossary.find((term) => term.id === selectedTermId)
  const search = normalizeSearch(query)
  const filteredTerms = [...data.glossary]
    .filter((term) => !search || normalizeSearch([term.term, ...term.aliases, term.definition, term.searchText].join(' ')).includes(search))
    .sort((a, b) => a.term.localeCompare(b.term, 'vi'))

  function selectCategory(id) {
    setCategoryId(id)
    setSelectedCardId(null)
    setFlipped(false)
  }

  function rate(action) {
    if (!activeCard || !flipped) return
    const ratedAt = currentTime()
    const updated = rateCard(progress, activeCard.id, action, ratedAt, data.reviewConfig)
    setProgress(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      setStorageError(true)
    }
    setSelectedCardId(null)
    setFlipped(false)
    setNow(ratedAt)
  }

  function skipCard() {
    const index = queue.findIndex((card) => card.id === activeCard?.id)
    setSelectedCardId(queue[(index + 1) % queue.length].id)
    setFlipped(false)
  }

  function openCard(id) {
    setCategoryId('all')
    setSelectedCardId(id)
    setFlipped(false)
    setTab('cards')
    window.requestAnimationFrame(() => {
      const target = document.querySelector('#study-card button')
      target?.focus({ preventScroll: true })
      target?.scrollIntoView({ block: 'center' })
    })
  }

  return (
    <div className="min-h-screen">
      <nav aria-label="Điều hướng chương I" className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
          <a href="/" title="Về trang chủ" className="flex items-center gap-2.5 text-ink">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-dark">I</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold">Chương I</span>
              <span className="text-xs text-muted">Tư tưởng Hồ Chí Minh</span>
            </span>
          </a>
          <ChapterTabBar tabs={TABS} value={tab} onChange={setTab} label="Nội dung chương I" />
        </div>
      </nav>

      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <p className="eyebrow">Chương I · Học và ôn tập</p>
            <h1 className="mt-3 max-w-[760px] text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">Thẻ ghi nhớ &amp; từ điển thuật ngữ</h1>
            <p className="mt-5 max-w-[690px] text-[15.5px] leading-[1.65] text-ink-soft">Nắm vững khái niệm, cơ sở hình thành tư tưởng Hồ Chí Minh và các mốc nhận thức của Đảng qua từng Đại hội.</p>
          </div>
          <div className="card p-[22px]">
            <div className="flex items-center justify-between text-sm text-muted"><span>Đã học lần đầu</span><span className="font-bold text-ink">{reviewedCount}/{cards.length} thẻ</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-track" role="progressbar" aria-label="Tiến độ học thẻ lần đầu" aria-valuenow={reviewedCount} aria-valuemin={0} aria-valuemax={cards.length}>
              <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${reviewedCount / cards.length * 100}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted">{data.glossary.length} thuật ngữ để tra cứu</p>
          </div>
        </div>


        {storageError && <p role="alert" className="mt-5 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">Trình duyệt không lưu được tiến độ. Các lựa chọn ôn tập có thể mất khi tải lại trang.</p>}

        {tab === 'cards' ? (
          <section className="mt-8" aria-label="Bộ thẻ ghi nhớ">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Lật thẻ · Tự đánh giá</p>
                <h2 className="mt-2 text-[26px] font-extrabold">Học theo nhịp của bạn</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">Thẻ đến hạn xuất hiện trước thẻ mới. Chọn “Cần ôn lại” để gặp lại thẻ sau {data.reviewConfig.againIntervalMinutes} phút.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-white px-4 py-2 text-ink-soft">{dueCount} đến hạn</span>
                <span className="rounded-full bg-white px-4 py-2 text-ink-soft">{newCount} thẻ mới</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2" aria-label="Lọc thẻ theo chủ đề">
              <button type="button" onClick={() => selectCategory('all')} aria-pressed={categoryId === 'all'} className={`btn ${categoryId === 'all' ? 'btn-dark' : 'btn-outline bg-white'}`}>Tất cả</button>
              {categories.map((category) => <button key={category.id} type="button" onClick={() => selectCategory(category.id)} aria-pressed={categoryId === category.id} className={`btn ${categoryId === category.id ? 'btn-dark' : 'btn-outline bg-white'}`}>{category.name}</button>)}
            </div>

            {activeCard ? (
              <div id="study-card" className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                    <span>{categories.find((item) => item.id === activeCard.categoryId)?.name}</span>
                    <span>{progress[activeCard.id]?.reviewCount ? 'Thẻ ôn tập' : 'Thẻ mới'} · {String(activeCard.order).padStart(2, '0')}/{cards.length}</span>
                  </div>
                  <button type="button" onClick={() => setFlipped((value) => !value)} aria-label={flipped ? `Giải thích: ${activeCard.back}. Nhấn để xem lại thuật ngữ.` : `Lật thẻ: ${activeCard.front}`} aria-pressed={flipped} className={`${styles.flipScene} block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
                    <span className={`${styles.flipInner} ${flipped ? styles.flipped : ''}`}>
                      <span className={`${styles.face} bg-ink text-on-dark`} aria-hidden={flipped}>
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Mặt trước · Thuật ngữ</span>
                        <span className="mt-6 block max-w-[650px] text-[clamp(25px,3.5vw,38px)] font-extrabold leading-tight">{activeCard.front}</span>
                        <span className="mt-auto inline-flex items-center gap-2 text-sm text-on-dark/80"><RotateCcw size={16} /> Chạm để lật thẻ</span>
                      </span>
                      <span className={`${styles.face} ${styles.back} border border-line bg-white text-ink`} aria-hidden={!flipped}>
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mặt sau · Giải thích</span>
                        <span className="mt-5 block max-w-[700px] text-[clamp(18px,2.3vw,25px)] font-semibold leading-relaxed">{activeCard.back}</span>
                        <span className="mt-auto inline-flex items-center gap-2 text-sm text-muted"><RotateCcw size={16} /> Chạm để xem mặt trước</span>
                      </span>
                    </span>
                  </button>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {flipped ? <>
                      <button type="button" onClick={() => rate('again')} className="btn btn-outline bg-white"><RotateCcw size={17} /> Cần ôn lại</button>
                      <button type="button" onClick={() => rate('known')} className="btn btn-primary"><Check size={17} /> Đã thuộc</button>
                    </> : <p className="text-sm text-muted">Lật thẻ để xem lời giải rồi tự đánh giá.</p>}
                    {queue.length > 1 && <button type="button" onClick={skipCard} className="btn ml-auto text-ink-soft hover:bg-white">Thẻ tiếp theo <ArrowRight size={17} /></button>}
                  </div>
                  {flipped && <Sources citations={activeCard.citations} />}
                </div>
                <aside className="space-y-4">
                  <div className="card p-[22px]">
                    <Clock3 size={22} className="text-primary" />
                    <h3 className="mt-3 text-[20px] font-extrabold">Lịch ôn tự động</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">“Đã thuộc” hẹn lại theo các mốc {data.reviewConfig.knownIntervalsDays.join(' · ')} ngày. “Cần ôn lại” hẹn sau {data.reviewConfig.againIntervalMinutes} phút.</p>
                    {futureReviews.length > 0 && <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">Lượt ôn sắp tới: <strong className="text-ink">{formatReviewTime(futureReviews[0])}</strong></p>}
                  </div>
                  {activeCard.glossaryIds?.length > 0 && <div className="card p-[22px]">
                    <h3 className="font-bold">Thuật ngữ liên quan</h3>
                    <div className="mt-3 flex flex-wrap gap-2">{activeCard.glossaryIds.map((id) => {
                      const term = data.glossary.find((item) => item.id === id)
                      return term && <button key={id} type="button" onClick={() => { setSelectedTermId(id); setTab('dictionary') }} className="rounded-full border border-line-strong px-3 py-2 text-sm text-ink-soft hover:bg-cream">{term.term}</button>
                    })}</div>
                  </div>}
                </aside>
              </div>
            ) : <div className="card mt-7 p-8 text-center sm:p-12">
              <Check size={34} className="mx-auto text-success" />
              <h3 className="mt-4 text-[24px] font-extrabold">Đã hoàn thành lượt học hiện tại</h3>
              <p className="mx-auto mt-3 max-w-[530px] text-ink-soft">Các thẻ trong chủ đề này đã được lên lịch. Quay lại khi đến hạn để tiếp tục ôn tập.</p>
              {futureReviews.length > 0 && <p className="mt-4 text-sm font-semibold text-primary">Lượt ôn tiếp theo: {formatReviewTime(futureReviews[0])}</p>}
            </div>}
          </section>
        ) : tab === 'content-video' ? (
          <ContentVideoTab data={data} onOpenCard={openCard} />
        ) : (
          <section className="mt-8" aria-label="Từ điển thuật ngữ">
            <p className="eyebrow">Tra cứu nhanh</p>
            <h2 className="mt-2 text-[26px] font-extrabold">Từ điển thuật ngữ</h2>
            <p className="mt-2 text-sm text-ink-soft">Tìm theo tên, tên gọi khác hoặc nội dung giải thích. Có thể nhập không dấu.</p>
            <label className="mt-6 flex max-w-[620px] items-center gap-3 rounded-xl border border-line-strong bg-white px-4 focus-within:border-primary">
              <Search size={20} className="shrink-0 text-muted" /><span className="sr-only">Tìm thuật ngữ</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: chủ nghĩa Mác - Lênin, Đại hội VII..." className="min-h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint" />
            </label>
            <p className="mt-3 text-sm text-muted">{filteredTerms.length} thuật ngữ</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-start">
              <div className="grid gap-3">
                {filteredTerms.length ? filteredTerms.map((term) => <button key={term.id} type="button" onClick={() => setSelectedTermId(term.id)} aria-pressed={selectedTermId === term.id} className={`card p-5 text-left transition-colors hover:border-primary ${selectedTermId === term.id ? 'border-primary bg-cream' : ''}`}>
                  <span className="flex items-center justify-between gap-3 font-bold text-ink">{term.term}<ArrowRight size={17} className="shrink-0 text-primary" /></span>
                  <span className="mt-2 block text-sm leading-relaxed text-ink-soft">{term.definition}</span>
                </button>) : <div className="card p-7 text-ink-soft">Không tìm thấy thuật ngữ phù hợp. Thử một từ khóa khác.</div>}
              </div>
              <aside className="card p-[22px] lg:sticky lg:top-24">
                {selectedTerm ? <>
                  <p className="eyebrow">Giải nghĩa</p><h3 className="mt-2 text-[22px] font-extrabold">{selectedTerm.term}</h3>
                  {selectedTerm.aliases.length > 0 && <p className="mt-2 text-sm text-muted">Tên gọi khác: {selectedTerm.aliases.join(', ')}</p>}
                  <p className="mt-5 text-[15.5px] leading-[1.65] text-ink-soft">{selectedTerm.definition}</p>
                  {selectedTerm.relatedTermIds.length > 0 && <div className="mt-6"><h4 className="text-sm font-bold">Thuật ngữ liên quan</h4><div className="mt-2 flex flex-wrap gap-2">{selectedTerm.relatedTermIds.map((id) => {
                    const term = data.glossary.find((item) => item.id === id)
                    return term && <button type="button" key={id} onClick={() => setSelectedTermId(id)} className="rounded-full border border-line-strong px-3 py-2 text-sm text-ink-soft hover:bg-cream">{term.term}</button>
                  })}</div></div>}
                  {selectedTerm.relatedFlashcardIds.length > 0 && <div className="mt-6"><h4 className="text-sm font-bold">Ôn bằng thẻ</h4><div className="mt-2 space-y-2">{selectedTerm.relatedFlashcardIds.map((id) => {
                    const card = cards.find((item) => item.id === id)
                    return card && <button type="button" key={id} onClick={() => openCard(id)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-cream px-4 py-3 text-left text-sm font-semibold text-ink hover:bg-track">{card.front}<ArrowRight size={16} className="shrink-0 text-primary" /></button>
                  })}</div></div>}
                  <Sources citations={selectedTerm.citations} />
                </> : <div className="py-8 text-center text-ink-soft"><BookOpen size={30} className="mx-auto text-primary" /><p className="mt-3">Chọn một thuật ngữ để xem liên hệ với thẻ ghi nhớ và nguồn tham khảo.</p></div>}
              </aside>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
