// Entry chạy riêng Chương 1: npm run dev → mở /chuong1.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import Flashcards from './Flashcards.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Flashcards />
  </StrictMode>,
)
