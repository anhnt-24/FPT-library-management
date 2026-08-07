import * as books from '../data/books.js';
import * as loans from '../data/loans.js';

// Gợi ý content-based: ưu tiên sách cùng thể loại/tác giả member từng mượn,
// loại sách đã mượn, chỉ gợi sách còn bản. Member mới → fallback theo số bản/độ phổ biến.
export function recommendFor(userId, limit = 6) {
  const myLoans = loans.getByUser(userId).filter((l) => l.status !== 'rejected');
  const borrowedIds = new Set(myLoans.map((l) => l.bookId));

  const catScore = {};
  const authScore = {};
  myLoans.forEach((l) => {
    const b = books.getById(l.bookId);
    if (b) {
      catScore[b.category] = (catScore[b.category] || 0) + 1;
      authScore[b.author] = (authScore[b.author] || 0) + 1;
    }
  });

  const hasHistory = myLoans.length > 0;
  const candidates = books
    .getAll()
    .filter((b) => !borrowedIds.has(b.id) && b.availableCopies > 0)
    .map((b) => ({ book: b, score: (catScore[b.category] || 0) * 2 + (authScore[b.author] || 0) * 3 }));

  candidates.sort((a, b) =>
    hasHistory ? b.score - a.score || b.book.totalCopies - a.book.totalCopies : b.book.totalCopies - a.book.totalCopies
  );
  return candidates.slice(0, limit).map((c) => c.book);
}
