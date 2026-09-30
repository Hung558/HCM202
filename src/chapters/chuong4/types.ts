// Kiểu dùng chung cho tính năng Trắc nghiệm tình huống (Chương IV).
// data.json là mock data; sau này nối API chỉ cần thay cách nạp dữ liệu ở Quiz.jsx.

export type Difficulty = 'de' | 'trungbinh' | 'kho'

export interface Scenario {
  id: string
  title: string
  description: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  referenceTopic: string
  difficulty: Difficulty
  points: number
}

export interface DifficultyInfo {
  label: string
  color: 'green' | 'amber' | 'red'
}

export interface BadgeCheck {
  topicAny?: string[]
  minCorrect?: number
  minScore?: number
  perfect?: boolean
}

export interface Badge {
  id: string
  name: string
  icon: string
  condition: string
  check: BadgeCheck
}

export interface Rank {
  minScore: number
  name: string
}

export interface QuizData {
  chapter: string
  title: string
  feature: string
  intro: string
  sessionSize: number
  scenarios: Scenario[]
  topics: string[]
  difficulties: Record<Difficulty, DifficultyInfo>
  badges: Badge[]
  reflectiveTemplate: string
  ranks: Rank[]
}

// Trạng thái một câu đã trả lời trong lượt chơi
export interface AnswerRecord {
  scenarioId: string
  selectedIndex: number | null // null = bỏ qua
  isCorrect: boolean
  timeMs: number // thời gian phản hồi cho câu này
}

export interface TopicStat {
  topic: string
  total: number
  correct: number
}

export interface Achievement {
  badge: Badge
  earned: boolean
}

export interface SessionSummary {
  score: number
  answered: number
  correct: number
  skipped: number
  accuracy: number // 0..100
  timeMs: number
  bestStreak: number
  xp: number
  topicStats: TopicStat[]
  strongTopics: string[]
  weakTopics: string[]
  achievements: Achievement[]
}

// Dữ liệu lưu localStorage phục vụ học tập dài hạn
export interface HistoryEntry {
  sessionId: number
  date: string
  score: number
  accuracy: number
  timeMs: number
  answers: AnswerRecord[]
  weakTopics: string[]
}

export interface StoredState {
  history: HistoryEntry[]
  bookmarks: string[]
}
