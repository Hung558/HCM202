export function getChapterResources(data, chapterId = data.chapter?.id ?? data.metadata?.id) {
  const chapter = data.chapter?.id === chapterId ? data.chapter : null
  const select = (items, ids) => (Array.isArray(items) ? items : [])
    .filter((item) => item.chapterId === chapterId && (!Array.isArray(ids) || ids.includes(item.id)))
    .sort((a, b) => a.order - b.order)

  return {
    chapter,
    sections: select(data.contentSections, chapter?.sectionIds),
    videos: select(data.videos, chapter?.videoIds),
  }
}

export function learningStorageKey(chapterId, userId = null) {
  const user = userId == null ? 'guest' : `user:${encodeURIComponent(String(userId))}`
  return `hcm202:chuong1:learning:${encodeURIComponent(chapterId)}:${user}`
}

export function normalizeLearningProgress(value, sections, videos) {
  const saved = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const validIds = (ids, items) => [...new Set(Array.isArray(ids) ? ids : [])]
    .filter((id) => items.some((item) => item.id === id))
  return {
    completedSectionIds: validIds(saved.completedSectionIds, sections),
    completedVideoIds: validIds(saved.completedVideoIds, videos),
    lastSectionId: sections.some((item) => item.id === saved.lastSectionId) ? saved.lastSectionId : null,
    lastVideoId: videos.some((item) => item.id === saved.lastVideoId) ? saved.lastVideoId : null,
  }
}

export function loadLearningProgress(storage, key, sections, videos) {
  try {
    const raw = storage.getItem(key)
    const saved = raw == null ? {} : JSON.parse(raw)
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid progress')
    return { progress: normalizeLearningProgress(saved, sections, videos), error: null }
  } catch {
    return {
      progress: normalizeLearningProgress({}, sections, videos),
      error: 'Không đọc được tiến độ đọc/xem đã lưu. Bạn vẫn có thể học và đánh dấu lại.',
    }
  }
}

export function saveLearningProgress(storage, key, progress) {
  try {
    storage.setItem(key, JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }))
    return null
  } catch {
    return 'Trình duyệt không lưu được tiến độ đọc/xem. Các dấu đã đọc và đã xem có thể mất khi tải lại trang.'
  }
}

export function toggleCompleted(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

// Use only real YouTube IDs/URLs from the data, never a placeholder video.
export function getYouTubeLinks(video) {
  if (video.provider !== 'youtube') return { embedUrl: null, watchUrl: null }
  const validId = (id) => typeof id === 'string' && /^[\w-]{11}$/.test(id)
  const readUrl = (value, embed) => {
    try {
      const url = new URL(value)
      if (url.protocol !== 'https:') return null
      const hosts = embed
        ? ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com']
        : ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be']
      if (!hosts.includes(url.hostname)) return null
      const id = embed ? url.pathname.match(/^\/embed\/([\w-]{11})$/)?.[1]
        : url.hostname === 'youtu.be' ? url.pathname.slice(1)
          : url.pathname === '/watch' ? url.searchParams.get('v') : null
      return validId(id) ? { url, id } : null
    } catch {
      return null
    }
  }
  const embed = readUrl(video.embedUrl, true)
  const watch = readUrl(video.watchUrl, false)
  const id = validId(video.providerVideoId) ? video.providerVideoId : embed?.id ?? watch?.id
  if (!id) return { embedUrl: null, watchUrl: null }

  const embedUrl = embed?.id === id ? embed.url : new URL(`https://www.youtube-nocookie.com/embed/${id}`)
  // Remove data-supplied playback settings so selection never starts playback.
  embedUrl.search = ''
  embedUrl.hash = ''
  embedUrl.searchParams.set('autoplay', '0')
  embedUrl.searchParams.set('rel', '0')
  return {
    embedUrl: video.verification?.embedStatus === 'unavailable' || video.verification?.embedStatus === 'disabled'
      ? null : embedUrl.href,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
  }
}
