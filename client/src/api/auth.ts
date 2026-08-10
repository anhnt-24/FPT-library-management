import request, { tokenStore } from './client';
import type { AuthResponse, User } from '../types';

export const register = (data: { name: string; email: string; password: string }) =>
  request<AuthResponse>('/auth/register', { method: 'POST', body: data });
export const login = (data: { email: string; password: string }) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: data });
export const me = () => request<{ user: User }>('/auth/me', { auth: true });
export const logout = () => request<null>('/auth/logout', { method: 'POST', body: { refreshToken: tokenStore.refresh } });
