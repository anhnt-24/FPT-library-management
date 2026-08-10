import { Router } from 'express';
import * as users from '../data/users.js';
import * as loans from '../data/loans.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import { LATE_LOCK_THRESHOLD } from '../config.js';
import type { User } from '../types.js';

const router = Router();
router.use(auth, requireRole('admin')); // toàn bộ route quản lý độc giả chỉ dành cho admin

function summary(u: User) {
  const mine = loans.getByUser(u.id);
  return {
    ...users.toPublic(u),
    borrowingCount: mine.filter((l) => l.status === 'borrowing').length,
    overdueCount: mine.filter((l) => l.status === 'overdue').length,
    shouldLock: (u.lateReturnCount || 0) >= LATE_LOCK_THRESHOLD, // cờ gợi ý khóa
  };
}

// GET /api/readers — danh sách độc giả (role=member) + chỉ số
router.get('/', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  let members = users.getAll().filter((u) => u.role === 'member');
  if (q) {
    members = members.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  res.json(members.map(summary));
});

// GET /api/readers/:id — hồ sơ độc giả
router.get('/:id', (req, res) => {
  const u = users.getById(Number(req.params.id));
  if (!u || u.role !== 'member') return res.status(404).json({ message: 'Không tìm thấy độc giả' });
  res.json(summary(u));
});

// GET /api/readers/:id/loans — lịch sử mượn/trả
router.get('/:id/loans', (req, res) => {
  const u = users.getById(Number(req.params.id));
  if (!u || u.role !== 'member') return res.status(404).json({ message: 'Không tìm thấy độc giả' });
  let mine = loans.getByUser(u.id);
  if (req.query.status) mine = mine.filter((l) => l.status === req.query.status);
  res.json(mine);
});

// PATCH /api/readers/:id/lock — khóa tài khoản độc giả
router.patch('/:id/lock', (req, res) => {
  const u = users.getById(Number(req.params.id));
  if (!u || u.role !== 'member') return res.status(404).json({ message: 'Không tìm thấy độc giả' });
  res.json(users.toPublic(users.update(u.id, { status: 'locked' })!));
});

// PATCH /api/readers/:id/unlock — mở khóa
router.patch('/:id/unlock', (req, res) => {
  const u = users.getById(Number(req.params.id));
  if (!u || u.role !== 'member') return res.status(404).json({ message: 'Không tìm thấy độc giả' });
  res.json(users.toPublic(users.update(u.id, { status: 'active' })!));
});

export default router;
