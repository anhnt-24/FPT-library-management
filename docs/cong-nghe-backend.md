# Công nghệ & cách triển khai — Backend

Tài liệu mô tả **backend** làm bằng công nghệ gì và mỗi tính năng được triển khai ra sao. (Không đề cập frontend.)

## 1. Stack công nghệ

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Runtime | **Node.js** (ESM, `"type":"module"`) | Chạy server |
| Web framework | **Express 4** | Routing, middleware, REST API |
| Cơ sở dữ liệu | **SQLite** qua **better-sqlite3** | Lưu trữ, truy vấn (API **đồng bộ**) |
| Mã hóa mật khẩu | **bcryptjs** | Hash + so khớp mật khẩu |
| Token | **jsonwebtoken** (JWT) + **crypto** (built-in) | Access token JWT + refresh token ngẫu nhiên |
| Mã QR | **qrcode** | Sinh ảnh PNG QR |
| Email | **nodemailer** | Gửi mail nhắc/quá hạn (HTML) |
| Hẹn giờ | **node-cron** | Quét hạn trả hằng ngày |
| CORS | **cors** | Cho phép gọi cross-origin ngoài dev |

## 2. Kiến trúc phân lớp

```
server.js  (bootstrap: app.listen + startScheduler)
   └─ app.js  (cors, express.json, mount router, 404)
        └─ routes/*.js  (REST endpoint + validate + phân quyền)
             └─ data/*.js  (data-access: prepared statement)
                  └─ db.js  (better-sqlite3: schema + seed)
   middleware/  auth.js (verify JWT), requireRole.js (guard vai trò)
   services/    fine.js, email.js, scheduler.js, recommend.js
   config.js    hằng số + tham số nghiệp vụ (override qua env)
```

Điểm cốt lõi: **route không biết dữ liệu nằm đâu** — mọi truy cập dữ liệu đi qua `data/*.js`. Nhờ vậy trước đây đổi từ mảng in-memory sang SQLite mà không phải sửa route.

## 3. Cơ sở dữ liệu — [server/src/db.js](../server/src/db.js)

- Mở file `server/library.db` bằng `new Database()`, bật `journal_mode = WAL`.
- Tạo schema `CREATE TABLE IF NOT EXISTS`: **users, books, loans, refresh_tokens, reviews** (reviews có `UNIQUE(userId, bookId)`).
- **Seed nếu rỗng**: 1 admin + 2 độc giả (bcrypt hash), 8 sách, 3 phiếu mượn.
- Mỗi `data/*.js` dùng **prepared statement** (`db.prepare(...).get/all/run`), có **UPDATE động** dựng từ whitelist cột — chỉ set field được truyền.

## 4. Triển khai từng tính năng

### 4.1 Authentication — [routes/auth.js](../server/src/routes/auth.js), [middleware/](../server/src/middleware/)
- **Đăng ký/đăng nhập**: mật khẩu hash bằng `bcrypt.hash` (đăng ký) / `bcrypt.compare` (đăng nhập); chỉ lưu `passwordHash`, trả về client đã lọc bằng `toPublic()`.
- **Access token**: `jwt.sign({sub, role}, ACCESS_SECRET, {expiresIn: '15m'})` (HS256).
- **Refresh token**: chuỗi ngẫu nhiên `crypto.randomBytes(40).toString('hex')`, lưu bảng `refresh_tokens` kèm `expiresAt`. `POST /auth/refresh` tra token còn hạn → cấp access mới; `logout` xóa token (thu hồi).
- **Phân quyền**: middleware `auth` đọc header `Authorization: Bearer`, `jwt.verify` → gắn `req.user = {id, role}`; `requireRole('admin')` chặn sai vai trò (403). Áp cho mọi route cần bảo vệ.

### 4.2 Quản lý sách — [routes/books.js](../server/src/routes/books.js), [data/books.js](../server/src/data/books.js)
- **Lọc + tìm kiếm**: hàm `search()` lấy toàn bộ rồi lọc trong JS (dataset nhỏ) — `q` khớp một phần không phân biệt hoa thường trên title/author/isbn; cộng dồn category/author/publisher/year.
- **Phân trang**: cắt mảng `slice((page-1)*limit, ...)`, trả `{items, total, page, limit}`.
- **Dropdown filter**: `distinct()` trả các giá trị duy nhất.
- **CRUD**: POST/PUT/DELETE bọc `auth + requireRole('admin')`. PUT cập nhật số lượng có ràng buộc `totalCopies ≥ số bản đang mượn` (nếu vi phạm → 409); `availableCopies` được tính lại.

