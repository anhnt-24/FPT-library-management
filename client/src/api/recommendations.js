import request from './client.js';

export const list = (limit = 6) => request('/recommendations?limit=' + limit, { auth: true });
