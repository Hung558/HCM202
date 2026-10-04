import { useState } from 'react'
import { ArrowRight, BookOpen, Puzzle, Users, Globe2 } from 'lucide-react'
import data from './data.json'
import MatchingGame from './MatchingGame.jsx'
import SectionVideo from './SectionVideo.jsx'
import ChapterTabBar from '../../components/ChapterTabBar.jsx'

const TABS = [
  { id: 'learn', label: 'Học bài', icon: BookOpen },
  { id: 'game', label: 'Ghép nối', icon: Puzzle },
]

export default function DragDrop() {
  const [tab, setTab] = useState('learn')
  const [active, setActive] = useState(0)
  const section = data.sections[active]

  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav aria-label="Điều hướng chương V" className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-3">
          <a href="/" title="Về trang chủ" className="flex items-center gap-2.5 text-ink">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-dark">V</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold">Chương V</span>
              <span className="text-xs text-muted">Tư tưởng Hồ Chí Minh</span>
            </span>
          </a>
          <ChapterTabBar tabs={TABS} value={tab} onChange={setTab} label="Nội dung chương V" />
        </div>
      </nav>
      <main className="mx-auto max-w-[1180px] px-5 pt-10 pb-20">
        <header className="mb-8">
          <p className="eyebrow">Chương V · {tab === 'learn' ? 'Học bài' : 'Thử thách kiến thức'}</p>
          <h1 className="mt-2.5 max-w-[950px] text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">{data.title}</h1>
          <p className="mt-5 max-w-[760px] text-[15.5px] leading-[1.65] text-ink-soft">Hiểu sức mạnh của đoàn kết. Ghi nhớ những tổ chức đã tập hợp các lực lượng yêu nước qua từng thời kỳ lịch sử.</p>
        </header>
        <div hidden={tab !== 'learn'}>
          <div className="mb-7 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-3xl bg-ink p-6 text-on-dark"><Users className="size-8 shrink-0 text-gold" aria-hidden="true" /><div><p className="font-bold">Sức mạnh dân tộc</p><p className="mt-1 text-sm text-on-dark/80">Toàn dân · Chung mục tiêu · Vững nền tảng</p></div></div>
            <div className="flex items-center gap-4 rounded-3xl bg-cream p-6"><Globe2 className="size-8 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-bold">Sức mạnh thời đại</p><p className="mt-1 text-sm text-ink-soft">Hợp tác · Hòa bình · Độc lập, tự chủ</p></div></div>
          </div>
          <div className="grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
            <aside aria-label="Các phần bài học" className="flex flex-col gap-2">
              {data.sections.map((item, i) => <button key={item.id} aria-current={active === i ? 'true' : undefined} onClick={() => setActive(i)} className={`flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold ${active === i ? 'border-ink bg-ink text-on-dark' : 'border-line bg-white hover:border-line-strong'}`}><span className="text-lg font-extrabold text-amber">{String(i + 1).padStart(2, '0')}</span>{item.title}</button>)}
              <button onClick={() => setTab('game')} className="btn mt-3 justify-between bg-gold text-ink">Thử sức ghép nối <ArrowRight className="size-4" /></button>
            </aside>
            <article className="card p-[clamp(22px,4vw,36px)]">
              <p className="eyebrow">Phần {String(active + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 text-[22px] font-extrabold tracking-[-0.01em]">{section.title}</h2>
              <p className="mt-4 rounded-2xl bg-cream p-5 font-semibold text-ink-soft">{section.subtitle}</p>
              <ul className="mt-6 space-y-5">{section.points.map((point, i) => <li key={point} className="flex gap-4 text-[15.5px] leading-[1.65] text-ink-soft"><span className="font-extrabold text-amber">{String(i + 1).padStart(2, '0')}</span><span>{point}</span></li>)}</ul>
              {tab === 'learn' && section.video && <SectionVideo key={section.id} video={section.video} />}
              {section.discussion && <p className="mt-6 rounded-2xl border border-line bg-paper p-5 text-sm leading-relaxed">{section.discussion}</p>}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5"><p className="text-xs text-muted">Giáo trình · trang {section.pages}</p><button className="btn btn-outline" onClick={() => active < data.sections.length - 1 ? setActive(active + 1) : setTab('game')}>{active < data.sections.length - 1 ? 'Phần tiếp theo' : 'Bắt đầu ghép nối'}<ArrowRight className="size-4" /></button></div>
            </article>
          </div>
        </div>
        <div hidden={tab !== 'game'}><MatchingGame /></div>
        <footer className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-muted">
          <p>{data.source}</p>
          <p className="mt-2">Đối chiếu mốc lịch sử: <a className="underline underline-offset-4 hover:text-primary" href={data.historySource.url} target="_blank" rel="noreferrer">{data.historySource.label}</a>.</p>
          <p className="mt-2">Thực hiện: {data.author} · Chương V</p>
        </footer>
      </main>
    </div>
  )
}
