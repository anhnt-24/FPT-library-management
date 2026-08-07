import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Bảo vệ route: chưa đăng nhập → /login; sai vai trò → về trang chủ.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted" style={{ padding: 20 }}>Đang tải...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
