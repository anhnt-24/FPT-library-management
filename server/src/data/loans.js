// Mock in-memory phiếu mượn. Mất khi restart server.
// Loan: { id, userId, bookId, status, requestedAt, borrowedAt, dueDate, returnedAt, fineAmount }
let loans = [];
let nextId = 1;

export function getAll() {
  return loans;
}

export function getById(id) {
  return loans.find((l) => l.id === id);
}

export function getByUser(userId) {
  return loans.filter((l) => l.userId === userId);
}

export function getByBook(bookId) {
  return loans.filter((l) => l.bookId === bookId);
}

export function create(data) {
  const loan = {
    id: nextId++,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    borrowedAt: null,
    dueDate: null,
    returnedAt: null,
    fineAmount: 0,
    ...data,
  };
  loans.push(loan);
  return loan;
}

export function update(id, data) {
  const loan = getById(id);
  if (!loan) return null;
  const { id: _ignore, ...rest } = data;
  Object.assign(loan, rest);
  return loan;
}
