const BASE = '/api/books';

export async function fetchBooks() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Không tải được danh sách sách');
  return res.json();
}

export async function createBook(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thêm được sách');
  return res.json();
}

export async function updateBook(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không cập nhật được sách');
  return res.json();
}

export async function deleteBook(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Không xoá được sách');
}
