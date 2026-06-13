import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProfilePage from './pages/ProfilePage'
import MyHorsesPage from './pages/MyHorsesPage'
import HorseRegisterPage from './pages/HorseRegisterPage'
import HorseDetailPage from './pages/HorseDetailPage'
import JockeysPage from './pages/JockeysPage'
import RacesPage from './pages/RacesPage'
import RaceDetailPage from './pages/RaceDetailPage'
import AdminCreateRacePage from './pages/AdminCreateRacePage'
import AdminEditRacePage from './pages/AdminEditRacePage'
import AdminUsersPage from './pages/AdminUsersPage'
import MyBetsPage from './pages/MyBetsPage'
import { ProtectedRoute } from './router/ProtectedRoute'
import MyWalletPage     from './pages/MyWalletPage'
import AdminDepositPage from './pages/AdminDepositPage' 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/jockeys" element={<Layout><JockeysPage /></Layout>} />
      <Route path="/races" element={<Layout><RacesPage /></Layout>} />
      <Route path="/races/:id" element={<Layout><RaceDetailPage /></Layout>} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses/new"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout>
              <HorseRegisterPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses/:id"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout>
              <HorseDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout>
              <MyHorsesPage />
            </Layout>
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/races/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminCreateRacePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/races/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminEditRacePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Layout><AdminUsersPage /></Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/my-bets"
  element={
    <ProtectedRoute allowedRoles={['USER']}>
      <Layout><MyBetsPage /></Layout>
    </ProtectedRoute>
  }
/>


<Route
  path="/my-wallet"
  element={
    <ProtectedRoute>
      <Layout><MyWalletPage /></Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/deposits"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Layout><AdminDepositPage /></Layout>
    </ProtectedRoute>
  }
/>
    </Routes>
  )
}
