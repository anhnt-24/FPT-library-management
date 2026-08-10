// Kiểu dữ liệu dùng chung cho backend.
export type Role = 'admin' | 'member';
export type UserStatus = 'active' | 'locked';
export type LoanStatus = 'pending' | 'borrowing' | 'returned' | 'overdue' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  lateReturnCount: number;
  createdAt: string;
}
export type PublicUser = Omit<User, 'passwordHash'>;

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  category: string;
  year: number | null;
  isbn: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
}

export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  status: LoanStatus;
  requestedAt: string;
  borrowedAt: string | null;
  dueDate: string | null;
  returnedAt: string | null;
  fineAmount: number;
}

export interface Review {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RefreshTokenRec {
  token: string;
  userId: number;
  expiresAt: string;
}

export interface AuthUser {
  id: number;
  role: Role;
}
