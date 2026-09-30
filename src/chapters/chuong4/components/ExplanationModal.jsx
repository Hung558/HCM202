// Bảng giải thích sau khi trả lời: đúng/sai, đáp án đúng, giải thích, chủ đề tham chiếu.
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Check, Lightbulb, X } from 'lucide-react'

export default function ExplanationModal({ open, isCorrect, correctText, explanation, referenceTopic, onContinue }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 grid place-items-end bg-ink/40 p-4 backdrop-blur-[2px] sm:place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onContinue}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Giải thích đáp án"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] rounded-3xl border border-line bg-white p-[22px]"
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${isCorrect ? 'bg-success-soft text-success' : 'bg-primary/10 text-primary'}`}
              >
                {isCorrect ? <Check className="size-5" strokeWidth={3} /> : <X className="size-5" strokeWidth={3} />}
              </span>
              <div>
                <p className={`text-[17px] font-extrabold ${isCorrect ? 'text-success' : 'text-primary'}`}>
                  {isCorrect ? 'Chính xác! +10 điểm' : 'Chưa đúng rồi'}
                </p>
                {!isCorrect && correctText && (
                  <p className="text-[13.5px] text-muted">
                    Đáp án đúng: <span className="font-bold text-ink">{correctText}</span>
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 text-pretty text-[15px] leading-[1.65] text-ink-soft">{explanation}</p>

            <p className="mt-4 flex items-center gap-2 rounded-xl bg-cream px-3.5 py-2.5 text-[13px] font-semibold text-ink">
              <BookOpen className="size-4 shrink-0 text-primary" />
              Chủ đề: {referenceTopic}
            </p>

            <button onClick={onContinue} className="btn btn-primary mt-5 w-full justify-center">
              <Lightbulb className="size-4" /> Tiếp tục
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
