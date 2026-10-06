import { useEffect, useState } from 'react'
import Content from './Content.jsx'
import Tracker from './Tracker.jsx'
import ChapterShell from '../_fun/ChapterShell.jsx'
import { say } from '../_fun/useGame.js'
import { EMPTY, READ_KEY, TRACKER_KEY, load, save } from './utils.js'

const TABS = [
  { id: 'content', label: 'Học bài' },
  { id: 'tracker', label: 'Rèn luyện' },
]
const TAB_TIPS = { content: 'Mở từng nội dung để đọc, xong thì đánh dấu đã học.', tracker: 'Mỗi việc tốt là một lần đóng dấu. Cố gắng đóng đủ 5 con dấu nhé!' }
const TIPS = ['XP được cộng chung cho cả 6 chương.', 'Làm đủ các việc của một đức tính sẽ được đóng dấu.', 'Sổ tay chỉ lưu trên máy của bạn.']

// Chương VI: tab Học bài (mặc định) + tab Rèn luyện
export default function Chuong6() {
  const [tab, setTab] = useState('content')
  const [tracker, setTracker] = useState(() => load(TRACKER_KEY, EMPTY))
  const [read, setRead] = useState(() => load(READ_KEY, {}))

  useEffect(() => save(TRACKER_KEY, tracker), [tracker])
  useEffect(() => save(READ_KEY, read), [read])

  function changeTab(id) {
    setTab(id)
    say(TAB_TIPS[id])
  }

  return (
    <ChapterShell num="VI" tabs={TABS} tab={tab} onTab={changeTab} tips={TIPS}>
      {tab === 'content' ? (
        <Content
          read={read}
          setRead={setRead}
          onDone={() => {
            changeTab('tracker')
            window.scrollTo({ top: 0 })
          }}
        />
      ) : (
        <Tracker state={tracker} setState={setTracker} />
      )}
    </ChapterShell>
  )
}
