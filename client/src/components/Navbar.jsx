import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const nav = useNavigate();
  return (
    <nav className="navbar">
      <Link to="/" className="brand">📚 Thư viện FPT</Link>
      <div className="nav-links">
        <Link to="/">Sách</Link>
        {user && !isAdmin && <Link to="/my-loans">Phiếu của tôi</Link>}
        {isAdmin && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/books">Quản lý sách</Link>
            <Link to="/admin/loans">Mượn/Trả</Link>
            <Link to="/admin/readers">Độc giả</Link>
          </>
        )}
      </div>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="muted">{user.name}{isAdmin ? ' · Admin' : ''}</span>
            <button onClick={() => { logout(); nav('/'); }}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register" className="btn-link-primary">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}
