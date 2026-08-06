import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books.js';

const app = express();

app.use(cors());
app.use(express.json());

// Route gốc - kiểm tra server sống
app.get('/', (req, res) => {
  res.json({ message: 'FPT Library Management API', books: '/api/books' });
});

app.use('/api/books', booksRouter);

// Không khớp route nào
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

export default app;
