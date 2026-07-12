import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AppLayout from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ScrollToTop from '@/components/ui/ScrollToTop';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage'));
const JockeysPage = lazy(() => import('@/pages/public/JockeysPage'));
const JockeyProfilePage = lazy(() => import('@/pages/public/JockeyProfilePage'));
const HorsesPage = lazy(() => import('@/pages/public/HorsesPage'));
const HorseProfilePage = lazy(() => import('@/pages/public/HorseProfilePage'));
const RacesPage = lazy(() => import('@/pages/public/RacesPage'));
const RaceDetailPage = lazy(() => import('@/pages/public/RaceDetailPage'));
const RaceResultsPage = lazy(() => import('@/pages/public/RaceResultsPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const BetHomePage = lazy(() => import('@/pages/public/BetHomePage'));
const BetRacesPage = lazy(() => import('@/pages/public/BetRacesPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

// Account pages
const DashboardPage = lazy(() => import('@/pages/account/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'));
const MyBetsPage = lazy(() => import('@/pages/account/MyBetsPage'));
const MyWalletPage = lazy(() => import('@/pages/account/MyWalletPage'));

// Horse Owner
const HorseOwnerDashboardPage = lazy(() => import('@/pages/horse-owner/HorseOwnerDashboardPage'));
const MyHorsesPage = lazy(() => import('@/pages/horse-owner/MyHorsesPage'));
const HorseRegisterPage = lazy(() => import('@/pages/horse-owner/HorseRegisterPage'));
const HorseDetailPage = lazy(() => import('@/pages/horse-owner/HorseDetailPage'));
const HorseOwnerRacePage = lazy(() => import('@/pages/horse-owner/HorseOwnerRacePage'));
const MyRaceRegistrationsPage = lazy(() => import('@/pages/horse-owner/MyRaceRegistrationsPage'));

// Trainer
const TrainerDashboardPage = lazy(() => import('@/pages/trainer/TrainerDashboardPage'));
const TrainerProfilePage = lazy(() => import('@/pages/trainer/TrainerProfilePage'));

// Referee
const RefereeDashboardPage = lazy(() => import('@/pages/referee/RefereeDashboardPage'));
const RefereeRacesPage = lazy(() => import('@/pages/referee/RefereeRacesPage'));

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminRaceListPage = lazy(() => import('@/pages/admin/AdminRaceListPage'));
const AdminRaceDetailPage = lazy(() => import('@/pages/admin/AdminRaceDetailPage'));
const AdminCreateRacePage = lazy(() => import('@/pages/admin/AdminCreateRacePage'));
const AdminEditRacePage = lazy(() => import('@/pages/admin/AdminEditRacePage'));
const AdminApproveHorsesPage = lazy(() => import('@/pages/admin/AdminApproveHorsesPage'));
const AdminSetOddsPage = lazy(() => import('@/pages/admin/AdminSetOddsPage'));
const AdminDepositPage = lazy(() => import('@/pages/admin/AdminDepositPage'));
const AdminWalletPage = lazy(() => import('@/pages/admin/AdminWalletPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ── Public (Layout: public header + footer) ───────────────── */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/jockeys" element={<Layout><JockeysPage /></Layout>} />
          <Route path="/jockeys/:id" element={<Layout><JockeyProfilePage /></Layout>} />
          <Route path="/horses" element={<Layout><HorsesPage /></Layout>} />
          <Route path="/horses/:id" element={<Layout><HorseProfilePage /></Layout>} />
          <Route path="/races" element={<Layout><RacesPage /></Layout>} />
          <Route path="/races/:id" element={<Layout><RaceDetailPage /></Layout>} />
          <Route path="/bet" element={<Layout><BetHomePage /></Layout>} />
          <Route path="/bet/races" element={<Layout><BetRacesPage /></Layout>} />
          <Route path="/results" element={<Layout><RaceResultsPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />

          {/* ── Authenticated (AppLayout: sidebar + app header) ───────── */}

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['USER']}><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>
          } />

          {/* Referee */}
          <Route path="/referee/dashboard" element={
            <ProtectedRoute allowedRoles={['REFEREE']}>
              <AppLayout><RefereeDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/referee/races" element={
            <ProtectedRoute allowedRoles={['REFEREE']}>
              <AppLayout><RefereeRacesPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Horse Owner */}
          <Route path="/horse-owner/dashboard" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><HorseOwnerDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/horse-owner/horses" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><MyHorsesPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/horse-owner/horses/new" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><HorseRegisterPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/horse-owner/horses/:id" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><HorseDetailPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/horse-owner/register-race" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><HorseOwnerRacePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/horse-owner/race-registrations" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><MyRaceRegistrationsPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Trainer */}
          <Route path="/trainer/dashboard" element={
            <ProtectedRoute allowedRoles={['TRAINER']}>
              <AppLayout><TrainerDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/trainer/profile" element={
            <ProtectedRoute allowedRoles={['TRAINER']}>
              <AppLayout><TrainerProfilePage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Bet & Wallet */}
          <Route path="/my-bets" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <AppLayout><MyBetsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/my-wallet" element={
            <ProtectedRoute allowedRoles={['USER', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']}>
              <AppLayout><MyWalletPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminUsersPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/races" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminRaceListPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/races/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminRaceDetailPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/races/create" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminCreateRacePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/races/:id/edit" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminEditRacePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/approve-horses" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminApproveHorsesPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/set-odds" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <AppLayout><AdminSetOddsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/deposits" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminDepositPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/wallet" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminWalletPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
