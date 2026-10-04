// Trang chủ HCM Web — dựng theo bản thiết kế "design_handoff_trang_chu" (cổ điển, trang trọng).
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import chuong2 from '../chapters/chuong2/data.json'
import heroImg from './images/bac_ho_thieu_nhi_1950.jpg'
import nhaRongImg from './images/nha_rong_1911.png'
import toursImg from './images/dai_hoi_tours_1920.jpg'
import baDinhImg from './images/quang_truong_ba_dinh_1945.jpg'
import dongKheImg from './images/ho_chi_minh_dong_khe_1950.jpg'
import dienBienPhuImg from './images/dien_bien_phu_1954.jpg'
import diChucImg from './images/di_chuc_1969.png'
import lamViecImg from './images/bac_ho_lam_viec.png'

const CHAPTERS = [
  ['I', 'Khái niệm, cơ sở hình thành và nhận thức của Đảng về tư tưởng Hồ Chí Minh', 'Flashcards và từ điển thuật ngữ'],
  ['II', 'Cơ sở, quá trình hình thành và phát triển tư tưởng Hồ Chí Minh', 'Trục thời gian tương tác'],
  ['III', 'Tư tưởng Hồ Chí Minh về độc lập dân tộc và chủ nghĩa xã hội', 'Sơ đồ tư duy'],
  ['IV', 'Tư tưởng Hồ Chí Minh về Đảng Cộng sản Việt Nam và Nhà nước của dân, do dân, vì dân', 'Trắc nghiệm tình huống'],
  ['V', 'Tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc và đoàn kết quốc tế', 'Kéo thả ghép nối'],
  ['VI', 'Tư tưởng Hồ Chí Minh về văn hóa, đạo đức, con người', 'Sổ tay rèn luyện đạo đức'],
]

const JOURNEY = [
  { year: 1911, img: nhaRongImg, alt: 'Bến cảng Nhà Rồng', text: 'Rời bến Nhà Rồng ra đi tìm đường cứu nước' },
  { year: 1920, img: toursImg, alt: 'Đại hội Tours 1920', text: 'Tại Đại hội Tours, tán thành Quốc tế III' },
  { year: 1945, img: baDinhImg, alt: 'Lễ đài Độc lập, Quảng trường Ba Đình', text: 'Đọc Tuyên ngôn Độc lập tại Ba Đình', pos: 'object-[center_60%]' },
  { year: 1950, img: dongKheImg, alt: 'Bác Hồ quan sát mặt trận Đông Khê', text: 'Cùng bộ đội quan sát mặt trận Đông Khê' },
  { year: 1954, img: dienBienPhuImg, alt: 'Chiến thắng Điện Biên Phủ', text: 'Chiến thắng Điện Biên Phủ' },
  { year: 1969, img: diChucImg, alt: 'Bút tích Di chúc', text: 'Để lại bản Di chúc lịch sử', pos: 'object-top', paper: true },
]

// ⚠ Nhóm cần đối chiếu lại các dòng nguồn với tài liệu chính thống trước khi đưa lên.
const QUOTES = [
  { text: 'Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người.', source: 'Nói chuyện tại lớp học chính trị của giáo viên, 1958' },
  { text: 'Có tài mà không có đức là người vô dụng, có đức mà không có tài thì làm việc gì cũng khó.', source: 'Bàn về đạo đức cách mạng' },
  { text: 'Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công.', source: 'Bế mạc Đại hội thành lập Mặt trận Tổ quốc Việt Nam, 1955' },
  { text: 'Non sông Việt Nam có trở nên tươi đẹp hay không, chính là nhờ một phần lớn ở công học tập của các em.', source: 'Thư gửi học sinh nhân ngày khai trường, 1945' },
]

// Tiêu đề thẻ theo thiết kế; các ý lấy thẳng từ dữ liệu Chương II
const VALUES = [
  { title: 'Đối với cách mạng Việt Nam', points: chuong2.significance.domains[0].points },
  { title: 'Đối với sự tiến bộ của nhân loại', points: chuong2.significance.domains[1].points },
]

