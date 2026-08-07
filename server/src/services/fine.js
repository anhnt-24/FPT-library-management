import { FINE_PER_DAY } from '../config.js';

// Tính tiền phạt trả trễ = số ngày trễ (làm tròn lên) × đơn giá. Trả đúng/sớm hạn → 0.
export function calcFine(dueDate, returnedAt = new Date()) {
  if (!dueDate) return 0;
  const ms = new Date(returnedAt) - new Date(dueDate);
  if (ms <= 0) return 0;
  const days = Math.ceil(ms / 86400000);
  return days * FINE_PER_DAY;
}
