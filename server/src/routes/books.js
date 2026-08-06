import { Router } from 'express';
import * as db from '../data/books.js';

const router = Router();

// GET /api/books - danh sách sách
router.get('/', (req, res) => {
  res.json(db.getAll());
});

// GET /api/books/:id - chi tiết 1 sách
router.get('/:id', (req, res) => {
  const book = db.getById(Number(req.params.id));
  if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
  res.json(book);
});

// POST /api/books - thêm sách
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'title và author là bắt buộc' });
  }
  const book = db.create({
    title,
    author,
    category: req.body.category ?? '',
    year: req.body.year ? Number(req.body.year) : null,
    available: req.body.available ?? true,
  });
  res.status(201).json(book);
});

// PUT /api/books/:id - sửa sách
router.put('/:id', (req, res) => {
  const book = db.update(Number(req.params.id), req.body);
  if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
  res.json(book);
});

// DELETE /api/books/:id - xoá sách
router.delete('/:id', (req, res) => {
  const ok = db.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ message: 'Không tìm thấy sách' });
  res.status(204).end();
});

export default router;
