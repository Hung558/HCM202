import data from './data.json'

const sources = Object.fromEntries(data.sources.map((source) => [source.id, source]))

// Dòng nguồn gọn: "Nguồn: <nhà xuất bản> · ..." (mỗi nguồn một lần, bấm để mở trang gốc).
export default function Sources({ citations, className = 'text-faint' }) {
  const list = [...new Map((citations ?? []).map((c) => [c.sourceId, sources[c.sourceId]])).values()].filter(Boolean)
  if (!list.length) return null
  return (
    <p className={`mt-1.5 text-[12px] font-semibold ${className}`}>
      Nguồn:{' '}
      {list.map((s, i) => (
        <span key={s.id}>
          {i > 0 && ' · '}
          <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.title} className="underline-offset-2 hover:underline">
            {s.publisher.split(';')[0]}
          </a>
        </span>
      ))}
    </p>
  )
}