const PHOTO = 'grayscale-100 sepia-[.22] contrast-[1.03]'
const STAR = {
  clipPath: 'polygon(50% 0%,61.8% 35.3%,100% 35.3%,69.1% 57.1%,80.9% 92.7%,50% 70.9%,19.1% 92.7%,30.9% 57.1%,0% 35.3%,38.2% 35.3%)',
}
const H2 = 'mt-3 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em]'
const pad = (n) => String(n).padStart(2, '0')

function StarLogo({ size = 'size-[38px]', star = 'size-5', radius = 'rounded-[10px]' }) {
  return (
    <span className={`grid shrink-0 place-items-center bg-primary ${size} ${radius}`}>
      <span className={`bg-gold ${star}`} style={STAR} />
    </span>
  )
}

function Nav() {
  const link =
    'inline-flex min-h-[44px] items-center whitespace-nowrap border-b-2 border-transparent text-[14px] font-semibold text-ink-soft transition-colors duration-150 hover:border-primary hover:text-ink'
  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-5 px-5 py-3">
        <a href="/" className="flex items-center gap-3 text-ink">
          <StarLogo />
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold">HCM Web</span>
            <span className="text-xs text-muted">Tư tưởng Hồ Chí Minh</span>
          </span>
        </a>
        <div className="ml-auto flex max-w-full gap-7 overflow-x-auto [scrollbar-width:none] max-sm:order-last max-sm:ml-0 max-sm:w-full max-sm:gap-5">
          <a href="#muc-luc" className={link}>Mục lục</a>
          <a href="#hanh-trinh" className={link}>Cuộc đời và sự nghiệp</a>
          <a href="#loi-bac" className={link}>Lời Bác dạy</a>
        </div>
        {/* điện thoại: nút lên cùng dòng logo, link xuống dòng dưới */}
        <a href="/chuong1.html" className="btn btn-dark whitespace-nowrap max-sm:ml-auto">Vào học</a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <header className="mx-auto max-w-[1180px] px-5 pt-14 pb-12">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-14">
        <div className="flex flex-col">
          <p className="eyebrow">Học phần HCM202</p>
          <h1 className="mt-3.5 text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.04] tracking-[-0.025em]">
            Tư tưởng
            <br />
            Hồ Chí Minh
          </h1>
          <p className="mt-[18px] max-w-[520px] font-serif text-[clamp(20px,2.2vw,24px)] leading-[1.45] text-ink-soft italic">
            Học tập và làm theo tư tưởng, đạo đức, phong cách của Người
          </p>
          <div className="mt-7 h-[3px] w-16 bg-primary" />
          <p className="mt-7 max-w-[520px] text-pretty text-[15.5px] leading-[1.7] text-ink-soft">
            Tài liệu ôn tập sáu chương theo giáo trình của Bộ Giáo dục và Đào tạo, dành cho học sinh, sinh viên tự học
            và thầy cô sử dụng trên lớp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/chuong1.html" className="btn btn-primary min-h-12 px-[26px] text-[15px]">Bắt đầu từ Chương I</a>
            <a href="#muc-luc" className="btn btn-outline min-h-12 px-[26px] text-[15px]">Xem mục lục</a>
          </div>
          <blockquote className="mt-12 max-w-[540px] border-t-[3px] border-double border-line-strong pt-7">
            <div className="h-7 font-serif text-[64px] leading-[0.6] text-primary italic">“</div>
            <p className="text-pretty font-serif text-[clamp(21px,2.3vw,26px)] leading-[1.45] italic">
              Trẻ em như búp trên cành,
              <br />
              Biết ăn ngủ, biết học hành là ngoan.
            </p>
            <p className="mt-3.5 text-[12.5px] font-bold tracking-[0.12em] text-muted uppercase">Chủ tịch Hồ Chí Minh</p>
          </blockquote>
        </div>

        <figure className="w-[min(100%,460px)] justify-self-end">
          <div className="rounded-[22px] border border-line bg-white p-3.5">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-track">
              <img
                src={heroImg}
                alt="Bác Hồ bế cháu Nguyễn Minh Phương khi về thăm nhà trẻ quân đội tại Đầm Hồng"
                className={`block size-full object-cover object-[center_30%] ${PHOTO}`}
              />
            </div>
          </div>
          <figcaption className="mx-1.5 mt-4 grid grid-cols-[auto_1fr] items-start gap-3">
            <span className="mt-[9px] h-px w-6 bg-faint" />
            <span className="flex flex-col gap-1">
              <span className="font-serif text-[15.5px] leading-normal italic">
                Bác Hồ bế cháu Nguyễn Minh Phương khi về thăm nhà trẻ quân đội tại Đầm Hồng
              </span>
              <span className="text-xs font-semibold tracking-[0.1em] text-faint uppercase">Ảnh tư liệu · 1950</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </header>
  )
}

