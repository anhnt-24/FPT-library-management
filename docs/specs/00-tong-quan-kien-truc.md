# 00. Tổng quan kiến trúc — Nền tảng dùng chung

Tài liệu này mô tả phần **dùng chung** cho tất cả các spec (01–07). Các spec khác chỉ mô tả phần riêng và tham chiếu về đây, không lặp lại.

## 1. Nguyên tắc kỹ thuật

- **Lưu trữ**: giữ pattern **mock in-memory** như hiện tại ([server/src/data/books.js](../../server/src/data/books.js)). Mỗi entity là 1 module `data/*.js` export các hàm CRUD; route không biết dữ liệu nằm đâu. Dữ liệu **mất khi restart server** (chấp nhận cho demo). Muốn lên DB thật sau này chỉ cần viết lại đúng interface các hàm trong `data/*`.
- **Xác thực**: **JWT access + refresh**. Access token ngắn hạn (15 phút) gửi qua header `Authorization: Bearer <token>`; refresh token dài hạn (7 ngày) lưu in-memory ở `data/refreshTokens.js`.
- **ES Modules** ở cả client/server; mọi HTTP phía client đi qua `client/src/api/*`.
- **Client** bổ sung **React Router** (nhiều trang) + **AuthContext** (giữ user/role/token) + `ProtectedRoute`. Dashboard dùng **Recharts**.

## 2. Cấu trúc thư mục (mở rộng từ hiện tại)

```
server/src/
├── data/          books, users, loans, reviews, refreshTokens
├── routes/        auth, books, loans, readers, reviews, dashboard, reports
├── middleware/    auth.js (verify JWT → req.user), requireRole.js
├── services/      email, qrcode, export, fine, scheduler, recommend
└── app.js         wire middleware + routers

client/src/
├── api/           auth, books, loans, readers, reviews, dashboard, reports
├── context/       AuthContext.jsx
├── components/    Navbar, ProtectedRoute, charts, ...
└── pages/         Login, Register, Books, BookDetail, MyLoans, AdminLoans,
                   Readers, ReaderDetail, Dashboard, ...
```

## 3. Data model dùng chung (object in-memory)

| Entity | Field |
|---|---|
| **User** | `id, name, email, passwordHash, role('admin'\|'member'), status('active'\|'locked'), lateReturnCount, createdAt` |
| **Book** | `id, title, author, publisher, category, year, isbn, description, totalCopies, availableCopies, coverUrl?` |
| **Loan** | `id, userId, bookId, status('pending'\|'borrowing'\|'returned'\|'overdue'), requestedAt, borrowedAt, dueDate, returnedAt, fineAmount` |
| **Review** | `id, userId, bookId, rating(1..5), comment, createdAt` |
| **RefreshToken** | `token, userId, expiresAt` |

> **Thay đổi model cũ**: `Book.available` (boolean) → **`totalCopies`** + **`availableCopies`** để hỗ trợ "số lượng còn lại". `availableCopies` giảm khi cho mượn, tăng khi trả. Sách "có sẵn" ⟺ `availableCopies > 0`.

Nhắc-hạn / quá-hạn **không có entity riêng** — suy ra từ `loans` theo `dueDate`.

## 4. Luồng xác thực (JWT)

1. `register`/`login` → server trả `{ accessToken, refreshToken, user }`.
2. Client lưu token (AuthContext), gắn `Authorization: Bearer` cho mọi request cần quyền.
3. Access hết hạn → client gọi `POST /api/auth/refresh` với refresh token → nhận access mới.
4. `logout` → xoá refresh token khỏi store (thu hồi).
5. Middleware `auth` giải mã access token → gắn `req.user = { id, role }`. `requireRole('admin')` chặn nếu sai vai trò.

## 5. Quy ước API & lỗi

- Thành công: trả JSON body; tạo mới → `201`; không nội dung → `204`.
- Lỗi: `{ "message": "..." }` kèm status: `400` (thiếu/sai input), `401` (chưa đăng nhập / token hỏng), `403` (sai vai trò / bị khóa), `404` (không tồn tại), `409` (xung đột, ví dụ hết sách / đã mượn).
- Danh sách có phân trang trả `{ items, total, page, limit }`.

## 6. Tham số nghiệp vụ mặc định (cấu hình được)

| Tham số | Mặc định |
|---|---|
| Hạn mượn | 14 ngày kể từ `borrowedAt` |
| Nhắc trả trước hạn (email) | 2 ngày trước `dueDate` |
| Phạt trả trễ | 5.000đ / ngày trễ |
| Khóa tài khoản | khi `lateReturnCount ≥ 3` |
| Giới hạn sách đang mượn / member | 5 cuốn |

## 7. Danh sách spec

- [01 — Authentication](01-authentication.md)
- [02 — Quản lý sách](02-quan-ly-sach.md)
- [03 — Mượn / trả sách](03-muon-tra-sach.md)
- [04 — Quản lý độc giả](04-quan-ly-doc-gia.md)
- [05 — Nhắc nhở & thông báo](05-nhac-nho-thong-bao.md)
- [06 — Dashboard thống kê](06-dashboard-thong-ke.md)
- [07 — Chức năng nâng cao](07-chuc-nang-nang-cao.md)
