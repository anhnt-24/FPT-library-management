export default function BookList({ books, onEdit, onDelete }) {
  if (books.length === 0) {
    return <p className="empty">Chưa có sách nào. Thêm cuốn đầu tiên nhé!</p>;
  }

  return (
    <table className="book-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Tên sách</th>
          <th>Tác giả</th>
          <th>Thể loại</th>
          <th>Năm</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {books.map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.title}</td>
            <td>{b.author}</td>
            <td>{b.category || '-'}</td>
            <td>{b.year ?? '-'}</td>
            <td>
              <span className={b.available ? 'badge ok' : 'badge no'}>
                {b.available ? 'Còn sẵn' : 'Đã mượn'}
              </span>
            </td>
            <td className="row-actions">
              <button onClick={() => onEdit(b)}>Sửa</button>
              <button className="danger" onClick={() => onDelete(b.id)}>
                Xoá
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
