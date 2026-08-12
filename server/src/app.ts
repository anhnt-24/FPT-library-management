import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import loansRouter from './routes/loans.js';
import readersRouter from './routes/readers.js';
import dashboardRouter from './routes/dashboard.js';
import reviewsRouter from './routes/reviews.js';
import recommendationsRouter from './routes/recommendations.js';
import reportsRouter from './routes/reports.js';
import adminRouter from './routes/admin.js';

const app = express();

app.use(cors());
app.use(express.json());

// Route gốc - kiểm tra server sống
app.get('/', (req, res) => {
  res.json({ message: 'FPT Library Management API', books: '/api/books' });
});

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/loans', loansRouter);
app.use('/api/readers', readersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);
app.use('/api', reviewsRouter); // /api/books/:id/reviews, /api/reviews/:id, /api/books/:id/qrcode

// Không khớp route nào
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

export default app;
