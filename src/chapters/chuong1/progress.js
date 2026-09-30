export function currentTime() {
  return Date.now()
}

export function rateCard(records, cardId, action, now, config) {
  if (action !== 'known' && action !== 'again') {
    throw new Error(`Unknown rating: ${action}`)
  }

  const previous = records[cardId] ?? {}
  const consecutiveKnown = Number.isInteger(previous.consecutiveKnown)
    ? previous.consecutiveKnown
    : 0
  const intervalIndex = Math.min(consecutiveKnown, config.knownIntervalsDays.length - 1)
  const delay = action === 'known'
    ? config.knownIntervalsDays[intervalIndex] * 24 * 60 * 60 * 1000
    : config.againIntervalMinutes * 60 * 1000

  return {
    ...records,
    [cardId]: {
      status: action === 'known' ? 'reviewing' : 'learning',
      consecutiveKnown: action === 'known' ? consecutiveKnown + 1 : 0,
      reviewCount: (previous.reviewCount ?? 0) + 1,
      againCount: (previous.againCount ?? 0) + (action === 'again' ? 1 : 0),
      lastRating: action,
      lastReviewedAt: new Date(now).toISOString(),
      nextReviewAt: new Date(now + delay).toISOString(),
    },
  }
}

export function getStudyQueue(cards, records, now) {
  const due = []
  const fresh = []

  for (const card of cards) {
    const record = records[card.id]
    if (!record || record.status === 'new' || !record.nextReviewAt) {
      fresh.push(card)
    } else if (!Number.isFinite(Date.parse(record.nextReviewAt)) || Date.parse(record.nextReviewAt) <= now) {
      due.push(card)
    }
  }

  due.sort((a, b) =>
    (Date.parse(records[a.id].nextReviewAt) || 0) - (Date.parse(records[b.id].nextReviewAt) || 0)
    || a.order - b.order,
  )
  fresh.sort((a, b) => a.order - b.order)

  return [...due, ...fresh]
}

export function normalizeSearch(value) {
  return value.toLocaleLowerCase('vi').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}
