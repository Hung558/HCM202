import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const reportDir = dirname(fileURLToPath(import.meta.url))
const base = process.env.HCM202_TEST_URL || 'http://127.0.0.1:5173'
const chapterData = JSON.parse(await readFile(new URL('../../../src/chapters/chuong1/data.json', import.meta.url), 'utf8'))
const profile = await mkdtemp(join(tmpdir(), 'hcm202-browser-check-'))
const checks = []
const exceptions = []
const consoleErrors = []
const resourceFailures = []
const notes = []
let browser
let page

function assert(value, detail) {
  if (!value) throw new Error(detail)
}

function delay(ms) {
  return new Promise((done) => setTimeout(done, ms))
}

class CDP {
  constructor(socket) {
    this.socket = socket
    this.counter = 0
    this.pending = new Map()
    this.events = new Map()
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data)
      if (message.id) {
        const pending = this.pending.get(message.id)
        if (pending) {
          clearTimeout(pending.timer)
          this.pending.delete(message.id)
          if (message.error) pending.reject(new Error(JSON.stringify(message.error)))
          else pending.resolve(message.result)
        }
      } else {
        for (const listener of this.events.get(message.method) || []) listener(message.params)
      }
    })
  }

  static async connect(url) {
    const socket = new WebSocket(url)
    await new Promise((done, reject) => {
      socket.addEventListener('open', done, { once: true })
      socket.addEventListener('error', reject, { once: true })
    })
    return new CDP(socket)
  }

  on(event, listener) {
    this.events.set(event, [...(this.events.get(event) || []), listener])
  }

  send(method, params = {}) {
    const id = ++this.counter
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method} timed out`))
      }, 20_000)
      this.pending.set(id, { resolve, reject, timer })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }
}

async function until(expression, label, timeout = 15_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await page.evaluate(expression)) return
    await delay(100)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

async function check(name, fn) {
  try {
    const detail = await fn()
    checks.push({ name, passed: true, detail: detail || '' })
    console.log(`PASS ${name}${detail ? `: ${detail}` : ''}`)
  } catch (error) {
    checks.push({ name, passed: false, detail: error.message })
    console.log(`FAIL ${name}: ${error.message}`)
  }
}

async function click(expression) {
  const point = await page.evaluate(`(() => { const element = ${expression}; if (!element) throw new Error('No matching clickable element'); element.scrollIntoView({block:'center',behavior:'instant'}); const rect=element.getBoundingClientRect(); return {x:rect.x+rect.width/2,y:rect.y+rect.height/2}; })()`)
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point })
  await delay(100)
}

async function tab(index) {
  await click(`document.querySelectorAll('main > nav button')[${index}]`)
  await until(index === 2 ? `Boolean(document.querySelector('#chapter-reading-title'))` : index === 0 ? `Boolean(document.querySelector('#study-card'))` : `Boolean(document.querySelector('input[type=search]'))`, 'selected tab')
}

async function reload() {
  await page.send('Page.reload', { ignoreCache: true })
  await until(`Boolean(document.querySelector('#study-card button'))`, 'Flashcards after reload')
  await tab(2)
}

async function screenshot(name, scroll = 'window.scrollTo({top:0,behavior:"instant"})') {
  await page.evaluate(scroll)
  const { data } = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(join(reportDir, name), Buffer.from(data, 'base64'))
}

async function savedProgress() {
  return page.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(`hcm202:chuong1:learning:${chapterData.chapter.id}:guest`)}))`)
}

const readButton = (index = 0) => `document.querySelectorAll('article button[aria-label*="đã đọc"]')[${index}]`
const watchedButton = (index = 0) => `document.querySelectorAll('#chapter-videos button[aria-label*="đã xem"]')[${index}]`

