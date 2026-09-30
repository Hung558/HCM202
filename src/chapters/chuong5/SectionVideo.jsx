import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'

export default function SectionVideo({ video }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <section aria-label="Video minh họa" className="mt-7 overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="p-5">
        <p className="eyebrow">Xem và liên hệ{video.duration ? ` · ${video.duration}` : ''}</p>
        <h3 className="mt-2 font-bold leading-relaxed">{video.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{video.context}</p>
      </div>
      <div className="aspect-video bg-ink text-on-dark">
        {video.type === 'external' ? (
          <a href={video.sourceUrl} target="_blank" rel="noreferrer" className="flex size-full min-h-44 flex-col items-center justify-center gap-3 p-5 text-center focus-visible:outline-4 focus-visible:outline-amber">
            <span className="grid size-14 place-items-center rounded-full bg-primary"><ExternalLink className="size-6" aria-hidden="true" /></span>
            <span className="font-semibold">Xem video trên {video.publisher}</span>
            <span className="text-xs text-on-dark/80">Mở trang nguồn trong tab mới</span>
          </a>
        ) : !loaded ? (
          <button onClick={() => setLoaded(true)} className="flex size-full min-h-44 flex-col items-center justify-center gap-3 p-5 text-center focus-visible:outline-4 focus-visible:outline-amber" aria-label={`Tải video: ${video.title}`}>
            <span className="grid size-14 place-items-center rounded-full bg-primary"><Play className="size-6" aria-hidden="true" /></span>
            <span className="font-semibold">Xem video minh họa</span>
            <span className="text-xs text-on-dark/80">{video.publisher} · Nhấn để tải trình phát</span>
          </button>
        ) : (
          <iframe className="size-full border-0" src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`} title={video.title} allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        )}
      </div>
      <div className="space-y-3 p-5">
        <a href={video.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4">Nguồn: {video.publisher}<ExternalLink className="size-4 shrink-0" aria-hidden="true" /></a>
        <p className="text-xs leading-relaxed text-muted">Video từ nguồn bên ngoài, cần kết nối Internet. Nếu trình phát không hoạt động, mở liên kết nguồn ở trên.</p>
        <p className="rounded-xl bg-cream p-4 text-sm leading-relaxed text-ink-soft"><span className="font-bold">Sau khi xem: </span>{video.question}</p>
      </div>
    </section>
  )
}
