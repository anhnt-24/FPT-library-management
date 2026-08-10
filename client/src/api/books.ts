import request from './client';
import type { Book, Paged, Filters, Review } from '../types';

export const list = (params: Record<string, any> = {}) =>
  request<Paged<Book>>('/books?' + new URLSearchParams(params));
export const get = (id: number | string) => request<Book>('/books/' + id);
export const filters = () => request<Filters>('/books/meta/filters');
export const create = (data: Partial<Book>) => request<Book>('/books', { method: 'POST', body: data, auth: true });
export const update = (id: number, data: Partial<Book>) =>
  request<Book>('/books/' + id, { method: 'PUT', body: data, auth: true });
export const remove = (id: number) => request<null>('/books/' + id, { method: 'DELETE', auth: true });

export const reviews = (id: number | string) =>
  request<{ items: Review[]; average: number; count: number }>(`/books/${id}/reviews`);
export const addReview = (id: number | string, data: { rating: number; comment: string }) =>
  request<Review>(`/books/${id}/reviews`, { method: 'POST', body: data, auth: true });
export const qrUrl = (id: number) => `/api/books/${id}/qrcode`;
