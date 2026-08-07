// Data-access người dùng — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';

const COLS = ['name', 'email', 'passwordHash', 'role', 'status', 'lateReturnCount', 'createdAt'];

export function getAll() {
  return db.prepare('SELECT * FROM users').all();
}

export function getById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function getByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(String(email));
}

export function create(data) {
  const row = {
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role || 'member',
    status: data.status || 'active',
    lateReturnCount: data.lateReturnCount || 0,
    createdAt: data.createdAt || new Date().toISOString(),
  };
  const info = db
    .prepare(
      `INSERT INTO users (name,email,passwordHash,role,status,lateReturnCount,createdAt)
       VALUES (@name,@email,@passwordHash,@role,@status,@lateReturnCount,@createdAt)`
    )
    .run(row);
  return getById(info.lastInsertRowid);
}

export function update(id, data) {
  const keys = Object.keys(data).filter((k) => COLS.includes(k));
  if (keys.length) {
    const params = { id };
    keys.forEach((k) => (params[k] = data[k]));
    const set = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE users SET ${set} WHERE id = @id`).run(params);
  }
  return getById(id) || null;
}

export function remove(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
}

// Bỏ passwordHash trước khi trả về client.
export function toPublic(user) {
  if (!user) return user;
  const { passwordHash, ...pub } = user;
  return pub;
}