### 4.3 Mượn / trả — [routes/loans.js](../server/src/routes/loans.js), [services/fine.js](../server/src/services/fine.js)
- **Máy trạng thái**: `pending → borrowing → returned/overdue`, nhánh `rejected`.
- **Đặt mượn** (member): kiểm còn bản, chưa khóa, chưa vượt `MAX_ACTIVE_LOANS`, không trùng sách đang xử lý → tạo phiếu `pending` (chưa trừ kho).
- **Duyệt** (admin): set `borrowedAt`, `dueDate = now + LOAN_DAYS`, gọi `books.update` giảm `availableCopies`.
- **Trả** (admin): `calcFine(dueDate, now)` = số ngày trễ (làm tròn lên) × `FINE_PER_DAY`; tăng `availableCopies`; nếu có phạt thì `lateReturnCount + 1`.

### 4.4 Quản lý độc giả — [routes/readers.js](../server/src/routes/readers.js)
- Toàn bộ router bọc `auth + requireRole('admin')`.
- Danh sách lọc `role='member'`, mỗi độc giả kèm chỉ số **suy ra từ loans** (`borrowingCount`, `overdueCount`) và cờ `shouldLock` khi `lateReturnCount ≥ LATE_LOCK_THRESHOLD`.
- Khóa/mở khóa = đổi `status` (`locked`/`active`).

### 4.5 Nhắc nhở & email — [services/email.js](../server/src/services/email.js), [services/scheduler.js](../server/src/services/scheduler.js)
- **nodemailer**: nếu có `SMTP_HOST` (env) → gửi thật; không thì transport **dev** ghi log `📧 [DEV email]`. Nội dung là **HTML template** (nhắc trước hạn / quá hạn).
- **node-cron**: `cron.schedule('0 8 * * *', ...)` chạy 08:00 hằng ngày → `runReminderSweep()` quét phiếu `borrowing`: còn 2 ngày → gửi nhắc; quá `dueDate` → đổi `overdue` + gửi mail quá hạn (kèm số ngày trễ + phạt tạm tính).

### 4.6 Dashboard thống kê — [routes/dashboard.js](../server/src/routes/dashboard.js)
- Router bọc `requireRole('admin')`. Số liệu tổng hợp bằng JS trên data module:
  - **summary**: `reduce` tổng bản, đang mượn (`totalCopies - availableCopies`), đếm `overdue`, đếm member.
  - **most-borrowed**: đếm phiếu theo `bookId` (bỏ `rejected`), sort giảm dần, `slice(limit)`.
  - **borrow-stats**: nhóm theo `day|month|year` (format từ `borrowedAt`); group sai → 400.
  - **category-breakdown**: đếm đầu sách theo `category`.

### 4.7 Chức năng nâng cao
- **Đánh giá** — [routes/reviews.js](../server/src/routes/reviews.js), [data/reviews.js](../server/src/data/reviews.js): điều kiện member đã có phiếu `returned` cho sách; `UNIQUE(userId,bookId)` + `upsert` (1 review/người/sách, gửi lại thì ghi đè); `averageForBook` dùng `AVG()` SQL.
- **Gợi ý sách** — [services/recommend.js](../server/src/services/recommend.js): content-based, chấm điểm `category × 2 + author × 3` theo lịch sử mượn, loại sách đã mượn, chỉ sách còn bản; member mới → fallback theo số bản/độ phổ biến.
- **Export CSV** — [routes/reports.js](../server/src/routes/reports.js): tự sinh chuỗi CSV (không cần thư viện), `csvEscape` cho dấu phẩy/ngoặc kép, thêm **BOM UTF-8** để Excel đọc đúng tiếng Việt, header `Content-Disposition: attachment`.
- **QR code** — trong [routes/reviews.js](../server/src/routes/reviews.js): `QRCode.toBuffer(url, {width:240})` trả **PNG**; `url` trỏ tới `APP_URL/books/:id`.

## 5. Cấu hình — [server/src/config.js](../server/src/config.js)

Tất cả override được qua biến môi trường:

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `JWT_ACCESS_SECRET` | dev secret | Khóa ký access token |
| `JWT_ACCESS_TTL` | `15m` | Hạn access token |
| `JWT_REFRESH_TTL_DAYS` | `7` | Hạn refresh token |
| `LOAN_DAYS` | `14` | Số ngày cho mượn |
| `FINE_PER_DAY` | `5000` | Phạt mỗi ngày trễ (đ) |
| `MAX_ACTIVE_LOANS` | `5` | Số sách mượn tối đa |
| `LATE_LOCK_THRESHOLD` | `3` | Số lần trễ → gợi ý khóa |
| `DB_PATH` | `server/library.db` | Vị trí file SQLite |
| `PORT` | `5555` | Cổng server |
| `SMTP_HOST/PORT/USER/PASS` | — | SMTP thật (không có → dev log) |
| `APP_URL` | `http://localhost:5173` | Base URL cho link QR |

## 6. Quy ước API

- REST dưới `/api/*`; body JSON.
- Thành công: `200`/`201`/`204`. Lỗi: `{ "message": "..." }` với `400/401/403/404/409`.
- Danh sách sách trả `{ items, total, page, limit }`.
