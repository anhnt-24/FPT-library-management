// Quét phiếu mượn hằng ngày: nhắc trước hạn 2 ngày, đánh dấu quá hạn + gửi mail.
import cron from 'node-cron';
import * as loans from '../data/loans.js';
import * as books from '../data/books.js';
import * as users from '../data/users.js';
import { sendDueSoon, sendOverdue } from './email.js';
import { calcFine } from './fine.js';

export async function runReminderSweep(now = new Date()) {
  let reminded = 0;
  let overdue = 0;
  for (const l of loans.getAll()) {
    if (l.status !== 'borrowing' || !l.dueDate) continue;
    const u = users.getById(l.userId);
    const b = books.getById(l.bookId);
    if (!u || !b) continue;

    const due = new Date(l.dueDate);
    if (now > due) {
      loans.update(l.id, { status: 'overdue' });
      const days = Math.ceil((now - due) / 86400000);
      await sendOverdue(u, b, l, days, calcFine(l.dueDate, now));
      overdue += 1;
    } else if (Math.ceil((due - now) / 86400000) === 2) {
      await sendDueSoon(u, b, l);
      reminded += 1;
    }
  }
  return { reminded, overdue };
}

export function startScheduler() {
  cron.schedule('0 8 * * *', () => {
    runReminderSweep().catch((e) => console.error('scheduler error:', e.message));
  });
  console.log('⏰ Scheduler nhắc/quá hạn đã bật (08:00 hằng ngày)');
}
