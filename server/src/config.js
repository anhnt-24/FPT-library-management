// Tham số cấu hình + nghiệp vụ (đều có thể override qua biến môi trường).
export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me';
export const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
export const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS || 7);

// Nghiệp vụ mượn/trả (xem docs/specs/00-tong-quan-kien-truc.md §6)
export const LOAN_DAYS = Number(process.env.LOAN_DAYS || 14);
export const FINE_PER_DAY = Number(process.env.FINE_PER_DAY || 5000);
export const MAX_ACTIVE_LOANS = Number(process.env.MAX_ACTIVE_LOANS || 5);
export const LATE_LOCK_THRESHOLD = Number(process.env.LATE_LOCK_THRESHOLD || 3);
