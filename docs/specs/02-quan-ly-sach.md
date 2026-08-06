# 02. Quản lý sách — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

## 1. Mục tiêu
Danh sách sách có **filter** (thể loại, tác giả, nhà xuất bản, năm) + **tìm kiếm** (tên, tác giả, ISBN); trang **chi tiết** hiển thị số lượng còn lại và trạng thái; **Admin** thêm/sửa/xóa và cập nhật số lượng.

## 2. User stories
- Là **người dùng**, tôi lọc và tìm sách để nhanh chóng thấy cuốn cần.
- Là **người dùng**, tôi mở chi tiết sách để xem thông tin và còn mấy bản.
- Là **Admin**, tôi thêm/sửa/xóa sách và chỉnh số lượng bản (nhập thêm, thanh lý).

## 3. Luồng nghiệp vụ
- **Danh sách**: mặc định phân trang; áp filter + search cộng dồn (AND); search không phân biệt hoa/thường, khớp một phần với `title`/`author`/`isbn`.
- **Chi tiết**: hiển thị đủ trường + `availableCopies/totalCopies`; **trạng thái** = `Có sẵn` khi `availableCopies>0`, ngược lại `Hết / đang được mượn`. Kèm danh sách review (xem [07](07-chuc-nang-nang-cao.md)).
- **Admin tạo/sửa**: `title` + `author` bắt buộc; `totalCopies ≥ 1`. Khi sửa giảm `totalCopies`, không cho nhỏ hơn số bản đang được mượn (`totalCopies - availableCopies`).
- **Admin xóa**: chặn nếu còn phiếu `borrowing`/`pending` tham chiếu sách (trả `409`), tránh mồ côi dữ liệu.

## 4. Data model liên quan
`Book` mở rộng thêm `publisher, isbn, description, totalCopies, availableCopies` (xem [00 §3](00-tong-quan-kien-truc.md#3-data-model-dùng-chung-object-in-memory)). Cần **migrate seed** hiện có: `available:true → totalCopies:1, availableCopies:1`.

## 5. API endpoints
| Method | Route | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/api/books` | công khai | query: `q, category, author, publisher, year, page, limit` → `{items,total,page,limit}` |
| GET | `/api/books/:id` | công khai | chi tiết 1 sách |
| GET | `/api/books/meta/filters` | công khai | danh sách distinct `categories, authors, publishers, years` để đổ dropdown |
| POST | `/api/books` | admin | tạo sách |
| PUT | `/api/books/:id` | admin | sửa (gồm cập nhật số lượng) |
| DELETE | `/api/books/:id` | admin | xóa |

## 6. Phân quyền
- GET công khai (khách xem được catalog).
- POST/PUT/DELETE yêu cầu `requireRole('admin')`.

## 7. Edge case & lỗi
- Filter/search không khớp → trả mảng rỗng + `total:0` (không phải lỗi).
- `year`, `page`, `limit` không phải số → bỏ qua hoặc `400` với thông báo rõ.
- Giảm `totalCopies` xuống dưới số bản đang mượn → `409`.
- ISBN trùng (nếu nhập) → cảnh báo `409` (tùy chọn, có thể chỉ warning).
- Xóa sách còn phiếu mượn hoạt động → `409`.

## 8. Tiêu chí chấp nhận
- [ ] Lọc theo từng field và kết hợp nhiều field cho kết quả đúng.
- [ ] Tìm theo tên/tác giả/ISBN không phân biệt hoa thường, khớp một phần.
- [ ] Chi tiết hiển thị đúng `availableCopies/totalCopies` và trạng thái.
- [ ] Chỉ Admin sửa được; giảm số lượng dưới mức đang mượn bị chặn.
- [ ] Phân trang trả đúng `total` và số trang.
