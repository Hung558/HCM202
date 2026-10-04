import data from './data.json'

const sources = Object.fromEntries(data.sources.map((source) => [source.id, source]))

export default function Sources({ citations }) {
  if (!citations?.length) return null
  return (
    <div className="mt-5 border-t border-line pt-4 text-sm text-muted">
      <p className="mb-2 font-bold text-ink-soft">Nguồn tham khảo</p>
      <ul className="space-y-2">
        {citations.map(({ sourceId, locator }) => {
          const source = sources[sourceId]
          return source && (
            <li key={`${sourceId}-${locator}`}>
              <a className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
              {locator && <span> · {locator}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
