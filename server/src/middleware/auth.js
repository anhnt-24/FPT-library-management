// Giải mã access token từ header Authorization: Bearer <token> → gắn req.user.
import jwt from 'jsonwebtoken';
import { ACCESS_SECRET } from '../config.js';

export default function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}
