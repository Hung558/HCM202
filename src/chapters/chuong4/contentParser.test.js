import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  filterByTopic,
  isCitationLine,
  parseChapter,
  searchUnits,
  stripQuoteIntros,
  stripQuoteMarks,
} from './contentParser.js'

const raw = readFileSync(new URL('./Chương IV.txt', import.meta.url), 'utf8')
const doc = parseChapter(raw)

// toàn bộ chữ mà trang học bài hiển thị (tiêu đề + mục tiêu + mọi đoạn)
const displayedText = (d) => {
  const out = [...(d.titleLines ?? []), d.docTitle]
  if (d.intro) {
    if (d.intro.title) out.push(d.intro.title)
    for (const b of d.intro.bullets) out.push(b.label, b.text)
  }
  for (const sec of d.sections) {
    out.push(sec.title)
    for (const item of sec.items) {
      out.push(item.title)
      for (const part of [item, ...item.children]) {
        out.push(part.title)
        for (const pa of part.paragraphs) out.push(pa.text)
      }
    }
  }
  return out.join('\n')
}

test('parses the document title and intro from the file', () => {
  assert.equal(doc.docTitle.includes('TƯ TƯỞNG HỒ CHÍ MINH'), true)
  assert.equal(doc.docTitle.includes('NHÀ NƯỚC'), true)
  assert.ok(doc.intro)
  assert.ok(doc.intro.bullets.length >= 3)
  for (const b of doc.intro.bullets) {
    assert.ok(b.label.length > 0)
    assert.ok(b.text.length > 30)
  }
})

test('finds the three roman-numeral sections', () => {
  const titles = doc.sections.map((s) => s.title)
  assert.equal(titles.length, 3)
  assert.equal(titles[0].includes('ĐẢNG CỘNG SẢN VIỆT NAM'), true)
  assert.equal(titles[1].includes('NHÂN DÂN'), true)
  assert.equal(titles[2].includes('XÂY DỰNG'), true)
})

test('the document title keeps its original line breaks', () => {
  assert.deepEqual(doc.titleLines, [
    'Chương IV',
    'TƯ TƯỞNG HỒ CHÍ MINH VỀ ĐẢNG CỘNG SẢN VIỆT NAM',
    'VÀ NHÀ NƯỚC CỦA NHÂN DÂN, DO NHÂN DÂN, VÌ NHÂN DÂN',
  ])
  // docTitle = các dòng tiêu đề nối lại, không mất chữ
  assert.equal(doc.docTitle, doc.titleLines.join(' '))
})

test('every section has items with verbatim paragraphs and original markers', () => {
  assert.ok(doc.sections.length > 0)
  let itemCount = 0
  for (const sec of doc.sections) {
    assert.ok(sec.title.length > 0)
    assert.match(sec.marker, /^[IVXLCP]+\.$/)
    assert.ok(sec.items.length > 0)
    for (const item of sec.items) {
      itemCount++
      assert.ok(item.id.length > 0, 'item id must not be empty')
      assert.ok(item.title.length > 0)
      assert.match(item.marker, /^\d+[.)]$/)
      for (const part of [item, ...item.children]) {
        // mục số chỉ chứa mục con (không có đoạn nào của riêng nó) được phép không có đoạn
        if (part.paragraphs.length === 0) {
          assert.equal(part === item && item.children.length > 0, true)
          continue
        }
        for (const pa of part.paragraphs) {
          assert.ok(typeof pa.text === 'string' && pa.text.length > 0)
        }
      }
      for (const child of item.children) {
        assert.match(child.marker, /^[a-z][.)]$/)
      }
    }
  }
  const unitCount = doc.sections.reduce((n, s) => n + s.items.reduce((m, i) => m + 1 + i.children.length, 0), 0)
  assert.ok(unitCount >= 15, `expected a realistic number of study units, got top=${itemCount} total=${unitCount}`)
})

test('every heading line of the file is reproduced verbatim, marker included', () => {
  const headings = []
  for (const sec of doc.sections) {
    headings.push(`${sec.marker} ${sec.title}`)
    for (const item of sec.items) {
      headings.push(`${item.marker} ${item.title}`)
      for (const ch of item.children) headings.push(`${ch.marker} ${ch.title}`)
    }
  }
  // marker + tiêu đề phải khớp đúng dòng đề mục trong file (sau khi nối dòng tràn)
  const rawText = raw.replace(/\r\n?/g, '\n').replace(/\s+/g, ' ')
  let checked = 0
  for (const h of headings) {
    assert.ok(rawText.includes(h), `heading not found verbatim in the .txt: "${h}"`)
    checked++
  }
  assert.ok(checked >= 17, `expected every heading to be checked, got ${checked}`)
})

