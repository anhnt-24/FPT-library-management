// Data-access người dùng — lưu ở SQLite (xem ../db.js). Giữ nguyên interface cũ.
import db from '../db.js';
import type { User, PublicUser } from '../types.js';

const COLS = ['name', 'email', 'passwordHash', 'role', 'status', 'lateReturnCount', 'createdAt'];

export function getAll(): User[] {
  return db.prepare('SELECT * FROM users').all() as User[];
}

export function getById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getByEmail(email: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(String(email)) as User | undefined;
}

export function create(data: Partial<User>): User {
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
  return getById(Number(info.lastInsertRowid)) as User;
}

export function update(id: number, data: Partial<User>): User | null {
  const keys = Object.keys(data).filter((k) => COLS.includes(k));
  if (keys.length) {
    const params: Record<string, unknown> = { id };
    keys.forEach((k) => (params[k] = (data as Record<string, unknown>)[k]));
    const set = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE users SET ${set} WHERE id = @id`).run(params);
  }
  return getById(id) || null;
}

export function remove(id: number): boolean {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes > 0;
}

// Bỏ passwordHash trước khi trả về client.
export function toPublic(user: User | undefined): PublicUser | undefined {
  if (!user) return user;
  const { passwordHash, ...pub } = user;
  return pub;
}
