import { Router } from 'express';
import * as loans from '../data/loans.js';
import * as users from '../data/users.js';
import * as books from '../data/books.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();
router.use(auth, requireRole('admin'));

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// GET /api/reports/loans.csv?status=&from=&to= — xuất danh sách mượn/trả ra CSV
router.get('/loans.csv', (req, res) => {
  let rows = loans.getAll();
  const { status, from, to } = req.query;
  if (status) rows = rows.filter((l) => l.status === status);
  if (from) rows = rows.filter((l) => (l.borrowedAt || l.requestedAt || '') >= from);
  if (to) rows = rows.filter((l) => (l.borrowedAt || l.requestedAt || '') <= to);

  const header = ['id', 'Độc giả', 'Sách', 'Trạng thái', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Phạt (đ)'];
  const lines = [header.join(',')];
  rows.forEach((l) => {
    const u = users.getById(l.userId);
    const b = books.getById(l.bookId);
    lines.push(
      [l.id, u ? u.name : l.userId, b ? b.title : l.bookId, l.status, l.borrowedAt || '', l.dueDate || '', l.returnedAt || '', l.fineAmount]
        .map(csvEscape)
        .join(',')
    );
  });

  const csv = '﻿' + lines.join('\n'); // BOM để Excel mở đúng UTF-8
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="loans.csv"');
  res.send(csv);
});

export default router;
