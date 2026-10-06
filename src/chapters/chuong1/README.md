# Chương I — Nội dung & Video

Trang `/chuong1.html` giữ **Thẻ ghi nhớ** làm tab mặc định, giữ **Từ điển thuật ngữ** và thêm một tab **Nội dung & Video**. Tab mới dùng dữ liệu thật trong [data.json](data.json): hiện có 7 phần đọc, 11 câu hỏi tự kiểm tra và 3 video.

## Chạy và sử dụng

Chạy tại thư mục gốc sau khi đã cài thư viện theo [README của dự án](../../../README.md):

```powershell
npm.cmd run dev
```

Mở `/chuong1.html` tại địa chỉ Vite in trong Terminal, rồi chọn **Nội dung & Video**.

- Đọc phần giới thiệu, phạm vi và mục tiêu học tập; dùng mục lục để đến một phần.
- Bấm **Đã đọc phần này** để ghi nhận hoàn thành; bấm lại để bỏ đánh dấu. Mở mục lục hoặc cuộn trang không tự ghi nhận đã đọc.
- Mở **Câu hỏi tự kiểm tra** hoặc **Ôn thẻ liên quan**, rồi chọn thẻ để quay về đúng thẻ ghi nhớ. Đổi tab thông thường giữ thẻ đang chọn, mặt thẻ và tiến độ ôn.
- Chọn một video để tải trình phát trong trang, sau đó bấm phát trong trình phát. Video không tự phát khi chọn.
- Bấm **Đánh dấu đã xem** để ghi nhận video, hoặc bấm lại để bỏ đánh dấu. Chọn video và mở YouTube không tự ghi nhận đã xem.
- Dùng **Mở trên YouTube** khi trình phát tải lâu, báo lỗi hoặc video không cho phép nhúng. Video cần kết nối Internet.

## Các mô-đun

| Tệp | Trách nhiệm |
| --- | --- |
| [Flashcards.jsx](Flashcards.jsx) | Trang chương: 4 tab theo `ui.tabs`, hero "nhiệm vụ", trạng thái thẻ/đọc/xem, mở bộ thẻ liên quan |
| [Reader.jsx](Reader.jsx) | Tab Nội dung: "Đường học" (vòng tiến độ, tìm không dấu, mục lục), một phần mỗi lần, câu tự kiểm tra lật |
| [ContentBlocks.jsx](ContentBlocks.jsx) | Hiển thị từng kiểu block (đoạn văn, danh sách, note vàng, lưới thẻ, dòng thời gian, ôn bộ thẻ) |
| [VideoLibrary.jsx](VideoLibrary.jsx) | Tab Video: ảnh bìa, bấm mới tải trình phát, đánh dấu đã xem, mở YouTube |
| [Deck.jsx](Deck.jsx) | Tab Flashcards: chồng thẻ lật 3D, chấm điểm, bản đồ bộ thẻ |
| [Glossary.jsx](Glossary.jsx) | Tab Từ điển: tìm không dấu, panel định nghĩa |
| [Sources.jsx](Sources.jsx) | Dòng nguồn tham khảo theo `sourceId` |
| [learning-progress.js](learning-progress.js) | Lọc dữ liệu theo chương, chuẩn hóa/lưu tiến độ và tạo URL YouTube hợp lệ |
| [progress.js](progress.js) | Thuật toán ôn thẻ hiện có |

XP, âm thanh, hiệu ứng và Bé Sen dùng chung ở [`../_fun/`](../_fun/). Không thêm thư viện hoặc thay đổi cấu hình/style dùng chung.

## Hợp đồng dữ liệu đang dùng

Tab đọc dữ liệu từ `chapter`, `contentSections`, `videos`, `flashcards` và `sources`; không dùng mảng bài đọc giả định tên `sections`.

| Nhóm | Trường và cách dùng |
| --- | --- |
| `chapter` | `id`, `title`, `overview`, `learningObjectives`, `scopeNote`, `scopeCitations`, `sectionIds`, `videoIds` |
| `contentSections[]` | `id`, `chapterId`, `order`, `title`, `summary`, `estimatedReadMinutes`, `blocks`, `relatedFlashcardIds`, `relatedVideoIds`, `selfCheckQuestions` |
| `selfCheckQuestions[]` | `question`, `answerFlashcardIds` trỏ đến `flashcards[].id` |
| `videos[]` | `id`, `chapterId`, `order`, `title`, `provider`, `providerVideoId`, `embedUrl`, `watchUrl`, `channelName`, `description`, `verification.embedStatus`, `citations` |
| `citations[]` | `{ sourceId, locator }`; `sourceId` trỏ đến `sources[].id`, nguồn có `title` và `url` |

Các phần/video phải có `chapterId` khớp chương đang chọn; nếu chương có danh sách `sectionIds`/`videoIds`, chỉ các ID trong danh sách được lấy. Kết quả sắp theo `order`, không sửa mảng gốc. ID phải ổn định để giữ liên kết và tiến độ.

Mỗi `blocks[]` có `id`, `type`, có thể có `title` và `citations`. Sáu kiểu hiện có:

| `type` | Nội dung |
| --- | --- |
| `paragraph` | `text` |
| `bullet_list` | `items[]` gồm `text`, `citations` |
| `table` | `columns[]` gồm `key`, `label`; `rows[]` chứa ô theo từng `key`, có thể có `flashcardIds`, `citations` |
| `timeline` | `items[]` gồm `id`, `date`, `label`, `title`, `text`, `flashcardIds`, `citations`; giữ ngày/tháng đúng mức chi tiết được cung cấp |
| `callout` | `tone`, `title`, `text`; `important` được nhấn mạnh |
| `flashcard_review` | `title`, `flashcardIds` |

