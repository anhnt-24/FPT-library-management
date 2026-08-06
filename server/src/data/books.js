// Mock "database" trong bộ nhớ (in-memory). Dữ liệu sẽ mất khi restart server.
let books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Lập trình', year: 2008, available: true },
  { id: 2, title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', category: 'Thiếu nhi', year: 1941, available: true },
  { id: 3, title: 'Nhà Giả Kim', author: 'Paulo Coelho', category: 'Tiểu thuyết', year: 1988, available: false },
];

let nextId = 4;

export function getAll() {
  return books;
}

export function getById(id) {
  return books.find((b) => b.id === id);
}

export function create(data) {
  const book = { id: nextId++, ...data };
  books.push(book);
  return book;
}

export function update(id, data) {
  const book = getById(id);
  if (!book) return null;
  // Không cho phép đổi id
  const { id: _ignore, ...rest } = data;
  Object.assign(book, rest);
  return book;
}

export function remove(id) {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return false;
  books.splice(index, 1);
  return true;
}
