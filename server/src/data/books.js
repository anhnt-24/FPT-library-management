// Data-access sách — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';

const COLS = ['title', 'author', 'publisher', 'category', 'year', 'isbn', 'description', 'totalCopies', 'availableCopies'];

export function getAll() {
  return db.prepare('SELECT * FROM books').all();
}

export function getById(id) {
  return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
}

// Lọc + tìm kiếm (dữ liệu nhỏ → lọc trong JS, giữ nguyên logic cũ).
export function search({ q, category, author, publisher, year } = {}) {
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
  const uniq = (key) => [...new Set(rows.map((b) => b[key]).filter((v) => v !== null && v !== ''))];
  return {
    categories: uniq('category'),
    authors: uniq('author'),
    publishers: uniq('publisher'),
    years: uniq('year').sort((a, b) => b - a),
  };
}

export function create(data) {
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
  return getById(info.lastInsertRowid);
}

export function update(id, data) {
  const keys = Object.keys(data).filter((k) => COLS.includes(k));
  if (keys.length) {
    const params = { id };
    keys.forEach((k) => (params[k] = data[k]));
    const set = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE books SET ${set} WHERE id = @id`).run(params);
  }
  return getById(id) || null;
}

export function remove(id) {
  return db.prepare('DELETE FROM books WHERE id = ?').run(id).changes > 0;
}
