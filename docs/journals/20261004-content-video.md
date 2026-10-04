# Nhật ký: Nội dung & Video Chương I

Ngày: 2026-10-04

## Bối cảnh

Bổ sung bài đọc và video từ dữ liệu hiện có vào trang Chương I, giữ luồng Flashcards và từ điển. `data.json` đã có thay đổi của người dùng và được giữ nguyên.

## Thay đổi

Thêm một tab **Nội dung & Video**, tải mô-đun khi mở. Bài đọc hiển thị giới thiệu, phạm vi, mục tiêu, 7 phần với sáu loại khối, nguồn tham khảo và 11 câu hỏi tự kiểm tra. Mục lục, liên kết thẻ và video nối bài đọc với luồng ôn tập hiện có. Video được chọn để tải trình phát trong trang, có liên kết YouTube dự phòng.

## Quyết định và đánh đổi

- Dùng một tab gộp theo lựa chọn người dùng dù `data.ui` mô tả hai tab; Flashcards vẫn là mặc định.
- Giữ khóa tiến độ, ID thẻ và thuật toán ôn Flashcards. Tiến độ đọc/xem dùng khóa riêng theo chương và `userId` tùy chọn; trang hiện tại dùng khách, chưa có đăng nhập.
- Chỉ thao tác **Đã đọc/Đã xem** ghi nhận hoàn thành và có thể bỏ đánh dấu. Lưu lựa chọn cuối, không suy ra hoàn thành từ mở mục hay mở video.
- Không thêm thư viện hoặc sửa style/cấu hình chung. Tách thành các mô-đun trong thư mục chương và tái sử dụng trình bày nguồn.
- Iframe YouTube không tự phát; khả năng nhúng/phát phụ thuộc dịch vụ ngoài. Giữ liên kết thật để người học mở YouTube. Không đo thời gian xem hoặc triển khai tiếp tục từ vị trí phát; các mẫu đó trong dữ liệu chưa phải hành vi hiện tại.
- Dữ liệu lưu hỏng/bị chặn có cảnh báo và học được trong bộ nhớ; tiến độ có thể mất khi tải lại nếu không ghi được.

## Xác minh

23 kiểm thử Chương I đạt (20 mới và 3 Flashcards hiện có); build đạt. Lint trả mã 0 với 13 cảnh báo có sẵn tại Chương II, IV, VI. Toàn bộ bộ kiểm thử: 58/64 đạt; 6 lỗi parser Chương IV được tái hiện độc lập và xác minh các tệp liên quan không đổi so với HEAD sau chuẩn hóa CRLF/LF.

Review đã kiểm tra dữ liệu, liên kết thẻ, tiến độ, nguồn, mốc thời gian và trạng thái rỗng/lưu trữ. Các phần tự kiểm tra, nguồn phạm vi chương và nguồn video đã được bổ sung theo review. Kiểm tra Chrome 154 với hồ sơ tạm riêng đạt 20/20, không có lỗi JavaScript chưa bắt hoặc `console.error`; bao gồm tương tác, tải lại, desktop và điện thoại 390px. URL/iframe và `autoplay=0` đã được kiểm tra; chưa kiểm tra phát video thật hoặc khả năng nhúng của YouTube.

## Tiếp theo

Khi có kết nối đến YouTube, kiểm tra phát video thật và khả năng nhúng. Xử lý 6 lỗi parser Chương IV ngoài phạm vi thay đổi này. Xem [kế hoạch](../../plans/20261004-content-video/plan.md), [kiểm thử](../../plans/20261004-content-video/reports/tests.md), [review](../../plans/20261004-content-video/reports/review.md) và [trình duyệt](../../plans/20261004-content-video/reports/browser.md).
