import { useState } from 'react'
import { BookOpen, Check, ListTree, Video } from 'lucide-react'
import ContentBlocks, { RelatedCards } from './ContentBlocks.jsx'
import Sources from './Sources.jsx'
import VideoLibrary from './VideoLibrary.jsx'
import {
  getChapterResources, learningStorageKey, loadLearningProgress,
  saveLearningProgress, toggleCompleted,
} from './learning-progress.js'

// Resolve localStorage inside the helpers' try/catch, including blocked access.
const storage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
}

function ChapterLearning({ chapter, sections, videos, cards, userId, onOpenCard }) {
  const key = learningStorageKey(chapter.id, userId)
  const [state, setState] = useState(() => loadLearningProgress(storage, key, sections, videos))
  const { progress, error } = state
  const activeId = progress.lastSectionId || sections[0]?.id
  const readCount = progress.completedSectionIds.length
  const readPercent = sections.length ? Math.round(readCount / sections.length * 100) : 0

  function updateProgress(changes) {
    const updated = { ...progress, ...changes }
    const saveError = saveLearningProgress(storage, key, updated)
    setState({ progress: updated, error: saveError })
  }

  function goToSection(id) {
    if (!sections.some((section) => section.id === id)) return
    updateProgress({ lastSectionId: id })
    const target = document.getElementById(`content-${chapter.id}-${id}`)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }

  function selectVideo(id, scroll = false) {
    if (!videos.some((video) => video.id === id)) return
    updateProgress({ lastVideoId: id })
    if (scroll) document.getElementById('chapter-videos')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }

  return (
    <div className="mt-8 min-w-0">
      {error && <p role="alert" className="mb-5 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">{error}</p>}
      <section className="card p-6 sm:p-8" aria-labelledby="chapter-reading-title">
        <p className="eyebrow">Nội dung chương</p>
        <h2 id="chapter-reading-title" className="mt-3 text-[clamp(24px,3vw,34px)] font-extrabold leading-tight">{chapter.title}</h2>
        {chapter.overview && <p className="mt-4 text-[15.5px] leading-[1.75] text-ink-soft">{chapter.overview}</p>}
        {chapter.scopeNote && <p className="mt-3 text-sm leading-relaxed text-muted">{chapter.scopeNote}</p>}
        <Sources citations={chapter.scopeCitations} />
        {chapter.learningObjectives?.length > 0 && <div className="mt-6 rounded-2xl bg-cream p-5">
          <h3 className="flex items-center gap-2 font-bold"><BookOpen size={18} className="text-primary" aria-hidden="true" /> Mục tiêu học tập</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft marker:text-primary">{chapter.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
        </div>}
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="card min-w-0 p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <h3 className="flex items-center gap-2 font-bold"><ListTree size={18} className="text-primary" aria-hidden="true" /> Mục lục</h3>
          <p role="status" className="mt-4 text-sm text-muted">Đã đọc <strong className="text-ink">{readCount}/{sections.length}</strong> phần · {readPercent}%</p>
          <div role="progressbar" aria-label="Tiến độ đọc chương" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readPercent} className="mt-3 h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-amber transition-all motion-reduce:transition-none" style={{ width: `${readPercent}%` }} /></div>
          <nav className="mt-5 space-y-2" aria-label="Mục lục nội dung chương">{sections.map((section, index) => <button key={section.id} type="button" onClick={() => goToSection(section.id)} aria-current={activeId === section.id ? 'location' : undefined} className={`flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm leading-relaxed ${activeId === section.id ? 'bg-ink text-on-dark' : 'text-ink-soft hover:bg-paper'}`}>
            <span className="font-bold text-amber">{String(index + 1).padStart(2, '0')}</span><span className="flex-1">{section.title}</span>{progress.completedSectionIds.includes(section.id) && <Check size={16} className="mt-1 shrink-0" aria-label="Đã đọc" />}
          </button>)}</nav>
          {videos.length > 0 && <a href="#chapter-videos" className="btn btn-outline mt-5 w-full justify-center"><Video size={16} aria-hidden="true" /> Video liên quan</a>}
        </aside>

        <div className="min-w-0 space-y-6">
          {!sections.length && <p role="status" className="card p-6 text-ink-soft">Chương này chưa có nội dung bài đọc.</p>}
          {sections.map((section, index) => {
            const completed = progress.completedSectionIds.includes(section.id)
            const relatedVideos = videos.filter((video) => section.relatedVideoIds?.includes(video.id))
            return <article key={section.id} className="card min-w-0 p-6 sm:p-8" aria-labelledby={`content-${chapter.id}-${section.id}`}>
              <p className="eyebrow">Phần {String(index + 1).padStart(2, '0')}{section.estimatedReadMinutes > 0 && ` · Khoảng ${section.estimatedReadMinutes} phút đọc`}</p>
              <h3 id={`content-${chapter.id}-${section.id}`} tabIndex={-1} className="mt-3 scroll-mt-24 text-[22px] font-extrabold leading-snug tracking-[-0.01em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{section.title}</h3>
              {section.summary && <p className="mt-3 text-sm leading-relaxed text-muted">{section.summary}</p>}
              <ContentBlocks blocks={section.blocks} cards={cards} onOpenCard={onOpenCard} />
              {section.selfCheckQuestions?.length > 0 && <details className="mt-6 rounded-xl bg-paper p-4">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-ink">Câu hỏi tự kiểm tra</summary>
                <ol className="mt-3 list-decimal space-y-5 pl-5 text-sm leading-relaxed text-ink-soft">{section.selfCheckQuestions.map((item, questionIndex) => <li key={questionIndex}>
                  <p>{item.question}</p><RelatedCards ids={item.answerFlashcardIds} cards={cards} onOpenCard={onOpenCard} />
                </li>)}</ol>
              </details>}
              {section.relatedFlashcardIds?.length > 0 && <details className="mt-6 border-t border-line pt-4">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-primary">Ôn thẻ liên quan</summary>
                <RelatedCards ids={section.relatedFlashcardIds} cards={cards} onOpenCard={onOpenCard} />
              </details>}
              {relatedVideos.length > 0 && <div className="mt-5"><h4 className="text-sm font-bold">Video cho phần này</h4><div className="mt-2 flex flex-wrap gap-2">{relatedVideos.map((video) => <button key={video.id} type="button" onClick={() => selectVideo(video.id, true)} className="btn btn-outline text-left"><Video size={16} className="shrink-0 text-primary" aria-hidden="true" />{video.title}</button>)}</div></div>}
              <div className="mt-6 border-t border-line pt-5">
                <button type="button" aria-label={`${completed ? 'Bỏ đánh dấu đã đọc' : 'Đánh dấu đã đọc'}: ${section.title}`} aria-pressed={completed} onClick={() => updateProgress({ completedSectionIds: toggleCompleted(progress.completedSectionIds, section.id), lastSectionId: section.id })} className={`btn ${completed ? 'bg-success-soft text-success' : 'btn-primary'}`}><Check size={17} aria-hidden="true" />{completed ? 'Đã đọc · Bỏ đánh dấu' : 'Đã đọc phần này'}</button>
              </div>
            </article>
          })}
        </div>
      </div>

      <VideoLibrary videos={videos} selectedVideoId={progress.lastVideoId} completedVideoIds={progress.completedVideoIds} onSelectVideo={selectVideo} onToggleWatched={(id) => updateProgress({ completedVideoIds: toggleCompleted(progress.completedVideoIds, id) })} />
    </div>
  )
}

export default function ContentVideo({ data, chapterId = data.chapter?.id ?? data.metadata?.id, userId = null, onOpenCard }) {
  const { chapter, sections, videos } = getChapterResources(data, chapterId)
  if (!chapter) return <p role="alert" className="card mt-8 p-6 text-ink-soft">Không tìm thấy thông tin của chương đang chọn.</p>
  return <ChapterLearning key={learningStorageKey(chapter.id, userId)} chapter={chapter} sections={sections} videos={videos} cards={data.flashcards} userId={userId} onOpenCard={onOpenCard} />
}
