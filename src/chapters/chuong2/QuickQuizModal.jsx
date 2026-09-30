import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, RotateCcw, Award, ChevronRight } from 'lucide-react'

export default function QuickQuizModal({ quizData, isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // Reset khi mở lại modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0)
      setSelectedOption(null)
      setShowExplanation(false)
      setScore(0)
      setIsFinished(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Đóng khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !quizData || quizData.length === 0) return null

  const currentQ = quizData[currentIdx]

  const handleSelect = (idx) => {
    if (showExplanation) return
    setSelectedOption(idx)
    setShowExplanation(true)
    if (idx === currentQ.answer) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx < quizData.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
    } else {
      setIsFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setScore(0)
    setIsFinished(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Nền mờ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1F1B16]/60 backdrop-blur-sm"
        />

        {/* Khung nội dung Quiz */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="card relative z-10 w-full max-w-2xl bg-white p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:bg-cream hover:border-line-strong"
            aria-label="Đóng bài trắc nghiệm"
          >
            <X className="size-4" />
          </button>

          {!isFinished ? (
            <div>
              {/* Thanh tiến độ */}
              <div className="flex items-center justify-between text-xs font-bold text-muted mb-2">
                <span className="eyebrow text-xs">Ôn tập trắc nghiệm Chương II</span>
                <span>
                  Câu hỏi {currentIdx + 1} / {quizData.length}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-paper overflow-hidden mb-6 border border-line">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIdx + 1) / quizData.length) * 100}%` }}
                />
              </div>

              {/* Câu hỏi */}
              <h3 className="text-lg sm:text-xl font-bold text-ink mb-6">
                {currentQ.question}
              </h3>

              {/* Danh sách 4 đáp án */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let btnStyle = 'border-line bg-white hover:border-line-strong text-ink'
                  if (showExplanation) {
                    if (idx === currentQ.answer) {
                      btnStyle = 'border-success bg-success-soft text-ink font-semibold'
                    } else if (idx === selectedOption) {
                      btnStyle = 'border-primary bg-primary/10 text-ink'
                    } else {
                      btnStyle = 'border-line bg-paper/40 opacity-50 text-muted'
                    }
                  } else if (selectedOption === idx) {
                    btnStyle = 'border-ink bg-paper text-ink'
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-[15px] transition-all flex items-start gap-3 ${btnStyle}`}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line bg-paper text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug pt-0.5">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Phần giải thích đáp án */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-cream p-4 border border-line-strong mb-6 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    {selectedOption === currentQ.answer ? (
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle2 className="size-4" /> Chính xác!
                      </span>
                    ) : (
                      <span className="text-primary flex items-center gap-1">
                        <AlertCircle className="size-4" /> Chưa chính xác!
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}

              {/* Nút chuyển tiếp */}
              {showExplanation && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="btn btn-primary text-xs font-semibold py-2 px-5"
                  >
                    <span>
                      {currentIdx < quizData.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                    </span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Màn hình kết quả khi hoàn thành */
            <div className="text-center py-6 space-y-5">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-cream text-amber border-2 border-line-strong">
                <Award className="size-10" />
              </div>

              <div className="space-y-1">
                <span className="eyebrow text-xs">Hoàn thành bài ôn tập</span>
                <h3 className="text-2xl font-extrabold text-ink">
                  Kết quả: {score} / {quizData.length} câu đúng
                </h3>
                <p className="text-ink-soft text-sm max-w-md mx-auto pt-2">
                  {score === quizData.length
                    ? 'Xuất sắc! Bạn đã nắm vững toàn bộ các mốc lịch sử cốt lõi và nội dung tư tưởng của Chương II.'
                    : score >= Math.ceil(quizData.length / 2)
                    ? 'Rất tốt! Bạn đã nắm được phần lớn kiến thức trọng tâm của Chương II. Hãy tiếp tục ôn lại các mốc trên Trục thời gian!'
                    : 'Hãy dành thêm thời gian khám phá chi tiết các mốc trên Trục thời gian để ghi nhớ sâu sắc hơn nhé!'}
                </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="btn btn-outline text-xs font-semibold"
                >
                  <RotateCcw className="size-4" />
                  <span>Làm lại bài kiểm tra</span>
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-primary text-xs font-semibold"
                >
                  <span>Xem lại trục thời gian</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
