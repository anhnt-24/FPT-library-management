// Data-access đánh giá sách — SQLite. 1 review / (user, book) nhờ UNIQUE.
import db from '../db.js';

export function getByBook(bookId) {
  return db.prepare('SELECT * FROM reviews WHERE bookId = ? ORDER BY createdAt DESC').all(bookId);
}

export function getById(id) {
  return db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
}

export function getByUserAndBook(userId, bookId) {
  return db.prepare('SELECT * FROM reviews WHERE userId = ? AND bookId = ?').get(userId, bookId);
}

export function upsert(userId, bookId, rating, comment) {
  const existing = getByUserAndBook(userId, bookId);
  if (existing) {
    db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?').run(rating, comment, existing.id);
    return getById(existing.id);
  }
  const info = db
    .prepare('INSERT INTO reviews (userId,bookId,rating,comment,createdAt) VALUES (?,?,?,?,?)')
    .run(userId, bookId, rating, comment, new Date().toISOString());
  return getById(info.lastInsertRowid);
}

export function remove(id) {
  return db.prepare('DELETE FROM reviews WHERE id = ?').run(id).changes > 0;
}

export function averageForBook(bookId) {
  const r = db.prepare('SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE bookId = ?').get(bookId);
  return { average: r.avg ? Math.round(r.avg * 10) / 10 : 0, count: r.count };
}
