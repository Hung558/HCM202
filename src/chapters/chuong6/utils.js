export const TRACKER_KEY = 'hcm-chuong6-tracker'
export const READ_KEY = 'hcm-chuong6-read'
export const EMPTY = { custom: {}, log: {}, notes: {} }
export const dayKey = (d = new Date()) => d.toLocaleDateString('sv') // YYYY-MM-DD theo giờ máy
export const pad = (n) => String(n).padStart(2, '0')

export function load(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key)) }
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // trình duyệt chặn localStorage: vẫn dùng được, chỉ không lưu lại
  }
}

// Số ngày liên tiếp có ít nhất 1 việc tốt; hôm nay chưa làm thì tính từ hôm qua
export function streak(log) {
  const d = new Date()
  if (!log[dayKey(d)]?.length) d.setDate(d.getDate() - 1)
  let n = 0
  while (log[dayKey(d)]?.length) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export function lastDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d
  })
}
