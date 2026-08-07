import { useEffect, useState } from 'react';
import * as readersApi from '../../api/readers.js';

const STATUS = { pending: 'Chờ duyệt', borrowing: 'Đang mượn', returned: 'Đã trả', overdue: 'Quá hạn', rejected: 'Từ chối' };
const fmt = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [err, setErr] = useState('');

  function load() {
    readersApi.list().then(setReaders);
  }
  useEffect(load, []);

  async function open(r) {
    setDetail(r);
    setHistory(await readersApi.loans(r.id));
  }

  async function toggle(r) {
    setErr('');
    try {
      if (r.status === 'locked') await readersApi.unlock(r.id);
      else await readersApi.lock(r.id);
      load();
      if (detail && detail.id === r.id) setDetail({ ...r, status: r.status === 'locked' ? 'active' : 'locked' });
    } catch (e) { setErr(e.message); }
  }

  return (
    <div>
      <h1>Quản lý độc giả</h1>
      {err && <div className="error">{err}</div>}
      <table className="table">
        <thead><tr><th>Tên</th><th>Email</th><th>Đang mượn</th><th>Quá hạn</th><th>Số lần trễ</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
          {readers.map((r) => (
            <tr key={r.id} className={r.shouldLock ? 'row-warn' : ''}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.borrowingCount}</td>
              <td>{r.overdueCount}</td>
              <td>{r.lateReturnCount}{r.shouldLock && ' ⚠'}</td>
              <td><span className={'status s-' + (r.status === 'locked' ? 'overdue' : 'returned')}>{r.status === 'locked' ? 'Khóa' : 'Hoạt động'}</span></td>
              <td>
                <button onClick={() => open(r)}>Lịch sử</button>{' '}
                <button className={r.status === 'locked' ? '' : 'btn-danger'} onClick={() => toggle(r)}>
                  {r.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {readers.length === 0 && <p className="muted">Chưa có độc giả nào.</p>}

      {detail && (
        <div className="panel">
          <div className="page-head"><h3>Lịch sử mượn/trả — {detail.name}</h3><button onClick={() => setDetail(null)}>Đóng</button></div>
          {history.length === 0 ? (
            <p className="muted">Chưa có phiếu nào.</p>
          ) : (
            <table className="table">
              <thead><tr><th>#</th><th>Sách</th><th>Trạng thái</th><th>Hạn trả</th><th>Phạt</th></tr></thead>
              <tbody>
                {history.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td><td>#{l.bookId}</td>
                    <td><span className={'status s-' + l.status}>{STATUS[l.status]}</span></td>
                    <td>{fmt(l.dueDate)}</td>
                    <td>{l.fineAmount ? l.fineAmount.toLocaleString('vi-VN') + 'đ' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
