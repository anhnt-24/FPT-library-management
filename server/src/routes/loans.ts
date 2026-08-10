import { Router } from 'express';
import * as loans from '../data/loans.js';
import * as books from '../data/books.js';
import * as users from '../data/users.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import { calcFine } from '../services/fine.js';
import { LOAN_DAYS, MAX_ACTIVE_LOANS } from '../config.js';
import type { LoanStatus } from '../types.js';

const router = Router();
const ACTIVE: LoanStatus[] = ['pending', 'borrowing', 'overdue'];

// POST /api/loans (member) — đặt mượn, tạo phiếu pending (chưa trừ kho)
router.post('/', auth, requireRole('member'), (req, res) => {
  const bookId = Number(req.body.bookId);
  const book = books.getById(bookId);
  if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });

  const me = users.getById(req.user!.id);
  if (me!.status === 'locked') return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
  if (book.availableCopies <= 0) return res.status(409).json({ message: 'Sách đã hết bản' });

  const myActive = loans.getByUser(req.user!.id).filter((l) => ACTIVE.includes(l.status));
  if (myActive.length >= MAX_ACTIVE_LOANS) {
    return res.status(409).json({ message: `Đã đạt giới hạn ${MAX_ACTIVE_LOANS} sách đang mượn` });
  }
  if (myActive.some((l) => l.bookId === bookId)) {
    return res.status(409).json({ message: 'Bạn đã có phiếu đang xử lý cho sách này' });
  }

  res.status(201).json(loans.create({ userId: req.user!.id, bookId, status: 'pending' }));
});

// GET /api/loans/me (member) — phiếu của chính mình
router.get('/me', auth, (req, res) => {
  let result = loans.getByUser(req.user!.id);
  if (req.query.status) result = result.filter((l) => l.status === req.query.status);
  res.json(result);
});

// GET /api/loans (admin) — tất cả, lọc theo status/userId/bookId
router.get('/', auth, requireRole('admin'), (req, res) => {
  let result = loans.getAll();
  const { status, userId, bookId } = req.query as Record<string, string | undefined>;
  if (status) result = result.filter((l) => l.status === status);
  if (userId) result = result.filter((l) => l.userId === Number(userId));
  if (bookId) result = result.filter((l) => l.bookId === Number(bookId));
  res.json(result);
});

// GET /api/loans/:id (admin hoặc chủ phiếu)
router.get('/:id', auth, (req, res) => {
  const loan = loans.getById(Number(req.params.id));
  if (!loan) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
  if (req.user!.role !== 'admin' && loan.userId !== req.user!.id) {
    return res.status(403).json({ message: 'Không đủ quyền' });
  }
  res.json(loan);
});

// PATCH /api/loans/:id/approve (admin) — pending → borrowing (trừ kho, đặt hạn trả)
router.patch('/:id/approve', auth, requireRole('admin'), (req, res) => {
  const loan = loans.getById(Number(req.params.id));
  if (!loan) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
  if (loan.status !== 'pending') return res.status(409).json({ message: 'Phiếu không ở trạng thái chờ duyệt' });

  const book = books.getById(loan.bookId);
  if (!book || book.availableCopies <= 0) return res.status(409).json({ message: 'Sách đã hết bản' });

  const borrowedAt = new Date();
  const dueDate = new Date(borrowedAt.getTime() + LOAN_DAYS * 86400000);
  books.update(book.id, { availableCopies: book.availableCopies - 1 });
  res.json(
    loans.update(loan.id, {
      status: 'borrowing',
      borrowedAt: borrowedAt.toISOString(),
      dueDate: dueDate.toISOString(),
    })
  );
});

// PATCH /api/loans/:id/reject (admin) — pending → rejected
router.patch('/:id/reject', auth, requireRole('admin'), (req, res) => {
  const loan = loans.getById(Number(req.params.id));
  if (!loan) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
  if (loan.status !== 'pending') return res.status(409).json({ message: 'Chỉ từ chối được phiếu chờ duyệt' });
  res.json(loans.update(loan.id, { status: 'rejected' }));
});

// PATCH /api/loans/:id/return (admin) — borrowing|overdue → returned (hoàn kho, tính phạt)
router.patch('/:id/return', auth, requireRole('admin'), (req, res) => {
  const loan = loans.getById(Number(req.params.id));
  if (!loan) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
  if (!['borrowing', 'overdue'].includes(loan.status)) {
    return res.status(409).json({ message: 'Phiếu không ở trạng thái đang mượn' });
  }

  const returnedAt = new Date();
  const fine = calcFine(loan.dueDate, returnedAt);
  const book = books.getById(loan.bookId);
  if (book) books.update(book.id, { availableCopies: book.availableCopies + 1 });
  if (fine > 0) {
    const u = users.getById(loan.userId);
    if (u) users.update(u.id, { lateReturnCount: (u.lateReturnCount || 0) + 1 });
  }
  res.json(loans.update(loan.id, { status: 'returned', returnedAt: returnedAt.toISOString(), fineAmount: fine }));
});

export default router;
