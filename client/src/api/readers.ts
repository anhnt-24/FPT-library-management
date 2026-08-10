import request from './client';
import type { Reader, Loan } from '../types';

export const list = (q = '') => request<Reader[]>('/readers?' + new URLSearchParams(q ? { q } : {}), { auth: true });
export const get = (id: number) => request<Reader>('/readers/' + id, { auth: true });
export const loans = (id: number) => request<Loan[]>(`/readers/${id}/loans`, { auth: true });
export const lock = (id: number) => request<Reader>(`/readers/${id}/lock`, { method: 'PATCH', auth: true });
export const unlock = (id: number) => request<Reader>(`/readers/${id}/unlock`, { method: 'PATCH', auth: true });
