import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAdminToken, clearAdminSession, apiFetch } from '../utils/api';

const VALID_ADMIN_ROLES = ['admin', 'super_admin', 'receptionist', 'content_manager', 'accountant'];

const AdminRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const token = getAdminToken();
    const storedUser = localStorage.getItem('adminUser');

    const validate = async () => {
      if (!token || !storedUser) {
        if (active) setIsAuthenticated(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        if (!VALID_ADMIN_ROLES.includes(parsedUser.role)) {
          if (active) setIsAuthenticated(false);
          return;
        }

        const res = await apiFetch('/api/auth/me');
        if (!res.ok) {
          clearAdminSession();
          if (active) setIsAuthenticated(false);
          return;
        }

        const data = await res.json();
        if (!active) return;
        setUser(data || parsedUser);
        setIsAuthenticated(true);
      } catch {
        if (active) setIsAuthenticated(false);
      }
    };

    validate();
    return () => { active = false; };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet context={{ user }} />;
};

export default AdminRoute;
