// Entry chạy riêng Chương 2: npm run dev → mở /chuong2.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import Timeline from './Timeline.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Timeline />
  </StrictMode>,
)
