import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as booksApi from '../api/books.js';
import * as loansApi from '../api/loans.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function BookDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [book, setBook] = useState(null);
  const [rev, setRev] = useState({ items: [], average: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  function load() {
    booksApi.get(id).then(setBook).catch((e) => setErr(e.message));
    booksApi.reviews(id).then(setRev).catch(() => {});
  }
  useEffect(load, [id]);

  async function borrow() {
    setErr(''); setMsg('');
    try {
      await loansApi.create(Number(id));
      setMsg('Đã gửi yêu cầu mượn, chờ thủ thư duyệt.');
    } catch (e) { setErr(e.message); }
  }

  async function submitReview(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await booksApi.addReview(id, { rating: Number(rating), comment });
      setComment('');
      setMsg('Đã gửi đánh giá.');
      load();
    } catch (e) { setErr(e.message); }
  }

  if (!book) return <p className="muted">Đang tải...</p>;

  return (
    <div className="detail">
      <div className="detail-main">
        <h1>{book.title}</h1>
        <p className="muted">{book.author} · {book.publisher || '—'} · {book.year || '—'}</p>
        <p>{book.description}</p>
        <p><b>ISBN:</b> {book.isbn || '—'} &nbsp;·&nbsp; <b>Thể loại:</b> {book.category || '—'}</p>
        <p>
          <span className={'badge ' + (book.availableCopies > 0 ? 'ok' : 'no')}>
            {book.availableCopies > 0 ? `Còn ${book.availableCopies}/${book.totalCopies} bản` : 'Hết sách'}
          </span>
        </p>
        {msg && <div className="success">{msg}</div>}
        {err && <div className="error">{err}</div>}
        {user && !isAdmin && (
          <button className="btn-primary" disabled={book.availableCopies <= 0} onClick={borrow}>Đặt mượn</button>
        )}
        {!user && <p className="muted">Đăng nhập để đặt mượn sách.</p>}
      </div>

      <div className="detail-side">
        <img className="qr" src={booksApi.qrUrl(book.id)} alt="QR tra cứu sách" width="160" height="160" />
        <p className="muted small">Quét QR để mở trang này</p>
      </div>

      <div className="reviews">
        <h2>Đánh giá {rev.count > 0 && <span className="stars">★ {rev.average} ({rev.count})</span>}</h2>
        {user && !isAdmin && (
          <form className="review-form" onSubmit={submitReview}>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
            </select>
            <input placeholder="Nhận xét của bạn..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary" type="submit">Gửi</button>
          </form>
        )}
        {rev.items.length === 0 ? (
          <p className="muted">Chưa có đánh giá.</p>
        ) : (
          rev.items.map((r) => (
            <div className="review" key={r.id}>
              <b>{r.userName}</b> <span className="stars">{'★'.repeat(r.rating)}</span>
              <p>{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
