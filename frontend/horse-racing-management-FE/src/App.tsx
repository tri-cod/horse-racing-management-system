import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AppLayout from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ScrollToTop from '@/components/ui/ScrollToTop';

// Public pages
import HomePage from '@/pages/public/HomePage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import JockeysPage from '@/pages/public/JockeysPage';
import RacesPage from '@/pages/public/RacesPage';
import RaceDetailPage from '@/pages/public/RaceDetailPage';
import RaceResultsPage from '@/pages/public/RaceResultsPage';
import AboutPage from '@/pages/public/AboutPage';
import BetHomePage from '@/pages/public/BetHomePage';
import BetRacesPage from '@/pages/public/BetRacesPage';

// Account pages
import ProfilePage from '@/pages/account/ProfilePage';
import NotificationsPage from '@/pages/account/NotificationsPage';
import MyBetsPage from '@/pages/account/MyBetsPage';
import MyWalletPage from '@/pages/account/MyWalletPage';

// Horse Owner
import MyHorsesPage from '@/pages/horse-owner/MyHorsesPage';
import HorseRegisterPage from '@/pages/horse-owner/HorseRegisterPage';
import HorseDetailPage from '@/pages/horse-owner/HorseDetailPage';
import HorseOwnerRacePage from '@/pages/horse-owner/HorseOwnerRacePage';
import MyRaceRegistrationsPage from '@/pages/horse-owner/MyRaceRegistrationsPage';

// Trainer
import TrainerProfilePage from '@/pages/trainer/TrainerProfilePage';

// Referee
import RefereeRacesPage from '@/pages/referee/RefereeRacesPage';

// Admin
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminRaceListPage from '@/pages/admin/AdminRaceListPage';
import AdminCreateRacePage from '@/pages/admin/AdminCreateRacePage';
import AdminEditRacePage from '@/pages/admin/AdminEditRacePage';
import AdminApproveHorsesPage from '@/pages/admin/AdminApproveHorsesPage';
import AdminSetOddsPage from '@/pages/admin/AdminSetOddsPage';
import AdminDepositPage from '@/pages/admin/AdminDepositPage';
import AdminWalletPage from '@/pages/admin/AdminWalletPage';

export default function App() {
 return (
 <ErrorBoundary>
 <ScrollToTop />
 <Routes>
 {/* ── Public (Layout: public header + footer) ───────────────── */}
 <Route path="/" element={<Layout><HomePage /></Layout>} />
 <Route path="/login" element={<LoginPage />} />
 <Route path="/register" element={<RegisterPage />} />
 <Route path="/forgot-password" element={<ForgotPasswordPage />} />
 <Route path="/jockeys" element={<Layout><JockeysPage /></Layout>} />
 <Route path="/races" element={<Layout><RacesPage /></Layout>} />
 <Route path="/races/:id" element={<Layout><RaceDetailPage /></Layout>} />
 <Route path="/bet" element={<Layout><BetHomePage /></Layout>} />
 <Route path="/bet/races" element={<Layout><BetRacesPage /></Layout>} />
 <Route path="/results" element={<Layout><RaceResultsPage /></Layout>} />
 <Route path="/about" element={<Layout><AboutPage /></Layout>} />

 {/* ── Authenticated (AppLayout: sidebar + app header) ───────── */}

 <Route path="/profile" element={
 <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
 } />

 <Route path="/notifications" element={
 <ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>
 } />

 {/* Referee */}
 <Route path="/referee/races" element={
 <ProtectedRoute allowedRoles={['REFEREE']}>
 <AppLayout><RefereeRacesPage /></AppLayout>
 </ProtectedRoute>
 } />

 {/* Horse Owner */}
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
 <ProtectedRoute allowedRoles={['ADMIN']}>
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
 </Routes>
 </ErrorBoundary>
 );
}
