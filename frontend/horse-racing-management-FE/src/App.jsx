import { Routes, Route } from 'react-router-dom'
import './App.css'
import PageTransition from './components/PageTransition'
import Layout from './components/Layout'
import AppLayout from './components/AppLayout'
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
import AdminApproveHorsesPage from './pages/AdminApproveHorsesPage'

// Referee
import RefereeRacesPage from './pages/RefereeRacesPage'

// Notifications
import NotificationsPage from './pages/NotificationsPage'

export default function App() {
  return (
    <Routes>
      {/* Public — dùng Layout (header home + footer, không có sidebar) */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
      <Route path="/jockeys" element={<Layout><JockeysPage /></Layout>} />
      <Route path="/races" element={<Layout><RacesPage /></Layout>} />
      <Route path="/races/:id" element={<Layout><RaceDetailPage /></Layout>} />

      {/* Authenticated — dùng AppLayout (app header + sidebar + footer) */}

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout><NotificationsPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout><ProfilePage /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Referee */}
      <Route
        path="/referee/races"
        element={
          <ProtectedRoute allowedRoles={['REFEREE']}>
            <AppLayout><RefereeRacesPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Horse Owner */}
      <Route
        path="/horse-owner/horses"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <AppLayout><MyHorsesPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses/new"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <AppLayout><HorseRegisterPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/horses/:id"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <AppLayout><HorseDetailPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/horse-owner/race-registrations"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <AppLayout><MyRaceRegistrationsPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Trainer */}
      <Route
        path="/trainer/profile"
        element={
          <ProtectedRoute allowedRoles={['TRAINER']}>
            <AppLayout><TrainerProfilePage /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Bet & Wallet */}
      <Route
        path="/my-bets"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <AppLayout><MyBetsPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-wallet"
        element={
          <ProtectedRoute allowedRoles={['USER', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']}>
            <AppLayout><MyWalletPage /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppLayout><AdminUsersPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/races/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppLayout><AdminCreateRacePage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/deposits"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AppLayout><AdminDepositPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/races/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppLayout><AdminEditRacePage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approve-horses"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppLayout><AdminApproveHorsesPage /></AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
