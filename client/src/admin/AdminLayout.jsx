import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    if (!token) { navigate('/admin/login'); return; }
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser({ name: 'Admin', role: 'admin' }); }
    }
  }, [navigate]);

  useEffect(() => {
    const handler = () => setCommandPaletteOpen(true);
    document.addEventListener('open-command-palette', handler);
    return () => document.removeEventListener('open-command-palette', handler);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    if (window.innerWidth < 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar
        collapsed={window.innerWidth < 1024 ? !mobileMenuOpen : sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div
        className={`transition-all duration-300 ${
          window.innerWidth < 1024
            ? ''
            : sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        <TopBar onMenuToggle={handleSidebarToggle} user={user} onOpenSearch={() => setCommandPaletteOpen(true)} />
        <main className="p-4 lg:p-6 max-w-[1600px]">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

export default AdminLayout;
