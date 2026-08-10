// Data-access đánh giá sách — SQLite. 1 review / (user, book) nhờ UNIQUE.
import db from '../db.js';
import type { Review } from '../types.js';

export function getByBook(bookId: number): Review[] {
  return db.prepare('SELECT * FROM reviews WHERE bookId = ? ORDER BY createdAt DESC').all(bookId) as Review[];
}

export function getById(id: number): Review | undefined {
  return db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as Review | undefined;
}

export function getByUserAndBook(userId: number, bookId: number): Review | undefined {
  return db.prepare('SELECT * FROM reviews WHERE userId = ? AND bookId = ?').get(userId, bookId) as Review | undefined;
}

export function upsert(userId: number, bookId: number, rating: number, comment: string): Review {
  const existing = getByUserAndBook(userId, bookId);
  if (existing) {
    db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?').run(rating, comment, existing.id);
    return getById(existing.id) as Review;
  }
  const info = db
    .prepare('INSERT INTO reviews (userId,bookId,rating,comment,createdAt) VALUES (?,?,?,?,?)')
    .run(userId, bookId, rating, comment, new Date().toISOString());
  return getById(Number(info.lastInsertRowid)) as Review;
}

export function remove(id: number): boolean {
  return db.prepare('DELETE FROM reviews WHERE id = ?').run(id).changes > 0;
}

export function averageForBook(bookId: number): { average: number; count: number } {
  const r = db.prepare('SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE bookId = ?').get(bookId) as {
    avg: number | null;
    count: number;
  };
  return { average: r.avg ? Math.round(r.avg * 10) / 10 : 0, count: r.count };
}
