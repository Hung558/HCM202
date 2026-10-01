// Header nhận diện chương — LUÔN hiển thị, không phụ thuộc tab đang chọn.
// Gồm: huy hiệu "IV", tên chương, phụ đề đầy đủ của chương và link về trang chủ.
import data from '../data.json'

export default function ChapterHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <a href="/" className="flex items-center gap-2.5" title="Về trang chủ">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-dark">IV</span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-[15px] font-bold">Chương IV</span>
          <span className="truncate text-xs text-muted sm:whitespace-normal">{data.title}</span>
        </span>
      </a>
    </div>
  )
}
