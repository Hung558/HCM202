# HCM Web – Web hỗ trợ học Tư tưởng Hồ Chí Minh

### Bước 1 – Cài phần mềm (chỉ làm 1 lần)
1. **Node.js** (bản LTS, từ 22 trở lên): tải ở https://nodejs.org → cài như phần mềm bình thường (Next liên tục).
2. **VS Code** (trình soạn code): https://code.visualstudio.com
   - Nên cài thêm extension **Tailwind CSS IntelliSense** để gợi ý class.

Kiểm tra đã cài được chưa: mở **Terminal** (Windows: mở VS Code → menu *Terminal → New Terminal*) rồi gõ:
```
node -v
```
Hiện ra số phiên bản (ví dụ `v22.x.x`) là được. Báo lỗi "not recognized" thì tắt hết cửa sổ Terminal/VS Code, mở lại rồi thử lại.

### Bước 2 – Tải project về (chỉ làm 1 lần)
Chọn một thư mục để chứa project (ví dụ `D:\`), mở Terminal ở đó rồi chạy:
```
git clone https://github.com/Hung558/HCM202.git
cd HCM202
code .
```
`code .` sẽ mở project trong VS Code. Từ giờ mở Terminal ngay trong VS Code cho tiện.

### Bước 3 – Cài thư viện (chỉ làm 1 lần, và mỗi khi `package.json` thay đổi)
```
npm install
```
Lệnh này tạo thư mục `node_modules` (rất nặng, **không** đẩy lên git, đã có `.gitignore` lo).

### Bước 4 – Chạy project
```
npm run dev
```
Terminal hiện `Local: http://localhost:5173/` → mở trình duyệt vào:
- `http://localhost:5173/` – trang chủ
- `http://localhost:5173/chuongX.html` – chương của bạn (X = 1..6)

Sửa code và lưu lại (Ctrl+S) thì trình duyệt tự cập nhật. Muốn tắt: bấm vào Terminal rồi **Ctrl+C**.

### Lỗi thường gặp
| Lỗi | Cách xử lý |
|---|---|
| `npm` / `node` is not recognized | Chưa cài Node.js, hoặc cài xong chưa mở lại Terminal |
| `Cannot find module ...` / `vite: not found` | Chưa chạy `npm install` |
| Windows báo `running scripts is disabled` khi gõ `npm` | Mở PowerShell bằng *Run as Administrator*, chạy `Set-ExecutionPolicy RemoteSigned`, chọn `Y` |
| Port 5173 đang bị dùng | Vite tự chuyển sang 5174… xem đúng link trong Terminal |
| Sửa code mà trang không đổi | Kiểm tra đã lưu file chưa; vẫn không được thì Ctrl+C rồi `npm run dev` lại |

## Phân công – mỗi người CHỈ sửa trong folder của mình

| Chương | Tính năng | Folder | Thư viện gợi ý |
|---|---|---|---|
| I | Flashcards & Từ điển thuật ngữ | `src/chapters/chuong1` | framer-motion (lật thẻ) |
| II | Trục thời gian tương tác | `src/chapters/chuong2` | framer-motion |
| III | Sơ đồ tư duy động | `src/chapters/chuong3` | @xyflow/react |
| IV | Trắc nghiệm tình huống | `src/chapters/chuong4` | framer-motion |
| V | Kéo thả ghép nối | `src/chapters/chuong5` | @hello-pangea/dnd |
| VI | Sổ tay rèn luyện đạo đức | `src/chapters/chuong6` | localStorage |

Mỗi folder gồm:
- `main.jsx` – entry chạy riêng chương (không cần sửa)
- `<TênTínhNăng>.jsx` – component chính, export default. Muốn tách nhỏ thì tạo thêm file trong cùng folder.
- `data.json` – nội dung của chương. Có sẵn 1 mẫu, tự thêm dữ liệu theo đúng cấu trúc.

Không sửa file dùng chung (`src/App.jsx`, `src/index.css`, `vite.config.js`, `package.json`). Cần thêm thư viện thì báo chủ project.
Icon dùng `lucide-react`, style dùng class Tailwind.

## Style – theo thiết kế Chương 6

Theme chung nằm trong `src/index.css`. **Không tự chọn mã màu**, chỉ dùng tên class bên dưới, để khi gộp 6 chương trông như một web.

### Màu
| Class | Mã | Dùng cho |
|---|---|---|
| `bg-paper` | #F5F1EA | nền trang (đã đặt sẵn cho `body`) |
| `bg-white` + `border-line` | #FFFFFF / #E6DFD3 | thẻ nội dung |
| `bg-cream` | #FBF3E4 | khối trích dẫn, ô nổi bật |
| `text-ink` / `bg-ink` | #1F1B16 | chữ chính; khối tối, tab đang chọn, nút tối |
| `text-ink-soft` | #5C5347 | đoạn văn |
| `text-muted` | #7A7063 | nhãn, chú thích nhỏ |
| `text-faint` | #A89C8B | chữ mờ, icon phụ |
| `text-on-dark` | #FFF8EC | chữ trên nền đỏ / tối (không dùng `text-white`) |
| `bg-primary` / `text-primary` | #B4322A | màu chủ đạo: nút chính, eyebrow, khối trích dẫn lớn |
| `bg-primary-dark` | #8A1F19 | hover của nút đỏ |
| `text-amber` / `bg-amber` | #E59A2F | số thứ tự 01, 02…; thanh tiến độ |
| `bg-gold` / `text-gold` | #F2C06B | nút vàng; chữ nhấn trên nền tối |
| `text-success` / `bg-success-soft` | #2F7D4F / #E8F5ED | đúng, đã hoàn thành |
| `bg-track` | #EFE9DF | nền thanh tiến độ |
| `border-line-strong` | #D9CFBF | viền nút phụ, input |

Đậm nhạt dùng `/`: ví dụ `bg-paper/90`, `bg-primary/10`.

### Chữ
- Font: **Be Vietnam Pro** (mặc định). Trích dẫn lời Bác dùng `font-serif italic` (Lora).
- Tiêu đề trang: `text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]`
- Tiêu đề thẻ: `text-[22px] font-extrabold tracking-[-0.01em]`
- Dòng nhỏ phía trên tiêu đề: `eyebrow`, ví dụ "CHƯƠNG VI · HỌC BÀI"
- Đoạn văn: `text-[15.5px] leading-[1.65] text-ink-soft`
- Số thứ tự: dạng `01`, `02`, `text-[28px] font-extrabold text-amber`

### Hình khối
- Thẻ: `card p-[22px]` (nền trắng, viền `line`, bo 22px). **Không dùng shadow**, chỉ dùng viền.
- Khối lớn / trích dẫn: `rounded-3xl`. Ô nhỏ, input, checkbox: `rounded-xl`.
- Nút luôn bo tròn hẳn và cao tối thiểu 44px (dễ bấm trên điện thoại):
  - Nút chính: `btn btn-primary`
  - Nút tối: `btn btn-dark`
  - Nút phụ: `btn btn-outline`
- Bố cục trang: `mx-auto max-w-[1180px] px-5 pt-10 pb-20`. Lưới thẻ: `grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4`.
- Thanh điều hướng: dính trên cùng, `sticky top-0 bg-paper/90 backdrop-blur-md border-b border-line`. Logo chương là ô vuông đỏ ghi số La Mã, bấm vào thì về trang chủ `/`.

### Chuyển động (framer-motion)
- Đổi trang, đổi phần: mờ dần và trượt nhẹ 12–24px, `duration: 0.2`.
- Thẻ xuất hiện lần lượt: `transition={{ delay: index * 0.06 }}`.
- Nhẹ nhàng, không nảy mạnh, không xoay.

### Icon
`lucide-react`, cỡ `size-4` trong nút, `size-5` trong tiêu đề.

### Mẫu nhanh
```jsx
<div className="mx-auto max-w-[1180px] px-5 pt-10 pb-20">
  <p className="eyebrow">Chương I · Flashcards</p>
  <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
    Tiêu đề chương
  </h1>
  <div className="card mt-6 p-[22px]">
    <span className="text-[28px] font-extrabold text-amber">01</span>
    <p className="mt-2 text-ink-soft">Nội dung…</p>
    <p className="mt-4 rounded-2xl bg-cream px-5 py-4 font-serif italic">“Trích dẫn…”</p>
    <button className="btn btn-primary mt-4">Tiếp tục</button>
  </div>
</div>
```

Cần CSS riêng thì tạo `TenFile.module.css` trong folder chương. **Không dùng file `.css` thường**, vì class sẽ trùng giữa các chương khi gộp.
