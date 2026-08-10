import request from './client';
import type { Loan } from '../types';

export const mine = (params: Record<string, any> = {}) =>
  request<Loan[]>('/loans/me?' + new URLSearchParams(params), { auth: true });
export const all = (params: Record<string, any> = {}) =>
  request<Loan[]>('/loans?' + new URLSearchParams(params), { auth: true });
export const create = (bookId: number) => request<Loan>('/loans', { method: 'POST', body: { bookId }, auth: true });
export const approve = (id: number) => request<Loan>(`/loans/${id}/approve`, { method: 'PATCH', auth: true });
export const reject = (id: number) => request<Loan>(`/loans/${id}/reject`, { method: 'PATCH', auth: true });
export const returnLoan = (id: number) => request<Loan>(`/loans/${id}/return`, { method: 'PATCH', auth: true });
