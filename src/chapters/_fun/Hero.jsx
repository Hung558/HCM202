// Hero tối đầu mỗi chương: số La Mã mờ cỡ lớn ở góc, eyebrow vàng, tiêu đề.
// `children`: thêm dưới phần giới thiệu; `aside`: cột bên phải (nếu có); `deco`: hình trang trí góc phải trên.
export default function Hero({ num, eyebrow, title, intro, aside, deco, children, className = '' }) {
  return (
    <section
      className={`relative grid items-center gap-7 overflow-hidden rounded-[32px] bg-ink p-[clamp(28px,5vw,52px)] text-on-dark ${
        aside ? 'grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]' : ''
      } ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-2.5 -bottom-[110px] text-[clamp(220px,30vw,360px)] leading-none font-extrabold tracking-[-0.04em] text-gold/[.07] select-none">
        {num}
      </div>
      {deco && (
        <div aria-hidden="true" className="absolute top-[clamp(18px,3vw,32px)] right-[clamp(18px,4vw,56px)]">
          {deco}
        </div>
      )}
      <div className="relative min-w-0">
        <p className={`text-[12.5px] font-bold tracking-[.14em] text-gold uppercase ${deco ? 'pr-[80px]' : ''}`}>{eyebrow}</p>
        <h1 className={`mt-3 text-[clamp(28px,4.6vw,52px)] leading-[1.08] font-extrabold tracking-[-0.02em] text-pretty ${deco ? 'sm:pr-[90px]' : ''}`}>{title}</h1>
        {intro && <p className="mt-3.5 text-[15.5px] leading-[1.65] text-pretty text-on-dark/80">{intro}</p>}
        {children}
      </div>
      {aside && <div className="relative min-w-0">{aside}</div>}
    </section>
  )
}
