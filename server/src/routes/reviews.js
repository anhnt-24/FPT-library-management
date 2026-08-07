// Router phụ trợ cho trang chi tiết sách: đánh giá (review) + mã QR.
// Mount tại '/api' (booksRouter chỉ khớp path 1 segment nên không đụng nhau).
import { Router } from 'express';
import QRCode from 'qrcode';
import * as reviews from '../data/reviews.js';
import * as loans from '../data/loans.js';
import * as users from '../data/users.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/books/:bookId/reviews (công khai) — danh sách + điểm trung bình
router.get('/books/:bookId/reviews', (req, res) => {
  const bookId = Number(req.params.bookId);
  const items = reviews.getByBook(bookId).map((r) => {
    const u = users.getById(r.userId);
    return { ...r, userName: u ? u.name : '(ẩn)' };
  });
  res.json({ items, ...reviews.averageForBook(bookId) });
});

// POST /api/books/:bookId/reviews (member đã từng mượn & trả sách này)
router.post('/books/:bookId/reviews', auth, (req, res) => {
  const bookId = Number(req.params.bookId);
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: 'rating phải từ 1 đến 5' });
  const returned = loans.getByUser(req.user.id).some((l) => l.bookId === bookId && l.status === 'returned');
  if (!returned) return res.status(403).json({ message: 'Chỉ đánh giá sách bạn đã mượn và đã trả' });
  res.status(201).json(reviews.upsert(req.user.id, bookId, rating, req.body.comment || ''));
});

// DELETE /api/reviews/:id (chủ review hoặc admin)
router.delete('/reviews/:id', auth, (req, res) => {
  const rv = reviews.getById(Number(req.params.id));
  if (!rv) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
  if (req.user.role !== 'admin' && rv.userId !== req.user.id) {
    return res.status(403).json({ message: 'Không đủ quyền' });
  }
  reviews.remove(rv.id);
  res.status(204).end();
});

// GET /api/books/:bookId/qrcode — ảnh QR PNG dẫn tới trang chi tiết sách
router.get('/books/:bookId/qrcode', async (req, res) => {
  const url = `${process.env.APP_URL || 'http://localhost:5173'}/books/${Number(req.params.bookId)}`;
  const png = await QRCode.toBuffer(url, { width: 240, margin: 1 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});

export default router;