Renderer cũng hỗ trợ `heading` bằng `text` hoặc `title`; kiểu chưa hỗ trợ hiện thông báo. Thẻ liên quan chỉ hiện khi ID giải được trong `flashcards`.

Theo lựa chọn của người dùng, giao diện dùng **một tab gộp** dù `data.ui.tabs` mô tả hai tab nội dung/video và `data.ui.defaultTabId` là `content`. Các cờ tìm kiếm/bộ lọc trong `ui`, `relatedGlossaryIds` và `relatedSectionIds` không tạo thêm chức năng điều hướng trong tab hiện tại.

## Lưu tiến độ và giới hạn

Tiến độ đọc/xem được lưu trong `localStorage` của trình duyệt hiện tại:

```text
Khách: hcm202:chuong1:learning:${encodeURIComponent(chapterId)}:guest
Có userId: hcm202:chuong1:learning:${encodeURIComponent(chapterId)}:user:${encodeURIComponent(String(userId))}
```

`ContentVideo` nhận `userId` tùy chọn; trang hiện tại không truyền giá trị này nên dùng khóa khách. Đây là phân vùng dữ liệu cục bộ, chưa có đăng nhập hay đồng bộ tài khoản.

Giá trị lưu gồm `completedSectionIds`, `completedVideoIds`, `lastSectionId`, `lastVideoId`, `updatedAt`. Tiến độ đọc là số ID phần hợp lệ, không trùng chia cho số phần hiện có, làm tròn phần trăm; không có phần thì là 0%. Video hiện số đã đánh dấu/tổng số. Khi tải lại, ID cũ không còn trong dữ liệu bị loại.

Khóa Flashcards vẫn là `hcm202:chuong1:progress:${data.metadata.id}`; dấu đọc/xem không ghi vào khóa này. Chọn mục lục/video lưu lựa chọn cuối; không tự cuộn lại phần đọc khi tải trang.

`data.learningProgress` chứa mô tả/mẫu cho phát triển sau. Triển khai hiện tại dùng dấu thủ công và lưu ID lựa chọn; chưa đo thời gian xem, lưu vị trí phát hoặc tiếp tục phát tại giây trước đó. Thời lượng video chưa biết không được hiển thị thành 0 giây.

Nếu dữ liệu lưu hỏng hoặc trình duyệt chặn lưu trữ, trang hiện cảnh báo và vẫn cho học/đánh dấu trong bộ nhớ. Dấu có thể mất khi tải lại nếu không lưu được. Xóa dữ liệu trình duyệt hoặc đổi thiết bị không giữ tiến độ này.

Chỉ nguồn YouTube và ID/URL hợp lệ tạo trình phát/liên kết; không dùng video thay thế. URL nhúng được đặt `autoplay=0`. `verification.embedStatus` là `disabled`/`unavailable` sẽ bỏ iframe nhưng giữ liên kết YouTube hợp lệ. Sự kiện tải iframe không chứng minh video phát được; lỗi bên trong trình phát có thể không truyền ra trang, nên liên kết ngoài luôn hiện khi hợp lệ.

## Kiểm tra

```powershell
node --test src/chapters/chuong1/progress.test.js src/chapters/chuong1/learning-progress.test.js
npm.cmd run lint
npm.cmd run build
```

Ngày 2026-10-04: 23 kiểm thử Chương I đạt; build đạt; lint đạt với 13 cảnh báo có sẵn tại Chương II, IV, VI. Toàn bộ bộ kiểm thử có 58/64 đạt; 6 lỗi parser Chương IV đã được xác minh có sẵn. Chi tiết: [báo cáo kiểm thử](../../../plans/20261004-content-video/reports/tests.md) và [báo cáo review](../../../plans/20261004-content-video/reports/review.md).

Danh sách kiểm tra thủ công trên màn hình máy tính và điện thoại:

1. Mở tab gộp, kiểm tra 7 phần, mục lục, nguồn, bảng cuộn ngang và mốc thời gian; kiểm tra không tràn ngang toàn trang.
2. Đánh dấu/bỏ đánh dấu một phần, kiểm tra số lượng/phần trăm; đổi tab và tải lại để kiểm tra lưu dấu.
3. Chọn video, kiểm tra không tự phát và không tự đánh dấu; thử liên kết ngoài, đánh dấu/bỏ đánh dấu rồi tải lại.
4. Mở thẻ từ bài đọc/câu hỏi; kiểm tra đúng thẻ, lật và ôn thẻ; đổi tab thông thường rồi quay lại để kiểm tra trạng thái. Tra từ điển như trước.
5. Thử điều hướng bằng bàn phím và tình huống chặn `localStorage`; kiểm tra cảnh báo và thao tác học vẫn dùng được.

Kiểm tra trình duyệt Chrome 154 bằng hồ sơ tạm riêng: 20/20 đạt, không có lỗi JavaScript chưa bắt hoặc `console.error`; đã kiểm tra chuyển tab, đọc/xem thủ công, tải lại, mục lục, liên kết thẻ, dữ liệu lưu hỏng/bị chặn, trạng thái rỗng và bố cục desktop/điện thoại 390px. Xem [báo cáo trình duyệt và ảnh](../../../plans/20261004-content-video/reports/browser.md). Chưa kiểm tra phát video thật hoặc khả năng nhúng của YouTube.
