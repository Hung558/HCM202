import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { analytics, checkAchievements, formatTime, pickSession, rankFor, summarize } from './quiz.js'

const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'))
const scenarios = data.scenarios
const byId = new Map(scenarios.map((s) => [s.id, s]))

test('data is well-formed: unique ids, valid answers and topics', () => {
  assert.equal(scenarios.length >= 15, true)
  assert.equal(new Set(scenarios.map((s) => s.id)).size, scenarios.length)
  for (const sc of scenarios) {
    assert.equal(sc.options.length, 4)
    assert.ok(sc.correctAnswer >= 0 && sc.correctAnswer < 4)
    assert.ok(data.topics.includes(sc.referenceTopic))
    assert.ok(data.difficulties[sc.difficulty])
    assert.equal(sc.points, 10)
  }
})

test('summarize scores points, accuracy and streak XP', () => {
  const recs = [
    { scenarioId: 'sc01', selectedIndex: 1, isCorrect: true, timeMs: 10_000 },
    { scenarioId: 'sc02', selectedIndex: 0, isCorrect: true, timeMs: 20_000 },
    { scenarioId: 'sc03', selectedIndex: 3, isCorrect: false, timeMs: 5_000 },
    { scenarioId: 'sc04', selectedIndex: null, isCorrect: false, timeMs: 30_000 },
    { scenarioId: 'sc05', selectedIndex: 1, isCorrect: true, timeMs: 15_000 },
    { scenarioId: 'sc06', selectedIndex: 0, isCorrect: true, timeMs: 10_000 },
    { scenarioId: 'sc07', selectedIndex: 2, isCorrect: false, timeMs: 8_000 },
    { scenarioId: 'sc08', selectedIndex: 1, isCorrect: true, timeMs: 12_000 },
  ]
  const sum = summarize(recs, scenarios, data)
  assert.equal(sum.correct, 5)
  assert.equal(sum.skipped, 1)
  assert.equal(sum.answered, 7)
  assert.equal(sum.accuracy, 63) // 5/8
  assert.equal(sum.score, 50)
  // Chuỗi đúng dài nhất chỉ là 2 (sc05–sc06): chưa chạm mốc 3 nên không có thưởng XP
  assert.equal(sum.xp, 50)
  assert.equal(sum.bestStreak, 2)
  assert.equal(sum.timeMs, 110_000)
  assert.equal(sum.weakTopics.length > 0, true)
})

test('streak bonus triggers on every third consecutive correct answer', () => {
  const allCorrect = scenarios.slice(0, 6).map((sc) => ({
    scenarioId: sc.id,
    selectedIndex: sc.correctAnswer,
    isCorrect: true,
    timeMs: 1_000,
  }))
  const sum = summarize(allCorrect, scenarios, data)
  assert.equal(sum.score, 60)
  assert.equal(sum.xp, 60 + 2 * 25) // chuỗi đạt 3 và 6
})

test('badges: perfect run, minScore and topic-group thresholds', () => {
  const perfect = scenarios.map((sc) => ({ scenarioId: sc.id, selectedIndex: sc.correctAnswer, isCorrect: true, timeMs: 1_000 }))
  const ach = checkAchievements(data.badges, perfect, byId, 150)
  const earned = Object.fromEntries(ach.map((a) => [a.badge.id, a.earned]))
  assert.equal(earned['perfect-run'], true)
  assert.equal(earned['outstanding-cadre'], true)
  assert.equal(earned['guardian-of-the-people'], true)

  const weak = scenarios.slice(0, 4).map((sc) => ({ scenarioId: sc.id, selectedIndex: -1, isCorrect: false, timeMs: 1_000 }))
  const none = checkAchievements(data.badges, weak, byId, 0)
  assert.equal(none.every((a) => !a.earned), true)
})

test('pickSession prefers unseen scenarios and respects size', () => {
  const session = pickSession(scenarios, 10, scenarios.slice(0, 5).map((s) => s.id))
  assert.equal(session.length, 10)
  const ids = new Set(session.map((s) => s.id))
  assert.equal(ids.size, 10)
  const seenCount = session.filter((s) => scenarios.slice(0, 5).some((x) => x.id === s.id)).length
  assert.equal(seenCount, 0) // còn 10 câu mới → không lấy câu đã hỏi
})

test('pickSession falls back to seen scenarios when fresh ones run out', () => {
  const seenAll = scenarios.map((s) => s.id)
  const session = pickSession(scenarios, 10, seenAll)
  assert.equal(session.length, 10)
  assert.equal(new Set(session.map((s) => s.id)).size, 10)
})

test('rankFor picks the highest reachable rank', () => {
  assert.equal(rankFor(data, 0), 'Cần rèn luyện thêm')
  assert.equal(rankFor(data, 60), 'Khá')
  assert.equal(rankFor(data, 200), 'Xuất sắc')
})

test('formatTime renders mm:ss', () => {
  assert.equal(formatTime(0), '00:00')
  assert.equal(formatTime(61_000), '01:01')
})

test('analytics aggregates history across sessions', () => {
  const state = {
    history: [
      {
        sessionId: 1,
        date: '2026-09-30',
        score: 30,
        accuracy: 30,
        timeMs: 60_000,
        answers: [
          { scenarioId: 'sc01', selectedIndex: 1, isCorrect: true, timeMs: 30_000 },
          { scenarioId: 'sc02', selectedIndex: 0, isCorrect: true, timeMs: 30_000 },
          { scenarioId: 'sc03', selectedIndex: 3, isCorrect: false, timeMs: 0 },
        ],
        weakTopics: [],
      },
    ],
    bookmarks: [],
  }
  const a = analytics(state, data)
  assert.equal(a.attempts, 1)
  assert.equal(a.completionPct, 20) // đã gặp 3/15 tình huống
  assert.equal(a.correctPct, 67) // 2/3
  assert.equal(a.avgTimeMs, 20_000)
  assert.equal(a.weakTopics.includes('Chống lãng phí'), true)
  assert.equal(a.recentMistakes[0].scenario.id, 'sc03')
})
