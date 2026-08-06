# FPT Library Management

Ứng dụng quản lý sách thư viện — **React (Vite)** ở frontend, **Express** ở backend, dữ liệu **mock in-memory** (lưu trong RAM, mất khi restart server).

## Cấu trúc

```
FPT-library-management/
├── package.json   # orchestrator — chạy cả 2 bằng 1 lệnh (concurrently)
├── client/        # React + Vite (port 5173)
└── server/        # Express API   (port 5555)
```

> `client/` và `server/` là **2 package npm độc lập** (không phải workspace). `package.json` ở gốc chỉ là lớp tiện lợi để chạy song song, không quản lý dependency của 2 bên.

## Cách chạy nhanh — 1 lệnh (khuyến nghị)

Cài toàn bộ dependency (chạy 1 lần đầu, gồm cả root + client + server):
```bash
npm run install:all
```

Chạy cả backend + frontend song song:
```bash
npm run dev
# server → http://localhost:5555
# client → http://localhost:5173
```

Log 2 tiến trình hiện chung một cửa sổ, gắn nhãn màu `server` / `client`. Nhấn **Ctrl+C** tắt cả hai cùng lúc.

| Lệnh (chạy ở gốc)   | Tác dụng                                                        |
|---------------------|----------------------------------------------------------------|
| `npm run dev`       | Chạy dev cả 2 (server `--watch` + client Vite HMR)             |
| `npm start`         | Chạy bản production: server thường + client `vite preview`      |
| `npm run build`     | Build frontend (`client`) ra thư mục `dist/`                    |
| `npm run install:all` | Cài dependency cho root, `server`, `client`                  |

## Cách chạy thủ công — 2 terminal

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
# → http://localhost:5555
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

Mở trình duyệt tại **http://localhost:5173**. Vite tự proxy `/api` sang backend nên không dính lỗi CORS lúc dev.

## API (REST)

| Method | Route             | Chức năng        |
|--------|-------------------|------------------|
| GET    | `/api/books`      | Danh sách sách   |
| GET    | `/api/books/:id`  | Chi tiết 1 sách  |
| POST   | `/api/books`      | Thêm sách        |
| PUT    | `/api/books/:id`  | Sửa sách         |
| DELETE | `/api/books/:id`  | Xoá sách         |

Model `Book`: `{ id, title, author, category, year, available }`

## Gợi ý mở rộng

- Thêm entity **Member** (độc giả) và chức năng **mượn/trả sách**
- Thay mock data bằng database thật (MongoDB / MySQL)
- Thêm tìm kiếm, lọc, phân trang
- Thêm React Router cho nhiều trang
