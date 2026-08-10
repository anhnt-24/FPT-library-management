// Data-access phiếu mượn — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';
import type { Loan } from '../types.js';

const COLS = ['userId', 'bookId', 'status', 'requestedAt', 'borrowedAt', 'dueDate', 'returnedAt', 'fineAmount'];

export function getAll(): Loan[] {
  return db.prepare('SELECT * FROM loans').all() as Loan[];
}

export function getById(id: number): Loan | undefined {
  return db.prepare('SELECT * FROM loans WHERE id = ?').get(id) as Loan | undefined;
}

export function getByUser(userId: number): Loan[] {
  return db.prepare('SELECT * FROM loans WHERE userId = ?').all(userId) as Loan[];
}

export function getByBook(bookId: number): Loan[] {
  return db.prepare('SELECT * FROM loans WHERE bookId = ?').all(bookId) as Loan[];
}

export function create(data: Partial<Loan>): Loan {
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
  return getById(Number(info.lastInsertRowid)) as Loan;
}

export function update(id: number, data: Partial<Loan>): Loan | null {
  const keys = Object.keys(data).filter((k) => COLS.includes(k));
  if (keys.length) {
    const params: Record<string, unknown> = { id };
    keys.forEach((k) => (params[k] = (data as Record<string, unknown>)[k]));
    const set = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE loans SET ${set} WHERE id = @id`).run(params);
  }
  return getById(id) || null;
}
