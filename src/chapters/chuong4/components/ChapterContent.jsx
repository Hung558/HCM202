// Tab 2 – Kiến thức: trang học bài sinh 100% từ "Chương IV.txt" — KHÔNG đổi chữ.
// Mọi câu hiển thị nguyên văn từ parser, ĐÃ DỌN SẠCH trích dẫn: không hộp trích
// dẫn (blockquote), không ngoặc kép, không câu giới thiệu trích dẫn, không tài
// liệu tham khảo — văn bản trích dẫn trở thành đoạn văn thường như sách giáo khoa.
// KHÔNG tóm tắt, KHÔNG diễn giải, KHÔNG gắn nhãn mới.
//
// Dạng trang: sách bài / tài liệu, KHÔNG phải dashboard — không thẻ trắng bao
// quanh nội dung, phân cấp bằng typography + đường kẻ + khoảng trắng:
//   Chương        — header dính trên cùng (đã có sẵn, không lặp ở đây)
//   ## I. <tiêu đề>  — phần lớn: kẻ ngang phía trên, h2 cỡ lớn
//   ### 1. <tiêu đề> — mục: h3 đậm, cách phần lớn bằng khoảng cách
//   #### a. <tiêu đề> — mục con: thụt lề, h4 bán đậm (KHÔNG thẻ)
//   Đoạn văn      — max-w 70ch, giãn dòng rộng cho dễ đọc
// Chỉ dùng thẻ nhỏ khi thật cần: trạng thái lỗi.
// Marker "I." / "1." / "a." và dấu "-" / "(1)" của file được giữ nguyên.
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ListTree, Loader2, Search } from 'lucide-react'
import { parseChapter, searchUnits } from '../contentParser.js'

// Cache mức module: parse một lần duy nhất mỗi phiên trang.
let cachedDoc = null
const loadChapter = async () => {
  if (cachedDoc) return cachedDoc
  const mod = await import('../Chương IV.txt?raw')
  const doc = parseChapter(mod.default)
  cachedDoc = doc
  return doc
}

// Một đoạn: p / ol / li — chỉ khác cách TRÌNH BÀY, chữ giữ nguyên từ parser.
function Paragraph({ para }) {
  // Gạch đầu dòng: giữ nguyên dấu "-" của file.
  if (para.type === 'li') {
    return (
      <p className="flex items-baseline gap-2.5 text-[16px] leading-[1.85] text-ink-soft">
        <span className="shrink-0 text-primary">{para.marker}</span>
        <span>{para.text}</span>
      </p>
    )
  }

  // Mục đánh số: "(1)…" nằm ngay trong text (thụt lề treo, không đánh số lại).
  if (para.type === 'ol') {
    return (
      <p className="pl-[2.1em] indent-[-2.1em] text-[16px] leading-[1.85] text-ink-soft">
        {para.text}
      </p>
    )
  }

  return <p className="text-[16.5px] leading-[1.85] text-ink-soft">{para.text}</p>
}

const Body = ({ paragraphs }) => (
  <div className="mt-5 flex max-w-[76ch] flex-col gap-[18px]">
    {paragraphs.map((para, i) => (
      <Paragraph key={i} para={para} />
    ))}
  </div>
)

// #### Mục con ("a. …"): KHÔNG thẻ — thụt lề + typography, luôn mở.
function SubUnit({ id, title, marker, paragraphs, scrollMargin }) {
  return (
    <div id={`hoc-${id}`} className="sm:pl-6" style={scrollMargin}>
      <h4 className="flex items-baseline gap-2 text-[16.5px] font-bold leading-snug tracking-[-0.005em] text-ink">
        {marker && <span className="shrink-0 font-extrabold text-primary">{marker}</span>}
        <span>{title}</span>
      </h4>
      <Body paragraphs={paragraphs} />
    </div>
  )
}

