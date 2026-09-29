# HCM Web – Web hỗ trợ học Tư tưởng Hồ Chí Minh

## Chạy
```
npm install
npm run dev
```
Mở `http://localhost:5173/chuongX.html` để xem riêng chương của mình (X = 1..6).

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

## Style
- Viết class Tailwind trực tiếp trong JSX.
- Màu và font chung đã khai báo trong `src/index.css`. Dùng các class `bg-primary`, `text-primary-dark`, `bg-accent`, `bg-surface`… thay vì tự chọn mã màu, để khi gộp các chương đồng bộ với nhau.
- Cần CSS riêng thì tạo file `TenFile.module.css` trong folder chương rồi dùng `import styles from './TenFile.module.css'`. **Không dùng file `.css` thường**, vì class sẽ bị trùng giữa các chương khi gộp.
