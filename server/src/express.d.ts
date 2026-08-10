// Mở rộng Express Request để chứa req.user (gắn bởi middleware auth).
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: 'admin' | 'member' };
    }
  }
}
