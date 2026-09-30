export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function secondsLeft(deadline, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

// Correct matches are locked; invalid, duplicate and expired input cannot score.
export function matchPair(pairs, matched, id, year, expired = false) {
  const pair = pairs.find((item) => item.id === id)
  if (expired || !pair || matched.includes(id) || matched.some((key) => pairs.find((item) => item.id === key)?.year === year)) return 'ignored'
  return pair.year === year ? 'correct' : 'wrong'
}
