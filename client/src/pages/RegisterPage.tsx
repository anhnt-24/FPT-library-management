import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await register(form);
      nav('/');
    } catch (e: any) {
      setErr(e.message);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-card">
      <h2>Đăng ký độc giả</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit}>
        <label>Họ tên<input value={form.name} onChange={set('name')} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Mật khẩu (tối thiểu 6 ký tự)<input type="password" value={form.password} onChange={set('password')} minLength={6} required /></label>
        <button className="btn-primary" type="submit">Đăng ký</button>
      </form>
      <p className="muted">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  );
}
