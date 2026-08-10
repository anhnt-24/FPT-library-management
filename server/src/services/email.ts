// Gửi email (HTML template). Có SMTP env → gửi thật; không thì ghi log ra console (dev),
// để không phụ thuộc hạ tầng khi demo.
import nodemailer from 'nodemailer';
import type { User, Book, Loan } from '../types.js';

interface MailTransport {
  sendMail(opt: { to: string; subject: string; html: string }): Promise<unknown>;
}

let transporter: MailTransport | undefined;
function getTransport(): MailTransport {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    }) as unknown as MailTransport;
  } else {
    transporter = {
      sendMail: async (opt) => {
        console.log(`📧 [DEV email] → ${opt.to} | ${opt.subject}`);
        return { dev: true };
      },
    };
  }
  return transporter;
}

const wrap = (title: string, body: string, color = '#2c3e50'): string =>
  `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
    <div style="background:${color};color:#fff;padding:16px 20px"><h2 style="margin:0">📚 Thư viện FPT</h2></div>
    <div style="padding:20px"><h3 style="margin-top:0">${title}</h3>${body}</div>
  </div>`;

export async function sendDueSoon(user: User, book: Book, loan: Loan): Promise<void> {
  const html = wrap(
    'Nhắc trả sách',
    `<p>Chào <b>${user.name}</b>,</p><p>Sách <b>${book.title}</b> sẽ đến hạn trả vào ngày
     <b>${new Date(loan.dueDate as string).toLocaleDateString('vi-VN')}</b>. Vui lòng trả đúng hạn để tránh bị phạt.</p>`
  );
  await getTransport().sendMail({ to: user.email, subject: `[Thư viện] Nhắc trả sách: ${book.title}`, html });
}

export async function sendOverdue(user: User, book: Book, loan: Loan, days: number, fine: number): Promise<void> {
  const html = wrap(
    'Sách đã quá hạn',
    `<p>Chào <b>${user.name}</b>,</p><p>Sách <b>${book.title}</b> đã quá hạn <b>${days}</b> ngày.
     Tiền phạt tạm tính: <b>${fine.toLocaleString('vi-VN')}đ</b>. Vui lòng trả sách sớm nhất có thể.</p>`,
    '#c0392b'
  );
  await getTransport().sendMail({ to: user.email, subject: `[Thư viện] Sách quá hạn: ${book.title}`, html });
}
