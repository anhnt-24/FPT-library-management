import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import loansRouter from './routes/loans.js';
import readersRouter from './routes/readers.js';
import dashboardRouter from './routes/dashboard.js';

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

// Không khớp route nào
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

export default app;
