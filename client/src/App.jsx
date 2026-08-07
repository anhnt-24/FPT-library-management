import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BooksPage from './pages/BooksPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MyLoansPage from './pages/MyLoansPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import AdminBooksPage from './pages/admin/AdminBooksPage.jsx';
import AdminLoansPage from './pages/admin/AdminLoansPage.jsx';
import ReadersPage from './pages/admin/ReadersPage.jsx';

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
