// Trang chủ tạm: link tới 6 trang chương. Chủ project gộp lại sau.
const chapters = ['I', 'II', 'III', 'IV', 'V', 'VI']

export default function App() {
  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-10 pb-20">
      <p className="eyebrow">Tư tưởng Hồ Chí Minh</p>
      <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">HCM Web</h1>
      <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
        {chapters.map((n, i) => (
          <li key={n}>
            <a href={`/chuong${i + 1}.html`} className="card flex items-center gap-3.5 p-4 hover:border-line-strong">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-extrabold text-on-dark">{n}</span>
              <span className="font-semibold">Chương {i + 1}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
