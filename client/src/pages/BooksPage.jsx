import { useEffect, useState } from 'react';
import * as api from '../api/books.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setBooks(await api.fetchBooks());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(data) {
    try {
      if (editing) {
        await api.updateBook(editing.id, data);
      } else {
        await api.createBook(data);
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá cuốn sách này?')) return;
    try {
      await api.deleteBook(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>📚 FPT Library Management</h1>
        <p>Quản lý sách thư viện — React (Vite) + Express, dữ liệu mock in-memory</p>
      </header>

      {error && <div className="error">⚠️ {error}</div>}

      <BookForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />

      {loading ? (
        <p className="empty">Đang tải...</p>
      ) : (
        <BookList books={books} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}
