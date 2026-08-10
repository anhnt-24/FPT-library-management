import { Router } from 'express';
import * as books from '../data/books.js';
import * as loans from '../data/loans.js';
import * as users from '../data/users.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();
router.use(auth, requireRole('admin')); // dashboard chỉ dành cho admin

// GET /api/dashboard/summary — các chỉ số tổng quan (KPI)
router.get('/summary', (req, res) => {
  const allBooks = books.getAll();
  const totalCopies = allBooks.reduce((s, b) => s + b.totalCopies, 0);
  const borrowing = allBooks.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0);
  const overdue = loans.getAll().filter((l) => l.status === 'overdue').length;
  const totalReaders = users.getAll().filter((u) => u.role === 'member').length;
  res.json({ totalTitles: allBooks.length, totalCopies, borrowing, overdue, totalReaders });
});

// GET /api/dashboard/most-borrowed?limit=5 — sách được mượn nhiều nhất
router.get('/most-borrowed', (req, res) => {
  const limit = Math.max(1, Number(req.query.limit) || 5);
  const count: Record<number, number> = {};
  loans
    .getAll()
    .filter((l) => l.status !== 'rejected')
    .forEach((l) => {
      count[l.bookId] = (count[l.bookId] || 0) + 1;
    });
  const result = Object.entries(count)
    .map(([bookId, c]) => ({
      bookId: Number(bookId),
      title: books.getById(Number(bookId))?.title || '(đã xóa)',
      count: c,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  res.json(result);
});

// GET /api/dashboard/borrow-stats?group=day|month|year — lượt mượn theo thời gian
router.get('/borrow-stats', (req, res) => {
  const group = String(req.query.group || 'month');
  if (!['day', 'month', 'year'].includes(group)) {
    return res.status(400).json({ message: 'group phải là day|month|year' });
  }
  const fmt = (iso: string): string => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (group === 'year') return `${y}`;
    if (group === 'month') return `${y}-${m}`;
    return `${y}-${m}-${day}`;
  };
  const count: Record<string, number> = {};
  loans
    .getAll()
    .filter((l) => l.borrowedAt)
    .forEach((l) => {
      const k = fmt(l.borrowedAt as string);
      count[k] = (count[k] || 0) + 1;
    });
  const result = Object.entries(count)
    .map(([period, c]) => ({ period, count: c }))
    .sort((a, b) => a.period.localeCompare(b.period));
  res.json(result);
});

// GET /api/dashboard/category-breakdown — cơ cấu đầu sách theo thể loại
router.get('/category-breakdown', (req, res) => {
  const count: Record<string, number> = {};
  books.getAll().forEach((b) => {
    const c = b.category || '(khác)';
    count[c] = (count[c] || 0) + 1;
  });
  res.json(Object.entries(count).map(([category, c]) => ({ category, count: c })));
});

export default router;
