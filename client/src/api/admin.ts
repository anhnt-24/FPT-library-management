import request from './client';

// Gửi email quá hạn mẫu (test SMTP). to rỗng → backend dùng SMTP_USER.
export const testEmail = (to?: string) =>
  request<{ ok: boolean; to: string; mode: string }>('/admin/test-email', { method: 'POST', body: { to }, auth: true });
