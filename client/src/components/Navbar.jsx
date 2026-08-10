import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">📚 Thư viện FPT</Link>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        {menuOpen ? '✕' : '☰'}
      </button>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Sách</Link>
        {user && !isAdmin && <Link to="/my-loans" onClick={() => setMenuOpen(false)}>Phiếu của tôi</Link>}
        {isAdmin && (
          <>
            <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/books" onClick={() => setMenuOpen(false)}>Quản lý sách</Link>
            <Link to="/admin/loans" onClick={() => setMenuOpen(false)}>Mượn/Trả</Link>
            <Link to="/admin/readers" onClick={() => setMenuOpen(false)}>Độc giả</Link>
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
