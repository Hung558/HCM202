import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Award, Eye, HeartHandshake, Scale, ShieldCheck, Trophy } from 'lucide-react'
import { STREAK_BONUS_XP, formatTime, rankFor, reflectiveQuestion } from './quiz.js'
import { animate, shake } from '../_fun/fx.js'

const ICONS = { HeartHandshake, ShieldCheck, Scale, Award, Trophy, Eye }
const DIFF = { green: '#2F7D4F', amber: '#B86E10', red: '#B4322A' }

function Medal({ badge, earned, small }) {
  const Icon = ICONS[badge.icon] ?? Award
  return (
    <div title={badge.condition} className={`flex flex-col items-center gap-2 rounded-[18px] text-center ${small ? 'p-2.5' : 'p-3.5'} ${earned ? 'bg-cream' : 'bg-paper opacity-55'}`}>
      <span className={`grid place-items-center rounded-full border-[3px] ${small ? 'size-10' : 'size-[46px]'} ${earned ? 'border-primary bg-gold' : 'border-line-strong bg-track'}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className={`leading-[1.3] font-extrabold ${small ? 'text-[11.5px]' : 'text-[12.5px]'}`}>{badge.name}</span>
      <span className="sr-only">{earned ? 'Đã đạt' : 'Chưa đạt'}</span>
    </div>
  )
}

// Tab Trắc nghiệm "Hồ sơ tình huống": màn mở (giới thiệu + tủ huy hiệu) → chơi từng hồ sơ → kết quả.
// run = { phase, session, qi, pick, records, t0, t1 }; điểm/huy hiệu tính bằng quiz.js.
export default function Quiz({ data, run, sum, everBadges, hasHistory, onStart, onPick, onNext, onKnow }) {
  const boxRef = useRef(null)
  const size = run.session.length || Math.min(data.sessionSize, data.scenarios.length)
  const sc = run.session[Math.min(run.qi, run.session.length - 1)]
  const answered = run.pick !== null
  const good = answered && sc && run.pick === sc.correctAnswer
  let streak = 0
  for (let i = run.records.length - 1; i >= 0 && run.records[i].isCorrect; i--) streak++

  // Hồ sơ mới trượt vào; trả lời sai thì khung rung
  useEffect(() => {
    if (run.phase === 'play') animate(boxRef.current, [{ opacity: 0, transform: 'translateY(30px) rotate(-1.5deg)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.3,1.3,.4,1)' })
  }, [run.phase, run.qi])
  useEffect(() => {
    if (answered && !good) shake(boxRef.current)
  }, [answered, good])

  if (run.phase === 'intro')
    return (
      <div className="mt-7 flex flex-wrap items-stretch gap-5">
        <div className="relative flex-[2_1_420px] overflow-hidden rounded-[30px] bg-primary p-[clamp(24px,4vw,40px)] text-on-dark">
          <span aria-hidden="true" className="absolute -right-[60px] -bottom-[60px] size-[220px] rounded-full bg-gold/20" />
          <p className="relative text-[12.5px] font-extrabold tracking-[.14em] text-gold uppercase">Hồ sơ tình huống</p>
          <h2 className="relative mt-2.5 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-extrabold">Bạn là cán bộ. Bạn xử lý thế nào?</h2>
          <p className="relative mt-3 max-w-[560px] text-[15.5px] leading-[1.65] text-on-dark/90">{data.intro}</p>
          <div className="relative mt-[18px] flex flex-wrap gap-2">
            {[`${size} hồ sơ mỗi lượt`, `Chuỗi 3 câu đúng · +${STREAK_BONUS_XP} điểm`, `${data.badges.length} huy hiệu`].map((t) => (
              <span key={t} className="rounded-full bg-on-dark/14 px-3.5 py-2 text-[13px] font-bold">
                {t}
              </span>
            ))}
          </div>
          <button type="button" onClick={() => onStart()} className="relative mt-6 min-h-[54px] rounded-full bg-gold px-[30px] text-[16px] font-extrabold text-ink transition-transform hover:scale-[1.04]">
            {hasHistory ? 'Lượt mới' : 'Bắt đầu'} →
          </button>
        </div>
        <div className="flex-[1_1_300px] rounded-[30px] border border-line bg-white p-[22px]">
          <p className="text-[16px] font-extrabold">Tủ huy hiệu</p>
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {data.badges.map((b) => (
              <Medal key={b.id} badge={b} earned={!!everBadges[b.id]} />
            ))}
          </div>
        </div>
      </div>
    )

  if (run.phase === 'done') {
    const rank = rankFor(data, sum.xp)
    return (
      <div className="mt-7 flex flex-wrap items-start gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex-[1_1_340px] overflow-hidden rounded-[30px] bg-ink p-[clamp(24px,4vw,40px)] text-center text-on-dark"
        >
          <span aria-hidden="true" className="absolute -top-[60px] -left-[60px] size-[200px] rounded-full bg-primary/55" />
          <p className="relative text-[12.5px] font-extrabold tracking-[.14em] text-gold uppercase">Xếp loại</p>
          <h2 className="relative mt-2 text-[clamp(28px,3.6vw,40px)] font-extrabold">{rank}</h2>
          <p className="relative mt-2.5 text-[52px] leading-none font-extrabold text-gold">
            {sum.xp}
            <span className="text-[18px] text-on-dark/70"> điểm</span>
          </p>
          <p className="relative mt-2.5 text-[15px] text-on-dark/85">
            Đúng {sum.correct} / {size} hồ sơ · chuỗi dài nhất {sum.bestStreak} · {formatTime(run.t1 - run.t0)}
          </p>
          <div className="relative mt-[22px] flex flex-wrap justify-center gap-2.5">
            <button type="button" onClick={() => onStart()} className="min-h-12 rounded-full bg-gold px-6 text-[15px] font-extrabold text-ink">
              Chơi lượt mới
            </button>
            <button type="button" onClick={onKnow} className="min-h-12 rounded-full border border-on-dark/35 px-6 text-[15px] font-bold">
              Ôn kiến thức
            </button>
          </div>
        </motion.div>
        <div className="flex flex-[1_1_340px] flex-col gap-3.5">
          <div className="rounded-[26px] border border-line bg-white p-5">
            <p className="text-[16px] font-extrabold">Huy hiệu lượt này</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {sum.achievements.map(({ badge, earned }) => (
                <Medal key={badge.id} badge={badge} earned={earned} small />
              ))}
            </div>
          </div>
          <div className="rounded-[26px] border border-line bg-white p-5">
            <p className="text-[16px] font-extrabold">Xem lại từng hồ sơ</p>
            <ol className="mt-3 flex flex-col gap-2">
              {run.records.map((r) => {
                const s = data.scenarios.find((x) => x.id === r.scenarioId)
                return (
                  <li key={r.scenarioId} className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${r.isCorrect ? 'bg-success-soft' : 'bg-[#FBEDEB]'}`}>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-on-dark ${r.isCorrect ? 'bg-success' : 'bg-primary'}`} aria-label={r.isCorrect ? 'Đúng' : 'Sai'}>
                      {r.isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[14px] font-bold">{s?.title}</span>
                      <span className="text-[12px] text-muted">{s?.referenceTopic}</span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    )
  }

  const diff = data.difficulties[sc.difficulty] ?? { label: sc.difficulty, color: 'amber' }
  const diffC = DIFF[diff.color] ?? DIFF.amber
  return (
    <>
      <div className="mt-7 flex items-center gap-1.5 overflow-x-auto px-0.5 py-1">
        {Array.from({ length: size }, (_, i) => {
          const r = run.records[i]
          const cur = i === run.qi && !r
          return (
            <span
              key={i}
              className={`grid size-[38px] shrink-0 place-items-center rounded-xl border-2 text-[13px] font-extrabold transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] ${
                r ? (r.isCorrect ? 'border-transparent bg-success text-on-dark' : 'border-transparent bg-primary text-on-dark') : cur ? 'scale-110 border-ink bg-ink text-on-dark' : 'border-line-strong bg-white text-faint'
              }`}
            >
              {r ? (r.isCorrect ? '✓' : '✗') : i + 1}
            </span>
          )
        })}
        <span className="flex-1" />
        <span className={`shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-extrabold ${streak >= 3 ? 'bg-primary text-on-dark' : streak > 0 ? 'bg-cream text-ink-soft' : 'bg-track text-ink-soft'}`}>🔥 {streak}</span>
        <span className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[13.5px] font-extrabold text-gold">{sum.xp} điểm</span>
      </div>

      <div ref={boxRef} className="relative mx-auto mt-4 max-w-[880px] overflow-hidden rounded-[30px] border border-line bg-white">
        <div className="relative border-b-[1.5px] border-dashed border-line-strong bg-cream p-[clamp(20px,3vw,30px)]">
          <div className="absolute top-[18px] right-[22px] rotate-[8deg] rounded-[10px] border-[3px] px-2.5 py-1 text-[12px] font-extrabold tracking-[.1em] uppercase" style={{ borderColor: diffC, color: diffC }}>
            {diff.label} · {sc.points}đ
          </div>
          <p className="pr-[110px] text-[12px] font-extrabold tracking-[.12em] text-primary-dark uppercase">
            Hồ sơ số {run.qi + 1} · {sc.referenceTopic}
          </p>
          <h2 className="mt-2 pr-[110px] text-[clamp(21px,2.6vw,27px)] leading-[1.25] font-extrabold max-sm:pr-0">{sc.title}</h2>
          <p className="mt-3 text-[15.5px] leading-[1.75] text-pretty">{sc.description}</p>
        </div>
        <div className="p-[clamp(20px,3vw,30px)]">
          <h3 className="text-[18px] leading-[1.4] font-extrabold">{sc.question}</h3>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-2.5">
            {sc.options.map((t, i) => {
              const right = i === sc.correctAnswer
              const picked = run.pick === i
              const look = answered && right ? 'border-success bg-success-soft' : answered && picked ? 'border-primary bg-[#FBEDEB]' : answered ? 'border-line bg-white opacity-50' : 'border-line bg-white hover:-translate-y-0.5'
              const badge = answered && right ? 'bg-success text-on-dark' : answered && picked ? 'bg-primary text-on-dark' : 'bg-paper'
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={(e) => onPick(i, e)}
                  className={`flex min-h-16 w-full items-center gap-3.5 rounded-[18px] border-[1.5px] px-4 py-3 text-left text-[15px] leading-normal transition-all duration-[250ms] ${look}`}
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-extrabold ${badge}`}>{'ABCD'[i]}</span>
                  <span>{t}</span>
                </button>
              )
            })}
          </div>
          {answered && (
            <div role="status" className={`mt-4 rounded-[22px] px-5 py-[18px] ${good ? 'bg-success-soft' : 'bg-[#FBEDEB]'}`}>
              <p className={`text-[19px] font-extrabold ${good ? 'text-success' : 'text-primary'}`}>{good ? 'Xử lý đúng!' : 'Chưa đúng rồi'}</p>
              <p className="mt-2 text-[15px] leading-[1.7]">{sc.explanation}</p>
              <p className="mt-3 font-serif text-[15px] leading-[1.6] text-ink-soft italic">{reflectiveQuestion(data, sc)}</p>
              <button type="button" onClick={onNext} className="btn btn-dark mt-3.5 min-h-12">
                {run.qi + 1 >= size ? 'Xem kết quả' : 'Hồ sơ tiếp theo'} →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
