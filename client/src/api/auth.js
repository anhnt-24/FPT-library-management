import request, { tokenStore } from './client.js';

export const register = (data) => request('/auth/register', { method: 'POST', body: data });
export const login = (data) => request('/auth/login', { method: 'POST', body: data });
export const me = () => request('/auth/me', { auth: true });
export const logout = () => request('/auth/logout', { method: 'POST', body: { refreshToken: tokenStore.refresh } });
