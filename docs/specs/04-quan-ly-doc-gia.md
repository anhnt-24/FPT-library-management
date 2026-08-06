# 04. Quản lý độc giả — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

## 1. Mục tiêu
Admin **xem danh sách độc giả**, xem **lịch sử mượn/trả** từng người, và **khóa/mở khóa** tài khoản vi phạm (trả trễ nhiều lần).

## 2. User stories
- Là **Admin**, tôi xem danh sách độc giả kèm số phiếu đang mượn / quá hạn để nắm tình hình.
- Là **Admin**, tôi mở hồ sơ một độc giả để xem toàn bộ lịch sử mượn/trả.
- Là **Admin**, tôi khóa tài khoản độc giả trả trễ nhiều lần và mở lại khi cần.

## 3. Luồng nghiệp vụ
- **Danh sách**: chỉ liệt kê User `role='member'`; kèm chỉ số suy ra: số đang mượn (`borrowing`), số `overdue`, `lateReturnCount`, `status`. Hỗ trợ tìm theo tên/email, phân trang.
- **Hồ sơ chi tiết**: thông tin cơ bản + toàn bộ `loans` của member (mọi trạng thái), sắp xếp mới nhất trước; kèm tổng phạt.
- **Khóa**: đặt `status='locked'` → member không đăng nhập/đặt mượn được (đang mượn vẫn phải trả). **Gợi ý tự động**: khi `lateReturnCount ≥ 3`, hệ thống đánh dấu "nên khóa" để Admin xác nhận (không tự khóa cứng để tránh khóa nhầm).
- **Mở khóa**: đặt `status='active'`; tùy chọn reset `lateReturnCount`.

## 4. Data model liên quan
`User` (`status`, `lateReturnCount`) + `Loan` để dựng lịch sử. Không thêm entity mới.

## 5. API endpoints
| Method | Route | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/api/readers` | admin | `q, page, limit` → member + chỉ số |
| GET | `/api/readers/:id` | admin | hồ sơ + tổng hợp |
| GET | `/api/readers/:id/loans` | admin | lịch sử mượn/trả (filter `status`) |
| PATCH | `/api/readers/:id/lock` | admin | khóa |
| PATCH | `/api/readers/:id/unlock` | admin | mở khóa |

## 6. Phân quyền
Toàn bộ route yêu cầu `requireRole('admin')`. Member chỉ xem lịch sử **của mình** qua `/api/loans/me` ([03](03-muon-tra-sach.md)).

## 7. Edge case & lỗi
- Không cho khóa tài khoản có `role='admin'`.
- Khóa độc giả đang có phiếu `borrowing`/`overdue` → vẫn khóa được, nhưng cảnh báo số phiếu chưa trả.
- `:id` không tồn tại hoặc không phải member → `404`.
- Khóa một tài khoản đã `locked` (hoặc mở tài khoản đã `active`) → idempotent, không lỗi.

## 8. Tiêu chí chấp nhận
- [ ] Danh sách chỉ gồm member, kèm số đang mượn / quá hạn / số lần trễ.
- [ ] Hồ sơ hiển thị đầy đủ lịch sử mượn/trả của độc giả.
- [ ] Khóa → member không đăng nhập/đặt mượn được; mở khóa → hoạt động lại.
- [ ] `lateReturnCount ≥ 3` hiển thị cờ gợi ý khóa cho Admin.
- [ ] Không thể khóa tài khoản admin.
