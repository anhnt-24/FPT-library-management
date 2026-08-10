import { useEffect, useState } from 'react';
import * as loansApi from '../../api/loans';
import * as booksApi from '../../api/books';
import * as reportsApi from '../../api/reports';
import type { Loan, Book } from '../../types';

const STATUS: Record<string, string> = { pending: 'Chờ duyệt', borrowing: 'Đang mượn', returned: 'Đã trả', overdue: 'Quá hạn', rejected: 'Từ chối' };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Record<number, Book>>({});
  const [filter, setFilter] = useState('');
  const [err, setErr] = useState('');

  function load() {
    loansApi.all(filter ? { status: filter } : {}).then(async (ls) => {
      setLoans(ls);
      const map: Record<number, Book> = {};
      await Promise.all([...new Set(ls.map((l) => l.bookId))].map((id) => booksApi.get(id).then((b) => (map[id] = b)).catch(() => {})));
      setBooks(map);
    });
  }
  useEffect(load, [filter]);

  async function act(fn: (id: number) => Promise<unknown>, id: number) {
    setErr('');
    try { await fn(id); load(); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div>
      <div className="page-head">
        <h1>Quản lý mượn/trả</h1>
        <button onClick={() => reportsApi.downloadLoansCsv(filter ? { status: filter } : {})}>⬇ Export CSV</button>
      </div>
      <div className="chart-toolbar">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>Tất cả</button>
        {Object.entries(STATUS).map(([k, v]) => (
          <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>{v}</button>
        ))}
      </div>
      {err && <div className="error">{err}</div>}
      <table className="table">
        <thead><tr><th>Sách</th><th>Độc giả</th><th>Trạng thái</th><th>Hạn trả</th><th>Phạt</th><th>Thao tác</th></tr></thead>
        <tbody>
          {loans.map((l) => {
            const b = books[l.bookId];
            return (
              <tr key={l.id}>
                <td>{b ? b.title : '#' + l.bookId}</td>
                <td>#{l.userId}</td>
                <td><span className={'status s-' + l.status}>{STATUS[l.status]}</span></td>
                <td>{fmt(l.dueDate)}</td>
                <td>{l.fineAmount ? l.fineAmount.toLocaleString('vi-VN') + 'đ' : '—'}</td>
                <td>
                  {l.status === 'pending' && (
                    <>
                      <button onClick={() => act(loansApi.approve, l.id)}>Duyệt</button>{' '}
                      <button className="btn-danger" onClick={() => act(loansApi.reject, l.id)}>Từ chối</button>
                    </>
                  )}
                  {['borrowing', 'overdue'].includes(l.status) && (
                    <button onClick={() => act(loansApi.returnLoan, l.id)}>Xác nhận trả</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {loans.length === 0 && <p className="muted">Không có phiếu nào.</p>}
    </div>
  );
}
