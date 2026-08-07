// Data-access refresh token — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';

export function add(token, userId, expiresAt) {
  db.prepare('INSERT OR REPLACE INTO refresh_tokens (token,userId,expiresAt) VALUES (?,?,?)').run(token, userId, expiresAt);
}

export function get(token) {
  const rec = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(token);
  if (!rec) return null;
  if (new Date(rec.expiresAt) < new Date()) {
    remove(token);
    return null;
  }
  return rec;
}

export function has(token) {
  return get(token) !== null;
}

export function remove(token) {
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
}

export function removeByUser(userId) {
  db.prepare('DELETE FROM refresh_tokens WHERE userId = ?').run(userId);
}
