import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import { ProtectedRoute } from './router/ProtectedRoute'

// Public / auth pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProfilePage from './pages/ProfilePage'
import JockeysPage from './pages/JockeysPage'

// Race pages
import RacesPage from './pages/RacesPage'
import RaceDetailPage from './pages/RaceDetailPage'

// Horse Owner
import MyHorsesPage from './pages/MyHorsesPage'
import HorseRegisterPage from './pages/HorseRegisterPage'
import HorseDetailPage from './pages/HorseDetailPage'
import MyRaceRegistrationsPage from './pages/MyRaceRegistrationsPage'

// Trainer
import TrainerProfilePage from './pages/TrainerProfilePage'

// Admin
import AdminUsersPage from './pages/AdminUsersPage'
import AdminCreateRacePage from './pages/AdminCreateRacePage'
import AdminEditRacePage from './pages/AdminEditRacePage'

// Bet & Wallet
import MyBetsPage from './pages/MyBetsPage'
import MyWalletPage from './pages/MyWalletPage'
import AdminDepositPage from './pages/AdminDepositPage'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/jockeys" element={<Layout><JockeysPage /></Layout>} />
      <Route path="/races" element={<Layout><RacesPage /></Layout>} />
      <Route path="/races/:id" element={<Layout><RaceDetailPage /></Layout>} />

      {/* Authenticated (mọi role) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Horse Owner */}
      <Route
        path="/horse-owner/horses"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout><MyHorsesPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses/new"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout><HorseRegisterPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses/:id"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout><HorseDetailPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/race-registrations"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <Layout><MyRaceRegistrationsPage /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Trainer */}
      <Route
        path="/trainer/profile"
        element={
          <ProtectedRoute allowedRoles={['TRAINER']}>
            <Layout><TrainerProfilePage /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Bet & Wallet (USER role) */}
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
          <ProtectedRoute allowedRoles={['USER', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']}>
            <Layout><MyWalletPage /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout><AdminUsersPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/races/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout><AdminCreateRacePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/deposits"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <Layout><AdminDepositPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/races/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout><AdminEditRacePage /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}