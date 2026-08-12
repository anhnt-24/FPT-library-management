// Tiện ích quản trị. Hiện có: gửi 1 email "quá hạn" mẫu để kiểm tra cấu hình SMTP.
import { Router } from 'express';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import { sendOverdue } from '../services/email.js';
import { calcFine } from '../services/fine.js';
import type { User, Book, Loan } from '../types.js';

const router = Router();
router.use(auth, requireRole('admin'));

// POST /api/admin/test-email  { to?: string }
// Gửi email quá hạn mẫu tới `to` (mặc định = SMTP_USER). Dùng để test SMTP.
router.post('/test-email', async (req, res) => {
  const to = req.body.to || process.env.SMTP_USER;
  if (!to) {
    return res.status(400).json({ message: 'Chưa có email nhận. Đặt SMTP_USER trong .env hoặc nhập địa chỉ.' });
  }
  const now = new Date();
  const dueDate = new Date(now.getTime() - 3 * 86400000).toISOString(); // giả lập quá hạn 3 ngày
  const user = { name: 'Người nhận thử', email: to } as User;
  const book = { title: 'Sách mẫu (email test)' } as Book;
  const loan = { dueDate } as Loan;
  try {
    await sendOverdue(user, book, loan, 3, calcFine(dueDate, now));
    res.json({ ok: true, to, mode: process.env.SMTP_HOST ? 'SMTP' : 'dev' });
  } catch (e) {
    res.status(500).json({ ok: false, message: (e as Error).message });
  }
});

export default router;
