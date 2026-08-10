// Kiểu dữ liệu dùng chung cho frontend (khớp payload API backend).
export type Role = 'admin' | 'member';
export type LoanStatus = 'pending' | 'borrowing' | 'returned' | 'overdue' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'locked';
  lateReturnCount: number;
  createdAt: string;
}

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
  userName?: string;
}

export interface Reader extends User {
  borrowingCount: number;
  overdueCount: number;
  shouldLock: boolean;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Filters {
  categories: string[];
  authors: string[];
  publishers: string[];
  years: number[];
}
