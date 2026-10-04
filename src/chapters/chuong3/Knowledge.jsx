import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Quote } from "lucide-react";
import data from "./knowledge.json";

/* Danh sách id cần theo dõi khi cuộn (phần lớn + phần nhỏ) */
const SPY_IDS = data.sections.flatMap((s) => [s.id, ...s.subsections.map((x) => x.id)]);

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Các khối nội dung ---------- */

function Block({ block }) {
  if (block.type === "p") {
    return <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">{block.text}</p>;
  }

  if (block.type === "quote") {
    return (
      <figure className="mt-4 rounded-2xl bg-cream px-5 py-4">
        <Quote className="mb-1.5 size-4 text-faint" aria-hidden="true" />
        <blockquote className="font-serif italic leading-[1.6] text-ink">{block.text}</blockquote>
        {block.source && (
          <figcaption className="mt-2 text-[13px] text-muted">{block.source}</figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="mt-3 grid gap-3">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <p className="text-[15.5px] leading-[1.65] text-ink-soft">
              {item.term && <strong className="font-bold text-ink">{item.term} </strong>}
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

function Section({ section, index }) {
  return (
    <motion.section
      id={section.id}
      className="card scroll-mt-24 p-[22px] sm:p-7"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.2, delay: Math.min(index, 1) * 0.06 }}
    >
      <span className="text-[28px] font-extrabold text-amber">{section.number}</span>
      <h2 className="mt-1 text-[22px] font-extrabold tracking-[-0.01em]">{section.title}</h2>
      <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">{section.summary}</p>

      {section.subsections.map((sub) => (
        <div key={sub.id} id={sub.id} className="mt-7 scroll-mt-24 border-t border-line pt-6">
          <p className="eyebrow">Mục {sub.number}</p>
          <h3 className="mt-1.5 text-[18px] font-extrabold leading-snug tracking-[-0.01em]">
            {sub.title}
          </h3>
          {sub.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
      ))}

      {section.key?.length > 0 && (
        <div className="mt-7 rounded-3xl bg-ink p-6 text-on-dark">
          <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-gold">
            <BookOpen className="size-4" aria-hidden="true" />
            Ghi nhớ nhanh
          </p>
          <ul className="mt-3 grid gap-2.5">
            {section.key.map((k, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-[1.6]">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                {k}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}

/* ---------- Mục lục ---------- */

function Toc({ activeId }) {
  const activeSection = data.sections.find(
    (s) => s.id === activeId || s.subsections.some((x) => x.id === activeId),
  );

  return (
    <nav aria-label="Mục lục chương" className="card p-3">
      <p className="px-3 pt-2 pb-1 text-[13px] font-semibold text-muted">Mục lục</p>
      <ul className="grid gap-1">
        {data.sections.map((s) => {
          const open = activeSection?.id === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToId(s.id)}
                aria-current={open ? "true" : undefined}
                className={`flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-bold leading-snug ${
                  open ? "bg-ink text-on-dark" : "text-ink hover:bg-cream"
                }`}
              >
                <span className={open ? "text-gold" : "text-amber"}>{s.number}</span>
                <span>{s.title}</span>
              </button>
              {open && (
                <ul className="mt-1 mb-1 grid gap-0.5 pl-3">
                  {s.subsections.map((sub) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => scrollToId(sub.id)}
                        className={`flex w-full gap-2 rounded-lg px-3 py-1.5 text-left text-[13px] leading-snug ${
                          activeId === sub.id
                            ? "bg-primary/10 font-bold text-primary"
                            : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        <span className="shrink-0 font-semibold">{sub.number}</span>
                        <span className="line-clamp-2">{sub.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* Mục lục gọn cho điện thoại: thanh chip cuộn ngang */
function TocMobile({ activeId }) {
  return (
    <nav aria-label="Mục lục chương" className="-mx-5 overflow-x-auto px-5 lg:hidden">
      <ul className="flex w-max gap-2 pb-1">
        {data.sections.map((s) => {
          const open = s.id === activeId || s.subsections.some((x) => x.id === activeId);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToId(s.id)}
                className={`btn min-h-11 whitespace-nowrap rounded-full px-4 text-[14px] font-bold ${
                  open ? "bg-ink text-on-dark" : "border border-line-strong bg-white text-ink"
                }`}
              >
                Phần {s.number}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------- Trang chính ---------- */

export default function Knowledge() {
  const [activeId, setActiveId] = useState(data.sections[0].id);

  // Theo dõi phần đang đọc để tô sáng mục lục
  useEffect(() => {
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        });
        if (visible.size > 0) {
          // Lấy phần tử nằm gần mép trên nhất; ưu tiên phần nhỏ khi bằng nhau
          const top = [...visible.entries()].sort((a, b) => a[1] - b[1] || SPY_IDS.indexOf(b[0]) - SPY_IDS.indexOf(a[0]))[0];
          setActiveId(top[0]);
        }
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    SPY_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-10 pb-20">
      <p className="eyebrow">{data.eyebrow}</p>
      <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
        {data.title}
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15.5px] leading-[1.65] text-ink-soft">{data.intro}</p>

      <div className="mt-6">
        <TocMobile activeId={activeId} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
          <Toc activeId={activeId} />
        </aside>

        <div className="grid gap-5">
          {data.sections.map((s, i) => (
            <Section key={s.id} section={s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
