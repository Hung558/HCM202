// Logo chương trên thanh điều hướng: ô đỏ số La Mã + "Chương X" + "Tư tưởng Hồ Chí Minh" (bấm để về trang chủ).
export default function ChapterLogo({ num }) {
  return (
    <a href="/" title="Về trang chủ" className="flex items-center gap-2.5 text-ink">
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary text-[15px] font-extrabold text-on-dark">
        {num}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-bold">Chương {num}</span>
        <span className="text-xs text-muted">Tư tưởng Hồ Chí Minh</span>
      </span>
    </a>
  )
}
