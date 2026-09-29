import data from './data.json'

export default function Flashcards() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">{data.title}</h1>
    </main>
  )
}
