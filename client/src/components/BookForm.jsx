import { useEffect, useState } from 'react';

const EMPTY = { title: '', author: '', category: '', year: '', available: true };

export default function BookForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  // Khi chọn "Sửa", đổ dữ liệu sách vào form
  useEffect(() => {
    setForm(editing ? { ...EMPTY, ...editing, year: editing.year ?? '' } : EMPTY);
  }, [editing]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      alert('Vui lòng nhập Tên sách và Tác giả');
      return;
    }
    onSubmit({ ...form, year: form.year ? Number(form.year) : null });
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h3>{editing ? `Sửa sách #${editing.id}` : 'Thêm sách mới'}</h3>
      <div className="fields">
        <input name="title" placeholder="Tên sách *" value={form.title} onChange={handleChange} />
        <input name="author" placeholder="Tác giả *" value={form.author} onChange={handleChange} />
        <input name="category" placeholder="Thể loại" value={form.category} onChange={handleChange} />
        <input name="year" type="number" placeholder="Năm XB" value={form.year} onChange={handleChange} />
        <label className="checkbox">
          <input name="available" type="checkbox" checked={form.available} onChange={handleChange} />
          Còn sẵn
        </label>
      </div>
      <div className="actions">
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm'}</button>
        {editing && (
          <button type="button" className="secondary" onClick={onCancel}>
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}
