import { tokenStore } from './client.js';

// Tải CSV (cần gửi Bearer nên không dùng thẻ <a href> trực tiếp được).
export async function downloadLoansCsv(params = {}) {
  const res = await fetch('/api/reports/loans.csv?' + new URLSearchParams(params), {
    headers: { Authorization: 'Bearer ' + tokenStore.access },
  });
  if (!res.ok) throw new Error('Không tải được CSV');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bao-cao-muon-tra.csv';
  a.click();
  URL.revokeObjectURL(url);
}
