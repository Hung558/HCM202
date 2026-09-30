// Logic thuần của Trắc nghiệm tình huống: chấm điểm, XP chuỗi đúng, phân tích chủ đề, huy hiệu.
// Tách khỏi React để dễ kiểm thử và sau này nối API.
// Kiểu dữ liệu tham khảo: Scenario, AnswerRecord, SessionSummary, Badge, QuizData (xem types.ts)

export const BASE_POINTS = 10
export const STREAK_BONUS_XP = 25 // thưởng thêm mỗi khi đạt chuỗi 3 câu đúng liên tiếp
export const STREAK_LENGTH = 3

export const formatTime = (ms) => {
  const s = Math.round(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// Chấm điểm + phân tích một lượt chơi
export const summarize = (records, scenarios, data) => {
  const byId = new Map(scenarios.map((s) => [s.id, s]))
  const stats = new Map() // referenceTopic -> { total, correct }
  let score = 0
  let xp = 0
  let correct = 0
  let skipped = 0
  let streak = 0
  let bestStreak = 0
  let timeMs = 0

  for (const rec of records) {
    const sc = byId.get(rec.scenarioId)
    if (!sc) continue
    timeMs += rec.timeMs
    const topic = sc.referenceTopic
    const entry = stats.get(topic) ?? { total: 0, correct: 0 }
    entry.total += 1

    if (rec.isCorrect) {
      correct += 1
      streak += 1
      bestStreak = Math.max(bestStreak, streak)
      score += sc.points
      xp += sc.points
      if (streak % STREAK_LENGTH === 0) xp += STREAK_BONUS_XP
    } else {
      streak = 0
      if (rec.selectedIndex === null) skipped += 1
    }
    entry.correct += rec.isCorrect ? 1 : 0
    stats.set(topic, entry)
  }

  const answered = records.length - skipped
  const topicStats = [...stats.entries()]
    .map(([topic, s]) => ({ topic, ...s }))
    .sort((a, b) => a.topic.localeCompare(b.topic, 'vi'))
  const played = topicStats.filter((t) => t.total > 0)
  const strongTopics = played.filter((t) => t.correct / t.total >= 0.8).map((t) => t.topic)
  const weakTopics = played
    .filter((t) => t.correct / t.total < 0.6)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .map((t) => t.topic)

  return {
    score,
    answered,
    correct,
    skipped,
    accuracy: records.length ? Math.round((correct / records.length) * 100) : 0,
    timeMs,
    bestStreak,
    xp,
    topicStats,
    strongTopics,
    weakTopics,
    achievements: checkAchievements(data.badges, records, byId, score),
  }
}

export const rankFor = (data, score) => data.ranks.findLast((r) => score >= r.minScore)?.name ?? data.ranks[0].name

export const checkAchievements = (badges, records, byId, score) => {
  const topicCorrect = new Map() // referenceTopic -> số câu đúng
  let allCorrect = true
  for (const rec of records) {
    const sc = byId.get(rec.scenarioId)
    if (!sc) continue
    if (rec.isCorrect) topicCorrect.set(sc.referenceTopic, (topicCorrect.get(sc.referenceTopic) ?? 0) + 1)
    else allCorrect = false
  }
  return badges.map((badge) => {
    const c = badge.check
    let earned = false
    if (c.perfect) earned = records.length > 0 && allCorrect
    else if (c.minScore !== undefined) earned = score >= c.minScore
    else if (c.topicAny) {
      // cộng dồn số câu đúng trên nhóm chủ đề của huy hiệu
      const n = c.topicAny.reduce((sum, t) => sum + (topicCorrect.get(t) ?? 0), 0)
      earned = n >= (c.minCorrect ?? 1)
    }
    return { badge, earned }
  })
}

export const reflectiveQuestion = (data, scenario) =>
  (data.reflectiveTemplate || 'Nếu bạn là cán bộ trong tình huống này, bạn sẽ làm gì khác đi?').replace('{title}', scenario?.title ?? '')

// Bộ câu cho một lượt chơi: lấy đủ các câu chưa hỏi trước, sau đó mới tới câu đã hỏi; cả hai nhóm đều được xáo trộn
export const pickSession = (scenarios, size, previouslySeenIds = []) => {
  const seen = new Set(previouslySeenIds)
  const fresh = shuffle(scenarios.filter((s) => !seen.has(s.id)))
  const played = shuffle(scenarios.filter((s) => seen.has(s.id)))
  return [...fresh, ...played].slice(0, Math.min(size, scenarios.length))
}

// Xáo trộn Fisher–Yates, không biến đổi mảng gốc
export function shuffle(array, rand = Math.random) {
  const out = [...array]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Thống kê dài hạn cho trang Phân tích: completion %, đúng %, thời gian TB, chủ đề mạnh/yếu, lỗi gần đây
export const analytics = (state, data) => {
  const flat = state.history.flatMap((h) => h.answers)
  const byId = new Map(data.scenarios.map((s) => [s.id, s]))
  const topicStats = new Map()
  const mistakes = []
  let correct = 0
  let timeMs = 0

  for (const rec of flat) {
    const sc = byId.get(rec.scenarioId)
    if (!sc) continue
    timeMs += rec.timeMs
    const e = topicStats.get(sc.referenceTopic) ?? { total: 0, correct: 0 }
    e.total += 1
    if (rec.isCorrect) correct += 1
    else mistakes.push({ scenario: sc, selectedIndex: rec.selectedIndex })
    e.correct += rec.isCorrect ? 1 : 0
    topicStats.set(sc.referenceTopic, e)
  }

  const topics = [...topicStats.entries()]
    .map(([topic, s]) => ({ topic, ...s }))
    .sort((a, b) => a.topic.localeCompare(b.topic, 'vi'))
  const seenIds = new Set(flat.map((r) => r.scenarioId))

  return {
    attempts: state.history.length,
    completionPct: data.scenarios.length ? Math.round((seenIds.size / data.scenarios.length) * 100) : 0,
    correctPct: flat.length ? Math.round((correct / flat.length) * 100) : 0,
    avgTimeMs: flat.length ? Math.round(timeMs / flat.length) : 0,
    topicStats: topics,
    strongTopics: topics.filter((t) => t.correct / t.total >= 0.8).map((t) => t.topic),
    weakTopics: topics.filter((t) => t.correct / t.total < 0.6).map((t) => t.topic),
    recentMistakes: mistakes.slice(-3).reverse(),
  }
}
