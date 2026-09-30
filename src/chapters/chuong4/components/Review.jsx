// Chế độ ôn tập: xem lại từng câu của lượt vừa chơi —
// tình huống, đáp án đã chọn, đáp án đúng, giải thích, chủ đề tham chiếu.
import { motion } from 'framer-motion'

import { ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react'
const LETTERS = ['A', 'B', 'C', 'D']
function AnswerLine({ record, scenario }) {
  const correct = scenario.options[scenario.correctAnswer]
  const picked = record.selectedIndex === null ? null : scenario.options[record.selectedIndex]
  return (
    <div className="mt-3 grid gap-2">
      <p className="text-[13.5px]">
        <span className="font-bold text-muted">Bạn chọn: </span>
        {picked === null ? (
          <span className="font-semibold text-muted">Bỏ qua</span>
        ) : record.isCorrect ? (
          <span className="font-semibold text-success">{LETTERS[record.selectedIndex]}. {picked}</span>
        ) : (
          <span className="font-semibold text-primary">{LETTERS[record.selectedIndex]}. {picked}</span>
        )}
      </p>
      <p className="text-[13.5px]">
        <span className="font-bold text-muted">Đáp án đúng: </span>
        <span className="font-semibold text-success">{LETTERS[scenario.correctAnswer]}. {correct}</span>
      </p>
      <p className="rounded-xl bg-cream px-4 py-3 text-pretty text-[14px] leading-[1.6] text-ink-soft">{scenario.explanation}</p>
      <p className="text-[13px] font-semibold text-primary">Chủ đề tham chiếu: {scenario.referenceTopic}</p>
    </div>
  )
}
export default function Review({ data, records, byId, bookmarks, onToggleBookmark, onBack }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[clamp(24px,3.4vw,36px)] font-extrabold tracking-[-0.02em]">Ôn tập từng câu</h1>
        <button onClick={onBack} className="btn btn-outline">
          <ArrowLeft className="size-4" /> Về kết quả
        </button>
      </div>
      {records.map((rec, i) => {
        const sc = byId.get(rec.scenarioId)
        if (!sc) return null
        const marked = bookmarks.includes(sc.id)
        return (
          <motion.article
            key={rec.scenarioId}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-[22px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Câu {String(i + 1).padStart(2, '0')} · {data.difficulties[sc.difficulty]?.label ?? ''}</p>
                <h2 className="mt-1.5 text-[19px] font-extrabold tracking-[-0.01em]">{sc.title}</h2>
              </div>
              <button
                onClick={() => onToggleBookmark(sc.id)}
                aria-pressed={marked}
                title={marked ? 'Bỏ đánh dấu' : 'Đánh dấu để ôn lại'}
                className={`grid size-11 shrink-0 place-items-center rounded-full border transition-colors ${
                  marked ? 'border-amber/40 bg-amber/15 text-amber' : 'border-line text-faint hover:border-line-strong hover:text-primary'
                }`}
              >
                {marked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
              </button>
            </div>
            <p className="mt-2.5 text-pretty text-[14.5px] leading-[1.65] text-ink-soft">{sc.description}</p>
            <p className="mt-3 text-[14.5px] font-semibold text-ink">{sc.question}</p>
            <AnswerLine record={rec} scenario={sc} />
          </motion.article>
        )
      })}
    </section>
  )
}
