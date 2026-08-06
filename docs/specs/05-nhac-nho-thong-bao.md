# 05. Nhắc nhở & thông báo — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

## 1. Mục tiêu
Gửi **email nhắc trả sách trước hạn** (HTML template) và **email thông báo quá hạn**; hiển thị **cảnh báo sách sắp đến hạn** trên giao diện Member.

## 2. User stories
- Là **Member**, tôi nhận email nhắc trước khi sách đến hạn để trả đúng hẹn.
- Là **Member**, tôi nhận email khi sách đã quá hạn kèm số tiền phạt đang tính.
- Là **Member**, khi đăng nhập tôi thấy cảnh báo các cuốn sắp/đã đến hạn.

## 3. Luồng nghiệp vụ
- **Scheduler** (`services/scheduler.js`, `node-cron`, chạy mỗi ngày ví dụ 08:00):
  1. Quét `loans` `status='borrowing'`.
  2. `dueDate - now == 2 ngày` (còn 2 ngày) → gửi **email nhắc trước hạn** (nếu chưa gửi).
  3. `now > dueDate` → set `status='overdue'` + gửi **email quá hạn** (một lần khi chuyển trạng thái).
- **Chống gửi trùng**: đánh dấu cờ đã gửi trên phiếu (`remindedBeforeDueAt`, `overdueNotifiedAt`) để idempotent qua nhiều lần cron.
- **Email service** (`services/email.js`): dùng `nodemailer`; cấu hình SMTP qua biến môi trường; **HTML template** có tên độc giả, tên sách, hạn trả, (với quá hạn) số ngày trễ + tiền phạt hiện tại.
- **Cảnh báo UI**: trang Member gọi `GET /api/loans/me?dueSoon=1` lấy phiếu có `dueDate` trong ≤ 2 ngày hoặc `overdue`, hiển thị banner.

## 4. Data model liên quan
`Loan` thêm cờ thời điểm `remindedBeforeDueAt`, `overdueNotifiedAt` (nullable). Không có entity notification riêng — nội dung email dựng từ `loan + user + book` lúc gửi.

## 5. API / thành phần
| Thành phần | Mô tả |
|---|---|
| `services/scheduler.js` | cron quét hạn, gọi email + cập nhật trạng thái |
| `services/email.js` | `sendDueSoon(loan)`, `sendOverdue(loan)`; render HTML template |
| `GET /api/loans/me?dueSoon=1` | (member) phiếu sắp/đã đến hạn cho banner UI |
| `POST /api/loans/:id/notify` (tùy chọn) | (admin) gửi lại nhắc thủ công |

Không có DB thật nên **email nên chạy chế độ dev** (log ra console hoặc dùng Mailtrap/Ethereal) khi thiếu SMTP thật, để không phụ thuộc hạ tầng.

## 6. Phân quyền
- Scheduler chạy server-side, không qua HTTP.
- `GET /api/loans/me` (member). Gửi lại thủ công: admin.

## 7. Edge case & lỗi
- Gửi email thất bại (SMTP lỗi) → log lỗi, **không** chặn việc cập nhật trạng thái; thử lại ở lần cron sau nếu cờ chưa set.
- Phiếu đã `returned` giữa hai lần cron → không gửi.
- Server restart mất cờ in-memory → chấp nhận có thể gửi lại; ưu tiên không sót hơn không trùng (demo).
- Nhiều phiếu của cùng người → có thể gộp 1 email nhiều dòng (tùy chọn nâng cao).

## 8. Tiêu chí chấp nhận
- [ ] Phiếu còn 2 ngày đến hạn được gửi email nhắc (HTML) đúng nội dung.
- [ ] Phiếu quá hạn chuyển `overdue` và gửi email quá hạn kèm số ngày trễ.
- [ ] Không gửi trùng trong cùng vòng đời phiếu (nhờ cờ đã gửi).
- [ ] Member thấy banner cảnh báo sách sắp/đã đến hạn khi đăng nhập.
- [ ] Lỗi SMTP không làm sập tiến trình cập nhật trạng thái.
