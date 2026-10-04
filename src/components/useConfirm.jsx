import { useCallback, useState } from 'react'
import ConfirmDialog from './ConfirmDialog.jsx'

// Thay cho window.confirm(): hộp xác nhận theo style của web.
// Dùng:  const [confirm, confirmDialog] = useConfirm()
//        if (await confirm({ title, message, confirmLabel })) { ...xóa... }
//        ...và render {confirmDialog} ở đâu đó trong JSX.
export function useConfirm() {
  const [req, setReq] = useState({ open: false })

  const confirm = useCallback((opts) => new Promise((resolve) => setReq({ ...opts, open: true, resolve })), [])
  const finish = useCallback(
    (ok) => {
      req.resolve?.(ok)
      setReq((r) => ({ ...r, open: false })) // giữ nội dung để chạy hiệu ứng đóng
    },
    [req],
  )

  return [confirm, <ConfirmDialog key="confirm" {...req} onConfirm={() => finish(true)} onCancel={() => finish(false)} />]
}
