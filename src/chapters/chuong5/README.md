# Chương V — Phúc Nguyên

Branch: `chuong5/phucnguyen`. Trang chạy riêng: `/chuong5.html`.

## Nội dung

- `DragDrop.jsx`: trang chương, tab Học bài (thẻ phần, các ý hiện dần, video, câu hỏi suy ngẫm) và giữ trò chơi khi đổi tab.
- `MatchingGame.jsx`: kéo thả bằng `@hello-pangea/dnd` có sẵn; hỗ trợ chọn mảnh rồi chọn năm bằng chuột, cảm ứng hoặc Tab + Enter.
- XP, âm thanh, hiệu ứng và Bé Sen dùng chung ở `../_fun/`; kỷ lục và số lượt lưu ở key `hcm202_c5`.
- `data.json`: nội dung tóm lược, bốn cặp năm – tổ chức, giải thích và nguồn.
- `game.js`, `game.test.js`: logic ghép, xáo trộn và đồng hồ theo thời điểm kết thúc thực tế.

## Luật chơi

Chọn chế độ 60 giây hoặc luyện tập tự do, rồi bấm Bắt đầu chơi. Tổ chức được xáo trộn mỗi lượt. Ghép sai không trừ thời gian và có thể thử lại; ghép đúng sẽ khóa cặp đó. Hoàn thành hoặc hết giờ sẽ hiện kết quả và giải thích cả bốn cặp. Chơi lại/đổi chế độ đặt lại kết quả. Đồng hồ vẫn chạy khi chuyển sang Học bài hoặc rời tab trình duyệt.

## Nguồn

Phần học tóm lược Chương V, trang in 99–118 của PDF giáo trình được cung cấp. Các mốc 1930, 1941, 1951, 1960 xuất hiện ở trang in 103. Chi tiết tổ chức đối chiếu với [Lịch sử Mặt trận dân tộc thống nhất — Ủy ban Trung ương MTTQ Việt Nam](https://m.mattran.org.vn/gioi-thieu/lich-su-mat-tran-dan-toc-thong-nhat-32563.html).

Giao diện dùng icon `lucide-react`, không cần ảnh minh họa hay ảnh AI. Không thêm thư viện hoặc sửa file dùng chung.

## Kiểm tra từ thư mục gốc

```sh
node --test src/chapters/chuong5/game.test.js
npx oxlint src/chapters/chuong5/DragDrop.jsx src/chapters/chuong5/MatchingGame.jsx src/chapters/chuong5/game.js src/chapters/chuong5/game.test.js
npm run dev
```

Mở `/chuong5.html`. Kiểm tra ghép sai → đúng, thắng đủ 4 cặp, hết giờ, chơi lại, đổi chế độ, đổi tab Học bài, và màn hình hẹp. Không lấy kết quả lượt luyện tập tự do làm thời gian của lượt thử thách.
