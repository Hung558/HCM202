// Header nhận diện chương — LUÔN hiển thị, không phụ thuộc tab đang chọn.
// Gồm: huy hiệu "IV", tên chương, phụ đề đầy đủ của chương và link về trang chủ.
import ChapterMenu from '../../../components/ChapterMenu.jsx'
import ChapterLogo from '../../../components/ChapterLogo.jsx'

export default function ChapterHeader() {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-4">
      <ChapterMenu current="IV" />
      <ChapterLogo num="IV" />
    </div>
  )
}
