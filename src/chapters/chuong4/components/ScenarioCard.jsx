// Thẻ tình huống dùng lại: tiêu đề + mô tả + câu hỏi + 4 phương án (A–D).
// Chế độ chơi: chọn phương án, mở khóa đáp án sau khi nộp.
// Chế độ ôn tập (readOnly): chỉ hiển thị, tô đúng/sai theo lựa chọn đã lưu.
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import DifficultyBadge from './DifficultyBadge.jsx'

const LETTERS = ['A', 'B', 'C', 'D']

export default function ScenarioCard({
  scenario,
  selected = null,
  onSelect,
  revealed = false,
  bookmarked = false,
  onToggleBookmark,
  difficulties,
  readOnly = false,
  questionNo,
}) {
  const canPick = !readOnly && !revealed
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card p-[22px]"
      aria-label={`Tình huống: ${scenario.title}`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        {questionNo !== undefined && (
          <span className="text-[28px] font-extrabold leading-none text-amber">{String(questionNo).padStart(2, '0')}</span>
        )}
        <h2 className="min-w-0 flex-1 text-[22px] font-extrabold tracking-[-0.01em]">{scenario.title}</h2>
        <DifficultyBadge difficulty={scenario.difficulty} difficulties={difficulties} />
        {!readOnly && onToggleBookmark && (
          <button
            onClick={() => onToggleBookmark(scenario.id)}
            aria-pressed={bookmarked}
            title={bookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu để ôn lại'}
            className={`grid size-11 place-items-center rounded-full border transition-colors ${
              bookmarked ? 'border-amber/40 bg-amber/15 text-amber' : 'border-line text-faint hover:border-line-strong hover:text-primary'
            }`}
          >
            {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>
        )}
      </div>

      <p className="mt-3 text-pretty text-[15.5px] leading-[1.65] text-ink-soft">{scenario.description}</p>
      <p className="mt-4 font-semibold text-ink">{scenario.question}</p>

      <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Phương án trả lời">
        {scenario.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = revealed && i === scenario.correctAnswer
          const isWrongPick = revealed && isSelected && i !== scenario.correctAnswer
          const base = 'flex min-h-[44px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] leading-snug transition-colors'
          const state = isCorrect
            ? 'border-success/40 bg-success-soft'
            : isWrongPick
              ? 'border-primary/40 bg-primary/10'
              : isSelected
                ? 'border-primary bg-primary/10'
                : readOnly
                  ? 'border-line bg-paper/60 text-muted'
                  : 'border-line-strong bg-white hover:border-primary/50 hover:bg-cream/60'
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!canPick}
              onClick={() => canPick && onSelect?.(i)}
              className={`${base} ${state} ${readOnly && !isCorrect && !isWrongPick ? 'opacity-75' : ''}`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg text-[12.5px] font-extrabold ${
                  isCorrect ? 'bg-success text-on-dark' : isSelected ? 'bg-primary text-on-dark' : 'bg-track text-ink-soft'
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="min-w-0">{opt}</span>
            </button>
          )
        })}
      </div>
    </motion.article>
  )
}
