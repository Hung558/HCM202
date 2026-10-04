import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useOverlay } from './overlay.js'

const EASE = [0.4, 0, 0.2, 1]

// Hộp xác nhận theo style của web (thay window.confirm). Dùng qua hook useConfirm() trong useConfirm.jsx.
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Xóa', cancelLabel = 'Hủy', onConfirm, onCancel }) {
  const cancelRef = useRef(null)
  // Esc = Hủy; focus sẵn vào "Hủy" để lỡ nhấn Enter cũng không xóa nhầm
  useOverlay(open, onCancel, cancelRef)

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4 font-sans text-ink">
          <motion.div
            className="absolute inset-0 bg-ink/55"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className="relative w-full max-w-[420px] rounded-[22px] border border-line bg-white p-7 text-center"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Trash2 className="size-6" aria-hidden="true" />
            </span>
            <h2 id="confirm-title" className="mt-4 text-[20px] leading-snug font-extrabold tracking-[-0.01em]">
              {title}
            </h2>
            {message && (
              <p id="confirm-message" className="mt-2 text-[15px] leading-[1.6] text-ink-soft">
                {message}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
              <button ref={cancelRef} type="button" onClick={onCancel} className="btn btn-outline justify-center sm:min-w-[120px]">
                {cancelLabel}
              </button>
              <button type="button" onClick={onConfirm} className="btn btn-primary justify-center sm:min-w-[120px]">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
