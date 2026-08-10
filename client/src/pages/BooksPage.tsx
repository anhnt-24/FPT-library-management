import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as booksApi from '../api/books';
import type { Book, Paged, Filters } from '../types';

export default function BooksPage() {
  const [data, setData] = useState<Paged<Book>>({ items: [], total: 0, page: 1, limit: 12 });
  const [opts, setOpts] = useState<Filters>({ categories: [], authors: [], publishers: [], years: [] });
  const [q, setQ] = useState('');
  const [f, setF] = useState({ category: '', author: '', publisher: '', year: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    booksApi.filters().then(setOpts).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page, limit: 12 };
    if (q) params.q = q;
    Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
    booksApi
      .list(params)
      .then((d) => { setData(d); setErr(''); })
      .catch((e: any) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [page, q, f]);

  const pages = Math.ceil(data.total / data.limit) || 1;
  const onFilter = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => { setPage(1); setF({ ...f, [k]: e.target.value }); };

  return (
    <div>
      <h1>Danh sách sách</h1>
      <div className="filters">
        <input placeholder="Tìm theo tên, tác giả, ISBN..." value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select value={f.category} onChange={onFilter('category')}><option value="">Thể loại</option>{opts.categories.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={f.author} onChange={onFilter('author')}><option value="">Tác giả</option>{opts.authors.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={f.publisher} onChange={onFilter('publisher')}><option value="">NXB</option>{opts.publishers.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={f.year} onChange={onFilter('year')}><option value="">Năm</option>{opts.years.map((c) => <option key={c}>{c}</option>)}</select>
      </div>

      {err && <div className="error">{err}</div>}
      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : data.items.length === 0 ? (
        <p className="muted">Không có sách phù hợp.</p>
      ) : (
        <div className="book-grid">
          {data.items.map((b) => (
            <Link to={`/books/${b.id}`} key={b.id} className="book-card">
              <h3>{b.title}</h3>
              <p className="muted small">{b.author}</p>
              <div className="tags"><span className="tag">{b.category || '—'}</span><span className="tag">{b.year || '—'}</span></div>
              <span className={'badge ' + (b.availableCopies > 0 ? 'ok' : 'no')}>
                {b.availableCopies > 0 ? `Còn ${b.availableCopies}/${b.totalCopies}` : 'Hết sách'}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
        <span className="muted">Trang {data.page}/{pages} · {data.total} sách</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Sau ›</button>
      </div>
    </div>
  );
}
