// Tìm không dấu: bỏ dấu tiếng Việt, đ → d
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

export function filterEvents(events, period, q) {
  const nq = norm(q.trim())
  return events.filter((e) => (period === 'all' || e.periodId === period) && (!nq || norm([e.title, e.shortDesc, e.location, e.date, e.tag].join(' ')).includes(nq)))
}
