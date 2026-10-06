import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import data from './data.json'
import MatchingGame from './MatchingGame.jsx'
import ChapterShell from '../_fun/ChapterShell.jsx'
import Hero from '../_fun/Hero.jsx'
import { award, play, say } from '../_fun/useGame.js'

const S = data.sections

// Tiến độ riêng chương V: phần đã xem, kỷ lục 60 giây, số lượt chơi
const KEY = 'hcm202_c5'
function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}')
    const seen = p.seen ?? []
    return { seen: seen.includes(S[0].id) ? seen : [...seen, S[0].id], best: p.best ?? 0, plays: p.plays ?? 0 }
  } catch {
    return { seen: [S[0].id], best: 0, plays: 0 }
  }
}

const TABS = [
  { id: 'learn', label: 'Học bài' },
  { id: 'game', label: 'Ghép nối' },
]
const TAB_TIPS = { learn: 'Đọc từng phần, mỗi phần có một video và câu hỏi suy ngẫm.', game: 'Chọn chế độ rồi ghép tổ chức với năm ra đời nhé!' }
const TIPS = ['XP được cộng chung cho cả 6 chương.', 'Ghép sai không bị trừ thời gian.', 'Dùng Tab rồi Enter để chơi bằng bàn phím cũng được.']
// Huy hiệu "đoàn kết": vòng đặc ghi số + vòng viền lệch phía sau
const DUO = [
  { dot: 'bg-primary text-on-dark', ring: 'border-gold' },
  { dot: 'bg-amber text-ink', ring: 'border-primary' },
  { dot: 'bg-success text-on-dark', ring: 'border-amber' },
]

