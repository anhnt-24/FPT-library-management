// Mock "database" người dùng trong bộ nhớ. Mất khi restart server.
// User: { id, name, email, passwordHash, role, status, lateReturnCount, createdAt }
import bcrypt from 'bcryptjs';

let users = [
  {
    id: 1,
    name: 'Thủ thư',
    email: 'admin@fpt.edu.vn',
    passwordHash: bcrypt.hashSync('admin123', 10), // tài khoản admin seed sẵn
    role: 'admin',
    status: 'active',
    lateReturnCount: 0,
    createdAt: new Date().toISOString(),
  },
];
let nextId = 2;

export function getAll() {
  return users;
}

export function getById(id) {
  return users.find((u) => u.id === id);
}

export function getByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

export function create(data) {
  const user = {
    id: nextId++,
    role: 'member',
    status: 'active',
    lateReturnCount: 0,
    createdAt: new Date().toISOString(),
    ...data,
  };
  users.push(user);
  return user;
}

export function update(id, data) {
  const user = getById(id);
  if (!user) return null;
  const { id: _ignore, ...rest } = data;
  Object.assign(user, rest);
  return user;
}

export function remove(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

// Bỏ passwordHash trước khi trả về client.
export function toPublic(user) {
  if (!user) return user;
  const { passwordHash, ...pub } = user;
  return pub;
}
