import request from './client.js';

export const list = (params = {}) => request('/books?' + new URLSearchParams(params));
export const get = (id) => request('/books/' + id);
export const filters = () => request('/books/meta/filters');
export const create = (data) => request('/books', { method: 'POST', body: data, auth: true });
export const update = (id, data) => request('/books/' + id, { method: 'PUT', body: data, auth: true });
export const remove = (id) => request('/books/' + id, { method: 'DELETE', auth: true });

export const reviews = (id) => request(`/books/${id}/reviews`);
export const addReview = (id, data) => request(`/books/${id}/reviews`, { method: 'POST', body: data, auth: true });
export const qrUrl = (id) => `/api/books/${id}/qrcode`;
