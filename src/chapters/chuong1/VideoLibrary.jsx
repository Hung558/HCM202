import { getYouTubeLinks } from './learning-progress.js'

// Tab Video: lưới thẻ. Ảnh bìa + nút ▶ đỏ; bấm mới tải iframe (tránh tải YouTube khi chưa cần).
export default function VideoLibrary({ videos, sections, ui, watchedIds, playingId, onPlay, onToggleWatched }) {
  return (
    <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-[18px]">
      {videos.map((v) => {
        const { embedUrl, watchUrl } = getYouTubeLinks(v)
        const id = watchUrl && new URL(watchUrl).searchParams.get('v')
        const thumb = v.thumbnailUrl || (id && `https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
        const watched = watchedIds.includes(v.id)
        const playing = playingId === v.id && embedUrl
        const related = (v.relatedSectionIds ?? []).map((sid) => sections.find((s) => s.id === sid)?.title).filter(Boolean)
        return (
          <article key={v.id} className={`overflow-hidden rounded-[26px] border bg-white ${watched ? 'border-success' : 'border-line'}`}>
            {playing ? (
              <div className="relative aspect-video bg-ink">
                <iframe
                  src={embedUrl.replace('autoplay=0', 'autoplay=1')}
                  title={v.title}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => (embedUrl ? onPlay(v.id) : watchUrl && window.open(watchUrl, '_blank', 'noopener'))}
                aria-label={`Phát video: ${v.title}`}
                className="relative block aspect-video w-full bg-ink bg-cover bg-center transition-[filter] hover:brightness-110"
                style={thumb ? { backgroundImage: `url('${thumb}')` } : undefined}
              >
                <span className="absolute inset-0 bg-linear-to-b from-ink/0 from-40% to-ink/75" />
                <span className="absolute top-1/2 left-1/2 grid size-[72px] -translate-1/2 place-items-center rounded-full bg-primary pl-[5px] text-[26px] text-on-dark">▶</span>
                {v.channelName && <span className="absolute bottom-3.5 left-4 text-[12px] font-extrabold tracking-[.1em] text-gold uppercase">{v.channelName}</span>}
              </button>
            )}
            <div className="px-5 py-[18px]">
              {v.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {v.tags.map((t) => (
                    <span key={t} className="rounded-full bg-cream px-2.5 py-1 text-[11.5px] font-bold text-primary-dark">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="mt-2.5 text-[17px] leading-[1.35] font-extrabold">{v.title}</h3>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-soft">{v.description}</p>
              {related.length > 0 && <p className="mt-2 text-[12.5px] font-semibold text-muted">Liên quan: {related.join(', ')}</p>}
              <div className="mt-3.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={watched}
                  onClick={(e) => onToggleWatched(v.id, e)}
                  className={`min-h-11 rounded-full px-4 text-[13.5px] font-extrabold ${watched ? 'bg-success-soft text-success' : 'bg-ink text-on-dark'}`}
                >
                  {watched ? `✓ ${ui.completeLabel}` : `Đánh dấu ${ui.completeLabel.toLowerCase()}`}
                </button>
                {watchUrl && (
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center rounded-full border border-line-strong px-4 text-[13.5px] font-bold text-ink-soft hover:text-primary">
                    {ui.openExternalLabel} ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
