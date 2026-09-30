// Lưu trạng thái học dài hạn (lịch sử lượt chơi + đánh dấu câu) vào localStorage.
// Trình duyệt chặn localStorage thì app vẫn chạy, chỉ là không lưu lại.
import { EMPTY, STORAGE_KEY } from './constants.js'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    return {
      history: Array.isArray(parsed.history) ? parsed.history : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // bỏ qua: chế độ riêng tư hoặc bộ nhớ đầy
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // bỏ qua
  }
}
