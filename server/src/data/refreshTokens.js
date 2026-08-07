// Lưu refresh token in-memory (mất khi restart). Token là chuỗi ngẫu nhiên opaque.
// Bản ghi: { token, userId, expiresAt(ISO) }
let tokens = [];

export function add(token, userId, expiresAt) {
  tokens.push({ token, userId, expiresAt });
}

export function get(token) {
  const rec = tokens.find((t) => t.token === token);
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
  const i = tokens.findIndex((t) => t.token === token);
  if (i !== -1) tokens.splice(i, 1);
}

export function removeByUser(userId) {
  tokens = tokens.filter((t) => t.userId !== userId);
}
