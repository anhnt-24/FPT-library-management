# Kịch bản sử dụng — FPT Library Management

Tài liệu mô tả các kịch bản thao tác thực tế trên ứng dụng (dùng để demo, hướng dẫn sử dụng và kiểm thử tay). Mỗi kịch bản gồm **Vai trò · Tiền đề · Các bước · Kết quả mong đợi**.

## 0. Chuẩn bị

```bash
npm run install:all   # lần đầu
npm run dev           # server :5555 + client :5173
```

Mở trình duyệt: **http://localhost:5173**

**Tài khoản seed sẵn (SQLite):**

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Thủ thư (Admin) | `admin@fpt.edu.vn` | `admin123` |
| Độc giả | `reader1@fpt.edu.vn` | `member123` |
| Độc giả | `reader2@fpt.edu.vn` | `member123` |

Dữ liệu mẫu: 8 sách, 3 phiếu mượn (1 đã trả, 1 đang mượn, 1 chờ duyệt). Tham số nghiệp vụ: hạn mượn **14 ngày**, phạt **5.000đ/ngày** trễ, khóa tài khoản khi trễ **≥ 3 lần**, mỗi độc giả mượn tối đa **5 cuốn**.

---

## 1. Kịch bản Độc giả (Member)

### KB1.1 — Đăng ký & đăng nhập
- **Tiền đề:** chưa có tài khoản.
- **Các bước:** Navbar → **Đăng ký** → nhập họ tên, email, mật khẩu (≥ 6 ký tự) → **Đăng ký**.
- **Kết quả:** tự đăng nhập, quay về trang chủ; navbar hiện tên + "Phiếu của tôi". (Đã có tài khoản thì dùng **Đăng nhập**.)

### KB1.2 — Tìm & lọc sách
- **Các bước:** Ở trang chủ, gõ từ khóa (tên/tác giả/ISBN) vào ô tìm; chọn **Thể loại / Tác giả / NXB / Năm**.
- **Kết quả:** lưới sách lọc theo điều kiện cộng dồn; mỗi thẻ hiện badge **"Còn x/y"** hoặc **"Hết sách"**; có phân trang.

### KB1.3 — Xem chi tiết + QR
- **Các bước:** bấm vào một thẻ sách.
- **Kết quả:** trang chi tiết hiện thông tin, số bản còn, **mã QR** (quét mở đúng trang này), khu vực **đánh giá**.

### KB1.4 — Đặt mượn sách
- **Tiền đề:** đã đăng nhập bằng tài khoản độc giả, sách còn bản.
- **Các bước:** ở trang chi tiết → **Đặt mượn**.
- **Kết quả:** thông báo "Đã gửi yêu cầu mượn, chờ thủ thư duyệt"; tạo phiếu trạng thái **Chờ duyệt** (chưa trừ kho). Nếu đã có phiếu đang xử lý cho đúng sách đó → báo lỗi 409.

### KB1.5 — Theo dõi phiếu & cảnh báo đến hạn
- **Các bước:** navbar → **Phiếu của tôi**.
- **Kết quả:** bảng phiếu với trạng thái (Chờ duyệt / Đang mượn / Đã trả / Quá hạn), ngày mượn, hạn trả, phạt. Sách **sắp/đã đến hạn** hiện banner cảnh báo và dòng được tô màu.

### KB1.6 — Nhận gợi ý sách
- **Các bước:** ở **Phiếu của tôi**, kéo xuống mục "Gợi ý cho bạn".
- **Kết quả:** danh sách sách gợi ý theo thể loại/tác giả từng mượn (loại sách đã mượn, chỉ gợi sách còn bản).

### KB1.7 — Đánh giá sách đã mượn
- **Tiền đề:** đã **trả** ít nhất một lần cuốn sách đó.
- **Các bước:** vào trang chi tiết sách → chọn số sao + nhận xét → **Gửi**.
- **Kết quả:** đánh giá xuất hiện, điểm trung bình cập nhật. Gửi lại sẽ **ghi đè** (1 đánh giá/người/sách). Nếu chưa từng trả sách → báo lỗi "Chỉ đánh giá sách bạn đã mượn và đã trả".

---

## 2. Kịch bản Thủ thư (Admin)

