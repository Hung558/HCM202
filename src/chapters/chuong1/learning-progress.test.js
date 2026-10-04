import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  getChapterResources, getYouTubeLinks, learningStorageKey,
  loadLearningProgress, normalizeLearningProgress, saveLearningProgress, toggleCompleted,
} from './learning-progress.js'

const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'))
const { sections, videos } = getChapterResources(data)
const emptyProgress = {
  completedSectionIds: [], completedVideoIds: [], lastSectionId: null, lastVideoId: null,
}

function memoryStorage(entries = []) {
  const values = new Map(entries)
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('the actual data contract reads chapter.id and contentSections', () => {
  const resources = getChapterResources(data)
  assert.equal(resources.chapter, data.chapter)
  assert.equal(resources.chapter.id, 'ho-chi-minh-introduction-foundations-v1')
  assert.equal(resources.sections.length, 7)
  assert.equal(resources.videos.length, 3)
  assert.deepEqual(resources.sections.map((section) => section.id), data.chapter.sectionIds)
  assert.deepEqual(resources.videos.map((video) => video.id), data.chapter.videoIds)
  assert.ok(resources.sections.every((section) => section.chapterId === data.chapter.id && Array.isArray(section.blocks)))
  assert.ok(resources.videos.every((video) => video.chapterId === data.chapter.id))
})

test('chapter.id takes precedence over metadata.id when choosing default resources', () => {
  const resources = getChapterResources({ ...data, metadata: { id: 'another-chapter' } })
  assert.equal(resources.chapter.id, data.chapter.id)
  assert.equal(resources.sections.length, sections.length)
  assert.equal(resources.videos.length, videos.length)
})

test('resource selection sorts without mutating inputs and honors chapter ID and resource lists', () => {
  const contentSections = [
    { id: 'late', chapterId: 'selected', order: 9 },
    { id: 'foreign', chapterId: 'other', order: 1 },
    { id: 'excluded', chapterId: 'selected', order: 0 },
    { id: 'early', chapterId: 'selected', order: 2 },
  ]
  const chapterVideos = [
    { id: 'second-video', chapterId: 'selected', order: 3 },
    { id: 'foreign-video', chapterId: 'other', order: 0 },
    { id: 'unlisted-video', chapterId: 'selected', order: 1 },
    { id: 'first-video', chapterId: 'selected', order: 2 },
  ]
  const fixture = {
    chapter: { id: 'selected', sectionIds: ['late', 'early', 'foreign'], videoIds: ['second-video', 'first-video', 'foreign-video'] },
    contentSections, videos: chapterVideos,
  }
  const resources = getChapterResources(fixture)
  assert.deepEqual(resources.sections.map((section) => section.id), ['early', 'late'])
  assert.deepEqual(resources.videos.map((video) => video.id), ['first-video', 'second-video'])
  assert.deepEqual(contentSections.map((section) => section.id), ['late', 'foreign', 'excluded', 'early'])
  assert.deepEqual(chapterVideos.map((video) => video.id), ['second-video', 'foreign-video', 'unlisted-video', 'first-video'])
  assert.deepEqual(getChapterResources(fixture, 'unknown'), { chapter: null, sections: [], videos: [] })
})

test('empty whitelists and absent resource arrays produce zero valid resources', () => {
  assert.deepEqual(getChapterResources({ ...data, chapter: { ...data.chapter, sectionIds: [], videoIds: [] } }).sections, [])
  assert.deepEqual(getChapterResources({ ...data, chapter: { ...data.chapter, sectionIds: [], videoIds: [] } }).videos, [])
  const resources = getChapterResources({ chapter: { id: 'empty' } })
  assert.deepEqual(resources.sections, [])
  assert.deepEqual(resources.videos, [])
})

test('learning storage keys isolate chapters and users, including delimiter and guest collisions', () => {
  const keys = [
    learningStorageKey('chapter'), learningStorageKey('chapter', 'guest'),
    learningStorageKey('chapter', ''), learningStorageKey('chapter', 'user:guest'),
    learningStorageKey('chapter:user', 'guest'), learningStorageKey('chapter', 'user:guest:guest'),
    learningStorageKey('chapter/one', 'a:b'), learningStorageKey('chapter%2Fone', 'a:b'),
    learningStorageKey('chapter/one', 'a%3Ab'), learningStorageKey('other-chapter'),
  ]
  assert.equal(new Set(keys).size, keys.length)
  assert.equal(learningStorageKey('chapter', null), learningStorageKey('chapter'))
  assert.notEqual(learningStorageKey(data.chapter.id), `hcm202:chuong1:progress:${data.metadata.id}`)
})

test('normalizing saved progress removes duplicates and obsolete or differently typed IDs', () => {
  const saved = {
    completedSectionIds: [sections[1].id, 'removed-section', sections[1].id, sections[0].id, null, 1],
    completedVideoIds: [videos[0].id, 'removed-video', videos[0].id, {}, false],
    lastSectionId: 'removed-section', lastVideoId: videos[0].id,
  }
  assert.deepEqual(normalizeLearningProgress(saved, sections, videos), {
    completedSectionIds: [sections[1].id, sections[0].id],
    completedVideoIds: [videos[0].id], lastSectionId: null, lastVideoId: videos[0].id,
  })
  assert.equal(saved.completedSectionIds.length, 6)
  assert.equal(saved.completedVideoIds.length, 5)
})

test('normalizing invalid values and completion fields starts with no completion marks', () => {
  for (const value of [null, undefined, [], 'progress', 1, false, {
    completedSectionIds: sections[0].id, completedVideoIds: {}, lastSectionId: 1, lastVideoId: [],
  }]) {
    assert.deepEqual(normalizeLearningProgress(value, sections, videos), emptyProgress)
  }
})

test('zero current sections and videos discard saved completion and selection IDs', () => {
  assert.deepEqual(normalizeLearningProgress({
    completedSectionIds: [sections[0].id], completedVideoIds: [videos[0].id],
    lastSectionId: sections[0].id, lastVideoId: videos[0].id,
  }, [], []), emptyProgress)
})

test('missing saved progress is a normal empty state', () => {
  assert.deepEqual(loadLearningProgress(memoryStorage(), 'missing', sections, videos), {
    progress: emptyProgress, error: null,
  })
})

test('malformed JSON, JSON null, arrays, and primitive saved values return recoverable errors', () => {
  for (const raw of ['{broken', 'null', '[]', '"text"', '1', 'false']) {
    const loaded = loadLearningProgress(memoryStorage([['progress', raw]]), 'progress', sections, videos)
    assert.deepEqual(loaded.progress, emptyProgress)
    assert.equal(typeof loaded.error, 'string')
    assert.ok(loaded.error.length > 0)
  }
})

test('loading prunes obsolete saved IDs without reporting a parsing error', () => {
  const storage = memoryStorage([['progress', JSON.stringify({
    completedSectionIds: [sections[0].id, sections[0].id, 'obsolete'],
    completedVideoIds: [videos[0].id, 'obsolete'], lastSectionId: 'obsolete', lastVideoId: videos[0].id,
  })]])
  assert.deepEqual(loadLearningProgress(storage, 'progress', sections, videos), {
    progress: {
      completedSectionIds: [sections[0].id], completedVideoIds: [videos[0].id],
      lastSectionId: null, lastVideoId: videos[0].id,
    }, error: null,
  })
})

test('blocked storage access remains recoverable for both property and method failures', () => {
  const blocked = { getItem() { throw new Error('Access denied') } }
  const blockedProperty = { get getItem() { throw new Error('SecurityError') } }
  for (const storage of [blocked, blockedProperty, null]) {
    const loaded = loadLearningProgress(storage, 'progress', sections, videos)
    assert.deepEqual(loaded.progress, emptyProgress)
    assert.equal(typeof loaded.error, 'string')
  }
  assert.equal(typeof saveLearningProgress({ setItem() { throw new Error('Quota exceeded') } }, 'progress', emptyProgress), 'string')
  assert.equal(typeof saveLearningProgress({ get setItem() { throw new Error('SecurityError') } }, 'progress', emptyProgress), 'string')
})

test('persisting a video selection does not mark it watched or change Flashcard or other learning storage', () => {
  const flashcardKey = `hcm202:chuong1:progress:${data.metadata.id}`
  const flashcardRaw = JSON.stringify({ [data.flashcards[0].id]: { status: 'learning', reviewCount: 2 } })
  const otherChapterKey = learningStorageKey('another-chapter')
  const otherUserKey = learningStorageKey(data.chapter.id, 'another-user')
  const storage = memoryStorage([[flashcardKey, flashcardRaw], [otherChapterKey, 'other-chapter-progress'], [otherUserKey, 'other-user-progress']])
  const key = learningStorageKey(data.chapter.id)
  const selection = { ...emptyProgress, lastSectionId: sections[0].id, lastVideoId: videos[0].id }
  assert.equal(saveLearningProgress(storage, key, selection), null)
  const loaded = loadLearningProgress(storage, key, sections, videos)
  assert.deepEqual(loaded.progress, selection)
  assert.deepEqual(loaded.progress.completedVideoIds, [])
  assert.equal(loaded.error, null)
  assert.equal(storage.getItem(flashcardKey), flashcardRaw)
  assert.equal(storage.getItem(otherChapterKey), 'other-chapter-progress')
  assert.equal(storage.getItem(otherUserKey), 'other-user-progress')
  assert.equal(storage.values.size, 4)
  assert.ok(Number.isFinite(Date.parse(JSON.parse(storage.getItem(key)).updatedAt)))
  assert.equal(Object.hasOwn(selection, 'updatedAt'), false)
})

test('explicit completion marks are reversible and do not mutate the previous list', () => {
  for (const id of [sections[0].id, videos[0].id]) {
    const original = ['already-completed']
    const marked = toggleCompleted(original, id)
    assert.deepEqual(marked, ['already-completed', id])
    assert.deepEqual(original, ['already-completed'])
    assert.deepEqual(toggleCompleted(marked, id), original)
    assert.deepEqual(marked, ['already-completed', id])
    assert.deepEqual(toggleCompleted([id, 'already-completed', id], id), original)
  }
})

test('actual video links keep the supplied YouTube IDs and disable autoplay', () => {
  for (const video of videos) {
    const links = getYouTubeLinks(video)
    const embed = new URL(links.embedUrl)
    assert.equal(embed.pathname, `/embed/${video.providerVideoId}`)
    assert.equal(embed.hostname, 'www.youtube-nocookie.com')
    assert.equal(embed.searchParams.get('autoplay'), '0')
    assert.equal(embed.searchParams.get('rel'), '0')
    assert.equal(links.watchUrl, video.watchUrl)
  }
})

test('supplied playback queries and fragments cannot enable autoplay or playlists', () => {
  const video = videos[0]
  const links = getYouTubeLinks({
    ...video,
    embedUrl: `${video.embedUrl}?autoplay=1&loop=1&playlist=${video.providerVideoId}&start=30#autoplay=1`,
    watchUrl: `${video.watchUrl}&autoplay=1`,
  })
  const embed = new URL(links.embedUrl)
  assert.deepEqual([...embed.searchParams], [['autoplay', '0'], ['rel', '0']])
  assert.equal(embed.hash, '')
  assert.equal(links.watchUrl, video.watchUrl)
})

test('valid supplied YouTube watch and embed URLs work when providerVideoId is absent', () => {
  const id = videos[0].providerVideoId
  for (const watchUrl of [`https://youtu.be/${id}`, `https://m.youtube.com/watch?v=${id}`, `https://youtube.com/watch?v=${id}`]) {
    const links = getYouTubeLinks({ provider: 'youtube', watchUrl })
    assert.equal(links.watchUrl, `https://www.youtube.com/watch?v=${id}`)
    assert.equal(new URL(links.embedUrl).pathname, `/embed/${id}`)
  }
  assert.equal(getYouTubeLinks({ provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }).watchUrl, `https://www.youtube.com/watch?v=${id}`)
})

test('invalid and non-YouTube sources never produce placeholder links', () => {
  const id = videos[0].providerVideoId
  for (const video of [
    { provider: 'vimeo', providerVideoId: id, watchUrl: videos[0].watchUrl },
    { provider: 'youtube' },
    { provider: 'youtube', providerVideoId: 'bad-id' },
    { provider: 'youtube', watchUrl: 'not a URL', embedUrl: null },
    { provider: 'youtube', watchUrl: `http://www.youtube.com/watch?v=${id}` },
    { provider: 'youtube', watchUrl: `https://youtube.com.example.com/watch?v=${id}` },
    { provider: 'youtube', watchUrl: `https://example.com/watch?v=${id}` },
    { provider: 'youtube', embedUrl: `https://example.com/embed/${id}` },
    { provider: 'youtube', watchUrl: 'https://www.youtube.com/watch?v=short' },
    { provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}/extra` },
    { provider: 'youtube', watchUrl: `https://www.youtube.com/anything/${id}` },
  ]) {
    assert.deepEqual(getYouTubeLinks(video), { embedUrl: null, watchUrl: null })
  }
})

test('a supplied valid provider ID determines canonical links when URLs are mismatched or missing', () => {
  const video = videos[0]
  const links = getYouTubeLinks({ ...video, embedUrl: videos[1].embedUrl, watchUrl: videos[1].watchUrl })
  assert.equal(links.watchUrl, video.watchUrl)
  assert.equal(new URL(links.embedUrl).pathname, `/embed/${video.providerVideoId}`)
  assert.equal(getYouTubeLinks({ provider: 'youtube', providerVideoId: video.providerVideoId }).watchUrl, video.watchUrl)
})

test('explicit embed unavailability keeps the external YouTube fallback', () => {
  for (const embedStatus of ['unavailable', 'disabled']) {
    assert.deepEqual(getYouTubeLinks({ ...videos[0], verification: { embedStatus } }), {
      embedUrl: null, watchUrl: videos[0].watchUrl,
    })
  }
})
