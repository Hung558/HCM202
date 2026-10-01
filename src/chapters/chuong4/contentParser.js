// Phân tích "Chương IV.txt" NGAY LÚC CHẠY (runtime): toàn bộ nội dung trang học bài
// sinh ra từ file văn bản — thay file là trang tự cập nhật, không hardcode nội dung.
//
// Đề mục nhận dạng tự động (không cần khai báo trước):
//   "#" hoặc "##" đầu dòng                       → cấp 1 / cấp 2 (markdown)
//   "I." "II." … (số La Mã) đầu dòng             → cấp 1 (section)
//   "1." "2." … đầu dòng                         → cấp 2 (mục)
//   "a." "b." "c." … đầu dòng                    → mục con, lồng vào mục số đứng ngay trước
//   dòng viết hoa toàn bộ                        → cấp 1 (tiêu đề section, tự gộp dòng tràn)
// Mọi đề mục giữ NGUYÊN marker gốc của file ("I.", "2.", "a.") ở field `marker`
// để UI hiện đúng như bản gốc. Tiêu đề tài liệu = dòng đầu file + các dòng viết
// hoa dài (≥20 ký tự) liền sau, trả về cả `titleLines` (từng dòng) và `docTitle`.
// Vùng giữa tiêu đề và đề mục La Mã đầu tiên là "MỤC TIÊU": gạch đầu dòng
// "- Nhãn" + các dòng nối tiếp thành intro { title, bullets: [{ marker, label, text }] }.
//
// KHÔNG tóm tắt, không diễn giải, không sinh thêm mục nào: output chỉ gồm cấu trúc
// + nguyên văn. Đoạn văn dài chỉ được ngắt tại ranh giới câu (không đổi ký tự nào).
//
// DỌN TRÍCH DẪN & TÀI LIỆU THAM KHẢO trước khi hiển thị — trang đọc như một trang
// sách giáo khoa sạch, không phải tài liệu có trích dẫn:
//   - bỏ hẳn câu CHỈ để giới thiệu trích dẫn ("Người nói:", "Người khẳng định:",
//     "Hồ Chí Minh viết:", "Theo Người:", "Trích:", "Người chỉ rõ:", "Trong tác
//     phẩm…, Hồ Chí Minh khẳng định:"…) — kể cả khi trích dẫn nằm ở khối sau;
//   - gỡ MỌI dấu ngoặc kép/guillemet: văn bản trích dẫn trở thành đoạn văn thường,
//     không còn hộp trích dẫn (blockquote) hay chữ in nghiêng kiểu trích dẫn;
//   - gỡ dòng/đuôi trích nguồn (Nguồn:, Nxb, Tập n, Trang n, ISBN, URL, [1], (*)),
//     số chú thích, mảnh vỡ quét PDF (đăng báo…), dấu câu treo cuối đoạn.
// Chữ nội dung học bài được giữ NGUYÊN từng chữ — chỉ bỏ dấu trích dẫn và các câu
// phụ thuộc (giới thiệu trích dẫn, trích nguồn).

const ROMAN_RE = /^([IVXLCP]+\.)\s+(.*)$/
const NUMBER_RE = /^(\d+[.)])\s+(.*)$/
const LETTER_RE = /^([a-z][.)])\s+(.*)$/
const MD2_RE = /^#{2,}\s+(.*)$/
const MD1_RE = /^#\s+(.*)$/
const BULLET_RE = /^([-–•*])\s+(.*)$/

// Dòng mở đầu một đoạn logic mới trong vùng văn bản trơn (file đã gỡ dòng cứng,
// không có dòng trống giữa các đoạn): đánh số "(1)", "Một là…", hoặc mở trích dẫn.
const PARA_START_RE = /^(?:\(\d+\)|(?:Một|Hai|Ba|Bốn|Năm|Sáu|Bảy|Tám|Chín|Mười) là\b|[“«])/

// Dấu kết câu: chỉ sau đó một dòng mới được coi là mở đoạn mới. File này KHÔNG
// giữ dòng cứng, nên câu vẫn tiếp ở giữa dòng; nếu chỉ nhìn PARA_START_RE thì
// chỗ xuống dòng ngay sau một từ nối ("…là những người" + "“thắng không kiêu…")
// bị cắt thành hai khối, để lại một mảnh vụn ("Nguyên lý") cuối đoạn.
const SENTENCE_END_CHARS = new Set(['.', '!', '?', '…', '”', '»', '"', ':', ')'])
const endsSentence = (line) => SENTENCE_END_CHARS.has(line.slice(-1))

