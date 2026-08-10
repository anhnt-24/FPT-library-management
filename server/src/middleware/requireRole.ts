// Chặn request nếu req.user.role không nằm trong danh sách vai trò cho phép.
// Dùng SAU middleware auth. Ví dụ: router.post('/', auth, requireRole('admin'), handler)
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Role } from '../types.js';

export default function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Không đủ quyền truy cập' });
      return;
    }
    next();
  };
}
