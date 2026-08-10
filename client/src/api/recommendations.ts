import request from './client';
import type { Book } from '../types';

export const list = (limit = 6) => request<Book[]>('/recommendations?limit=' + limit, { auth: true });
