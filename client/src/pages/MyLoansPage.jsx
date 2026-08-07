import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as loansApi from '../api/loans.js';
import * as booksApi from '../api/books.js';
import * as recApi from '../api/recommendations.js';

const STATUS = { pending: 'Chờ duyệt', borrowing: 'Đang mượn', returned: 'Đã trả', overdue: 'Quá hạn', rejected: 'Từ chối' };
const fmt = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

export default function MyLoansPage() {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState({});
  const [rec, setRec] = useState([]);

  useEffect(() => {
    loansApi.mine().then(async (ls) => {
      setLoans(ls);
      const map = {};
      await Promise.all([...new Set(ls.map((l) => l.bookId))].map((id) => booksApi.get(id).then((b) => (map[id] = b)).catch(() => {})));
      setBooks(map);
    });
    recApi.list().then(setRec).catch(() => {});
  }, []);

  const dueSoon = (l) => l.status === 'borrowing' && l.dueDate && new Date(l.dueDate) - Date.now() < 2 * 86400000;

  return (
    <div>
      <h1>Phiếu mượn của tôi</h1>
      {loans.some((l) => l.status === 'overdue' || dueSoon(l)) && (
        <div className="error">⚠️ Bạn có sách sắp/đã đến hạn trả — vui lòng kiểm tra và trả đúng hạn.</div>
      )}
      {loans.length === 0 ? (
        <p className="muted">Bạn chưa có phiếu mượn nào.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Sách</th><th>Trạng thái</th><th>Ngày mượn</th><th>Hạn trả</th><th>Phạt</th></tr></thead>
          <tbody>
            {loans.map((l) => {
              const b = books[l.bookId];
              return (
                <tr key={l.id} className={l.status === 'overdue' ? 'row-danger' : dueSoon(l) ? 'row-warn' : ''}>
                  <td>{b ? b.title : '#' + l.bookId}</td>
                  <td><span className={'status s-' + l.status}>{STATUS[l.status]}</span></td>
                  <td>{fmt(l.borrowedAt)}</td>
                  <td>{fmt(l.dueDate)}</td>
                  <td>{l.fineAmount ? l.fineAmount.toLocaleString('vi-VN') + 'đ' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {rec.length > 0 && (
        <>
          <h2>Gợi ý cho bạn</h2>
          <div className="book-grid">
            {rec.map((b) => (
              <Link to={`/books/${b.id}`} key={b.id} className="book-card">
                <h3>{b.title}</h3>
                <p className="muted small">{b.author}</p>
                <span className="tag">{b.category}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
