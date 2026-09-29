// Trang chủ tạm: link tới 6 trang chương. Chủ project gộp lại sau.
const chapters = [1, 2, 3, 4, 5, 6]

export default function App() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">HCM Web</h1>
      <ul className="space-y-2">
        {chapters.map((i) => (
          <li key={i}>
            <a className="text-blue-600 underline" href={`/chuong${i}.html`}>Chương {i}</a>
          </li>
        ))}
      </ul>
    </main>
  )
}
