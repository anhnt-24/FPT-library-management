import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const u = await login(email, password);
      nav(u.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="auth-card">
      <h2>Đăng nhập</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="btn-primary" type="submit">Đăng nhập</button>
      </form>
      <p className="muted">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      <p className="hint">Admin: admin@fpt.edu.vn / admin123 · Độc giả: reader1@fpt.edu.vn / member123</p>
    </div>
  );
}
