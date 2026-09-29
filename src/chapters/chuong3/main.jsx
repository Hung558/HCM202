// Entry chạy riêng Chương 3: npm run dev → mở /chuong3.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import Mindmap from './Mindmap.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Mindmap />
  </StrictMode>,
)