export default function DragDrop() {
  const [tab, setTab] = useState('learn')
  const [si, setSi] = useState(0)
  const [prog, setProg] = useState(load)
  const [playing, setPlaying] = useState({})

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prog))
    } catch {
      // không lưu được: vẫn dùng trong phiên này
    }
  }, [prog])

  function changeTab(t) {
    setTab(t)
    say(TAB_TIPS[t])
  }
  function goSec(i) {
    play('tap')
    setSi(i)
    // Mở một phần là tính "đã xem"
    setProg((p) => (p.seen.includes(S[i].id) ? p : { ...p, seen: [...p.seen, S[i].id] }))
    if (tab !== 'learn') changeTab('learn')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Trả về true nếu lập kỷ lục mới (chỉ chế độ 60 giây)
  function onFinish(won, dur, mode) {
    const record = won && mode === 'timed' && (!prog.best || dur < prog.best)
    setProg((p) => ({ ...p, plays: p.plays + 1, best: record ? dur : p.best }))
    return record
  }

  const x = S[si]
  const last = si === S.length - 1
  const v = x.video
  const isYt = v.type === 'youtube'
  const isPlaying = isYt && playing[x.id]

  return (
    <ChapterShell num="V" tabs={TABS} tab={tab} onTab={changeTab} tips={TIPS}>
      <Hero num="V" eyebrow="Chương V · Kéo thả ghép nối" title={data.title}>
        <nav aria-label="Các phần học" className="mt-[26px] flex flex-wrap gap-1.5">
          {S.map((s, i) => {
            const on = tab === 'learn' && si === i
            const seen = prog.seen.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                aria-current={on ? 'step' : undefined}
                onClick={() => goSec(i)}
                className={`flex min-h-12 items-center gap-2.5 rounded-full border-[1.5px] py-1.5 pr-4 pl-1.5 transition-all duration-300 ${on ? 'border-gold bg-gold/16' : 'border-on-dark/14 bg-on-dark/5'}`}
              >
                <span className={`grid size-9 place-items-center rounded-full text-[13px] font-extrabold transition-all duration-300 ${on ? 'bg-gold text-ink' : seen ? 'bg-success' : 'bg-on-dark/12'}`}>
                  {seen && !on ? '✓' : i + 1}
                </span>
                <span className="text-[13px] font-bold whitespace-nowrap">{s.title}</span>
              </button>
            )
          })}
        </nav>
      </Hero>

      {tab === 'learn' && (
        <>
          <div className="mt-7 flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
              <motion.div
                key={x.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-[30px] bg-primary p-[clamp(24px,3.4vw,36px)] text-on-dark"
              >
                <span aria-hidden="true" className="absolute -top-[50px] -right-[50px] size-[190px] rounded-full bg-gold/[.22]" />
                <span aria-hidden="true" className="absolute right-[60px] -bottom-10 size-[90px] rounded-full bg-on-dark/8" />
                <div className="relative flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-gold px-3 py-[5px] text-[15px] font-extrabold text-ink">
                    {String(si + 1).padStart(2, '0')} / {String(S.length).padStart(2, '0')}
                  </span>
                  <span className="text-[12.5px] font-bold opacity-85">Giáo trình · trang {x.pages}</span>
                </div>
                <h2 className="relative mt-3.5 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-extrabold tracking-[-0.02em]">{x.title}</h2>
                <p className="relative mt-2 text-[16px] font-semibold text-gold">{x.subtitle}</p>
              </motion.div>

              <ol className="flex flex-col gap-3">
                {x.points.map((t, i) => (
                  <motion.li
                    key={`${x.id}-${i}`}
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.11, duration: 0.5, ease: [0.3, 1.3, 0.4, 1] }}
                    className="flex items-start gap-4 rounded-3xl border border-line bg-white px-[22px] py-5"
                  >
                    <div aria-hidden="true" className="relative mt-0.5 size-11 shrink-0">
                      <span className={`absolute top-0 left-0 size-[34px] rounded-full border-2 ${DUO[i % 3].ring}`} />
                      <span className={`absolute right-0 bottom-0 grid size-[34px] place-items-center rounded-full text-[15px] font-extrabold ${DUO[i % 3].dot}`}>{i + 1}</span>
                    </div>
                    <p className="flex-1 text-[16px] leading-[1.75] text-pretty">{t}</p>
                  </motion.li>
                ))}
              </ol>

              <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={() => goSec(si - 1)} disabled={si === 0} className="min-h-12 rounded-full border border-line-strong bg-white px-[18px] text-[14px] font-bold disabled:opacity-35">
                  ← Phần trước
                </button>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => {
                    if (!last) return goSec(si + 1)
                    play('tap')
                    changeTab('game')
                    window.scrollTo({ top: 0 })
                  }}
                  className="min-h-12 rounded-full bg-ink px-[22px] text-[14.5px] font-extrabold text-on-dark"
                >
                  {last ? 'Bắt đầu ghép nối' : 'Phần tiếp theo'} →
                </button>
              </div>
            </div>

            <aside className="flex max-w-full flex-[1_1_320px] flex-col gap-3.5 md:sticky md:top-[84px]">
              <div className="overflow-hidden rounded-[26px] border border-line bg-white">
                {isPlaying ? (
                  <div className="relative aspect-video bg-ink">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0&autoplay=1`}
                      title={v.title}
                      allow="encrypted-media; picture-in-picture; fullscreen; autoplay"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="absolute inset-0 size-full border-0"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={isYt ? `Phát video: ${v.title}` : `Mở video trên ${v.publisher} (tab mới): ${v.title}`}
                    onClick={(e) => {
                      play('tap')
                      award(`c5-v-${x.id}`, 10, e)
                      if (isYt) setPlaying((p) => ({ ...p, [x.id]: true }))
                      else window.open(v.sourceUrl, '_blank', 'noopener')
                    }}
                    className="relative block aspect-video w-full overflow-hidden bg-ink bg-cover bg-center transition-[filter] hover:brightness-110"
                    style={isYt ? { backgroundImage: `url('https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg')` } : undefined}
                  >
                    <span className={`absolute inset-0 ${isYt ? 'bg-linear-to-b from-ink/0 from-40% to-ink/80' : 'bg-[radial-gradient(circle_at_30%_30%,#3A2F25,#1F1B16)]'}`} />
                    <span className={`absolute top-1/2 left-1/2 grid size-[68px] -translate-1/2 place-items-center rounded-full bg-primary text-on-dark ${isYt ? 'pl-[5px] text-[24px]' : 'text-[28px]'}`}>{isYt ? '▶' : '↗'}</span>
                    <span className="absolute inset-x-3.5 bottom-3 flex justify-between gap-2 text-[12px] font-extrabold tracking-[.06em] text-gold uppercase">
                      <span>{v.publisher}</span>
                      <span>{v.duration}</span>
                    </span>
                  </button>
                )}
                <div className="px-5 py-[18px]">
                  <p className="text-[12px] font-extrabold tracking-[.12em] text-primary uppercase">Video minh họa</p>
                  <h3 className="mt-1.5 text-[16.5px] leading-[1.4] font-extrabold">{v.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-soft">{v.context}</p>
                  {!isYt && <p className="mt-2 text-[12.5px] font-semibold text-muted">Video mở ở trang {v.publisher} trong tab mới.</p>}
                </div>
              </div>
              <div className="relative -rotate-[0.8deg] rounded-[6px_24px_24px_24px] bg-gold px-[22px] py-5">
                <span aria-hidden="true" className="absolute -top-2.5 left-[26px] h-[18px] w-[62px] -rotate-[4deg] bg-on-dark/75" />
                <p className="text-[12px] font-extrabold tracking-[.12em] text-primary-dark uppercase">Câu hỏi suy ngẫm</p>
                <p className="mt-2 text-[15.5px] leading-[1.6] font-bold">{v.question}</p>
              </div>
            </aside>
          </div>

          <div className="mt-9 border-t border-line pt-[18px] text-[13px] leading-[1.7] text-muted">
            <p>{data.source}</p>
            <p className="mt-1">
              Đối chiếu mốc lịch sử:{' '}
              <a href={data.historySource.url} target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary-dark">
                {data.historySource.label}
              </a>
              .
            </p>
            <p className="mt-1">Thực hiện: {data.author} · Chương V</p>
          </div>
        </>
      )}

      {/* Giữ trò chơi khi sang Học bài để đồng hồ không bị đặt lại */}
      <div hidden={tab !== 'game'}>
        <MatchingGame pairs={data.pairs} timeLimit={data.timeLimitSeconds} stats={prog} onFinish={onFinish} />
      </div>
    </ChapterShell>
  )
}
