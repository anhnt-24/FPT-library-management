# 03. Quản lý mượn / trả sách — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

## 1. Mục tiêu
Member **đặt mượn online**; Admin **xác nhận cho mượn** (ghi ngày mượn + hạn trả), **xác nhận trả** (cập nhật số lượng). Phiếu mượn có 4 trạng thái: `pending → borrowing → returned`, và `overdue` khi quá hạn.

## 2. User stories
- Là **Member**, tôi đặt mượn một cuốn sách còn bản trống và theo dõi trạng thái phiếu.
- Là **Admin**, tôi duyệt/ từ chối yêu cầu mượn; khi duyệt, hệ thống đặt ngày mượn và hạn trả.
- Là **Admin**, tôi xác nhận trả sách để hoàn số lượng và tính phạt nếu trễ.
- Là **Member**, tôi xem danh sách phiếu của mình và hạn trả.

## 3. Luồng nghiệp vụ & vòng đời trạng thái
```
Member đặt mượn ──▶ pending ──(Admin duyệt)──▶ borrowing ──(Admin xác nhận trả)──▶ returned
                      │                              │
             (Admin từ chối)                 (quá dueDate, scheduler)
                      ▼                              ▼
                   rejected                       overdue ──(trả)──▶ returned (+ phạt)
```
- **Đặt mượn** (`pending`): kiểm tra `availableCopies>0`, member `status='active'`, chưa vượt giới hạn 5 cuốn đang mượn, và **chưa có phiếu active cùng sách**. Chưa trừ kho ở bước này.
- **Duyệt** (`pending→borrowing`): set `borrowedAt=now`, `dueDate=now+14 ngày`, **giảm `availableCopies`**. Nếu lúc duyệt hết bản → `409`.
- **Từ chối** (`pending→rejected`): không đổi kho.
- **Quá hạn** (`borrowing→overdue`): scheduler đánh dấu khi `now > dueDate` và chưa trả (xem [05](05-nhac-nho-thong-bao.md)).
- **Trả** (`borrowing|overdue → returned`): set `returnedAt=now`, **tăng `availableCopies`**; nếu trả trễ → tính `fineAmount` và tăng `lateReturnCount` của member (xem [07 §2](07-chuc-nang-nang-cao.md)).

## 4. Data model liên quan
`Loan` (thêm giá trị trạng thái `rejected` ngoài 4 trạng thái chính). Kho lấy từ `Book.availableCopies`. `lateReturnCount` thuộc `User`.

## 5. API endpoints
| Method | Route | Quyền | Ghi chú |
|---|---|---|---|
| POST | `/api/loans` | member | `{bookId}` → tạo phiếu `pending` |
| GET | `/api/loans/me` | member | phiếu của chính mình (filter `status`) |
| GET | `/api/loans` | admin | tất cả phiếu, filter `status,userId,bookId`, phân trang |
| GET | `/api/loans/:id` | admin / chủ phiếu | chi tiết |
| PATCH | `/api/loans/:id/approve` | admin | `pending→borrowing` |
| PATCH | `/api/loans/:id/reject` | admin | `pending→rejected` |
| PATCH | `/api/loans/:id/return` | admin | `borrowing\|overdue→returned` |

## 6. Phân quyền
- Member: tạo phiếu, xem phiếu của mình.
- Admin: xem tất cả, duyệt/từ chối/xác nhận trả. Member **không** tự chuyển trạng thái.

## 7. Edge case & lỗi
- Đặt mượn khi hết bản / bị khóa / vượt giới hạn / đã có phiếu active cùng sách → `409`/`403`.
- Duyệt phiếu không ở `pending`, hoặc trả phiếu không ở `borrowing/overdue` → `409` (sai trạng thái).
- Trả đúng hạn → `fineAmount=0`. Trả trễ → phạt theo số ngày, làm tròn theo ngày.
- Kho không bao giờ âm; tổng bản đang mượn ≤ `totalCopies`.

## 8. Tiêu chí chấp nhận
- [ ] Member đặt mượn tạo phiếu `pending`, chưa trừ kho.
- [ ] Admin duyệt → `borrowing`, có `borrowedAt`/`dueDate`, kho giảm 1.
- [ ] Admin xác nhận trả → `returned`, kho tăng 1; trả trễ có `fineAmount>0`.
- [ ] Quá `dueDate` mà chưa trả → phiếu thành `overdue`.
- [ ] Các chuyển trạng thái sai luật đều bị chặn.