// Đoạn mở đầu bằng số thứ tự "(1)", "(2)"… → hiển thị thành MỤC ĐÁNH SỐ.
// Marker "(n)" GIỮ NGUYÊN trong text (không dùng counter của CSS) để không bao giờ
// bị đánh số lại và không mất ký tự nào của file.
const OL_START_RE = /^\(\d+\)/

// Câu CHỈ để giới thiệu trích dẫn: chủ ngữ trích dẫn + động từ trích dẫn + ":" và
// NGAY SAU là văn bản trích dẫn (dấu ngoặc kép, hoặc câu mới mở đầu bằng chữ hoa —
// nội dung trích). Nhận dạng theo CÂU nên chỉ gỡ câu thuần túy làm nhiệm vụ dẫn
// trích dẫn; câu mang nội dung riêng (giới thiệu danh sách "(1)(2)…", luận điểm,
// dấu ":" giữa câu) không khớp và được giữ nguyên.
const QUOTE_INTRO_RE = new RegExp(
  '(?:^|(?<=[.!?…]["”»]?)\\s+)' +
    '(?:' +
    '(?:Trong\\s+(?:tác phẩm|bài nói|bài viết|bài báo|Di chúc|thư|một bài)|Từ đầu những năm|Lời nói đầu|Người|Hồ Chí Minh)' +
    '[^:]{0,160}?' +
    '(?:nói rõ|nói|viết|khẳng định|chỉ rõ|chỉ ra|nhấn mạnh|nêu rõ|tuyên bố|cảnh báo|đề nghị|yêu cầu|cho rằng|phát biểu|ghi|mong|lưu ý|nêu lên|nêu ý kiến|nhắc nhở|nhắc lại)' +
    '\\b[^:]{0,24}\\s*:' +
    '|' +
    '(?:Theo\\s+(?:Người|Hồ Chí Minh)|Trích)\\s*:' +
    ')' +
    '(?=\\s*[“"«A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠ])',
  'gi',
)

// Gỡ các câu giới thiệu trích dẫn khỏi khối đã ghép. `nextStartsQuote` cho biết
// khối KẾ TIẾP có mở đầu bằng ngoặc kép không — câu giới thiệu đứng CUỐI khối,
// trích dẫn nằm ở khối sau thì cũng phải gỡ (nối qua sentinel " “" cuối chuỗi).
export const stripQuoteIntros = (text, nextStartsQuote = false) => {
  const probe = nextStartsQuote ? `${text} “` : text
  const stripped = probe.replace(QUOTE_INTRO_RE, '')
  if (stripped === probe) return text
  return (nextStartsQuote ? stripped.slice(0, -2) : stripped).trim()
}