try {
  browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', 'about:blank',
  ], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
  const endpoint = await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome did not expose debugging endpoint')), 15_000)
    let output = ''
    browser.stderr.on('data', (chunk) => {
      output += chunk.toString()
      const found = output.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (found) { clearTimeout(timer); done(found[1]) }
    })
    browser.once('error', (error) => { clearTimeout(timer); reject(error) })
    browser.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Chrome exited ${code}: ${output.slice(-1000)}`)) })
  })
  const browserProtocol = await CDP.connect(endpoint)
  const { product } = await browserProtocol.send('Browser.getVersion')
  notes.push(`Browser: ${product}; isolated temporary profile; no dependencies installed.`)
  const { targetId } = await browserProtocol.send('Target.createTarget', { url: 'about:blank' })
  const endpointUrl = new URL(endpoint)
  const targets = await (await fetch(`http://${endpointUrl.host}/json/list`)).json()
  page = await CDP.connect(targets.find((target) => target.id === targetId).webSocketDebuggerUrl)
  page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => exceptions.push(exceptionDetails.exception?.description || exceptionDetails.text))
  page.on('Runtime.consoleAPICalled', ({ type, args }) => {
    if (type === 'error') consoleErrors.push(args.map((argument) => argument.value ?? argument.description).join(' '))
  })
  page.on('Network.loadingFailed', (event) => resourceFailures.push(`${event.errorText}${event.blockedReason ? ` (${event.blockedReason})` : ''}`))
  await page.send('Page.enable')
  await page.send('Runtime.enable')
  await page.send('Network.enable')
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await page.send('Page.navigate', { url: `${base}/chuong1.html` })
  await until(`Boolean(document.querySelector('#study-card button'))`, 'application')

  await check('Exactly three top-level tabs; Flashcards is the default', async () => {
    const result = await page.evaluate(`Array.from(document.querySelectorAll('main > nav button'), b=>({text:b.innerText,pressed:b.getAttribute('aria-pressed')}))`)
    assert(result.length === 3 && result[0].pressed === 'true' && result[2].text === 'Nội dung & Video', JSON.stringify(result))
    return result.map((item) => item.text).join(' / ')
  })
  await check('Selected Flashcard and flipped face survive a tab round trip', async () => {
    await click(`Array.from(document.querySelectorAll('button')).find(b=>b.innerText.trim()==='Thẻ tiếp theo')`)
    await click(`document.querySelector('#study-card button')`)
    const before = await page.evaluate(`document.querySelector('#study-card button').getAttribute('aria-label')`)
    assert(before.startsWith('Giải thích:'), before)
    await tab(2)
    await tab(0)
    const after = await page.evaluate(`document.querySelector('#study-card button').getAttribute('aria-label')`)
    assert(before === after, `${before} -> ${after}`)
    return 'Second card, back face unchanged'
  })
  let flashcardSaved
  await check('Rating uses the existing Flashcard storage key and survives tab switching', async () => {
    await click(`Array.from(document.querySelectorAll('button')).find(b=>b.innerText.trim()==='Cần ôn lại')`)
    const key = `hcm202:chuong1:progress:${chapterData.metadata.id}`
    flashcardSaved = await page.evaluate(`localStorage.getItem(${JSON.stringify(key)})`)
    assert(JSON.parse(flashcardSaved).fc002.reviewCount === 1, flashcardSaved)
    await tab(2)
    await tab(0)
    assert(await page.evaluate(`localStorage.getItem(${JSON.stringify(key)})`) === flashcardSaved, 'Stored review changed')
    return 'fc002 reviewCount=1; legacy key preserved'
  })
  await tab(2)
  await check('Actual chapter title, four objectives, and seven reading sections render', async () => {
    const result = await page.evaluate(`({title:document.querySelector('#chapter-reading-title').innerText,objectives:Array.from(Array.from(document.querySelector('#chapter-reading-title').closest('section').querySelectorAll('h3')).find(h=>h.innerText.trim()==='Mục tiêu học tập').parentElement.querySelectorAll('li'),l=>l.innerText),headings:Array.from(document.querySelectorAll('article > h3'),h=>h.innerText),toc:document.querySelectorAll('nav[aria-label="Mục lục nội dung chương"] button').length})`)
    assert(result.title === chapterData.chapter.title, result.title)
    assert(JSON.stringify(result.objectives) === JSON.stringify(chapterData.chapter.learningObjectives), JSON.stringify(result.objectives))
    assert(result.toc === 7 && result.headings.length === 7, JSON.stringify(result))
    return 'Title matches data; 4 objectives; 7 sections and TOC entries'
  })
  await check('Collapsed self-check questions expand with real questions and answer-card links', async () => {
    const detail = `Array.from(document.querySelector('article').querySelectorAll('details')).find(d=>d.querySelector('summary').innerText.trim()==='Câu hỏi tự kiểm tra')`
    assert(await page.evaluate(`!(${detail}).open`), 'Questions are not initially collapsed')
    await click(`(${detail}).querySelector('summary')`)
    const result = await page.evaluate(`({open:(${detail}).open,questions:Array.from((${detail}).querySelectorAll('ol > li > p'),p=>p.innerText),buttons:(${detail}).querySelectorAll('button').length,visible:Array.from((${detail}).querySelectorAll('ol > li > p'),p=>p.getClientRects().length>0)})`)
    assert(result.open && result.visible.every(Boolean), JSON.stringify(result))
    assert(JSON.stringify(result.questions) === JSON.stringify(chapterData.contentSections[0].selfCheckQuestions.map(q=>q.question)), JSON.stringify(result))
    assert(result.buttons > 0, JSON.stringify(result))
    return `${result.questions.length} questions visible with ${result.buttons} answer-card buttons`
  })
  await check('Tables show both source values and every Congress/year/content column', async () => {
    const result = await page.evaluate(`Array.from(document.querySelectorAll('article table'),t=>({headers:Array.from(t.querySelectorAll('th'),e=>e.innerText),rows:Array.from(t.querySelectorAll('tbody tr'),r=>Array.from(r.querySelectorAll('td'),c=>c.childNodes[0]?.textContent?.trim() ?? ''))}))`)
    assert(result.length === 2, JSON.stringify(result))
    assert(JSON.stringify(result[0].headers) === JSON.stringify(['Nguồn tiếp thu','Điểm cần nhớ']), JSON.stringify(result[0]))
    assert(result[0].rows[0][0] === 'Nho giáo' && result[0].rows[0][1].startsWith('Hiếu học, tu dưỡng'), JSON.stringify(result[0]))
    assert(JSON.stringify(result[1].headers) === JSON.stringify(['Đại hội','Năm','Nội dung cần nhớ']), JSON.stringify(result[1]))
    assert(JSON.stringify(result[1].rows.map(r=>r.slice(0,2))) === JSON.stringify([['II','1951'],['V','1982'],['VI','1986'],['VII','1991'],['IX','2001'],['X','2006'],['XI','2011']]), JSON.stringify(result[1]))
    assert(result[1].rows.every(row=>row[2].length > 20), JSON.stringify(result[1]))
    return '2-column traditions table and 3-column Congress table complete'
  })
  await check('Timeline preserves day precision for 1911 and month precision for 1920', async () => {
    const times = await page.evaluate(`Array.from(document.querySelectorAll('article time'),e=>[e.getAttribute('datetime'),e.innerText])`)
    assert(JSON.stringify(times) === JSON.stringify([['1911-06-05','5/6/1911'],['1920-07','Tháng 7/1920'],['1920-12','Tháng 12/1920']]), JSON.stringify(times))
    return '1911-06-05, 1920-07, 1920-12'
  })
  await check('TOC moves and focuses the heading below the sticky header without marking read', async () => {
    await click(`document.querySelectorAll('nav[aria-label="Mục lục nội dung chương"] button')[4]`)
    const result = await page.evaluate(`({headingTop:document.querySelectorAll('article > h3')[4].getBoundingClientRect().top,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,focused:document.activeElement===document.querySelectorAll('article > h3')[4]})`)
    assert(result.focused && result.headingTop >= result.headerBottom, JSON.stringify(result))
    const progress = await savedProgress()
    assert(progress.lastSectionId === 'sec05' && progress.completedSectionIds.length === 0, JSON.stringify(progress))
    return `heading top ${result.headingTop}px; header bottom ${result.headerBottom}px`
  })
  await check('Manual reading mark, reversal, percentage, and reload restoration', async () => {
    await click(readButton())
    assert((await savedProgress()).completedSectionIds.join() === 'sec01', 'First section not saved')
    assert(await page.evaluate(`document.querySelector('[aria-label="Tiến độ đọc chương"]').getAttribute('aria-valuenow')`) === '14', 'Percentage not 14%')
    await reload()
    assert(await page.evaluate(`${readButton()}.getAttribute('aria-pressed')`) === 'true', 'Reload did not restore read mark')
    await click(readButton())
    assert((await savedProgress()).completedSectionIds.length === 0, 'Read mark not reversed')
    await reload()
    assert(await page.evaluate(`${readButton()}.getAttribute('aria-pressed')`) === 'false', 'Reversal not restored')
    return '0→1/7 (14%)→0; both persisted across reload'
  })
  await check('Selecting and changing videos loads an iframe with autoplay disabled; no watched mark', async () => {
    assert(await page.evaluate(`document.querySelectorAll('#chapter-videos iframe').length`) === 0, 'Player loaded before selection')
    await click(`document.querySelectorAll('#chapter-videos ul > li > button')[0]`)
    const first = await page.evaluate(`document.querySelector('#chapter-videos iframe').src`)
    assert(first.includes('/_HZ-m1Lqekg?autoplay=0') && new URL(first).searchParams.get('autoplay') === '0', first)
    await click(`document.querySelectorAll('#chapter-videos ul > li > button')[1]`)
    const second = await page.evaluate(`document.querySelector('#chapter-videos iframe').src`)
    assert(second.includes('/UmdfV1fU8G0?autoplay=0'), second)
    const progress = await savedProgress()
    assert(progress.lastVideoId === 'vid02' && progress.completedVideoIds.length === 0, JSON.stringify(progress))
    return 'Two real YouTube IDs; autoplay=0; watched count remains 0'
  })
  await check('Opening the external YouTube link leaves watched progress unchanged', async () => {
    const before = await savedProgress()
    await click(`document.querySelector('#chapter-videos a[target="_blank"]')`)
    await delay(300)
    const { targetInfos } = await browserProtocol.send('Target.getTargets')
    const external = targetInfos.find((target) => target.url.includes('youtube.com/watch?v=UmdfV1fU8G0'))
    assert(external, 'No external YouTube target opened')
    assert(JSON.stringify((await savedProgress()).completedVideoIds) === JSON.stringify(before.completedVideoIds), 'External link marked watched')
    await browserProtocol.send('Target.closeTarget', { targetId: external.targetId })
    return 'Correct watch URL opened in separate target; no completion change'
  })
  await check('Manual watched mark, reversal, selected video, and reload restoration', async () => {
    await click(watchedButton(1))
    assert((await savedProgress()).completedVideoIds.join() === 'vid02', 'Watched mark not saved')
    await reload()
    assert(await page.evaluate(`${watchedButton(1)}.getAttribute('aria-pressed')`) === 'true', 'Watched mark not restored')
    assert(await page.evaluate(`document.querySelector('#chapter-videos iframe').src.includes('UmdfV1fU8G0')`), 'Selected video not restored')
    await click(watchedButton(1))
    assert((await savedProgress()).completedVideoIds.length === 0, 'Watched reversal not saved')
    await reload()
    assert(await page.evaluate(`${watchedButton(1)}.getAttribute('aria-pressed')`) === 'false', 'Watched reversal not restored')
    return 'Mark and reversal persisted; last selected vid02 restored'
  })
  await check('Related Flashcard uses the existing handler and opens the exact requested card', async () => {
    await click(`Array.from(document.querySelectorAll('article button')).find(b=>b.innerText.trim()===${JSON.stringify(chapterData.flashcards.find(c=>c.id==='fc036').front)})`)
    await until(`Boolean(document.querySelector('#study-card'))`, 'related card')
    const result = await page.evaluate(`({label:document.querySelector('#study-card button').getAttribute('aria-label'),activeTab:document.querySelector('main > nav button[aria-pressed="true"]').innerText,focused:document.activeElement===document.querySelector('#study-card button')})`)
    assert(result.activeTab === 'Thẻ ghi nhớ' && result.label.includes(chapterData.flashcards.find(c=>c.id==='fc036').front) && result.label.startsWith('Lật thẻ:'), JSON.stringify(result))
    assert(result.focused, JSON.stringify(result))
    return 'fc036, front face, Flashcards tab, study button focused'
  })
  await tab(2)
  await check('Desktop layout has no horizontal page overflow', async () => {
    const sizes = await page.evaluate(`({viewport:innerWidth,page:document.documentElement.scrollWidth})`)
    assert(sizes.page <= sizes.viewport, JSON.stringify(sizes))
    await screenshot('desktop.png')
    await screenshot('desktop-reader.png', `document.querySelector('article > h3').scrollIntoView({block:'start',behavior:'instant'})`)
    return `${sizes.page}px page / ${sizes.viewport}px viewport`
  })
  await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await check('390px mobile layout contains wide tables and has no page overflow', async () => {
    const sizes = await page.evaluate(`({viewport:innerWidth,page:document.documentElement.scrollWidth,tables:Array.from(document.querySelectorAll('table'),t=>({table:t.scrollWidth,container:t.parentElement.clientWidth,overflow:getComputedStyle(t.parentElement).overflowX}))})`)
    assert(sizes.page <= sizes.viewport && sizes.viewport === 390, JSON.stringify(sizes))
    assert(sizes.tables.every(t=>t.overflow === 'auto' && t.table > t.container), JSON.stringify(sizes))
    await screenshot('mobile.png')
    await screenshot('mobile-reader.png', `document.querySelector('article > h3').scrollIntoView({block:'start',behavior:'instant'})`)
    await screenshot('mobile-videos.png', `document.querySelector('#chapter-videos').scrollIntoView({block:'start',behavior:'instant'})`)
    return `${sizes.page}px page / 390px viewport; tables scroll inside their regions`
  })
  await check('Mobile TOC scrolls the heading below the sticky header', async () => {
    await click(`document.querySelectorAll('nav[aria-label="Mục lục nội dung chương"] button')[5]`)
    const result = await page.evaluate(`({top:document.querySelectorAll('article > h3')[5].getBoundingClientRect().top,bottom:document.querySelector('header').getBoundingClientRect().bottom})`)
    assert(result.top >= result.bottom, JSON.stringify(result))
    return `heading top ${result.top}px; header bottom ${result.bottom}px`
  })
  await check('Corrupted saved learning progress gives a useful warning and working marks', async () => {
    const key = `hcm202:chuong1:learning:${chapterData.chapter.id}:guest`
    await page.evaluate(`localStorage.setItem(${JSON.stringify(key)},'{invalid JSON')`)
    await reload()
    assert(await page.evaluate(`Array.from(document.querySelectorAll('[role=alert]')).some(e=>e.innerText.includes('Không đọc được tiến độ đọc/xem'))`), 'No corrupted-storage warning')
    await click(readButton())
    assert((await savedProgress()).completedSectionIds.join() === 'sec01', 'Could not recover with fresh mark')
    return 'Warning shown; read mark replaces invalid saved value'
  })
  await check('Blocked localStorage warns while explicit marks still update in memory', async () => {
    const { identifier } = await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError')}})` })
    try {
      await reload()
      assert(await page.evaluate(`Array.from(document.querySelectorAll('[role=alert]')).some(e=>e.innerText.includes('Không đọc được tiến độ đọc/xem'))`), 'No blocked-access warning')
      await click(readButton())
      assert(await page.evaluate(`${readButton()}.getAttribute('aria-pressed')`) === 'true', 'Mark not updated in memory')
      assert(await page.evaluate(`Array.from(document.querySelectorAll('[role=alert]')).some(e=>e.innerText.includes('không lưu được tiến độ đọc/xem'))`), 'No blocked-write warning')
    } finally {
      await page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier })
    }
    return 'Read/write warnings shown; mark works without storage'
  })
  await page.send('Page.reload', { ignoreCache: true })
  await until(`Boolean(document.querySelector('#study-card'))`, 'app before empty-data harness')
  await check('Empty chapter sections/videos and invalid chapter have explicit UI states', async () => {
    await page.evaluate(`(async()=>{
      const React=await import('/node_modules/.vite/deps/react.js');
      const ReactDOM=await import('/node_modules/.vite/deps/react-dom_client.js');
      const {default:ContentVideo}=await import('/src/chapters/chuong1/ContentVideo.jsx');
      const {default:data}=await import('/src/chapters/chuong1/data.json');
      const host=document.createElement('div');host.id='browser-check-empty';document.body.append(host);
      window.__browserCheckRoot=(ReactDOM.default||ReactDOM).createRoot(host);
      window.__browserCheckRender=(props)=>window.__browserCheckRoot.render((React.default||React).createElement(ContentVideo,props));
      window.__browserCheckRender({data:{...data,chapter:{...data.chapter,id:'browser-test-empty',sectionIds:[],videoIds:[]},contentSections:[],videos:[]},onOpenCard:()=>{}});
    })()`)
    await until(`document.querySelector('#browser-check-empty')?.innerText.includes('Chương này chưa có nội dung bài đọc.')`, 'empty content')
    assert(await page.evaluate(`document.querySelector('#browser-check-empty').innerText.includes('Chương này chưa có video liên quan.')`), 'Missing empty-video message')
    assert(await page.evaluate(`document.querySelector('#browser-check-empty [aria-label="Tiến độ đọc chương"]').getAttribute('aria-valuenow')`) === '0', 'Empty progress is not zero')
    await page.evaluate(`window.__browserCheckRender({data:{metadata:{id:'missing'},flashcards:[],contentSections:[],videos:[]},onOpenCard:()=>{}})`)
    await until(`document.querySelector('#browser-check-empty')?.innerText.includes('Không tìm thấy thông tin của chương đang chọn.')`, 'missing chapter message')
    await page.evaluate(`window.__browserCheckRoot.unmount();document.querySelector('#browser-check-empty').remove();delete window.__browserCheckRoot;delete window.__browserCheckRender`)
    return 'Real component mounted through dev module imports; empty and missing states verified'
  })
  await check('No uncaught application JavaScript errors', async () => {
    assert(exceptions.length === 0, exceptions.join('\n'))
    assert(consoleErrors.length === 0, consoleErrors.join('\n'))
    return '0 Runtime exceptions; 0 console.error calls'
  })
  notes.push('YouTube playback and embed availability were not verified. Browser navigation to external provider URLs was attempted, but this environment may block provider access. Only generated URLs, iframe loading, external-target opening, and explicit completion behavior are covered.')
  if (resourceFailures.length) notes.push(`Observed network failures: ${[...new Set(resourceFailures)].join(', ')}.`)
  await browserProtocol.send('Browser.close').catch(() => {})
  page.socket.close()
  browserProtocol.socket.close()
} catch (error) {
  checks.push({ name: 'Browser verification infrastructure', passed: false, detail: error.stack || error.message })
  console.error(error.message)
} finally {
  if (browser && browser.exitCode == null) browser.kill()
  await delay(500)
  const temporaryRoot = resolve(tmpdir())
  if (dirname(resolve(profile)) === temporaryRoot && resolve(profile).startsWith(join(temporaryRoot, 'hcm202-browser-check-'))) {
    await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 }).catch((error) => notes.push(`Temporary browser profile could not be fully removed: ${error.message}`))
  }
  const failed = checks.filter((check) => !check.passed)
  const report = [
    '# Independent browser verification', '',
    `Date: ${new Date().toISOString()}`, '',
    `Result: ${checks.length - failed.length}/${checks.length} checks passed${failed.length ? `; ${failed.length} failed` : ''}.`, '',
    '| Check | Result | Evidence |', '| --- | --- | --- |',
    ...checks.map((check) => `| ${check.name} | ${check.passed ? 'PASS' : 'FAIL'} | ${check.detail.replaceAll('|', '\\|').replaceAll('\n', ' ')} |`), '',
    '## Notes', '', ...notes.map((note) => `- ${note}`), '',
    '## Artifacts', '',
    '- [Desktop introduction](desktop.png)', '- [Desktop reader](desktop-reader.png)',
    '- [390px mobile introduction](mobile.png)', '- [390px mobile reader](mobile-reader.png)', '- [390px mobile videos](mobile-videos.png)',
    '- Reproduce with the Vite dev server running: `node plans/20261004-content-video/reports/browser-check.mjs`.',
    '- Tests use actual CDP mouse clicks in isolated Chrome, real application components/data, and a temporary in-browser dev-module harness for empty states. No implementation files or shared configuration are modified.', '',
  ].join('\n')
  await writeFile(join(reportDir, 'browser.md'), report)
  console.log(`RESULT ${checks.length - failed.length}/${checks.length} passed; report ${join(reportDir, 'browser.md')}`)
  process.exitCode = failed.length ? 1 : 0
}
