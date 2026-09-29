// Entry chạy riêng Chương 6: npm run dev → mở /chuong6.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import Tracker from './Tracker.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Tracker />
  </StrictMode>,
)
