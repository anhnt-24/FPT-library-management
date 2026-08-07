import request from './client.js';

export const summary = () => request('/dashboard/summary', { auth: true });
export const mostBorrowed = (limit = 5) => request('/dashboard/most-borrowed?limit=' + limit, { auth: true });
export const borrowStats = (group = 'month') => request('/dashboard/borrow-stats?group=' + group, { auth: true });
export const categoryBreakdown = () => request('/dashboard/category-breakdown', { auth: true });
