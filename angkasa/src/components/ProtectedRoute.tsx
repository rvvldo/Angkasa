import { MAINTENANCE_CONFIG } from '../config/maintenance';
import MaintenancePage from '../pages/MaintenancePage';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { user, /*isEmailVerified,*/ loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

//  if (!isEmailVerified) {
//    return <Navigate to="/verify-email" replace />;
//  }

  if (MAINTENANCE_CONFIG.user) {
    return <MaintenancePage />;
  }

  return <Outlet />;
}