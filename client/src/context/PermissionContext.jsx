import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

const PermissionContext = createContext(null);

const VALID_ADMIN_ROLES = ['admin', 'super_admin', 'receptionist', 'content_manager', 'accountant'];

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPermissions = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setPermissions(data.permissions || []);
            setRole(data.role || null);
          }
        } else {
          if (active) {
            setPermissions([]);
            setRole(null);
          }
        }
      } catch {
        if (active) {
          setPermissions([]);
          setRole(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPermissions();
    return () => { active = false; };
  }, []);

  const hasPermission = useCallback((permissionKey) => {
    if (role === 'super_admin') return true;
    if (permissions.includes(permissionKey)) return true;
    const module = permissionKey.split('.')[0];
    if (permissions.includes(module + '.*')) return true;
    if (permissions.includes('*')) return true;
    return false;
  }, [permissions, role]);

  const hasAnyPermission = useCallback((...permissionKeys) => {
    return permissionKeys.some(pk => hasPermission(pk));
  }, [hasPermission]);

  const value = {
    permissions,
    role,
    loading,
    hasPermission,
    hasAnyPermission,
    isAdmin: VALID_ADMIN_ROLES.includes(role),
    isSuperAdmin: role === 'super_admin',
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

export default PermissionContext;
