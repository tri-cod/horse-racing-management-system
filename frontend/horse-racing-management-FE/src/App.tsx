import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
const RefereeProfilePage = lazy(() => import('@/pages/public/RefereeProfilePage'));
const HorsesPage = lazy(() => import('@/pages/public/HorsesPage'));
const HorseProfilePage = lazy(() => import('@/pages/public/HorseProfilePage'));
const HorseOwnerProfilePage = lazy(() => import('@/pages/public/HorseOwnerProfilePage'));
const RacesPage = lazy(() => import('@/pages/public/RacesPage'));
const RaceDetailPage = lazy(() => import('@/pages/public/RaceDetailPage'));
const RaceResultsPage = lazy(() => import('@/pages/public/RaceResultsPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
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
const HorseEditPage = lazy(() => import('@/pages/horse-owner/HorseEditPage'));
const HorseOwnerRacePage = lazy(() => import('@/pages/horse-owner/HorseOwnerRacePage'));
const MyRaceRegistrationsPage = lazy(() => import('@/pages/horse-owner/MyRaceRegistrationsPage'));
const HorseOwnerMyProfilePage = lazy(() => import('@/pages/horse-owner/HorseOwnerMyProfilePage'));

// Trainer
const TrainerDashboardPage = lazy(() => import('@/pages/trainer/TrainerDashboardPage'));
const TrainerProfilePage = lazy(() => import('@/pages/trainer/TrainerProfilePage'));

// Jockey
const JockeyDashboardPage = lazy(() => import('@/pages/jockey/JockeyDashboardPage'));
const JockeyMyProfilePage = lazy(() => import('@/pages/jockey/JockeyMyProfilePage'));
const JockeyRaceRequestsPage = lazy(() => import('@/pages/jockey/JockeyRaceRequestsPage'));

// Referee
const RefereeDashboardPage = lazy(() => import('@/pages/referee/RefereeDashboardPage'));
const RefereeRacesPage = lazy(() => import('@/pages/referee/RefereeRacesPage'));
const RefereeMyRacesPage = lazy(() => import('@/pages/referee/RefereeMyRacesPage'));
const RefereePenaltyHistoryPage = lazy(() => import('@/pages/referee/RefereePenaltyHistoryPage'));
const RefereeMyProfilePage = lazy(() => import('@/pages/referee/RefereeMyProfilePage'));

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminRaceListPage = lazy(() => import('@/pages/admin/AdminRaceListPage'));
const AdminRaceDetailPage = lazy(() => import('@/pages/admin/AdminRaceDetailPage'));
const AdminEditRacePage = lazy(() => import('@/pages/admin/AdminEditRacePage'));
const AdminWithdrawalRequestsPage = lazy(() => import('@/pages/admin/AdminWithdrawalRequestsPage'));
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
          <Route path="/referees/:id" element={<Layout><RefereeProfilePage /></Layout>} />
          <Route path="/horses" element={<Layout><HorsesPage /></Layout>} />
          <Route path="/horses/:id" element={<Layout><HorseProfilePage /></Layout>} />
          <Route path="/horse-owners/:id" element={<Layout><HorseOwnerProfilePage /></Layout>} />
          <Route path="/races" element={<Layout><RacesPage /></Layout>} />
          <Route path="/races/:id" element={<Layout><RaceDetailPage /></Layout>} />
          <Route path="/bet" element={<Navigate to="/bet/races" replace />} />
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
          <Route path="/referee/my-races" element={
            <ProtectedRoute allowedRoles={['REFEREE']}>
              <AppLayout><RefereeMyRacesPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/referee/penalties" element={
            <ProtectedRoute allowedRoles={['REFEREE']}>
              <AppLayout><RefereePenaltyHistoryPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/referee/profile" element={
            <ProtectedRoute allowedRoles={['REFEREE']}>
              <AppLayout><RefereeMyProfilePage /></AppLayout>
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
          <Route path="/horse-owner/horses/:id/edit" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><HorseEditPage /></AppLayout>
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
          <Route path="/horse-owner/profile" element={
            <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
              <AppLayout><HorseOwnerMyProfilePage /></AppLayout>
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

          {/* Jockey */}
          <Route path="/jockey/dashboard" element={
            <ProtectedRoute allowedRoles={['JOCKEY']}>
              <AppLayout><JockeyDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jockey/profile" element={
            <ProtectedRoute allowedRoles={['JOCKEY']}>
              <AppLayout><JockeyMyProfilePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jockey/race-requests" element={
            <ProtectedRoute allowedRoles={['JOCKEY']}>
              <AppLayout><JockeyRaceRequestsPage /></AppLayout>
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
          {/* Create Race, Set Odds and Approve Horses merged into Manage Races as
              tabs — keep the old URLs working by redirecting into the right tab. */}
          <Route path="/admin/races" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <AppLayout><AdminRaceListPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/races/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminRaceDetailPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/races/create" element={<Navigate to="/admin/races?tab=create" replace />} />
          <Route path="/admin/races/:id/edit" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminEditRacePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/approve-horses" element={<Navigate to="/admin/races?tab=approve" replace />} />
          <Route path="/admin/withdrawal-requests" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminWithdrawalRequestsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/set-odds" element={<Navigate to="/admin/races?tab=odds" replace />} />
          {/* Deposit Requests merged into System Wallet as a tab — keep the old
              URL working by redirecting straight into that tab. */}
          <Route path="/admin/deposits" element={<Navigate to="/admin/wallet?tab=deposits" replace />} />
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