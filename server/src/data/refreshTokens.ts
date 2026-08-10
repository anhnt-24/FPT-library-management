// Data-access refresh token — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';
import type { RefreshTokenRec } from '../types.js';

export function add(token: string, userId: number, expiresAt: string): void {
  db.prepare('INSERT OR REPLACE INTO refresh_tokens (token,userId,expiresAt) VALUES (?,?,?)').run(token, userId, expiresAt);
}

export function get(token: string): RefreshTokenRec | null {
  const rec = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(token) as RefreshTokenRec | undefined;
  if (!rec) return null;
  if (new Date(rec.expiresAt) < new Date()) {
    remove(token);
    return null;
  }
  return rec;
}

export function has(token: string): boolean {
  return get(token) !== null;
}

export function remove(token: string): void {
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
}

export function removeByUser(userId: number): void {
  db.prepare('DELETE FROM refresh_tokens WHERE userId = ?').run(userId);
}
