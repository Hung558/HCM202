// Entry chạy riêng Chương 5: npm run dev → mở /chuong5.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import DragDrop from './DragDrop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DragDrop />
  </StrictMode>,
)
