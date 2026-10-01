// Hằng số dùng chung của Chương IV – Trắc nghiệm tình huống
export const STORAGE_KEY = 'hcm-chuong4-quiz'
export const EMPTY = { history: [], bookmarks: [] }

// Tab trang học bài: mặc định Scenario Quiz; tab chọn cuối được ghi nhớ
export const TAB_KEY = 'hcm-chuong4-active-tab'
export const TAB_QUIZ = 'quiz'
export const TAB_CONTENT = 'content'

export function readSavedTab() {
  try {
    return localStorage.getItem(TAB_KEY) === TAB_CONTENT ? TAB_CONTENT : TAB_QUIZ
  } catch {
    return TAB_QUIZ
  }
}

export function saveTab(tab) {
  try {
    localStorage.setItem(TAB_KEY, tab)
  } catch {
    // bỏ qua: chế độ riêng tư hoặc bộ nhớ đầy
  }
}
