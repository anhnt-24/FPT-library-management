import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyLoansPage from './pages/MyLoansPage';
import DashboardPage from './pages/admin/DashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminLoansPage from './pages/admin/AdminLoansPage';
import ReadersPage from './pages/admin/ReadersPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-loans" element={<ProtectedRoute role="member"><MyLoansPage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute role="admin"><AdminBooksPage /></ProtectedRoute>} />
          <Route path="/admin/loans" element={<ProtectedRoute role="admin"><AdminLoansPage /></ProtectedRoute>} />
          <Route path="/admin/readers" element={<ProtectedRoute role="admin"><ReadersPage /></ProtectedRoute>} />
          <Route path="*" element={<p style={{ padding: 20 }}>404 — Không tìm thấy trang</p>} />
        </Routes>
      </main>
    </>
  );
}
