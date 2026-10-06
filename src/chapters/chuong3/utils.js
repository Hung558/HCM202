// Duỗi cây sơ đồ thành danh sách { n: nút, lv: cấp } (0 = tâm, 1 = nhánh lớn, 2 = ý nhỏ)
export function flatten(root) {
  const all = []
  const walk = (n, lv) => {
    all.push({ n, lv })
    n.children?.forEach((c) => walk(c, lv + 1))
  }
  walk(root, 0)
  return all
}

// Lượt ôn tập mới (lọc theo phần `filter`, 'all' = toàn chương)
export const freshRun = (filter = 'all') => ({ filter, qi: 0, pick: null, streak: 0, best: 0, answers: [], done: false })