function QuoteBand() {
  return (
    <section className="border-y-[3px] border-double border-line-strong bg-cream">
      <div className="mx-auto max-w-[900px] px-5 py-11 text-center">
        <p className="font-serif text-[clamp(24px,3.2vw,36px)] leading-[1.35] italic">“Không có gì quý hơn độc lập, tự do.”</p>
        <p className="mt-3.5 text-[13px] font-bold tracking-[0.12em] text-primary uppercase">Chủ tịch Hồ Chí Minh · 1966</p>
      </div>
    </section>
  )
}

function ChapterIndex() {
  return (
    <section id="muc-luc" className="mx-auto max-w-[980px] scroll-mt-[72px] px-5 pt-20 pb-6">
      <div className="text-center">
        <p className="eyebrow">Mục lục học phần</p>
        <h2 className={H2}>Sáu chương</h2>
        <p className="mx-auto mt-3.5 max-w-[520px] text-[15.5px] leading-[1.65] text-ink-soft">
          Mỗi chương là một trang riêng với một cách ôn tập phù hợp nội dung.
        </p>
      </div>
      <div className="card mt-10 overflow-hidden">
        {CHAPTERS.map(([num, title, method], i) => (
          <motion.a
            key={num}
            href={`/chuong${i + 1}.html`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-5 border-b border-line px-7 py-6 transition-colors duration-150 last:border-b-0 hover:bg-cream max-sm:grid-cols-[48px_minmax(0,1fr)] max-sm:px-5"
          >
            <span className="font-serif text-[34px] leading-none text-primary italic">{num}</span>
            <span className="flex flex-col gap-1.5">
              <span className="text-pretty text-[19px] leading-[1.35] font-bold tracking-[-0.01em]">{title}</span>
              <span className="text-[13.5px] text-muted">{method}</span>
            </span>
            <span className="text-[14px] font-semibold whitespace-nowrap text-primary max-sm:hidden">Vào học →</span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

function Journey() {
  return (
    <section id="hanh-trinh" className="mt-20 scroll-mt-14 bg-ink text-on-dark">
      <div className="mx-auto max-w-[1180px] px-5 py-[72px]">
        <div className="text-center">
          <p className="eyebrow text-gold">Cuộc đời và sự nghiệp</p>
          <h2 className={H2}>Từ bến Nhà Rồng đến bản Di chúc</h2>
          <p className="mx-auto mt-3.5 max-w-[560px] font-serif text-lg leading-normal text-line italic">
            Những dấu mốc trên hành trình tìm đường cứu nước và lãnh đạo cách mạng Việt Nam
          </p>
        </div>
        <div className="mt-11 grid grid-cols-[repeat(auto-fill,minmax(min(170px,100%),1fr))] gap-5">
          {JOURNEY.map((m, i) => (
            <motion.a
              key={m.year}
              href="/chuong2.html"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col gap-3.5 text-on-dark transition-colors duration-150 hover:text-gold"
            >
              <div className="rounded-2xl border border-gold/35 p-2">
                <div className={`aspect-[3/4] overflow-hidden rounded-[10px] ${m.paper ? 'bg-cream' : 'bg-[#2E2822]'}`}>
                  <img
                    src={m.img}
                    alt={m.alt}
                    loading="lazy"
                    className={`size-full object-cover ${m.pos ?? ''} ${m.paper ? 'sepia-[.2]' : 'grayscale-100 sepia-[.25]'}`}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-[22px] font-extrabold text-amber">{m.year}</div>
                <div className="mt-1.5 text-[14px] leading-normal">{m.text}</div>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mt-11 flex justify-center">
          <a
            href="/chuong2.html"
            className="inline-flex min-h-[44px] items-center rounded-full border border-gold px-[22px] text-[14px] font-semibold text-gold transition-colors duration-150 hover:bg-gold hover:text-ink"
          >
            Xem toàn bộ trục thời gian →
          </a>
        </div>
      </div>
    </section>
  )
}

function Teachings() {
  const [i, setI] = useState(0)
  const n = QUOTES.length
  const q = QUOTES[i]
  const arrow =
    'grid size-11 place-items-center rounded-full border border-line-strong text-base transition-colors duration-150 hover:bg-white'

  return (
    <section id="loi-bac" className="mx-auto max-w-[1180px] scroll-mt-[72px] px-5 pt-20 pb-6">
      <div className="rounded-3xl border border-line bg-cream p-2.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-10 rounded-2xl border border-line-strong p-[clamp(24px,4vw,48px)]">
          <figure className="w-[min(100%,520px)] justify-self-center">
            <div className="rounded-[18px] border border-line bg-white p-2.5">
              <div className="aspect-[575/405] overflow-hidden rounded-[10px] bg-track">
                <img src={lamViecImg} alt="Chủ tịch Hồ Chí Minh đang làm việc" loading="lazy" className={`size-full object-cover ${PHOTO}`} />
              </div>
            </div>
            <figcaption className="mt-3 text-center text-xs font-semibold tracking-[0.1em] text-faint uppercase">
              Chủ tịch Hồ Chí Minh làm việc
            </figcaption>
          </figure>

          <div className="flex flex-col items-center gap-6 text-center">
            <p className="eyebrow">Lời Bác dạy</p>
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px w-10 bg-line-strong" />
              <span className="size-2 rotate-45 bg-amber" />
              <span className="h-px w-10 bg-line-strong" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-6"
                aria-live="polite"
              >
                <p className="max-w-[560px] text-pretty font-serif text-[clamp(23px,2.7vw,31px)] leading-[1.45] italic">“{q.text}”</p>
                <p className="text-[14px] leading-normal text-muted">{q.source}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setI((i - 1 + n) % n)} aria-label="Câu trước" className={arrow}>←</button>
              <span className="text-[13px] font-semibold tracking-[0.08em] text-muted">
                {pad(i + 1)} / {pad(n)}
              </span>
              <button type="button" onClick={() => setI((i + 1) % n)} aria-label="Câu tiếp" className={arrow}>→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Significance() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 pt-14 pb-6">
      <div className="text-center">
        <p className="eyebrow">Di sản vô giá</p>
        <h2 className={H2}>Giá trị của tư tưởng Hồ Chí Minh</h2>
        <p className="mx-auto mt-3.5 max-w-[620px] font-serif text-lg leading-normal text-ink-soft italic">
          Soi sáng cách mạng giải phóng dân tộc Việt Nam và cống hiến cho phong trào tiến bộ của nhân loại
        </p>
      </div>
      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-4">
        {VALUES.map((v) => (
          <div key={v.title} className="card flex flex-col p-7">
            <h3 className="border-b-[3px] border-double border-line-strong pb-4 text-[22px] font-extrabold tracking-[-0.01em]">{v.title}</h3>
            {v.points.map((p, j) => (
              <div key={p.title} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-b border-line py-[18px] last:border-b-0 last:pb-0">
                <span className="text-[22px] leading-[1.2] font-extrabold text-amber">{pad(j + 1)}</span>
                <span className="text-[15.5px] leading-[1.55] font-semibold">{p.title}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <a href="/chuong2.html" className="btn btn-outline">Tìm hiểu trong Chương II →</a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t-[3px] border-double border-line-strong">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-5 pt-9 pb-12 text-center">
        <StarLogo size="size-8" star="size-4" radius="rounded-lg" />
        <span className="text-[14px] font-semibold">HCM Web · Học phần Tư tưởng Hồ Chí Minh</span>
        <span className="text-[13px] text-muted">Nội dung theo giáo trình của Bộ Giáo dục và Đào tạo · Ảnh tư liệu lịch sử</span>
      </div>
    </footer>
  )
}

export default function HomePage() {
  // Cuộn mượt khi bấm link neo (#muc-luc…) — đặt ở đây, không sửa index.css
  useEffect(() => {
    const html = document.documentElement
    html.style.scrollBehavior = 'smooth'
    return () => {
      html.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <QuoteBand />
      <ChapterIndex />
      <Journey />
      <Teachings />
      <Significance />
      <Footer />
    </div>
  )
}
