import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
 children: ReactNode;
 allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
 const { user, isAuthenticated, isLoading } = useAuth();

 if (isLoading) {
 return (
 <div className="">
 <LoadingSpinner size="lg" />
 </div>
 );
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 if (allowedRoles && user && !allowedRoles.includes(user.role)) {
 return <Navigate to="/" replace />;
 }

 return <>{children}</>;
}
