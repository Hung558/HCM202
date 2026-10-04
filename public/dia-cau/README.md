# Quá trình hình thành tư tưởng Hồ Chí Minh — Quả địa cầu 3D

Khám phá hành trình vạn dặm và sự kết tinh của Tư tưởng Hồ Chí Minh qua không gian 3D. Viết bằng Three.js (HTML/CSS/JavaScript thuần, không cần cài đặt hay build).

## Tính năng

- Quả địa cầu có mây, nền sao, ánh sáng đều mọi phía.
- Đường biên giới giữa các quốc gia.
- **41 sự kiện** trong hành trình của Chủ tịch Hồ Chí Minh (1890–1969), chia **5 giai đoạn**, đánh dấu bằng chấm đỏ tại 31 địa điểm (chấm càng to/đậm màu thì càng nhiều sự kiện).
- Trang chi tiết cho mỗi sự kiện: tiêu đề, thời gian, ảnh/video YouTube (xem dạng trình chiếu), mô tả, nguồn và tài liệu tham khảo. Địa điểm có nhiều sự kiện sẽ hiện danh sách để chọn.
- 50 quốc gia được đánh dấu (chấm vàng + tên), cùng quần đảo **Hoàng Sa** và **Trường Sa** của Việt Nam.
- Bấm vào chấm hoặc tên: quả địa cầu xoay tới đó và mở trang chi tiết bên trái.
- Menu **"Các Giai Đoạn Chính"** (góc trên phải) có 2 tab: **Giai đoạn** (các sự kiện) và **Châu lục** (các nước).
- Kéo chuột để xoay, lăn chuột để phóng to/thu nhỏ, nút **Bật/Tắt xoay** (góc dưới phải).

## Chạy thử trên máy

Trang tải dữ liệu biên giới bằng `fetch`, nên cần mở qua một web server (mở trực tiếp file `index.html` sẽ không hiện biên giới):

- VS Code: cài extension **Live Server** → chuột phải `index.html` → *Open with Live Server*.
- Hoặc: `npx serve .` rồi mở địa chỉ được in ra.

## Đưa lên mạng (GitHub Pages)

Repo → **Settings → Pages** → *Source*: `Deploy from a branch`, branch `main`, thư mục `/ (root)` → **Save**.
Sau khoảng 1 phút trang sẽ có tại `https://<tên-github>.github.io/<tên-repo>/`.

## Sửa nội dung sự kiện

Mở `events.js`: `PHASE_LABELS` là tên 5 giai đoạn, `EVENTS` là danh sách sự kiện (`year`, `location`, `coordinates` [vĩ độ, kinh độ], `eventName`, `description`, `mediaUrl`, `sourceMedia`, `references`, `templateType`: `normal` = 1 ảnh, `grid` = nhiều ảnh, `story_scroll` = mỗi ảnh đi kèm một đoạn mô tả). Ảnh lưu trong máy đặt ở thư mục `image/`.

## Thêm nội dung cho từng nước

Mở `data.js`. Mỗi nước có các trường để trống sẵn:

| Trường | Ý nghĩa |
|---|---|
| `eventName` | Tên sự kiện |
| `description` | Nội dung hiển thị trong trang chi tiết |
| `mediaUrl` | Danh sách link ảnh/video |
| `references` | Danh sách link tham khảo |

Thêm nước mới: thêm một dòng `['Châu lục', 'Tên nước', 'Thủ đô', vĩ độ, kinh độ]` vào danh sách `COUNTRIES`.

## Cấu trúc

```
index.html      Giao diện (menu, trang chi tiết, nút)
style.css       Kiểu dáng
main.js         Quả địa cầu, marker, biên giới, điều khiển chuột
data.js         Danh sách quốc gia và quần đảo
events.js       41 sự kiện và 5 giai đoạn
image/          Ảnh dùng trong các sự kiện
three.js        Thư viện Three.js r160
lib/            Dữ liệu biên giới + thư viện topojson-client
texture/        Ảnh bề mặt Trái Đất, mây, nền sao
```

## Giấy phép

[MIT](LICENSE) © 2026 Hung558

## Nguồn

- Nội dung các sự kiện: dự án hcma (Hành trình tư tưởng Hồ Chí Minh); ảnh và bài viết thuộc các báo/trang được ghi nguồn trong từng sự kiện

- [Three.js](https://threejs.org/) (MIT)
- Biên giới: [Natural Earth](https://www.naturalearthdata.com/) 1:50m qua [world-atlas](https://github.com/topojson/world-atlas) (public domain), đọc bằng [topojson-client](https://github.com/topojson/topojson-client) (ISC)