// ### Mục ("1. …") và các mục con của nó.
function Unit({ id, title, marker, paragraphs, children, scrollMargin }) {
  return (
    <article id={`hoc-${id}`} className="flex flex-col gap-8" style={scrollMargin}>
      <div>
        <h3 className="flex items-baseline gap-2.5 text-[19px] font-extrabold leading-snug tracking-[-0.01em] text-ink">
          {marker && <span className="shrink-0 text-primary">{marker}</span>}
          <span>{title}</span>
        </h3>
        {paragraphs.length > 0 && <Body paragraphs={paragraphs} />}
      </div>
      {children.length > 0 && (
        <div className="flex flex-col gap-8">
          {children.map((ch) => (
            <SubUnit
              key={ch.id}
              id={ch.id}
              title={ch.title}
              marker={ch.marker}
              paragraphs={ch.paragraphs}
              scrollMargin={scrollMargin}
            />
          ))}
        </div>
      )}
    </article>
  )
}

// ## Phần lớn ("I. …"): kẻ ngang phía trên + khoảng cách, KHÔNG bọc thẻ riêng.
// first:border-t-0 bỏ kẻ ở phần đầu tiên khi không có khối MỤC TIÊU phía trên.
function Section({ section, scrollMargin, isFirst }) {
  return (
    <section
      id={`hoc-${section.id}`}
      className={`border-t border-line pt-8 ${isFirst ? 'border-t-0 pt-0' : ''}`}
      style={scrollMargin}
    >
      <h2 className="flex items-baseline gap-2.5 text-[clamp(21px,2.5vw,28px)] font-extrabold leading-[1.22] tracking-[-0.01em] text-ink">
        {section.marker && <span className="shrink-0 text-primary">{section.marker}</span>}
        <span>{section.title}</span>
      </h2>
      <div className="mt-9 flex flex-col gap-11">
        {section.items.map((item) => (
          <Unit key={item.id} {...item} scrollMargin={scrollMargin} />
        ))}
      </div>
    </section>
  )
}

