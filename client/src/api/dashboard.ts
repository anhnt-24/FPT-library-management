import request from './client';

export interface Summary {
  totalTitles: number;
  totalCopies: number;
  borrowing: number;
  overdue: number;
  totalReaders: number;
}
export interface MostBorrowed {
  bookId: number;
  title: string;
  count: number;
}
export interface BorrowStat {
  period: string;
  count: number;
}
export interface CategoryStat {
  category: string;
  count: number;
}

export const summary = () => request<Summary>('/dashboard/summary', { auth: true });
export const mostBorrowed = (limit = 5) => request<MostBorrowed[]>('/dashboard/most-borrowed?limit=' + limit, { auth: true });
export const borrowStats = (group = 'month') => request<BorrowStat[]>('/dashboard/borrow-stats?group=' + group, { auth: true });
export const categoryBreakdown = () => request<CategoryStat[]>('/dashboard/category-breakdown', { auth: true });
