import request from './client.js';

export const list = (q = '') => request('/readers?' + new URLSearchParams(q ? { q } : {}), { auth: true });
export const get = (id) => request('/readers/' + id, { auth: true });
export const loans = (id) => request(`/readers/${id}/loans`, { auth: true });
export const lock = (id) => request(`/readers/${id}/lock`, { method: 'PATCH', auth: true });
export const unlock = (id) => request(`/readers/${id}/unlock`, { method: 'PATCH', auth: true });
