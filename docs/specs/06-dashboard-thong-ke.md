# 06. Dashboard thống kê (chỉ Admin) — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

## 1. Mục tiêu
Trang dashboard **chỉ dành cho Admin**: các chỉ số tổng quan, sách được mượn nhiều nhất, thống kê lượt mượn theo ngày/tháng/năm, với **tối thiểu 2 loại biểu đồ**.

## 2. User stories
- Là **Admin**, tôi thấy nhanh tổng số sách, số đang mượn, số phiếu quá hạn.
- Là **Admin**, tôi biết sách nào được mượn nhiều nhất để cân đối kho.
- Là **Admin**, tôi xem xu hướng lượt mượn theo thời gian bằng biểu đồ.

## 3. Nội dung & chỉ số
- **Thẻ tổng quan (KPI)**: tổng số đầu sách + tổng số bản; số bản **đang được mượn** (`Σ (totalCopies-availableCopies)`); số phiếu **overdue**; tổng độc giả.
- **Top sách mượn nhiều nhất**: đếm số phiếu theo `bookId` (mọi trạng thái trừ `rejected`), lấy top N.
- **Lượt mượn theo thời gian**: nhóm `loans` theo `borrowedAt` theo `day|month|year`.

## 4. Biểu đồ (Recharts, ≥ 2 loại)
| Biểu đồ | Loại | Dữ liệu |
|---|---|---|
| Lượt mượn theo thời gian | **Line/Bar** | trục X = ngày/tháng/năm, Y = số lượt |
| Top sách mượn nhiều | **Bar ngang** | tên sách × số lượt |
| Cơ cấu theo thể loại / trạng thái phiếu | **Pie/Doughnut** | tỉ lệ theo `category` hoặc `status` |

Tối thiểu dùng 2 trong số trên (khuyến nghị đủ 3).

## 5. API endpoints
| Method | Route | Quyền | Trả về |
|---|---|---|---|
| GET | `/api/dashboard/summary` | admin | `{ totalTitles, totalCopies, borrowing, overdue, totalReaders }` |
| GET | `/api/dashboard/most-borrowed?limit=5` | admin | `[{ bookId, title, count }]` |
| GET | `/api/dashboard/borrow-stats?group=day\|month\|year&from=&to=` | admin | `[{ period, count }]` |
| GET | `/api/dashboard/category-breakdown` | admin | `[{ category, count }]` |

## 6. Phân quyền
Toàn bộ route + trang dashboard yêu cầu `requireRole('admin')`; client chặn bằng `ProtectedRoute role="admin"`.

## 7. Edge case & lỗi
- Chưa có dữ liệu → trả mảng rỗng / số 0; UI hiển thị "chưa có dữ liệu" thay vì biểu đồ trống lỗi.
- `group` không hợp lệ → `400`.
- `from>to` → `400` hoặc hoán đổi.
- Tính theo `borrowedAt` (thời điểm thực mượn), phiếu `pending` chưa có `borrowedAt` không tính vào thống kê thời gian.

## 8. Tiêu chí chấp nhận
- [ ] KPI hiển thị đúng tổng sách, đang mượn, quá hạn.
- [ ] Top sách mượn nhiều đúng thứ tự theo số lượt.
- [ ] Đổi `group=day/month/year` biểu đồ thời gian đổi tương ứng.
- [ ] Có ≥ 2 loại biểu đồ render đúng dữ liệu.
- [ ] Member truy cập route/trang dashboard → `403` / bị chặn.
