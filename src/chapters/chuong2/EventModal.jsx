import { useEffect } from 'react'
import { getEventImage } from './imageRegistry.js'
import Modal from '../_fun/Modal.jsx'

// Chi tiết một sự kiện: ảnh tư liệu, mô tả, trích dẫn, ý nghĩa, tác phẩm; chuyển trước/sau (cả phím ← →).
export default function EventModal({ event, period, index, total, onClose, onStep }) {
  useEffect(() => {
    if (!event) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onStep])

  const img = event && getEventImage(event)
  return (
    <Modal open={!!event} onClose={onClose} label={event?.title}>
      {event && (
        <>
          {img && (
            <>
              <div className="h-[clamp(180px,34vw,300px)] bg-ink bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }} role="img" aria-label={event.imageCaption || event.title} />
              {event.imageCaption && <p className="bg-ink px-6 py-2.5 text-[12.5px] leading-normal text-on-dark/80">{event.imageCaption}</p>}
            </>
          )}
          <div className="p-[clamp(20px,3vw,32px)]">
            <div className="flex flex-wrap items-center gap-2 pr-12">
              {period && (
                <span className="rounded-full bg-ink px-3 py-1.5 text-[12px] font-extrabold text-gold">
                  {period.badge} · {period.timeSpan}
                </span>
              )}
              <span className="rounded-full bg-cream px-3 py-1.5 text-[12px] font-extrabold text-primary-dark">{event.tag}</span>
            </div>
            <p className="mt-3.5 text-[30px] font-extrabold tracking-[-0.02em] text-amber">{event.date}</p>
            <h2 className="mt-1 text-[clamp(21px,2.6vw,27px)] leading-[1.3] font-extrabold tracking-[-0.01em] text-pretty">{event.title}</h2>
            <p className="mt-2 text-[13.5px] font-semibold text-muted">⌖ {event.location}</p>
            <p className="mt-[18px] text-[15.5px] leading-[1.75] text-pretty">{event.detailDesc}</p>
            {event.quotes && (
              <div className="mt-[18px] rounded-[22px] bg-primary px-[22px] py-5 text-on-dark">
                <p className="font-serif text-[17px] leading-[1.6] italic">“{event.quotes}”</p>
              </div>
            )}
            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-3">
              <div className="rounded-[20px] bg-success-soft p-[18px]">
                <p className="text-[12px] font-extrabold tracking-[.1em] text-success uppercase">Ý nghĩa</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.65]">{event.significance}</p>
              </div>
              <div className="rounded-[20px] bg-cream p-[18px]">
                <p className="text-[12px] font-extrabold tracking-[.1em] text-primary-dark uppercase">Tác phẩm · Văn kiện</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.65]">{event.works}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-between gap-2.5">
              <button type="button" onClick={() => onStep(-1)} disabled={index <= 0} className="min-h-[46px] rounded-full border border-line-strong bg-white px-[18px] text-[14px] font-bold disabled:opacity-35">
                ← Trước
              </button>
              <span className="self-center text-[13px] font-bold text-muted">
                {index + 1} / {total}
              </span>
              <button type="button" onClick={() => onStep(1)} disabled={index >= total - 1} className="min-h-[46px] rounded-full bg-ink px-[18px] text-[14px] font-bold text-on-dark disabled:opacity-35">
                Tiếp →
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
