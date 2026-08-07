// Data-access phiếu mượn — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';

const COLS = ['userId', 'bookId', 'status', 'requestedAt', 'borrowedAt', 'dueDate', 'returnedAt', 'fineAmount'];

export function getAll() {
  return db.prepare('SELECT * FROM loans').all();
}

export function getById(id) {
  return db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
}

export function getByUser(userId) {
  return db.prepare('SELECT * FROM loans WHERE userId = ?').all(userId);
}

export function getByBook(bookId) {
  return db.prepare('SELECT * FROM loans WHERE bookId = ?').all(bookId);
}

export function create(data) {
  const row = {
    userId: data.userId,
    bookId: data.bookId,
    status: data.status || 'pending',
    requestedAt: data.requestedAt || new Date().toISOString(),
    borrowedAt: data.borrowedAt ?? null,
    dueDate: data.dueDate ?? null,
    returnedAt: data.returnedAt ?? null,
    fineAmount: data.fineAmount ?? 0,
  };
  const info = db
    .prepare(
      `INSERT INTO loans (userId,bookId,status,requestedAt,borrowedAt,dueDate,returnedAt,fineAmount)
       VALUES (@userId,@bookId,@status,@requestedAt,@borrowedAt,@dueDate,@returnedAt,@fineAmount)`
    )
    .run(row);
  return getById(info.lastInsertRowid);
}

export function update(id, data) {
  const keys = Object.keys(data).filter((k) => COLS.includes(k));
  if (keys.length) {
    const params = { id };
    keys.forEach((k) => (params[k] = data[k]));
    const set = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE loans SET ${set} WHERE id = @id`).run(params);
  }
  return getById(id) || null;
}
