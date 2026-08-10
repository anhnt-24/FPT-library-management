// Data-access sách — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';
import type { Book } from '../types.js';

const COLS = ['title', 'author', 'publisher', 'category', 'year', 'isbn', 'description', 'totalCopies', 'availableCopies'];

export interface BookQuery {
  q?: string;
  category?: string;
  author?: string;
  publisher?: string;
  year?: string;
}

export function getAll(): Book[] {
  return db.prepare('SELECT * FROM books').all() as Book[];
}

export function getById(id: number): Book | undefined {
  return db.prepare('SELECT * FROM books WHERE id = ?').get(id) as Book | undefined;
}

// Lọc + tìm kiếm (dữ liệu nhỏ → lọc trong JS, giữ nguyên logic cũ).
export function search({ q, category, author, publisher, year }: BookQuery = {}): Book[] {
  let result = getAll();
  if (q) {
    const s = String(q).toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        String(b.isbn || '').toLowerCase().includes(s)
    );
  }
  if (category) result = result.filter((b) => b.category === category);
  if (author) result = result.filter((b) => b.author === author);
  if (publisher) result = result.filter((b) => b.publisher === publisher);
  if (year) result = result.filter((b) => String(b.year) === String(year));
  return result;
}

export function distinct() {
  const rows = getAll();
  const uniq = (key: keyof Book) => [...new Set(rows.map((b) => b[key]).filter((v) => v !== null && v !== ''))];
  return {
    categories: uniq('category'),
    authors: uniq('author'),
    publishers: uniq('publisher'),
    years: (uniq('year') as number[]).sort((a, b) => b - a),
  };
}

export function create(data: Partial<Book>): Book {
  const total = data.totalCopies ?? 1;
  const row = {
    title: data.title,
    author: data.author,
    publisher: data.publisher ?? '',
    category: data.category ?? '',
    year: data.year ?? null,
    isbn: data.isbn ?? '',
    description: data.description ?? '',
    totalCopies: total,
    availableCopies: data.availableCopies ?? total,
  };
  const info = db
    .prepare(
      `INSERT INTO books (title,author,publisher,category,year,isbn,description,totalCopies,availableCopies)
       VALUES (@title,@author,@publisher,@category,@year,@isbn,@description,@totalCopies,@availableCopies)`
    )
    .run(row);
  return getById(Number(info.lastInsertRowid)) as Book;
}

export function update(id: number, data: Partial<Book>): Book | null {
  const keys = Object.keys(data).filter((k) => COLS.includes(k));
  if (keys.length) {
    const params: Record<string, unknown> = { id };
    keys.forEach((k) => (params[k] = (data as Record<string, unknown>)[k]));
    const set = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE books SET ${set} WHERE id = @id`).run(params);
  }
  return getById(id) || null;
}

export function remove(id: number): boolean {
  return db.prepare('DELETE FROM books WHERE id = ?').run(id).changes > 0;
}
