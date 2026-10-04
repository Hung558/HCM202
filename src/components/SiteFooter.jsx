import StarLogo from './StarLogo.jsx'
import { CHAPTERS, GLOBE } from './chapters.js'
import { leaveTo } from './overlay.js'

const LINKS = [...CHAPTERS.map((c) => ({ key: c.num, href: c.href, label: `Chương ${c.num}` })), { key: 'globe', href: GLOBE.href, label: 'Quả địa cầu' }]

// Footer chung của trang chủ và 6 chương. current: số La Mã của chương đang mở (tô đậm, không bấm).
export default function SiteFooter({ current }) {
  return (
    <footer className="mt-16 border-t-[3px] border-double border-line-strong">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-5 pt-9 pb-12 text-center">
        <StarLogo size="size-8" star="size-4" radius="rounded-lg" />
        <span className="text-[14px] font-semibold">HCM Web · Học phần Tư tưởng Hồ Chí Minh</span>

        <nav aria-label="Các trang học" className="mt-1">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {LINKS.map((l) => (
              <li key={l.key}>
                {l.key === current ? (
                  <span aria-current="page" className="inline-flex min-h-9 items-center text-[13.5px] font-bold text-primary">
                    {l.label}
                  </span>
                ) : (
                  <a
                    href={l.href}
                    onClick={(e) => leaveTo(e, l.href, () => {})}
                    className="inline-flex min-h-9 items-center text-[13.5px] font-semibold text-ink-soft underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline"
                  >
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <span className="text-[13px] text-muted">
          <span className="whitespace-nowrap">Nội dung theo giáo trình của Bộ Giáo dục và Đào tạo</span>
          <span className="max-sm:hidden"> · </span>
          <span className="whitespace-nowrap max-sm:block">Ảnh tư liệu lịch sử</span>
        </span>

        {/* Ghi công nhóm thực hiện — kiểu lời ghi cuối sách */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-10 bg-line-strong" />
            <span className="size-1.5 rotate-45 bg-amber" />
            <span className="h-px w-10 bg-line-strong" />
          </div>
          <p className="font-serif text-[15.5px] leading-normal text-ink-soft italic">
            <span className="whitespace-nowrap">
              Sản phẩm học tập của <span className="font-sans font-bold text-primary not-italic">Nhóm Chủ đề 1</span>
            </span>
            <span className="max-sm:hidden"> · </span>
            <span className="whitespace-nowrap max-sm:block">Lớp SE1912-JV</span>
          </p>
          <p className="text-[11px] font-bold tracking-[0.18em] text-faint uppercase">Học phần HCM202</p>
        </div>
      </div>
    </footer>
  )
}
