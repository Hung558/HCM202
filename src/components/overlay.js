import { useEffect } from 'react'

const LEAVE_MS = 200

// Chuyển trang mượt: gọi close() để đóng bảng/sách, làm mờ trang hiện tại rồi mới chuyển;
// trang mới tự hiện dần (index.css).
export function leaveTo(e, href, close) {
  // giữ hành vi mặc định khi mở tab mới (Ctrl/Cmd/Shift/chuột giữa)
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  close()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    location.href = href
    return
  }
  const fade = document.getElementById('root')?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: LEAVE_MS,
    easing: 'ease-in',
    fill: 'forwards',
  })
  // bấm Back quay lại (trang lấy từ bfcache) thì bỏ trạng thái mờ
  window.addEventListener('pageshow', () => fade?.cancel(), { once: true })
  setTimeout(() => (location.href = href), LEAVE_MS)
}

// Khi hộp đang mở: khóa cuộn trang, Esc để đóng, đưa focus vào nút đóng.
export function useOverlay(open, close, focusRef) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    focusRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, focusRef])
}
