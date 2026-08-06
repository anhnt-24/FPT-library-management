# 07. Chức năng nâng cao (cộng điểm) — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

Gộp 5 tính năng cộng điểm, mỗi tính năng một mục độc lập.

---

## 1. QR Code sách
**Mục tiêu**: mỗi sách có mã QR để tra cứu nhanh thông tin.
- **Nội dung mã**: URL trang chi tiết `<APP_URL>/books/:id` (quét bằng điện thoại mở web ngay).
- **Sinh mã**: thư viện `qrcode` (server) → trả PNG/dataURL; hoặc `qrcode.react` render phía client.
- **API**: `GET /api/books/:id/qrcode` → ảnh PNG (hoặc `{ dataUrl }`). Nút "In mã QR" ở trang chi tiết (Admin).
- **Chấp nhận**: quét mã dẫn đúng trang chi tiết sách tương ứng.

## 2. Phạt trả trễ
**Mục tiêu**: tự động tính tiền phạt theo số ngày trễ.
- **Công thức**: `fine = max(0, ceil((returnedAt - dueDate)/1 ngày)) × 5.000đ` (đơn giá cấu hình ở [00 §6](00-tong-quan-kien-truc.md#6-tham-số-nghiệp-vụ-mặc-định-cấu-hình-được)).
- **Thời điểm tính**: khi Admin xác nhận trả ([03](03-muon-tra-sach.md)); ghi `Loan.fineAmount`, tăng `User.lateReturnCount`.
- **Hiển thị**: badge phạt trên phiếu; tổng phạt trong hồ sơ độc giả ([04](04-quan-ly-doc-gia.md)).
- **Service**: `services/fine.js` → `calcFine(dueDate, returnedAt)`.
- **Chấp nhận**: trả đúng hạn `fine=0`; trễ N ngày → `fine = N×đơn giá`; `lateReturnCount` tăng.

## 3. Đánh giá sách (review + rating)
**Mục tiêu**: Member review và chấm điểm sách **đã từng mượn**.
- **Điều kiện**: chỉ member có phiếu `returned` cho sách đó mới được review; **1 review / (member, sách)** (cho phép sửa).
- **Data**: `Review { id, userId, bookId, rating(1..5), comment, createdAt }`.
- **API**: `GET /api/books/:id/reviews`; `POST /api/books/:id/reviews {rating,comment}` (member); `PUT/DELETE /api/reviews/:id` (chủ review hoặc admin).
- **Hiển thị**: điểm trung bình + số lượt trên trang chi tiết ([02](02-quan-ly-sach.md)).
- **Chấp nhận**: member chưa mượn → `403`; điểm trung bình cập nhật đúng; không tạo được review trùng.

## 4. Export báo cáo (CSV / PDF)
**Mục tiêu**: xuất danh sách mượn/trả ra CSV hoặc PDF.
- **API**: `GET /api/reports/loans.csv?from=&to=&status=` và `GET /api/reports/loans.pdf?...` (admin) → tải file.
- **Nội dung**: mã phiếu, độc giả, sách, ngày mượn, hạn, ngày trả, trạng thái, phạt.
- **Kỹ thuật**: CSV tự sinh (không cần lib); PDF dùng `pdfkit`. Header `Content-Disposition: attachment`.
- **Chấp nhận**: file tải về mở được, đúng cột, đúng bộ lọc `from/to/status`.

## 5. Gợi ý sách
**Mục tiêu**: gợi ý sách dựa trên lịch sử mượn của Member.
- **Thuật toán (content-based, đơn giản)**: lấy `category`/`author` xuất hiện nhiều trong lịch sử mượn của member → đề xuất sách **cùng thể loại/tác giả** mà member **chưa mượn** và `availableCopies>0`, sắp theo mức độ khớp + rating trung bình. Member mới chưa có lịch sử → fallback theo sách được mượn nhiều / rating cao.
- **API**: `GET /api/recommendations` (member) → danh sách sách gợi ý.
- **Service**: `services/recommend.js`.
- **Chấp nhận**: member từng mượn nhiều sách "Lập trình" được gợi ý thêm sách "Lập trình" chưa mượn; member mới nhận fallback hợp lý.

---

## Phụ thuộc thư viện (thêm mới)
`qrcode` / `qrcode.react`, `pdfkit`, `nodemailer` ([05](05-nhac-nho-thong-bao.md)), `node-cron` ([05](05-nhac-nho-thong-bao.md)), `recharts` ([06](06-dashboard-thong-ke.md)), `bcrypt` + `jsonwebtoken` ([01](01-authentication.md)), `react-router-dom`.
