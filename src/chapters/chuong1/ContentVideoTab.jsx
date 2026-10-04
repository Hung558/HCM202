import { Component, lazy, Suspense } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

const ContentVideo = lazy(() => import('./ContentVideo.jsx'))

class ContentErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return (
      <div role="alert" className="card mt-8 space-y-4 p-6 text-ink-soft">
        <AlertCircle className="text-primary" aria-hidden="true" />
        <p>Không tải được nội dung và video của chương. Hãy kiểm tra kết nối rồi tải lại trang.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Tải lại trang</button>
      </div>
    )
    return this.props.children
  }
}

export default function ContentVideoTab(props) {
  return (
    <ContentErrorBoundary>
      <Suspense fallback={<div role="status" className="mt-8 flex items-center gap-3 py-12 text-muted"><Loader2 size={22} className="animate-spin motion-reduce:animate-none text-primary" aria-hidden="true" /> Đang tải nội dung và video…</div>}>
        <ContentVideo {...props} />
      </Suspense>
    </ContentErrorBoundary>
  )
}
