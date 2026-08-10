import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as users from '../data/users.js';
import * as refreshStore from '../data/refreshTokens.js';
import auth from '../middleware/auth.js';
import { ACCESS_SECRET, ACCESS_TTL, REFRESH_TTL_DAYS } from '../config.js';
import type { User } from '../types.js';

const router = Router();

function issueTokens(user: User) {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL as any });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000).toISOString();
  refreshStore.add(refreshToken, user.id, expiresAt);
  return { accessToken, refreshToken };
}

// POST /api/auth/register — đăng ký độc giả (role='member')
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email và password là bắt buộc' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });
  }
  if (users.getByEmail(email)) {
    return res.status(409).json({ message: 'Email đã tồn tại' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = users.create({ name, email, passwordHash, role: 'member' });
  res.status(201).json({ ...issueTokens(user), user: users.toPublic(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.getByEmail(email);
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
  if (user.status === 'locked') {
    return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
  }
  res.json({ ...issueTokens(user), user: users.toPublic(user) });
});

// POST /api/auth/refresh — cấp access token mới từ refresh token còn hiệu lực
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const rec = refreshToken ? refreshStore.get(refreshToken) : null;
  if (!rec) return res.status(401).json({ message: 'Refresh token không hợp lệ' });
  const user = users.getById(rec.userId);
  if (!user || user.status === 'locked') {
    return res.status(401).json({ message: 'Không thể làm mới phiên' });
  }
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL as any });
  res.json({ accessToken });
});

// POST /api/auth/logout — thu hồi refresh token
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshStore.remove(refreshToken);
  res.status(204).end();
});

// GET /api/auth/me — thông tin người dùng hiện tại
router.get('/me', auth, (req, res) => {
  const user = users.getById(req.user!.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  res.json({ user: users.toPublic(user) });
});

export default router;
