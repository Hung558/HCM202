import { ArrowRight } from 'lucide-react'
import Sources from './Sources.jsx'

export function RelatedCards({ ids = [], cards, onOpenCard }) {
  const related = [...new Set(ids)].map((id) => cards.find((card) => card.id === id)).filter(Boolean)
  if (!related.length) return null
  return (
    <div className="mt-3 grid gap-2">
      {related.map((card) => (
        <button key={card.id} type="button" onClick={() => onOpenCard(card.id)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3 text-left text-sm font-semibold text-ink hover:bg-track">
          <span>{card.front}</span><ArrowRight size={16} className="shrink-0 text-primary" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

export default function ContentBlocks({ blocks = [], cards, onOpenCard }) {
  return (
    <div className="mt-6 space-y-6 text-[15.5px] leading-[1.75] text-ink-soft">
      {blocks.map((block) => {
        let body
        switch (block.type) {
          case 'paragraph':
            body = <p className="whitespace-pre-line">{block.text}</p>
            break
          case 'bullet_list':
            body = <ul className="list-disc space-y-4 pl-5 marker:text-primary">{block.items.map((item, index) => (
              <li key={index}>{item.text}<Sources citations={item.citations} /></li>
            ))}</ul>
            break
          case 'table':
            body = <div role="region" aria-label={block.title || 'Bảng nội dung'} tabIndex={0} className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[520px] text-left text-sm leading-relaxed">
                <caption className={block.title ? 'p-4 text-left font-bold text-ink' : 'sr-only'}>{block.title || 'Bảng nội dung'}</caption>
                <thead className="bg-paper text-ink"><tr>{block.columns.map((column) => <th key={column.key} scope="col" className="px-4 py-3 font-bold">{column.label}</th>)}</tr></thead>
                <tbody>{block.rows.map((row, index) => <tr key={index} className="border-t border-line align-top">
                  {block.columns.map((column, columnIndex) => <td key={column.key} className="px-4 py-4">
                    {row[column.key]}
                    {columnIndex === block.columns.length - 1 && <>
                      <RelatedCards ids={row.flashcardIds} cards={cards} onOpenCard={onOpenCard} />
                      <Sources citations={row.citations} />
                    </>}
                  </td>)}
                </tr>)}</tbody>
              </table>
            </div>
            break
          case 'timeline':
            body = <ol className="ml-2 space-y-6 border-l-2 border-line pl-6">{block.items.map((item) => <li key={item.id} className="relative">
              <span className="absolute -left-[31px] top-2 size-3 rounded-full bg-primary" aria-hidden="true" />
              <time dateTime={item.date} className="text-sm font-bold text-primary">{item.label}</time>
              <h4 className="mt-1 font-bold text-ink">{item.title}</h4>
              <p className="mt-2">{item.text}</p>
              <RelatedCards ids={item.flashcardIds} cards={cards} onOpenCard={onOpenCard} />
              <Sources citations={item.citations} />
            </li>)}</ol>
            break
          case 'callout':
            body = <aside className={`rounded-2xl p-5 ${block.tone === 'important' ? 'border-l-4 border-primary bg-primary/10' : 'bg-cream'}`}>
              <h4 className="font-bold text-ink">{block.title}</h4><p className="mt-2">{block.text}</p>
            </aside>
            break
          case 'flashcard_review':
            body = <div><h4 className="font-bold text-ink">{block.title}</h4><RelatedCards ids={block.flashcardIds} cards={cards} onOpenCard={onOpenCard} /></div>
            break
          case 'heading':
            body = <h4 className="text-lg font-bold text-ink">{block.text || block.title}</h4>
            break
          default:
            body = <p role="status" className="rounded-xl bg-cream p-4 text-sm">Phần nội dung này chưa có định dạng được hỗ trợ.</p>
        }
        return <div key={block.id}>{block.title && !['callout', 'flashcard_review', 'table', 'heading'].includes(block.type) && <h4 className="mb-3 font-bold text-ink">{block.title}</h4>}{body}<Sources citations={block.citations} /></div>
      })}
    </div>
  )
}
