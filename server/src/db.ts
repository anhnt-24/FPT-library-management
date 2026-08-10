// Kết nối SQLite (better-sqlite3 — đồng bộ). Tạo schema + seed dữ liệu mẫu nếu DB rỗng.
// File DB mặc định: server/library.db (đổi qua biến môi trường DB_PATH).
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'library.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    lateReturnCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT DEFAULT '',
    category TEXT DEFAULT '',
    year INTEGER,
    isbn TEXT DEFAULT '',
    description TEXT DEFAULT '',
    totalCopies INTEGER NOT NULL DEFAULT 1,
    availableCopies INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    bookId INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requestedAt TEXT,
    borrowedAt TEXT,
    dueDate TEXT,
    returnedAt TEXT,
    fineAmount INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    expiresAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    bookId INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    UNIQUE(userId, bookId)
  );
`);

seedIfEmpty();

function seedIfEmpty(): void {
  const row = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number };
  if (row.c > 0) return;

  const now = new Date().toISOString();
  const insUser = db.prepare(
    `INSERT INTO users (name,email,passwordHash,role,status,lateReturnCount,createdAt)
     VALUES (@name,@email,@passwordHash,@role,@status,0,@createdAt)`
  );
  const admin = insUser.run({ name: 'Thủ thư', email: 'admin@fpt.edu.vn', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin', status: 'active', createdAt: now });
  const r1 = insUser.run({ name: 'Nguyễn Văn A', email: 'reader1@fpt.edu.vn', passwordHash: bcrypt.hashSync('member123', 10), role: 'member', status: 'active', createdAt: now });
  const r2 = insUser.run({ name: 'Trần Thị B', email: 'reader2@fpt.edu.vn', passwordHash: bcrypt.hashSync('member123', 10), role: 'member', status: 'active', createdAt: now });

  const insBook = db.prepare(
    `INSERT INTO books (title,author,publisher,category,year,isbn,description,totalCopies,availableCopies)
     VALUES (@title,@author,@publisher,@category,@year,@isbn,@description,@totalCopies,@availableCopies)`
  );
  const books = [
    { title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', category: 'Lập trình', year: 2008, isbn: '9780132350884', description: 'Cẩm nang viết mã sạch.', totalCopies: 3, availableCopies: 3 },
    { title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', publisher: 'Kim Đồng', category: 'Thiếu nhi', year: 1941, isbn: '8934974150001', description: 'Tác phẩm thiếu nhi kinh điển.', totalCopies: 5, availableCopies: 4 },
    { title: 'Nhà Giả Kim', author: 'Paulo Coelho', publisher: 'Hội Nhà Văn', category: 'Tiểu thuyết', year: 1988, isbn: '9788478447494', description: 'Hành trình theo đuổi vận mệnh.', totalCopies: 2, availableCopies: 2 },
    { title: 'Refactoring', author: 'Martin Fowler', publisher: 'Addison-Wesley', category: 'Lập trình', year: 1999, isbn: '9780201485677', description: 'Cải thiện thiết kế mã nguồn.', totalCopies: 4, availableCopies: 4 },
    { title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', publisher: 'Tổng hợp TP.HCM', category: 'Kỹ năng', year: 1936, isbn: '9786045871189', description: 'Nghệ thuật đối nhân xử thế.', totalCopies: 6, availableCopies: 6 },
    { title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari', publisher: 'Thế Giới', category: 'Lịch sử', year: 2011, isbn: '9786045877654', description: 'Lịch sử tiến hóa loài người.', totalCopies: 3, availableCopies: 3 },
    { title: 'Doraemon Tập 1', author: 'Fujiko F. Fujio', publisher: 'Kim Đồng', category: 'Thiếu nhi', year: 1969, isbn: '9784091401755', description: 'Truyện tranh thiếu nhi kinh điển.', totalCopies: 8, availableCopies: 8 },
    { title: 'Design Patterns', author: 'Erich Gamma', publisher: 'Addison-Wesley', category: 'Lập trình', year: 1994, isbn: '9780201633610', description: 'Các mẫu thiết kế hướng đối tượng.', totalCopies: 2, availableCopies: 2 },
  ];
  books.forEach((b) => insBook.run(b));

  const insLoan = db.prepare(
    `INSERT INTO loans (userId,bookId,status,requestedAt,borrowedAt,dueDate,returnedAt,fineAmount)
     VALUES (@userId,@bookId,@status,@requestedAt,@borrowedAt,@dueDate,@returnedAt,@fineAmount)`
  );
  insLoan.run({ userId: r2.lastInsertRowid, bookId: 1, status: 'returned', requestedAt: '2026-07-18T08:00:00.000Z', borrowedAt: '2026-07-20T09:00:00.000Z', dueDate: '2026-08-03T09:00:00.000Z', returnedAt: '2026-08-01T10:00:00.000Z', fineAmount: 0 });
  insLoan.run({ userId: r1.lastInsertRowid, bookId: 2, status: 'borrowing', requestedAt: '2026-07-31T08:00:00.000Z', borrowedAt: '2026-08-01T09:00:00.000Z', dueDate: '2026-08-15T09:00:00.000Z', returnedAt: null, fineAmount: 0 });
  insLoan.run({ userId: r1.lastInsertRowid, bookId: 3, status: 'pending', requestedAt: '2026-08-06T08:00:00.000Z', borrowedAt: null, dueDate: null, returnedAt: null, fineAmount: 0 });

  console.log(`🌱 Seed SQLite: 3 users, ${books.length} books, 3 loans (admin id=${admin.lastInsertRowid})`);
}

export default db;
