// Thanh tab bo tròn: chỉ Render NÚT TAB — panel nội dung do Chuong4Page render riêng.
// Tab active dùng màu đen (ink) giống các chương khác; thanh nằm ngay dưới header chương.
import { BookOpen, ClipboardList } from 'lucide-react'
import { TAB_CONTENT, TAB_QUIZ } from '../constants.js'

const TABS = [
  { id: TAB_CONTENT, label: 'Kiến thức', icon: BookOpen },
  { id: TAB_QUIZ, label: 'Trắc nghiệm tình huống', icon: ClipboardList },
]

export default function ChapterTabs({ tab, onTabChange }) {
  return (
    <div
      role="tablist"
      aria-label="Nội dung chương IV"
      className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1.5 shadow-[0_2px_10px_rgba(31,27,22,0.05)]"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-colors sm:px-5 ${
              active ? 'bg-ink text-on-dark shadow-sm' : 'text-muted hover:bg-paper hover:text-ink'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
