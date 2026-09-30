import test from 'node:test'
import assert from 'node:assert/strict'
import { getStudyQueue, normalizeSearch, rateCard } from './progress.js'

const config = { knownIntervalsDays: [1, 3, 7], againIntervalMinutes: 10 }
const start = Date.parse('2026-09-30T08:00:00.000Z')
const cards = [
  { id: 'first', order: 1 },
  { id: 'second', order: 2 },
  { id: 'third', order: 3 },
]

test('known ratings advance the interval and again resets it', () => {
  const first = rateCard({}, 'first', 'known', start, config)
  assert.equal(first.first.nextReviewAt, '2026-10-01T08:00:00.000Z')

  const second = rateCard(first, 'first', 'known', start + 86_400_000, config)
  assert.equal(second.first.nextReviewAt, '2026-10-04T08:00:00.000Z')
  assert.equal(second.first.consecutiveKnown, 2)

  const again = rateCard(second, 'first', 'again', start + 4 * 86_400_000, config)
  assert.equal(again.first.nextReviewAt, '2026-10-04T08:10:00.000Z')
  assert.equal(again.first.consecutiveKnown, 0)
  assert.equal(again.first.reviewCount, 3)
  assert.equal(again.first.againCount, 1)
})

test('due cards come before new cards; future cards stay out of the queue', () => {
  const records = {
    first: rateCard({}, 'first', 'known', start - 2 * 86_400_000, config).first,
    third: rateCard({}, 'third', 'known', start, config).third,
  }
  assert.deepEqual(getStudyQueue(cards, records, start).map((card) => card.id), ['first', 'second'])
  assert.deepEqual(getStudyQueue(cards, records, start + 86_400_000).map((card) => card.id), ['first', 'third', 'second'])
})

test('dictionary search accepts Vietnamese text without tone marks', () => {
  assert.equal(normalizeSearch('Đại hội VII'), 'dai hoi vii')
  assert.equal(normalizeSearch('Chủ nghĩa Mác - Lênin'), 'chu nghia mac - lenin')
})
