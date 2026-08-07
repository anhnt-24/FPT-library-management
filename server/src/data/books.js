// Mock "database" trong bộ nhớ (in-memory). Dữ liệu sẽ mất khi restart server.
// Book: { id, title, author, publisher, category, year, isbn, description, totalCopies, availableCopies }
let books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', category: 'Lập trình', year: 2008, isbn: '9780132350884', description: 'Cẩm nang viết mã sạch.', totalCopies: 3, availableCopies: 3 },
  { id: 2, title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', publisher: 'Kim Đồng', category: 'Thiếu nhi', year: 1941, isbn: '8934974150001', description: 'Tác phẩm thiếu nhi kinh điển.', totalCopies: 5, availableCopies: 5 },
  { id: 3, title: 'Nhà Giả Kim', author: 'Paulo Coelho', publisher: 'Hội Nhà Văn', category: 'Tiểu thuyết', year: 1988, isbn: '9788478447494', description: 'Hành trình theo đuổi vận mệnh.', totalCopies: 2, availableCopies: 1 },
];

let nextId = 4;

export function getAll() {
  return books;
}

export function getById(id) {
  return books.find((b) => b.id === id);
}

// Lọc + tìm kiếm. Tìm kiếm (q) khớp một phần, không phân biệt hoa thường, trên title/author/isbn.
export function search({ q, category, author, publisher, year } = {}) {
  let result = books;
  if (q) {
    const s = String(q).toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        String(b.isbn || '').toLowerCase().includes(s)
    );
  }
  if (category) result = result.filter((b) => b.category === category);
  if (author) result = result.filter((b) => b.author === author);
  if (publisher) result = result.filter((b) => b.publisher === publisher);
  if (year) result = result.filter((b) => String(b.year) === String(year));
  return result;
}

// Giá trị distinct để đổ dropdown filter.
export function distinct() {
  const uniq = (key) => [...new Set(books.map((b) => b[key]).filter((v) => v !== null && v !== ''))];
  return {
    categories: uniq('category'),
    authors: uniq('author'),
    publishers: uniq('publisher'),
    years: uniq('year').sort((a, b) => b - a),
  };
}

export function create(data) {
  const book = { id: nextId++, ...data };
  books.push(book);
  return book;
}

export function update(id, data) {
  const book = getById(id);
  if (!book) return null;
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