// Gỡ mọi dấu ngoặc kép/guillemet: văn bản trích dẫn thành đoạn văn thường (giữ
// nguyên chữ, chỉ bỏ dấu trích dẫn). Sửa luôn dấu câu xót lại sau khi gỡ dấu
// (vd rằng,“Đảng → rằng,Đảng → rằng, Đảng;  chân chính ». → chân chính ».
// → chân chính.) — không thêm/bớt từ nào.
export const stripQuoteMarks = (s) =>
  s
    .replace(/[“”«»"„‟]/g, '')
    .replace(/([,;:])(?=\p{L})/gu, '$1 ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

// Chia đoạn văn dài thành các đoạn ~2–3 câu (chỉ ngắt tại ranh giới câu,
// KHÔNG đổi ký tự nào) — tránh "bức tường chữ" trên trang học bài. Chạy SAU khi
// đã gỡ sạch ngoặc kép nên không cần theo dõi chiều sâu trích dẫn nữa.
const SENT_BOUNDARY_RE = /(?<=[.!?…])\s+(?=[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠ(])/

const splitLongParagraph = (text, max = 480) => {
  if (text.length <= max) return [text]
  const chunks = []
  let cur = ''
  for (const s of text.split(SENT_BOUNDARY_RE)) {
    if (!s) continue
    if (cur && `${cur} ${s}`.length > max) {
      chunks.push(cur)
      cur = s
    } else {
      cur = cur ? `${cur} ${s}` : s
    }
  }
  if (cur) chunks.push(cur)
  return chunks
}

const isAllCaps = (s) => {
  const letters = s.replace(/[^A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯa-zàáâãèéêìíòóôõùúăđĩũơ]/g, '')
  return letters.length >= 6 && letters === letters.toUpperCase()
}

// Chỉ khớp dòng viết hoa thuần (không phải đề mục La Mã/số/chữ/markdown)
const isPureCaps = (line) =>
  isAllCaps(line) && !MD1_RE.test(line) && !MD2_RE.test(line) && !ROMAN_RE.test(line) && !NUMBER_RE.test(line) && !LETTER_RE.test(line)

// Dòng trích dẫn/nguồn đứng RIÊNG một dòng ở cuối đoạn — xoá hẳn khối.
// Chỉ nhận tiền tố + số/URL nên "Tập trung dân chủ", "Trang bị cho sinh viên" an toàn.
const CITATION_LINE_RE =
  /^(?:Hồ Chí Minh Toàn tập|Toàn tập|Nxb|NXB|Tập \d+|Trang \d+|ISBN|https?:\/\/|www\.|\[\d+\]|\(\*\)|Nguồn:|Trích từ)/i

export const isCitationLine = (line) => CITATION_LINE_RE.test(line.trim())

// Gỡ mọi dấu vết trích dẫn khỏi câu, KHÔNG đụng tới chữ nội dung:
//   văn minh"1. → văn minh".      (53 lần: số chú thích bám sau dấu trích dẫn)
//   mặc đủ”°      → mặc đủ”       (ký tự chú thích vỡ)
//   (đăng báo Nhân Dân, số 5409, ngày 3-2-1969) → rỗng   (thông tin xuất bản;
//   dấu "," sau ngoặc được GIỮ lại: "…cá nhân", Người vẫn…" đọc trôi chảy hơn)
//   chủ nghĩa Lênin22. → chủ nghĩa Lênin.               (số chú thích dính liền chữ)
// `(?!\d)` + {1,2} giữ nguyên "năm1959" (4 chữ số = năm thật, là lỗi quét của file).
// Đuôi đoạn còn sót từ trích dẫn, ví dụ khối PDF quét lỗi bị cắt thành
// "…khẳng định đó. Trang 45" hoặc "…của tác giả. Nguồn:".
// CHỈ khớp khi mảnh nằm SÁT CUỐI chuỗi, nên "Tập trung dân chủ" và
// "Trang bị cho sinh viên" nằm giữa câu vẫn an toàn; "Nguyên lý" /
// "Giáo trình" cố tình KHÔNG có ở đây vì chúng là nội dung học bài.
const TRAILING_CITATION_RE =
  /(?:\s*[.,;:]?\s*(?:Nguồn\s*:|Trích từ|Toàn tập|Tập \d+|Trang \d+|Nxb\.?|ISBN)\s*[.,;:]?\s*)+$/i

// Dấu câu treo ở cuối đoạn — dấu vết câu bị ngắt dở. KHÔNG gỡ ":" vì
// SOURCE_RE nhận diện câu giới thiệu nguồn bằng dấu ":" ở cuối.
const DANGLING_TAIL_RE = /[\s,;-]+$/

const clean = (s) =>
  s
    .replace(/(["”»«“„‟])\d+/g, '$1')
    .replace(/(["”»«“„‟])°+/g, '$1')
    .replace(/\s*\(\s*đăng[^()]*\)/gi, '')
    .replace(/(\p{L}{3,})\d{1,2}(?!\d)(?=[\s.,;:!?)»”"']|$)/gu, '$1')
    .replace(/\.{2,}/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

// Dọn ĐUÔI đoạn đã ghép xong — KHÔNG đặt trong clean(): clean() chạy lên từng
// dòng khi nối khối, nên luật "bỏ đuôi" ở đó sẽ cắt dấu phẩy giữa hai dòng.
const trimDanglingTail = (s) =>
  s.replace(TRAILING_CITATION_RE, '').replace(DANGLING_TAIL_RE, '').trim()

const stripDiacritics = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')

export const slugify = (s) =>
  stripDiacritics(String(s))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'muc'

// Tiêu đề đã nhận dạng + marker gốc của file (null nếu dòng không có tiền tố)
const matchHeading = (line) => {
  let m = line.match(MD2_RE)
  if (m) return { level: 2, title: clean(m[1]), marker: null }
  m = line.match(MD1_RE)
  if (m) return { level: 1, title: clean(m[1]), marker: null }
  m = line.match(ROMAN_RE)
  if (m) return { level: 1, title: clean(m[2]), marker: m[1], roman: true }
  m = line.match(NUMBER_RE)
  if (m) return { level: 2, title: clean(m[2]), marker: m[1] }
  m = line.match(LETTER_RE)
  if (m) return { level: 2, title: clean(m[2]), marker: m[1], letter: true }
  if (isAllCaps(line)) return { level: 1, title: clean(line), marker: null }
  return null
}

// Đề mục có cấu trúc rõ (La Mã/số/chữ/markdown) — phân biệt với đề mục viết hoa
const isStructuredHeading = (line) => {
  const h = matchHeading(line)
  return h ? !isPureCaps(line) : false
}

// Phân tích toàn bộ chương → { docTitle, titleLines, intro, sections }
export function parseChapter(rawText) {
  const lines = String(rawText).replace(/\r\n?/g, '\n').split('\n')

  // --- Bước 1: tiêu đề tài liệu = dòng đầu tiên + các dòng viết hoa dài liền sau
  // (tiêu đề thường tràn nhiều dòng). Dừng ở đề mục có cấu trúc hoặc dòng caps ngắn.
  const docTitleLines = []
  let i = 0
  while (i < lines.length) {
    const t = lines[i].trim()
    if (!t) {
      i++
      continue
    }
    const structured = isStructuredHeading(t)
    if (docTitleLines.length === 0 && !structured) {
      docTitleLines.push(t)
      i++
      continue
    }
    if (docTitleLines.length > 0 && !structured && isPureCaps(t) && t.length >= 20) {
      docTitleLines.push(t)
      i++
      continue
    }
    break
  }
  // titleLines giữ từng dòng tiêu đề như file (dòng 1 = "Chương IV", các dòng sau
  // là phụ đề) để UI dựng đúng cấp # / phụ đề mà không phải nối lại chuỗi.
  const titleLines = docTitleLines.map((t) => clean(t))
  const docTitle = clean(docTitleLines.join(' '))

  // --- Bước 2: vùng intro — từ đây tới đề mục có cấu trúc đầu tiên (La Mã/số/chữ/md).
  // "MỤC TIÊU" (viết hoa) thành intro.title; gạch "- Nhãn" + dòng nối tiếp thành bullets.
  let introEnd = i
  while (introEnd < lines.length) {
    const t = lines[introEnd].trim()
    if (!t) {
      introEnd++
      continue
    }
    if (isStructuredHeading(t)) break
    introEnd++
  }
  const intro = { title: null, bullets: [] }
  let curIntro = null
  for (let n = i; n < introEnd; n++) {
    const line = lines[n].trim()
    if (!line) continue
    if (isCitationLine(line)) continue
    const bm = line.match(BULLET_RE)
    if (bm) {
      curIntro = { marker: bm[1], label: clean(bm[2]), text: '' }
      intro.bullets.push(curIntro)
    } else if (isPureCaps(line) && !curIntro && intro.title === null) {
      intro.title = clean(line)
    } else if (curIntro) {
      curIntro.text = clean(`${curIntro.text} ${line}`)
    } else if (intro.title === null) {
      intro.title = clean(line)
    } else {
      intro.title = clean(`${intro.title} ${line}`)
    }
  }
  const intro0 = intro.bullets.length || intro.title ? intro : null
  i = introEnd

  // --- Bước 3: quét phần còn lại thành khối; dòng văn bản liền nhau gộp vào khối trước
  // (kể cả nối tiếp gạch đầu dòng kiểu "- Nhãn\nNội dung…").
  const blocks = []
  let prevLine = '' // dòng nội dung đã xử lý gần nhất, dùng làm cổng "kết thúc câu"
  for (; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    // dòng toàn trích dẫn/nguồn (nguồn, Nxb, Tập n, Trang n, URL, [1], (*)) → bỏ qua
    if (isCitationLine(line)) continue
    const h = matchHeading(line)
    if (h) {
      let title = h.title
      if (isPureCaps(line)) {
        let j = i + 1
        while (j < lines.length) {
          const next = lines[j].trim()
          if (next && isPureCaps(next)) {
            title = clean(`${title} ${next}`)
            j++
          } else break
        }
        i = j - 1
      } else {
        // đề mục La Mã/số tràn sang dòng viết hoa kế tiếp (vd tiêu đề section II, III)
        // → gộp vào title, nếu không dòng đó sẽ thành section rỗng và làm mất chữ
        const next = (lines[i + 1] ?? '').trim()
        if (next && isPureCaps(next) && next.length >= 10) {
          title = clean(`${title} ${next}`)
          i++
        }
      }
      blocks.push({ heading: true, level: h.level, title, marker: h.marker, letter: !!h.letter })
      continue
    }
    const bm = line.match(BULLET_RE)
    if (bm) {
      blocks.push({ heading: false, bullet: true, marker: bm[1], text: clean(bm[2]) })
    } else if (PARA_START_RE.test(line) && (!prevLine || endsSentence(prevLine))) {
      // bắt đầu đoạn logic mới — tách thay vì nối tiếp khối trước.
      // Cổng "dòng trước đã kết thúc câu" chặn việc cắt đôi một câu bị xuống dòng.
      blocks.push({ heading: false, bullet: false, text: clean(line) })
    } else if (blocks.length > 0 && !blocks[blocks.length - 1].heading) {
      const prev = blocks[blocks.length - 1]
      prev.text = clean(`${prev.text} ${line}`)
    } else {
      blocks.push({ heading: false, bullet: false, text: clean(line) })
    }
    prevLine = line
  }

  // --- Bước 4: cây nội dung: section ("I.") → mục ("1.") → mục con ("a.")
  const sections = []
  let sec = null
  let curTop = null
  let active = null // khối đang nhận nội dung (mục số hoặc mục con)
  const finishTop = () => {
    if (sec && curTop) sec.items.push(curTop)
    curTop = null
    active = null
  }
  for (let n = 0; n < blocks.length; n++) {
    const b = blocks[n]
    if (b.heading && b.level === 1) {
      finishTop()
      sec = { id: slugify(b.title), title: b.title, marker: b.marker, items: [] }
      sections.push(sec)
      curTop = { title: b.title, marker: b.marker, blocks: [], children: [] }
      active = curTop
      continue
    }
    if (b.heading) {
      // đề mục "a." lồng vào mục số đứng ngay trước và nhận nội dung riêng
      if (b.letter && curTop) {
        const child = { title: b.title, marker: b.marker, blocks: [], children: [] }
        curTop.children.push(child)
        active = child
        continue
      }
      finishTop()
      curTop = { title: b.title, marker: b.marker, blocks: [], children: [] }
      active = curTop
      continue
    }
    if (!sec || !active) continue
    active.blocks.push(b)
  }
  finishTop()

  // --- Bước 5: dựng các đoạn của từng mục — chỉ còn 3 dạng: li (gạch "-"),
  // ol ("(n)…"), p (đoạn thường). Mỗi khối được DỌN TRÍCH DẪN trước khi ghép:
  // bỏ câu chỉ giới thiệu trích dẫn (kể cả khi trích dẫn nằm ở khối kế tiếp),
  // rồi gỡ mọi dấu ngoặc kép → văn bản trích dẫn thành đoạn văn thường, các đoạn
  // nối liền mạch như một trang sách giáo khoa.
  const buildParagraphs = (bl) => {
    const out = []
    for (let bi = 0; bi < bl.length; bi++) {
      const x = bl[bi]
      // khối đã ghép xong → dọn đuôi trích dẫn/dấu câu treo TRƯỚC khi tách câu
      const xText = trimDanglingTail(x.text)
      if (!xText) continue
      const nextStartsQuote = bi + 1 < bl.length && /^[“"«]/.test(bl[bi + 1].text.trimStart())
      const cleaned = stripQuoteMarks(stripQuoteIntros(xText, nextStartsQuote))
      if (!cleaned) continue
      if (x.bullet) {
        out.push({ type: 'li', marker: x.marker, text: cleaned })
        continue
      }
      if (OL_START_RE.test(cleaned)) {
        // đoạn đánh số "(1)…": giữ nguyên cả marker trong text, không tách nhỏ
        out.push({ type: 'ol', text: cleaned })
        continue
      }
      for (const chunk of splitLongParagraph(cleaned)) out.push({ type: 'p', text: chunk })
    }
    return out
  }

  const buildItem = (title, marker, bl) => ({
    id: '',
    title,
    marker,
    children: [],
    paragraphs: buildParagraphs(bl),
  })

  const usedIds = new Set()
  const uniqueId = (base) => {
    if (!usedIds.has(base)) {
      usedIds.add(base)
      return base
    }
    let n = 2
    while (usedIds.has(`${base}-${n}`)) n++
    usedIds.add(`${base}-${n}`)
    return `${base}-${n}`
  }

  const result = []
  for (const s of sections) {
    const items = []
    for (const top of s.items) {
      if (top.blocks.length === 0 && top.children.length === 0) continue // đề mục rỗng → bỏ
      const item = buildItem(top.title, top.marker, top.blocks)
      item.id = uniqueId(slugify(top.title))
      for (const ch of top.children) {
        if (ch.blocks.length === 0) continue
        const child = buildItem(ch.title, ch.marker, ch.blocks)
        child.id = uniqueId(slugify(ch.title))
        item.children.push(child)
      }
      items.push(item)
    }
    if (items.length > 0) {
      result.push({ id: s.id === '' ? uniqueId(slugify(s.title)) : uniqueId(s.id), title: s.title, marker: s.marker, items })
    }
  }

  return { docTitle, titleLines, intro: intro0, sections: result }
}

// Chữ của một mục (tiêu đề + nguyên văn các đoạn) để tìm kiếm theo chủ đề
const itemHay = (it) =>
  `${it.title} ${it.paragraphs.map((p) => p.text).join(' ')} ${it.children.map(itemHay).join(' ')}`

// Lọc section liên quan tới chủ đề quiz (không phân biệt hoa/thường và dấu thanh)
export function filterByTopic(sections, query) {
  const q = stripDiacritics(String(query ?? '').toLowerCase()).trim()
  if (!q) return sections
  const words = [...new Set(q.split(/[^a-z0-9]+/).filter((w) => w.length >= 3))]
  const score = (s) => {
    const hay = stripDiacritics(`${s.title} ${s.items.map(itemHay).join(' ')}`.toLowerCase())
    return words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0)
  }
  return sections
    .map((s) => ({ s, n: score(s) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.s)
}

const fold = (s) => stripDiacritics(String(s ?? '').toLowerCase())
const childHay = (ch) => `${ch.title} ${ch.paragraphs.map((p) => p.text).join(' ')}`
const secHay = (s) => `${s.title} ${s.items.map(itemHay).join(' ')}`

// Ô tìm kiếm trong mục lục: lọc section/mục/mục con theo câu, KHÔNG đánh thứ tự lại.
// Rỗng → trả về chính `sections` (không tạo object mới) để không render lại vô ích.
export function searchUnits(sections, query) {
  const q = fold(query).trim()
  if (!q) return sections
  const words = [...new Set(q.split(/[^a-z0-9]+/).filter((w) => w.length >= 2))]
  if (words.length === 0) return sections
  const hasAll = (hay) => {
    const f = fold(hay)
    return words.every((w) => f.includes(w))
  }

  const out = []
  for (const sec of sections) {
    const secHit = hasAll(secHay(sec))
    const items = []
    for (const item of sec.items) {
      // mục khớp khi chính nó khớp, hoặc khi cha (section) đã khớp
      if (!secHit && !hasAll(itemHay(item))) continue
      const children = secHit ? item.children : item.children.filter((ch) => hasAll(childHay(ch)))
      items.push(children.length === item.children.length ? item : { ...item, children })
    }
    if (items.length > 0) out.push(items.length === sec.items.length ? sec : { ...sec, items })
  }
  return out
}
