import { Router } from 'express';
import * as db from '../data/books.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

// GET /api/books (công khai) — lọc + tìm kiếm + phân trang → { items, total, page, limit }
router.get('/', (req, res) => {
  const { q, category, author, publisher, year } = req.query as Record<string, string | undefined>;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 12));
  const all = db.search({ q, category, author, publisher, year });
  const start = (page - 1) * limit;
  res.json({ items: all.slice(start, start + limit), total: all.length, page, limit });
});

// GET /api/books/meta/filters — danh sách distinct để đổ dropdown filter
router.get('/meta/filters', (req, res) => {
  res.json(db.distinct());
});

// GET /api/books/:id — chi tiết 1 sách
router.get('/:id', (req, res) => {
  const book = db.getById(Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
  res.json(book);
});

// POST /api/books (admin) — thêm sách
router.post('/', auth, requireRole('admin'), (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'title và author là bắt buộc' });
  }
  const total = Math.max(1, Number(req.body.totalCopies) || 1);
  const book = db.create({
    title,
    author,
    publisher: req.body.publisher ?? '',
    category: req.body.category ?? '',
    year: req.body.year ? Number(req.body.year) : null,
    isbn: req.body.isbn ?? '',
    description: req.body.description ?? '',
    totalCopies: total,
    availableCopies: total,
  });
  res.status(201).json(book);
});

// PUT /api/books/:id (admin) — sửa sách (gồm cập nhật số lượng)
router.put('/:id', auth, requireRole('admin'), (req, res) => {
  const book = db.getById(Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });

  const data = { ...req.body };
  // Cập nhật số lượng: không cho tổng nhỏ hơn số bản đang được mượn.
  if (data.totalCopies != null) {
    const borrowed = book.totalCopies - book.availableCopies;
    const total = Number(data.totalCopies);
    if (Number.isNaN(total) || total < borrowed) {
      return res.status(409).json({ message: `Số lượng không hợp lệ (đang có ${borrowed} bản được mượn)` });
    }
    data.totalCopies = total;
    data.availableCopies = total - borrowed;
  }
  delete data.id;
  res.json(db.update(book.id, data));
});

// DELETE /api/books/:id (admin) — xóa sách
router.delete('/:id', auth, requireRole('admin'), (req, res) => {
  const ok = db.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'Không tìm thấy sách' });
  res.status(204).end();
});

export default router;
