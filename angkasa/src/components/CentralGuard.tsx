import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function CentralGuard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check session storage
    const auth = sessionStorage.getItem('central_admin_auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  if (isAuthenticated === null) {
    return null; // or loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/central/login" replace />;
  }

  return <Outlet />;
}
