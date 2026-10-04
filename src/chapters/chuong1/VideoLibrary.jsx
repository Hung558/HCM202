import { useEffect, useState } from 'react'
import { Check, ExternalLink, Loader2, Play, Video } from 'lucide-react'
import { getYouTubeLinks } from './learning-progress.js'
import Sources from './Sources.jsx'

function VideoPlayer({ video }) {
  const { embedUrl, watchUrl } = getYouTubeLinks(video)
  const [status, setStatus] = useState(embedUrl ? 'loading' : 'error')

  useEffect(() => {
    if (status !== 'loading') return undefined
    const timer = window.setTimeout(() => setStatus('slow'), 15_000)
    return () => window.clearTimeout(timer)
  }, [status])

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-video bg-ink text-on-dark">
        {embedUrl && status !== 'error' ? <>
          <iframe
            className="size-full border-0"
            src={embedUrl}
            title={video.title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('error')}
          />
          {status === 'loading' && <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-ink"><Loader2 size={22} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Đang tải trình phát…</div>}
        </> : <div role="status" className="flex size-full items-center justify-center px-5 text-center text-sm leading-relaxed">Không phát được video tại đây.{watchUrl && ' Bạn có thể mở video trên YouTube.'}</div>}
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        <h3 className="text-lg font-bold leading-snug">{video.title}</h3>
        {video.channelName && <p className="text-sm text-muted">Kênh: {video.channelName}</p>}
        {video.description && <p className="text-sm leading-relaxed text-ink-soft">{video.description}</p>}
        {status === 'slow' && <p role="status" className="rounded-xl bg-cream p-4 text-sm text-ink-soft">Trình phát đang tải lâu. Bạn có thể mở video trên YouTube để xem.</p>}
        {watchUrl ? <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink size={16} aria-hidden="true" /> Mở trên YouTube</a>
          : <p role="status" className="text-sm text-muted">Video chưa có liên kết YouTube hợp lệ.</p>}
        <p className="text-xs leading-relaxed text-muted">Video cần kết nối Internet. Nếu trình phát báo lỗi hoặc không cho phép nhúng, hãy dùng “Mở trên YouTube”. Việc chọn video hoặc mở liên kết không tự đánh dấu đã xem.</p>
        <Sources citations={video.citations} />
      </div>
    </div>
  )
}

export default function VideoLibrary({ videos, selectedVideoId, completedVideoIds, onSelectVideo, onToggleWatched }) {
  const selectedVideo = videos.find((video) => video.id === selectedVideoId)
  return (
    <section id="chapter-videos" aria-labelledby="chapter-videos-title" className="mt-12 scroll-mt-24 border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Xem và liên hệ</p><h2 id="chapter-videos-title" className="mt-2 text-[26px] font-extrabold">Video liên quan</h2></div>
        <p role="status" className="text-sm text-muted">Đã xem <strong className="text-ink">{completedVideoIds.length}/{videos.length}</strong> video</p>
      </div>
      {!videos.length ? <div role="status" className="card mt-5 p-6 text-ink-soft">Chương này chưa có video liên quan. Bạn có thể tiếp tục đọc nội dung và ôn thẻ ghi nhớ.</div> : <>
        <p className="mt-3 text-sm text-ink-soft">Chọn một video để tải trình phát. Nhấn nút phát trong trình phát khi bạn sẵn sàng.</p>
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            {selectedVideo ? <VideoPlayer key={selectedVideo.id} video={selectedVideo} /> : <div className="card flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center text-ink-soft"><Video size={30} className="text-primary" aria-hidden="true" /><p>Chọn video trong danh sách để xem tại đây.</p></div>}
          </div>
          <ul className="min-w-0 space-y-3" aria-label="Danh sách video">
            {videos.map((video) => {
              const selected = selectedVideoId === video.id
              const watched = completedVideoIds.includes(video.id)
              return <li key={video.id} className={`card overflow-hidden ${selected ? 'border-primary' : ''}`}>
                <button type="button" onClick={() => onSelectVideo(video.id)} aria-pressed={selected} className={`flex w-full gap-3 p-5 text-left ${selected ? 'bg-cream' : 'hover:bg-paper'}`}>
                  <Play size={20} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0"><span className="block font-bold leading-relaxed text-ink">{video.title}</span>{video.channelName && <span className="mt-2 block text-xs text-muted">{video.channelName}</span>}{video.description && <span className="mt-2 block text-sm leading-relaxed text-ink-soft">{video.description}</span>}</span>
                </button>
                <div className="border-t border-line px-5 py-3">
                  <button type="button" onClick={() => onToggleWatched(video.id)} aria-label={`${watched ? 'Bỏ đánh dấu đã xem' : 'Đánh dấu đã xem'}: ${video.title}`} aria-pressed={watched} className={`btn ${watched ? 'bg-success-soft text-success' : 'btn-outline'}`}><Check size={16} aria-hidden="true" />{watched ? 'Đã xem · Bỏ đánh dấu' : 'Đánh dấu đã xem'}</button>
                </div>
              </li>
            })}
          </ul>
        </div>
      </>}
    </section>
  )
}
