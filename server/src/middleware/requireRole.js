// Chặn request nếu req.user.role không nằm trong danh sách vai trò cho phép.
// Dùng SAU middleware auth. Ví dụ: router.post('/', auth, requireRole('admin'), handler)
export default function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không đủ quyền truy cập' });
    }
    next();
  };
}
