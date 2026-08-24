import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../context/PermissionContext';
import AccessDenied from './AccessDenied';

const PermissionRoute = ({ children, permission, anyPermission, fallback }) => {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasAccess = permission
    ? hasPermission(permission)
    : anyPermission
    ? hasAnyPermission(...anyPermission)
    : true;

  if (!hasAccess) {
    if (fallback) return <AccessDenied />;
    return <AccessDenied />;
  }

  return children || <Outlet />;
};

export default PermissionRoute;
