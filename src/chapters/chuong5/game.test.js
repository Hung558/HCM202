import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { matchPair, secondsLeft, shuffle } from './game.js'

const { pairs } = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'))

test('historical matches score only once and only for the correct year', () => {
  assert.deepEqual(pairs.map((pair) => pair.year), [1930, 1941, 1951, 1960])
  assert.equal(new Set(pairs.map((pair) => pair.id)).size, 4)
  for (const pair of pairs) {
    assert.equal(matchPair(pairs, [], pair.id, pair.year), 'correct')
    assert.equal(matchPair(pairs, [], pair.id, 2000), 'wrong')
    assert.equal(matchPair(pairs, [pair.id], pair.id, pair.year), 'ignored')
    assert.equal(matchPair(pairs, [], pair.id, pair.year, true), 'ignored')
  }
  assert.equal(matchPair(pairs, [pairs[0].id], pairs[1].id, pairs[0].year), 'ignored')
  assert.equal(matchPair(pairs, [], 'unknown', 1930), 'ignored')
})

test('deadline catches elapsed time even when callbacks are delayed', () => {
  assert.equal(secondsLeft(60000, 0), 60)
  assert.equal(secondsLeft(60000, 59001), 1)
  assert.equal(secondsLeft(60000, 60000), 0)
  assert.equal(secondsLeft(60000, 80000), 0)
})

test('shuffle preserves cards without mutating chapter data', () => {
  const source = [...pairs]
  const result = shuffle(pairs, () => 0)
  assert.deepEqual(pairs, source)
  assert.deepEqual([...result].sort((a, b) => a.year - b.year), pairs)
  assert.notDeepEqual(result, pairs)
})
