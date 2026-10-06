import { forwardRef, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useOverlay } from '../../components/overlay.js'

// Hộp nổi giữa màn hình: nền mờ, Esc / bấm nền để đóng, khoá cuộn trang, focus vào nút ×.
// ref trỏ vào khung trắng (để rung khi trả lời sai...).
const Modal = forwardRef(function Modal({ open, onClose, label, width = 760, closeClass = 'bg-on-dark', children }, ref) {
  const closeRef = useRef(null)
  useOverlay(open, onClose, closeRef)

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 font-sans text-ink" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-ink/55 backdrop-blur-[4px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={ref}
            className="relative max-h-[92vh] w-full overflow-auto rounded-[28px] bg-white"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.3, 1.2, 0.4, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className={`absolute top-3.5 right-3.5 z-[2] grid size-11 place-items-center rounded-full text-[22px] text-ink ${closeClass}`}
            >
              ×
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
})

export default Modal