### KB2.1 — Đăng nhập & Dashboard
- **Các bước:** đăng nhập `admin@fpt.edu.vn` / `admin123`.
- **Kết quả:** chuyển tới **Dashboard**: 5 chỉ số (đầu sách, tổng bản, đang mượn, quá hạn, độc giả) + 3 biểu đồ (lượt mượn theo ngày/tháng/năm, sách mượn nhiều nhất, cơ cấu thể loại).

### KB2.2 — Quản lý sách (CRUD + số lượng)
- **Các bước:** navbar → **Quản lý sách** → điền form **Thêm sách**; hoặc bấm **Sửa** ở một dòng (đổi cả số lượng), **Xóa**.
- **Kết quả:** danh sách cập nhật ngay. Khi giảm tổng số lượng xuống dưới số bản đang được mượn → báo lỗi 409.

### KB2.3 — Duyệt / từ chối yêu cầu mượn
- **Các bước:** navbar → **Mượn/Trả** → lọc **Chờ duyệt** → **Duyệt** (hoặc **Từ chối**).
- **Kết quả:** Duyệt → phiếu thành **Đang mượn**, đặt ngày mượn + hạn trả (14 ngày), **kho giảm 1**. Từ chối → **Từ chối**, kho không đổi.

### KB2.4 — Xác nhận trả + tính phạt
- **Các bước:** ở **Mượn/Trả**, phiếu Đang mượn/Quá hạn → **Xác nhận trả**.
- **Kết quả:** phiếu thành **Đã trả**, **kho +1**. Nếu trễ hạn → cột **Phạt** hiện số tiền (5.000đ/ngày) và tăng số lần trễ của độc giả.

### KB2.5 — Quản lý độc giả (lịch sử · khóa/mở)
- **Các bước:** navbar → **Độc giả** → **Lịch sử** để xem toàn bộ phiếu; **Khóa/Mở khóa** tài khoản.
- **Kết quả:** độc giả bị **Khóa** không đăng nhập/đặt mượn được. Độc giả trễ **≥ 3 lần** hiện cờ ⚠ gợi ý nên khóa.

### KB2.6 — Xuất báo cáo CSV
- **Các bước:** ở **Mượn/Trả** (có thể lọc theo trạng thái) → **⬇ Export CSV**.
- **Kết quả:** tải file `bao-cao-muon-tra.csv` (mở bằng Excel, UTF-8) gồm độc giả, sách, trạng thái, ngày mượn/hạn/trả, phạt.

---

## 3. Kịch bản end-to-end (demo 1 vòng mượn–trả)

1. **Độc giả** `reader1` đăng nhập → chọn "Design Patterns" → **Đặt mượn**.
2. **Admin** vào **Mượn/Trả** → thấy phiếu **Chờ duyệt** → **Duyệt** (kho giảm, hạn trả +14 ngày).
3. Độc giả xem **Phiếu của tôi** → thấy trạng thái **Đang mượn** + hạn trả.
4. **Admin** → **Xác nhận trả** → phiếu **Đã trả**, kho hồi lại.
5. Độc giả mở lại chi tiết sách → **đánh giá 5 sao**.
6. **Admin** mở **Dashboard** → số liệu "đang mượn / lượt mượn" cập nhật; **Export CSV** để lưu báo cáo.

---

## 4. Kịch bản ngoại lệ / kiểm thử nhanh

| Tình huống | Cách tái hiện | Kết quả mong đợi |
|---|---|---|
| **Sách hết bản** | Mượn hết số bản của 1 cuốn | Nút **Đặt mượn** bị vô hiệu, badge "Hết sách" |
| **Vượt giới hạn** | 1 độc giả có 5 phiếu đang xử lý rồi mượn cuốn thứ 6 | Báo lỗi "Đã đạt giới hạn 5 sách đang mượn" |
| **Trả trễ → phạt** | Trả một phiếu sau hạn | Cột Phạt = số ngày trễ × 5.000đ; số lần trễ của độc giả +1 |
| **Quá hạn → nhắc** | Scheduler chạy 08:00 hằng ngày quét phiếu quá `dueDate` | Phiếu chuyển **Quá hạn** + gửi email (dev: log console `📧 [DEV email]`) |
| **Khóa vi phạm** | Admin khóa độc giả trễ ≥ 3 lần | Độc giả không đăng nhập/đặt mượn được |
| **Phân quyền** | Độc giả mở `/admin/...` hoặc gọi API admin | Bị chuyển về trang chủ / trả 403 |

> Cấu hình email thật: đặt biến môi trường `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` cho server; không đặt thì chạy chế độ dev (ghi log, không gửi thật).
