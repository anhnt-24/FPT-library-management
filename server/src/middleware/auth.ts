// Giải mã access token từ header Authorization: Bearer <token> → gắn req.user.
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_SECRET } from '../config.js';
import type { Role } from '../types.js';

export default function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: 'Chưa đăng nhập' });
    return;
  }
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as unknown as { sub: number; role: Role };
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}
