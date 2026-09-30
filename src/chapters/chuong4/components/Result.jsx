// Màn kết quả: điểm, độ chính xác, thời gian, chuỗi đúng, XP, chủ đề mạnh/yếu,
// huy hiệu, câu gợi ý suy ngẫm và nút chơi lại / ôn tập.
import { motion } from 'framer-motion'
import { Award, BookOpen, Check, Clock, Eye, Flame, HeartHandshake, RotateCcw, Scale, ShieldCheck, Sparkles, Target, Trophy } from 'lucide-react'
import { formatTime } from '../quiz.js'

const BADGE_ICONS = { Trophy, Award, ShieldCheck, Eye, Scale, HeartHandshake }

function BadgeIcon({ name }) {
  const Icon = BADGE_ICONS[name] ?? Award
  return <Icon className="size-5" />
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[18px] border border-line bg-paper/60 px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1.5 text-[24px] font-extrabold leading-none">{value}</p>
    </div>
  )
}

function TopicList({ title, topics, tone }) {
  return (
    <div className="rounded-[18px] border border-line bg-white px-4 py-3.5">
      <p className={`text-[12.5px] font-bold uppercase tracking-[0.08em] ${tone === 'good' ? 'text-success' : 'text-primary'}`}>{title}</p>
      {topics.length === 0 ? (
        <p className="mt-1.5 text-[13.5px] text-muted">Chưa có dữ liệu</p>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-1">
          {topics.map((t) => (
            <li key={t} className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft">
              <span className={`size-1.5 shrink-0 rounded-full ${tone === 'good' ? 'bg-success' : 'bg-primary'}`} />
              <span className="min-w-0">{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Result({ summary, rank, reflective, onPlayAgain, onReview, attempts }) {
  return (
    <section className="flex flex-col gap-4">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-[26px]">
        <p className="eyebrow">Hoàn thành lượt chơi</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.05] tracking-[-0.02em]">{rank}</h1>
          <p className="text-[14px] font-semibold text-muted">{attempts > 0 ? `Lượt thứ ${attempts + 1} của bạn` : 'Lượt đầu tiên'}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon={Check} label="Điểm" value={summary.score} />
          <StatBox icon={Target} label="Chính xác" value={`${summary.accuracy}%`} />
          <StatBox icon={Clock} label="Thời gian" value={formatTime(summary.timeMs)} />
          <StatBox icon={Flame} label="Chuỗi dài nhất" value={summary.bestStreak} />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-[18px] bg-ink px-4 py-3.5 text-on-dark">
          <Sparkles className="size-4 shrink-0 text-gold" />
          <p className="text-[14px]">
            <span className="font-extrabold">{summary.xp} XP</span>
            <span className="opacity-75"> · {summary.correct}/{summary.answered} câu đúng · đã tính thưởng chuỗi</span>
          </p>
        </div>
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-2">
        <TopicList title="Chủ đề vững nhất" topics={summary.strongTopics} tone="good" />
        <TopicList title="Nên ôn lại" topics={summary.weakTopics} tone="bad" />
      </section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-[26px]">
        <p className="eyebrow">Danh hiệu đạt được</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {summary.achievements.map(({ badge, earned: ok }, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`flex items-center gap-3.5 rounded-[18px] border px-4 py-3.5 ${ok ? 'border-gold/50 bg-gold/10' : 'border-line bg-paper/50 opacity-55'}`}
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${ok ? 'bg-gold text-ink' : 'bg-track text-faint'}`}>
                <BadgeIcon name={badge.icon} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-extrabold">{badge.name}</p>
                <p className="text-[12.5px] leading-snug text-muted">{ok ? 'Đã đạt trong lượt này' : badge.condition}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card p-[26px]">
        <p className="eyebrow">Câu hỏi suy ngẫm</p>
        <p className="mt-2 flex gap-2.5 text-[15px] font-serif italic leading-[1.6] text-ink">
          <Sparkles className="mt-1 size-4 shrink-0 text-primary" />
          {reflective}
        </p>
      </motion.section>

      <div className="flex flex-wrap gap-3">
        <button onClick={onPlayAgain} className="btn btn-primary">
          <RotateCcw className="size-4" /> Chơi lượt mới
        </button>
        <button onClick={onReview} className="btn btn-outline">
          <BookOpen className="size-4" /> Xem lại từng câu
        </button>
      </div>
    </section>
  )
}
