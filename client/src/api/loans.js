import request from './client.js';

export const mine = (params = {}) => request('/loans/me?' + new URLSearchParams(params), { auth: true });
export const all = (params = {}) => request('/loans?' + new URLSearchParams(params), { auth: true });
export const create = (bookId) => request('/loans', { method: 'POST', body: { bookId }, auth: true });
export const approve = (id) => request(`/loans/${id}/approve`, { method: 'PATCH', auth: true });
export const reject = (id) => request(`/loans/${id}/reject`, { method: 'PATCH', auth: true });
export const returnLoan = (id) => request(`/loans/${id}/return`, { method: 'PATCH', auth: true });
