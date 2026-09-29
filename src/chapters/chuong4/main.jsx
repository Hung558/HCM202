// Entry chạy riêng Chương 4: npm run dev → mở /chuong4.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import Quiz from './Quiz.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Quiz />
  </StrictMode>,
)
