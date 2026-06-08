import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/header'
import Footer from './components/footer'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import TrainerProfilePage from './pages/TrainerProfilePage'
import { ProtectedRoute } from './router/ProtectedRoute'

// ✨ MỚI: import layout và page admin
import AdminLayout from './components/admin/AdminLayout'
import AdminUsersPage from './pages/AdminUsersPage'

function Layout({ children }) {
  return (
    <div className="App">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/trainer/profile"
        element={
          <ProtectedRoute allowedRoles={['TRAINER']}>
            <Layout><TrainerProfilePage /></Layout>
          </ProtectedRoute>
        }
      />

      {/* ✨ MỚI: Khu vực admin
          - AdminLayout có <Outlet/> bên trong → mọi page con sẽ render vào đó
          - Bọc ProtectedRoute để bắt buộc đăng nhập */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="users" element={<AdminUsersPage />} />
        {/* Sau này thêm route con khác:
            <Route path="races"   element={<AdminRacesPage   />} />
            <Route path="horses"  element={<AdminHorsesPage  />} />
            <Route path="betting" element={<AdminBettingPage />} />
        */}
      </Route>
    </Routes>
  )
}