// topOffset: chiều cao khối sticky (header + tabs + divider) đo ở Chuong4Page —
// dùng để căn IntersectionObserver đúng dưới header và scroll-margin khi bấm mục lục.
export default function ChapterContent({ topOffset = 0 }) {
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [query, setQuery] = useState('')

  // Chỉ parse lần đầu tab mở (component mount lần đầu); kết quả lấy từ cache module
  useEffect(() => {
    let alive = true
    loadChapter().then(
      (d) => alive && setDoc(d),
      (e) => alive && setError(e?.message ?? String(e)),
    )
    return () => {
      alive = false
    }
  }, [])

  const flatItems = useMemo(
    () => (doc ? doc.sections.flatMap((s) => s.items.map((it) => ({ sec: s, item: it }))) : []),
    [doc],
  )

  // Ô tìm kiếm chỉ lọc MỤC LỤC; `doc.sections` bên phải giữ nguyên → không mất nội dung
  const tocSections = useMemo(() => (doc ? searchUnits(doc.sections, query) : []), [doc, query])

  // Đánh dấu mục đang đọc trên mục lục khi cuộn
  useEffect(() => {
    if (!doc) return undefined
    const els = flatItems.map(({ item }) => document.getElementById(`hoc-${item.id}`)).filter(Boolean)
    if (els.length === 0) return undefined
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (first) setActiveId(first.target.id.replace('hoc-', ''))
      },
      { rootMargin: `${-(topOffset + 24)}px 0px -70% 0px` },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [doc, flatItems, topOffset])

  const goto = (id) => {
    document.getElementById(`hoc-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (error) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
        <AlertCircle className="size-8 text-primary" />
        <p className="text-[15px] font-bold">Không tải được nội dung chương</p>
        <p className="text-[13px] text-muted">{error}</p>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-[13.5px] font-semibold">Đang đọc Chương IV…</p>
      </div>
    )
  }

  const scrollMargin = { scrollMarginTop: 'calc(var(--header-height) + var(--tabs-height) + 20px)' }

  return (
    <>
      {/* Tiêu đề chương đã hiện ở header dính trên cùng — không lặp lần hai ở đây.
          H1 ẩn để trang vẫn có đúng một thẻ H1 cho trình đọc màn hình. */}
      <h1 className="sr-only">{doc.docTitle}</h1>

      {/* Mục lục dính (desktop): offset & chiều cao tính từ CSS variables
          --header-height/--tabs-height (đo động ở Chuong4Page); tự cuộn khi tràn. */}
      <div className="grid gap-7 pt-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-[calc(var(--header-height)_+_var(--tabs-height)_+_21px)] lg:max-h-[calc(100vh_-_var(--header-height)_-_var(--tabs-height)_-_33px)] lg:self-start lg:overflow-y-auto">
          {/* THẺ TRÁI: mục lục + ô tìm kiếm. Lọc CHỈ mục lục — nội dung bên phải
              luôn hiện đầy đủ, không bao giờ bị ẩn theo từ khóa. */}
          <div className="card p-5">
            <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.09em] text-muted">
              <ListTree className="size-3.5" /> Mục lục
            </p>

            <div className="relative mt-3.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm trong chương"
                aria-label="Tìm trong chương"
                className="w-full rounded-[10px] border border-line-strong bg-paper/70 py-2 pl-9 pr-3 text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-primary"
              />
            </div>

            {tocSections.length === 0 ? (
              <p className="mt-4 text-[12.5px] italic text-muted">Không tìm thấy mục nào</p>
            ) : (
              <nav className="mt-4 flex flex-col gap-4">
                {tocSections.map((s) => (
                  <div key={s.id}>
                    <p className="text-[11.5px] font-extrabold uppercase leading-snug tracking-[0.06em] text-primary">
                      {s.marker ? `${s.marker} ` : ''}
                      {s.title}
                    </p>
                    <ul className="mt-1.5 flex flex-col">
                      {s.items.map((it) => (
                        <li key={it.id}>
                          <button
                            onClick={() => goto(it.id)}
                            className={`block w-full truncate border-l-2 py-1.5 pl-2.5 text-left text-[13px] leading-snug transition-colors ${
                              activeId === it.id
                                ? 'border-primary font-bold text-primary'
                                : 'border-transparent font-medium text-ink-soft hover:text-ink'
                            }`}
                          >
                            {it.marker ? `${it.marker} ` : ''}
                            {it.title}
                          </button>
                          {it.children.length > 0 && (
                            <ul className="mb-1 ml-2.5 flex flex-col border-l border-line pl-1.5">
                              {it.children.map((ch) => (
                                <li key={ch.id}>
                                  <button
                                    onClick={() => goto(ch.id)}
                                    className="block w-full truncate border-l-2 border-transparent py-1 pl-2.5 text-left text-[12px] font-medium leading-snug text-muted transition-colors hover:text-ink"
                                  >
                                    {ch.marker ? `${ch.marker} ` : ''}
                                    {ch.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </div>
        </aside>

        {/* THẺ PHẢI: MỘT thẻ duy nhất chứa cả chương. Bên trong chỉ dùng
            typography + khoảng cách + đường kẻ ngăn cách 3 phần lớn. */}
        <div className="card min-w-0 p-8 sm:p-10">
          {doc.intro && (
            // KHÔNG kẻ dưới: phần lớn ngay sau đã có kẻ trên của nó
            <section>
              {doc.intro.title && (
                <h2 className="text-[17px] font-extrabold uppercase tracking-[0.03em] text-ink">{doc.intro.title}</h2>
              )}
              <ul className="mt-4 flex flex-col gap-3.5">
                {doc.intro.bullets.map((b, i) => (
                  <li key={i} className="flex items-baseline gap-2.5 text-[16px] leading-[1.85] text-ink-soft">
                    <span className="shrink-0 text-primary">{b.marker}</span>
                    <span>
                      <span className="font-bold text-ink">{b.label}</span> {b.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {doc.sections.map((s, i) => (
            <Section key={s.id} section={s} scrollMargin={scrollMargin} isFirst={!doc.intro && i === 0} />
          ))}
        </div>
      </div>
    </>
  )
}