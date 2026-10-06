import Sources from './Sources.jsx'

// Mỗi kiểu block một hình thức riêng: đoạn văn, ô đánh số, giấy note vàng, lưới thẻ, đường thời gian, thẻ "Ôn bộ thẻ này".
export default function ContentBlocks({ blocks = [], onOpenCards }) {
  return (
    <div className="mt-6 flex flex-col gap-[18px]">
      {blocks.map((b) => (
        <div key={b.id} className="min-w-0">
          <Block b={b} onOpenCards={onOpenCards} />
        </div>
      ))}
    </div>
  )
}

function Block({ b, onOpenCards }) {
  switch (b.type) {
    case 'paragraph':
      return (
        <>
          {b.title && <h3 className="mb-2 text-[17px] font-extrabold">{b.title}</h3>}
          <p className="text-[16px] leading-[1.8] whitespace-pre-line text-pretty">{b.text}</p>
          <Sources citations={b.citations} />
        </>
      )
    case 'heading':
      return <h3 className="text-[19px] font-extrabold">{b.text || b.title}</h3>
    case 'bullet_list':
      return (
        <>
          {b.title && <h3 className="mb-2.5 text-[17px] font-extrabold">{b.title}</h3>}
          <ol className="flex flex-col gap-2.5">
            {b.items.map((it, k) => (
              <li key={k} className="flex items-start gap-3.5 rounded-[18px] bg-paper px-4 py-3.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[12.5px] font-extrabold text-on-dark">{k + 1}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] leading-[1.65]">{it.text}</span>
                  <Sources citations={it.citations} />
                </span>
              </li>
            ))}
          </ol>
          <Sources citations={b.citations} />
        </>
      )
    case 'callout':
      return (
        <div className="relative -rotate-[0.6deg] rounded-[6px_22px_22px_22px] bg-gold px-[22px] py-5">
          <span aria-hidden="true" className="absolute -top-2.5 left-6 h-[18px] w-[60px] -rotate-[4deg] bg-on-dark/70" />
          <p className="text-[12.5px] font-extrabold tracking-[.12em] text-primary-dark uppercase">
            {b.tone === 'important' ? '⚠' : '✎'} {b.title}
          </p>
          <p className="mt-1.5 text-[15.5px] leading-[1.6] font-semibold">{b.text}</p>
        </div>
      )
    case 'table': {
      const [head, ...rest] = b.columns
      return (
        <>
          {b.title && <h3 className="mb-2.5 text-[17px] font-extrabold">{b.title}</h3>}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-2.5">
            {b.rows.map((r, k) => (
              <div key={k} className="rounded-[18px] border border-line bg-white p-4 transition-transform duration-200 hover:-translate-y-[3px]">
                <p className="text-[11.5px] font-extrabold tracking-[.1em] text-faint uppercase">{head.label}</p>
                <p className="mt-1 text-[16px] leading-[1.35] font-extrabold text-primary">{r[head.key]}</p>
                {rest.map((c) => (
                  <div key={c.key}>
                    <p className="mt-2.5 text-[11.5px] font-extrabold tracking-[.1em] text-faint uppercase">{c.label}</p>
                    <p className="mt-1 text-[14px] leading-[1.6]">{r[c.key]}</p>
                  </div>
                ))}
                {r.flashcardIds?.length > 0 && (
                  <button type="button" onClick={() => onOpenCards(r.flashcardIds, r[head.key])} className="mt-3 min-h-11 text-[13px] font-bold text-primary hover:text-primary-dark">
                    Ôn {r.flashcardIds.length} thẻ →
                  </button>
                )}
                <Sources citations={r.citations} />
              </div>
            ))}
          </div>
        </>
      )
    }
    case 'timeline':
      return (
        <>
          {b.title && <h3 className="mb-2.5 text-[17px] font-extrabold">{b.title}</h3>}
          <ol className="relative flex flex-col gap-3 pl-7">
            <span aria-hidden="true" className="absolute top-2 bottom-2 left-[9px] w-[3px] rounded-[3px] bg-linear-to-b from-primary to-amber" />
            {b.items.map((ti) => (
              <li key={ti.id} className="relative rounded-[18px] bg-cream px-4 py-3.5">
                <span aria-hidden="true" className="absolute top-4 -left-[26px] size-[17px] rounded-full border-4 border-primary bg-white" />
                <time dateTime={ti.date} className="text-[13px] font-extrabold text-primary">{ti.label}</time>
                <p className="mt-0.5 text-[16px] font-extrabold">{ti.title}</p>
                <p className="mt-1 text-[14px] leading-[1.6] text-ink-soft">{ti.text}</p>
                <Sources citations={ti.citations} />
              </li>
            ))}
          </ol>
        </>
      )
    case 'flashcard_review':
      return (
        <div className="flex flex-wrap items-center gap-4 rounded-[22px] bg-ink px-[22px] py-5 text-on-dark">
          <div aria-hidden="true" className="relative h-[52px] w-16 shrink-0">
            <span className="absolute inset-0 -rotate-[8deg] rounded-[10px] bg-amber" />
            <span className="absolute inset-0 rotate-[4deg] rounded-[10px] bg-gold" />
            <span className="absolute inset-0 grid place-items-center rounded-[10px] bg-on-dark font-extrabold text-primary">{b.flashcardIds.length}</span>
          </div>
          <span className="min-w-40 flex-1">
            <span className="block text-[17px] font-extrabold">{b.title}</span>
            <span className="text-[13.5px] text-on-dark/75">{b.flashcardIds.length} thẻ chọn lọc để ôn ngay</span>
          </span>
          <button type="button" onClick={() => onOpenCards(b.flashcardIds, b.title)} className="min-h-[46px] rounded-full bg-gold px-5 text-[14px] font-extrabold text-ink">
            Ôn bộ thẻ này →
          </button>
        </div>
      )
    default:
      return <p className="rounded-xl bg-cream p-4 text-sm">Phần nội dung này chưa có định dạng được hỗ trợ.</p>
  }
}
