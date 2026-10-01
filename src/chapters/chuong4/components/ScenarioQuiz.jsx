// Tab 1 – Scenario Quiz: bọc nguyên bộ quiz hiện có, không đổi logic lẫn UI.
// key mặc định 'all' — không còn luồng luyện theo chủ đề từ trang kiến thức.
import Quiz from '../Quiz.jsx'

export default function ScenarioQuiz({ active = true }) {
  return <Quiz key="all" active={active} />
}