test('numbered and bulleted lists keep their original markers', () => {
  const types = { li: 0, ol: 0 }
  for (const sec of doc.sections) {
    for (const item of sec.items) {
      for (const part of [item, ...item.children]) {
        for (const pa of part.paragraphs) {
          if (pa.type === 'li') {
            types.li++
            assert.equal(pa.marker, '-', 'bullet keeps the "-" from the file')
            assert.ok(!pa.text.startsWith('-'), 'marker is not duplicated in the text')
          }
          if (pa.type === 'ol') {
            types.ol++
            assert.match(pa.text, /^\(\d+\)/, 'numbered item keeps its "(n)" in the text')
          }
        }
      }
    }
  }
  assert.ok(types.li >= 15, `expected the dash lists to be detected, got ${types.li}`)
  assert.ok(types.ol >= 9, `expected the "(n)" lists to be detected, got ${types.ol}`)
})

test('no summary / remember / keywords fields are produced', () => {
  // trang học bài chỉ hiện nguyên văn: không sinh mục tóm tắt, ghi nhớ, từ khóa
  const banned = ['summary', 'concepts', 'notes', 'quote', 'remember']
  for (const sec of doc.sections) {
    for (const item of sec.items) {
      for (const part of [item, ...item.children]) {
        for (const key of banned) assert.equal(key in part, false, `unexpected field "${key}"`)
      }
    }
  }
})

test('letter subheadings become child units (a. / b. / c.)', () => {
  const children = doc.sections.flatMap((s) => s.items.flatMap((i) => i.children.map((c) => c.title)))
  assert.equal(children.some((t) => t.includes('Đảng là đạo đức')), true)
  assert.equal(children.some((t) => t.includes('Những vấn đề nguyên tắc')), true)
  assert.equal(children.some((t) => t.includes('đội ngũ cán bộ')), true)
  // mục số có mục con thì vẫn giữ tiêu đề riêng và nằm trong mục lục
  const tops = doc.sections.flatMap((s) => s.items.map((i) => i.title))
  assert.equal(tops.some((t) => t.includes('Đảng phải trong sạch')), true)
})

test('item ids are unique and slug-like', () => {
  const ids = doc.sections.flatMap((s) => [s.id, ...s.items.map((i) => i.id)])
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/)
})

test('sections with subheadings keep an overview item when intro text exists', () => {
  // "Tính tất yếu..." heading followed by body text before "2." → still 1+ items
  const first = doc.sections[0]
  assert.ok(first.items.length >= 2)
})

test('filterByTopic ranks matching sections first and keeps order when query is empty', () => {
  assert.equal(filterByTopic(doc.sections, '').length, doc.sections.length)
  const hits = filterByTopic(doc.sections, 'Nhà nước của dân, do dân, vì dân')
  assert.ok(hits.length > 0)
  assert.equal(
    hits.some((s) => s.title.includes('NHÂN DÂN')),
    true,
  )
})

