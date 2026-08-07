import { useEffect, useState } from 'react';
import * as booksApi from '../../api/books.js';

const EMPTY = { title: '', author: '', publisher: '', category: '', year: '', isbn: '', description: '', totalCopies: 1 };

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');

  function load() {
    booksApi.list({ limit: 100 }).then((d) => setBooks(d.items));
  }
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function edit(b) {
    setEditing(b.id);
    setForm({ ...EMPTY, ...b });
    window.scrollTo(0, 0);
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const payload = { ...form, year: form.year ? Number(form.year) : null, totalCopies: Number(form.totalCopies) };
      if (editing) await booksApi.update(editing, payload);
      else await booksApi.create(payload);
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (e) { setErr(e.message); }
  }

  async function del(id) {
    if (!confirm('Xóa sách này?')) return;
    setErr('');
    try { await booksApi.remove(id); load(); } catch (e) { setErr(e.message); }
  }

  return (
    <div>
      <h1>Quản lý sách</h1>
      {err && <div className="error">{err}</div>}
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Tên sách *" value={form.title} onChange={set('title')} required />
        <input placeholder="Tác giả *" value={form.author} onChange={set('author')} required />
        <input placeholder="NXB" value={form.publisher} onChange={set('publisher')} />
        <input placeholder="Thể loại" value={form.category} onChange={set('category')} />
        <input placeholder="Năm" value={form.year || ''} onChange={set('year')} />
        <input placeholder="ISBN" value={form.isbn} onChange={set('isbn')} />
        <input placeholder="Số lượng" type="number" min="1" value={form.totalCopies} onChange={set('totalCopies')} />
        <input placeholder="Mô tả" value={form.description} onChange={set('description')} />
        <button className="btn-primary" type="submit">{editing ? 'Cập nhật' : 'Thêm sách'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }}>Hủy</button>}
      </form>

      <table className="table">
        <thead><tr><th>Tên</th><th>Tác giả</th><th>Thể loại</th><th>Còn/Tổng</th><th></th></tr></thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td><td>{b.author}</td><td>{b.category}</td><td>{b.availableCopies}/{b.totalCopies}</td>
              <td>
                <button onClick={() => edit(b)}>Sửa</button>{' '}
                <button className="btn-danger" onClick={() => del(b.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
