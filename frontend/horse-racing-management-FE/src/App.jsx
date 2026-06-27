import { Routes, Route } from 'react-router-dom'
import './App.css'
import PageTransition from './components/PageTransition'
import Layout from './components/Layout'
import AppLayout from './components/AppLayout'
import { ProtectedRoute } from './router/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Public pages
import HomePage from './pages/public/HomePage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import JockeysPage from './pages/public/JockeysPage'
import RacesPage from './pages/public/RacesPage'
import RaceResultsPage from './pages/public/RaceResultsPage'

// User pages
import ProfilePage from './pages/user/ProfilePage'
import NotificationsPage from './pages/user/NotificationsPage'
import MyBetsPage from './pages/user/MyBetsPage'
import MyWalletPage from './pages/user/MyWalletPage'

// Horse Owner pages
import MyHorsesPage from './pages/horse-owner/MyHorsesPage'
import HorseRegisterPage from './pages/horse-owner/HorseRegisterPage'
import HorseDetailPage from './pages/horse-owner/HorseDetailPage'
import MyRaceRegistrationsPage from './pages/horse-owner/MyRaceRegistrationsPage'
import HorseOwnerRacePage from './pages/horse-owner/HorseOwnerRacePage'

// Trainer pages
import TrainerProfilePage from './pages/trainer/TrainerProfilePage'

// Referee pages
import RefereeRacesPage from './pages/referee/RefereeRacesPage'

// Admin pages
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCreateRacePage from './pages/admin/AdminCreateRacePage'
import AdminEditRacePage from './pages/admin/AdminEditRacePage'
import AdminSetOddsPage from './pages/admin/AdminSetOddsPage'
import AdminWalletPage from './pages/admin/AdminWalletPage'
import AdminRaceListPage from './pages/admin/AdminRaceListPage'
import AdminDepositPage from './pages/admin/AdminDepositPage'
import AdminApproveHorsesPage from './pages/admin/AdminApproveHorsesPage'

export default function App() {
  return (
    <Routes>
      {/* Public — uses Layout (home header + footer, no sidebar) */}
      <Route path="/" element={<ErrorBoundary><Layout><HomePage /></Layout></ErrorBoundary>} />
      <Route path="/login" element={<ErrorBoundary><Layout><LoginPage /></Layout></ErrorBoundary>} />
      <Route path="/register" element={<ErrorBoundary><Layout><RegisterPage /></Layout></ErrorBoundary>} />
      <Route path="/forgot-password" element={<ErrorBoundary><PageTransition><ForgotPasswordPage /></PageTransition></ErrorBoundary>} />
      <Route path="/jockeys" element={<ErrorBoundary><Layout><JockeysPage /></Layout></ErrorBoundary>} />
      <Route path="/races" element={<ErrorBoundary><Layout><RacesPage /></Layout></ErrorBoundary>} />
      <Route path="/results" element={<ErrorBoundary><Layout><RaceResultsPage /></Layout></ErrorBoundary>} />

      {/* Authenticated — uses AppLayout (app header + sidebar + footer) */}

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
        path="/horse-owner/register-race"
        element={
          <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
            <AppLayout><HorseOwnerRacePage /></AppLayout>
          </ProtectedRoute>
        }
      />
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
          <ProtectedRoute allowedRoles={['USER', 'SPECTATOR']}>
            <AppLayout><MyBetsPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-wallet"
        element={
          <ProtectedRoute allowedRoles={['USER', 'SPECTATOR', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']}>
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
      <Route
        path="/admin/races"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppLayout><AdminRaceListPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/set-odds"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AppLayout><AdminSetOddsPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/wallet"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AppLayout><AdminWalletPage /></AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