test('every item carries full verbatim paragraphs (no content loss)', () => {
  // toàn bộ chữ hiển thị (docTitle + intro + paragraphs) phải khớp câu trong file
  const collected = [doc.docTitle]
  if (doc.intro) {
    if (doc.intro.title) collected.push(doc.intro.title)
    for (const b of doc.intro.bullets) collected.push(b.label, b.text)
  }
  for (const sec of doc.sections) {
    collected.push(sec.title)
    for (const item of sec.items) {
      collected.push(item.title)
      for (const part of [item, ...item.children]) {
        for (const pa of part.paragraphs) {
          if (pa.parts) for (const sp of pa.parts) collected.push(sp.text)
          else collected.push(pa.text)
        }
      }
      for (const ch of item.children) collected.push(ch.title)
    }
  }
  // join(' ') có thể chèn space trước dấu câu giữa các phần trích dẫn — chuẩn hóa
  // (cả parsed lẫn probe) để so sánh nguyên văn công bằng
  const normPunct = (t) => t.replace(/\s+([;,.!?…])/g, '$1')
  const parsedText = normPunct(collected.join(' ').replace(/\s+/g, ' '))
  // So sánh theo dòng: dòng đề mục (La Mã/số/chữ/viết hoa) trở thành title — kiểm tra
  // riêng từng dòng; các dòng còn lại kiểm tra theo câu. Nhờ vậy dòng đề mục không bị
  // nối với dòng nội dung kế tiếp khi tách câu từ raw.
  const rawLines = raw.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean)
  const isHeadingLine = (l) =>
    /^[IVXLCP]+\.\s/.test(l) || /^\d+[.)]\s/.test(l) || /^[a-z][.)]\s/.test(l) || /^[#]+\s/.test(l) ||
    (l.replace(/[^\p{Lu}\p{Ll}]/gu, '').length >= 6 && l === l.toUpperCase())
  let bodySentenceCount = 0
  for (const line of rawLines) {
    if (isHeadingLine(line)) {
      // đề mục ("a. Đảng là đạo đức…") → title trong parsed (bỏ tiền tố khi so)
      const probe = line.replace(/^(?:[IVXLCP]+|\d+|[a-z])[.)]\s*/, '').trim()
      assert.ok(parsedText.includes(probe), `heading lost: "${probe}…"`)
      continue
    }
    for (const s of line.split(/(?<=[.!?…])\s+/)) {
      // gạch đầu dòng "- Nhãn" tách thành label/text riêng; dấu vết trích dẫn bị
      // clean() gỡ chủ ý — áp cùng chuẩn hóa trước khi so nguyên văn.
      // Ngoặc "(đăng báo …)" có thể bị cắt ở cuối dòng nên cho phép chưa đóng ngoặc.
      const probe = normPunct(
        s
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/^-\s*/, '')
          .replace(/(["”»«“„‟])\d+/g, '$1')
          .replace(/(["”»«“„‟])°+/g, '$1')
          .replace(/\s*\(đăng[^)]*,?/gi, '')
          // câu bắt đầu giữa dòng còn sót đuôi của ngoặc xuất bản đã gỡ ("3-2-1969), Người…")
          .replace(/^\d{1,2}-\d{1,2}-\d{4}\),?\s*/, '')
          .replace(/(\p{L}{3,})\d{1,2}(?!\d)(?=[\s.,;:!?)»”"']|$)/gu, '$1'),
      )
      if (probe.replace(/[^\p{L}\p{N}]/gu, '').length < 40) continue
      bodySentenceCount++
      assert.ok(parsedText.includes(probe.slice(0, 60)), `sentence lost: "${probe.slice(0, 60)}…"`)
    }
  }
  assert.ok(bodySentenceCount > 100, `expected many body sentences, got ${bodySentenceCount}`)
})

test('quotes and paragraphs have verbatim text and consistent shape', () => {
  let quotes = 0
  for (const sec of doc.sections) {
    for (const item of sec.items) {
      for (const part of [item, ...item.children]) {
        // mục cha chỉ chứa mục con được phép không có đoạn riêng
        if (part.paragraphs.length === 0) {
          assert.equal(part === item && item.children.length > 0, true)
          continue
        }
        for (const pa of part.paragraphs) {
          if (pa.type === 'quote') {
            quotes++
            assert.ok(pa.parts.length > 0)
            assert.equal(pa.parts.some((sp) => sp.q), true)
            // parts nối lại phải đúng bằng text (nguyên văn, không thêm/bớt)
            assert.equal(pa.parts.map((sp) => sp.text).join(''), pa.text)
          } else {
            assert.ok(typeof pa.text === 'string' && pa.text.length > 0)
          }
        }
      }
    }
  }
  // 2 khối trích dẫn đứng riêng thật sự trong file. Trước đây có 3 vì một mảnh
  // nửa câu ở dòng 324 ("“hồng" vừa “chuyên""") bị tách nhầm thành khối riêng;
  // nay đã nối lại đúng vào câu của nó (xem test "không cắt đôi câu").
  assert.ok(quotes >= 2, `expected quote blocks detected, got ${quotes}`)
})

test('no paragraph is cut mid-sentence by the line-wrap or the 480-char splitter', () => {
  // Dấu vết xuất hiện khi parser cắt đôi một câu bị xuống dòng trong PDF: đoạn
  // kết bằng mảnh vụn ("…là những người", "…Nguyên lý") và đoạn sau mở đầu bằng
  // ngoặc kép. Ở đây: mọi đoạn phải kết thúc bằng dấu kết câu.
  const END = new Set(['.', '!', '?', '…', '”', '»', '"', ':', ')'])
  const offenders = []
  for (const sec of doc.sections) {
    for (const item of sec.items) {
      for (const part of [item, ...item.children]) {
        for (const pa of part.paragraphs) {
          const t = pa.text.trim()
          if (!END.has(t.slice(-1))) offenders.push(`${item.marker}/${part.marker} …${t.slice(-50)}`)
        }
      }
    }
  }
  assert.deepEqual(offenders, [], 'paragraph ends on a broken fragment')
})

test('no paragraph is cut mid-quotation by the parser', () => {
  // Không được ngắt đoạn khi trích dẫn còn mở: sinh đoạn kết bằng mảnh vụn.
  // Dựng lại từ TÁCH KHỐI THÔ (line 141 mở “ mà dòng 144 chỉ có "Lênin22." và
  // dòng 147 kết "." — file gốc vốn không đóng ngoặc kép ở đây). Vì vậy tiêu chí là
  // TÍCH LUỸ: chiều sâu ngoặc kép phải về 0 ở CUỐI đoạn, và không đoạn nào được cắt
  // khi đang mở. Hai đoạn còn mở là lỗi file gốc, đã xác nhận ở test dưới.
  const OPEN = new Set(['“', '«'])
  const CLOSE = new Set(['”', '»', '"'])
  const depth = (t) => {
    let d = 0
    for (const ch of t) {
      if (OPEN.has(ch)) d++
      else if (CLOSE.has(ch)) d--
      if (d < 0) d = 0
    }
    return d
  }
  // mỗi đoạn (trừ `quote`) phải cân bằng ngoặc kép, hoặc là một trong hai đoạn hợp lệ
  // đuôi (không kèm dấu "…") của hai đoạn mà FILE GỐC không đóng ngoặc kép
  const sourceUnclosed = [
    'hoàn cảnh, từng lúc, từng nơi, không được phép giáo điều.',
    'tu dưỡng và thực hành đạo đức cách mạng.',
  ]
  let checked = 0
  for (const sec of doc.sections) {
    for (const item of sec.items) {
      for (const part of [item, ...item.children]) {
        for (const pa of part.paragraphs) {
          if (pa.type === 'quote') continue
          if (depth(pa.text) === 0) continue
          const ok = sourceUnclosed.some((tail) => pa.text.endsWith(tail))
          assert.ok(ok, `paragraph ends with an open quotation: …${pa.text.slice(-54)}`)
          checked++
        }
      }
    }
  }
  // đúng 2 đoạn, không hơn — nếu thêm đoạn thứ ba thì đã hỏng ở chỗ khác
  assert.equal(checked, 2, 'exactly the two source-unclosed quotations remain')
})

test('the two paragraphs left with an open quote are unclosed in the source file', () => {
  // Chương IV.txt:141 mở “Đảng muốn vững…” và không có dấu đóng nào tới hết
  // đoạn 2./b.; tương tự 3./a. Không thêm dấu đóng — giữ nguyên văn file.
  const flat = raw.replace(/\r\n?/g, '\n').replace(/\s+/g, ' ')
  const opensAt141 = '“Đảng muốn vững thì phải có chủ nghĩa làm cốt'
  const afterOpens = flat.slice(flat.indexOf(opensAt141))
  const beforeEnd = afterOpens.slice(0, afterOpens.indexOf('không được phép giáo điều.'))
  assert.equal(/[”»"]/.test(beforeEnd), false, 'the file never closes this quotation — parser must not invent one')
  const text = displayedText(doc)
  assert.ok(text.includes(opensAt141), 'quotation opening kept verbatim')
  assert.equal(text.includes(`${opensAt141}”`), false, 'no closing quote was added')
})

test('the multi-line quotation that used to be broken is now one whole sentence', () => {
  // Chương IV.txt:280 — "…là những người" rồi xuống dòng "“thắng không kiêu
  // bại không nản”…". Trước đây bị tách làm đoạn kết bằng "…những người".
  const t = displayedText(doc)
  assert.ok(t.includes('mà phải là những người “thắng không kiêu bại không nản”'), 'sentence stays joined')
  assert.ok(t.includes('Nguyên lý “dân là chủ” khẳng định'), 'orphaned "Nguyên lý" rejoins its sentence')
  assert.equal(/\.\s*Nguyên lý\s*$/.test(t), false, 'no paragraph ends on the bare word "Nguyên lý"')
})

test('dangling citation and punctuation tails are removed from the assembled paragraph', () => {
  // Đuôi trích dẫn chỉ bị gỡ ở CUỐI khối đã ghép xong, không phải ở từng dòng.
  // Vì vậy "Trang 45" ở giữa file vẫn giữ nguyên; chỉ khi nó rơi vào đuôi khối
  // (dòng cuối) thì mới bị gỡ.
  const base = [
    '# Chương X',
    'I. MỘT PHẦN',
    '1. Tiêu đề mục',
    'Câu học thuật này cần giữ nguyên văn và không bị cắt.',
    'Theo tác giả, nhận định đó là đúng. Trang 45',
  ]
  const t = displayedText(parseChapter([...base, 'Vậy mà dòng kết này bị cắt dở,'].join('\n')))
  assert.ok(t.includes('Câu học thuật này cần giữ nguyên văn'), 'study sentence survives')
  assert.ok(t.includes('bị cắt dở'), 'dangling text is kept, only the trailing comma goes')
  assert.equal(t.includes('bị cắt dở,'), false, 'trailing comma removed')

  const tail = displayedText(parseChapter([...base, 'Toàn tập, Tập 12, Nxb Chính trị quốc gia, 2011'].join('\n')))
  assert.ok(tail.includes('nhận định đó là đúng'), 'sentence before the tail survives')
  assert.equal(/Trang 45/.test(tail), false, 'trailing "Trang 45" removed at a block end')
})

test('tail cleanup never removes study content or mid-sentence words', () => {
  const src = [
    '# Chương XI',
    'I. MỘT PHẦN',
    '1. Tập trung dân chủ',
    '- Trang bị cho sinh viên nắm được Nguyên lý cơ bản của chủ nghĩa Mác.',
  ].join('\n')
  const t = displayedText(parseChapter(src))
  assert.ok(t.includes('Trang bị cho sinh viên'), '"Trang" mid-sentence is content')
  assert.ok(t.includes('Nguyên lý cơ bản'), '"Nguyên lý" mid-sentence is content')
  assert.ok(t.includes('Tập trung dân chủ'), '"Tập" in a heading is content')
})

test('no citation or reference information survives into the displayed text', () => {
  const t = displayedText(doc)
  // các dấu vết có thật trong file (xác nhận ở test dưới) phải biến mất khỏi kết quả
  assert.equal(/["“”„‟«»]\s*\d/.test(t), false, 'superscript footnote digit after a quote mark')
  assert.equal(/["“”„‟«»]\s*°/.test(t), false, 'degree-sign footnote artifact')
  assert.equal(/\p{L}{3,}\d{1,2}(?!\d)/u.test(t), false, 'footnote digit glued to a word')
  assert.equal(/đăng báo|số 5409|3-2-1969/i.test(t), false, 'newspaper publication note')
})

test('the citation markers being removed really exist in the source file', () => {
  // chống "test xanh vì không kiểm": xác nhận file gốc có các dấu vết trên
  const flat = raw.replace(/\r\n?/g, '\n').replace(/\s+/g, ' ')
  assert.ok((flat.match(/(["”»«“„‟])\d+/g) || []).length >= 53, 'expected the footnote digits')
  assert.ok(flat.includes('Lênin22.'), 'expected a digit glued to a word')
  assert.ok(flat.includes('Cộng hòa1,'), 'expected a digit glued to a word')
  assert.ok(flat.includes('mặc đủ”°'), 'expected the degree-sign artifact')
  assert.ok(flat.includes('(đăng báo Nhân Dân, số 5409, ngày 3-2-1969)'), 'expected the publication note')
  assert.ok(flat.includes('»4.') && flat.includes('"9.'), 'expected footnote numbering gaps')
})

test('cleaning never eats study content', () => {
  const t = displayedText(doc)
  assert.ok(t.includes('(năm 1927)'), 'year inside a work title is kept')
  assert.ok(t.includes('năm1959'), 'scanned year without a space is content, not a footnote')
  assert.ok(t.includes('Trong tác phẩm Đường cách mệnh'), 'quotation attribution lead-in is kept')
  assert.ok(t.includes('Người viết trong Di chúc'), 'quotation attribution lead-in is kept')
  assert.ok(t.includes('Tập trung dân chủ'), '"Tập" inside a heading is not a citation')
  assert.ok(t.includes('Trang bị cho sinh viên'), '"Trang" inside the intro is not a citation')
  const enumerations = (t.match(/\(\d+\)/g) || []).length
  assert.ok(enumerations >= 14, `expected the "(n)" study lists to survive, got ${enumerations}`)
})

test('standalone citation lines are dropped', () => {
  const src = [
    '# Chương IX',
    'I. MỘT PHẦN',
    '1. Tiêu đề mục',
    'Câu này là nội dung học cần giữ nguyên.',
    'Hồ Chí Minh Toàn tập, Tập 12, Nxb Chính trị quốc gia, 2011.',
    'Tập 12',
    'Trang 45.',
    'Nguồn: báo Nhân Dân',
    'Trích từ: sách giáo khoa',
    'ISBN 978-604-000-000-0',
    'https://example.com/bai-viet',
    '[1]',
    '(*)',
  ].join('\n')
  const t = displayedText(parseChapter(src))
  assert.ok(t.includes('Câu này là nội dung học cần giữ nguyên.'), 'study content survives')
  for (const gone of ['Toàn tập', 'Tập 12', 'Trang 45', 'Nguồn:', 'Trích từ:', 'ISBN', 'example.com', '[1]', '(*)']) {
    assert.equal(t.includes(gone), false, `citation line not removed: "${gone}"`)
  }
})

test('searchUnits returns the same array for an empty query', () => {
  // không query → trả về chính doc.sections (identity) để không render lại vô ích
  assert.equal(searchUnits(doc.sections, ''), doc.sections)
  assert.equal(searchUnits(doc.sections, '   '), doc.sections)
})

test('searchUnits narrows to real entries only', () => {
  const hits = searchUnits(doc.sections, 'văn minh')
  assert.ok(hits.length > 0, 'expected at least one section to match')
  const allItems = doc.sections.flatMap((s) => s.items)
  const allIds = new Set(
    doc.sections.flatMap((s) => [s.id, ...s.items.flatMap((i) => [i.id, ...i.children.map((c) => c.id)])]),
  )
  const allItemIds = new Set(allItems.map((o) => o.id))
  for (const s of hits) {
    assert.ok(allIds.has(s.id), `unknown section id "${s.id}"`)
    assert.ok(s.items.length > 0, 'a returned section keeps at least one item')
    for (const it of s.items) {
      assert.ok(allIds.has(it.id), `unknown item id "${it.id}"`)
      assert.ok(allItemIds.has(it.id), 'item comes from the parsed doc')
      for (const ch of it.children) assert.ok(allIds.has(ch.id), `unknown child id "${ch.id}"`)
    }
  }
})

test('searchUnits preserves document order and never re-ranks', () => {
  // "cương lĩnh" nằm ở phần II — kết quả phải giữ đúng thứ tự I, II, III của file
  const hits = searchUnits(doc.sections, 'cương lĩnh')
  const order = doc.sections.map((s, i) => [s.id, i])
  const positions = hits.map((s) => order.find(([id]) => id === s.id)[1])
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b), 'sections must not be reordered')
})

test('searchUnits ignores case and diacritics', () => {
  const a = searchUnits(doc.sections, 'đảng').map((s) => s.id)
  const b = searchUnits(doc.sections, 'DANG').map((s) => s.id)
  const c = searchUnits(doc.sections, 'đảng'.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).map((s) => s.id)
  assert.deepEqual(b, a)
  assert.deepEqual(c, a)
})

test('searchUnits returns nothing for a query that is absent', () => {
  assert.deepEqual(searchUnits(doc.sections, 'xyzzy không có trong chương này'), [])
  // chỉ ký tự không phải chữ/số (ví dụ "---") → coi như không có từ khóa, trả về nguyên danh sách
  assert.equal(searchUnits(doc.sections, '---'), doc.sections)
})

test('no line of the real file is treated as a citation footer', () => {
  // luật gỡ dòng trích dẫn là "phòng thủ" cho các chương khác: với file này phải rảnh
  const lines = raw.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean)
  assert.deepEqual(lines.filter(isCitationLine), [], 'a study line must not be dropped as a citation')
})
