# 01. Authentication — Spec

> Nền tảng chung: [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)

## 1. Mục tiêu
Đăng ký / đăng nhập / đăng xuất; phân 2 vai trò **Admin (thủ thư)** và **Member (độc giả)**; bảo vệ route theo vai trò ở cả server và client.

## 2. User stories
- Là **khách**, tôi đăng ký tài khoản độc giả bằng email + mật khẩu để mượn sách.
- Là **người dùng**, tôi đăng nhập để nhận phiên làm việc và truy cập tính năng theo quyền.
- Là **người dùng**, tôi đăng xuất để thu hồi phiên trên thiết bị hiện tại.
- Là **Admin**, tôi truy cập được khu quản trị; **Member** thì không.

## 3. Luồng nghiệp vụ
- **Đăng ký**: nhập `name, email, password` → kiểm tra email chưa tồn tại → hash mật khẩu (bcrypt) → tạo User `role='member', status='active'` → trả token + user.
- **Đăng nhập**: kiểm tra email tồn tại + mật khẩu đúng + `status='active'` → phát access + refresh token.
- **Refresh**: nhận refresh token hợp lệ (còn trong store, chưa hết hạn) → phát access mới.
- **Đăng xuất**: xoá refresh token khỏi store.
- **Tài khoản Admin**: seed sẵn 1 admin (`admin@fpt.edu.vn`), không cho đăng ký role admin qua API công khai.

## 4. Data model liên quan
`User` và `RefreshToken` (xem [00 §3](00-tong-quan-kien-truc.md#3-data-model-dùng-chung-object-in-memory)). Mật khẩu chỉ lưu `passwordHash`, không lưu plaintext.

## 5. API endpoints
| Method | Route | Body / quyền | Kết quả |
|---|---|---|---|
| POST | `/api/auth/register` | `{name,email,password}` | `201 {accessToken,refreshToken,user}` |
| POST | `/api/auth/login` | `{email,password}` | `200 {accessToken,refreshToken,user}` |
| POST | `/api/auth/refresh` | `{refreshToken}` | `200 {accessToken}` |
| POST | `/api/auth/logout` | `{refreshToken}` | `204` |
| GET | `/api/auth/me` | Bearer | `200 {user}` |

## 6. Phân quyền
- **Server**: middleware `auth` (giải mã access → `req.user`), `requireRole('admin')` cho route quản trị.
- **Client**: `AuthContext` giữ `user`; `ProtectedRoute` chuyển hướng về `/login` nếu chưa đăng nhập, về `/` (403) nếu sai vai trò. Menu ẩn/hiện theo `role`.

## 7. Edge case & lỗi
- Email đã tồn tại → `409`.
- Sai email/mật khẩu → `401` (thông báo chung, không tiết lộ field nào sai).
- Đăng nhập khi `status='locked'` → `403 "Tài khoản đã bị khóa"`.
- Access token hết hạn → `401` → client tự gọi refresh; refresh cũng hỏng → buộc đăng nhập lại.
- Mật khẩu tối thiểu 6 ký tự; email đúng định dạng → nếu không `400`.

## 8. Tiêu chí chấp nhận
- [ ] Đăng ký tạo được member và đăng nhập được ngay.
- [ ] Mật khẩu không bao giờ trả về client / không lưu plaintext.
- [ ] Member gọi route admin → `403`; khách gọi route cần đăng nhập → `401`.
- [ ] Access hết hạn refresh được token mới; logout xong refresh cũ bị từ chối.
- [ ] Tài khoản `locked` không đăng nhập được.
