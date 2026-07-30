import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import useMediaQuery from '../hooks/useMediaQuery';
import './DashboardLayout.css';

const STORAGE_KEY = 'subhan_care.sidebar.collapsed';

const DashboardLayout = () => {
  const location = useLocation();
  const isMobile = !useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch (error) {
      /* ignore */
    }
  }, [collapsed]);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  return (
    <div className={`dashboard-layout ${collapsed && !isMobile ? 'dashboard-layout--collapsed' : ''}`}>
      {!isMobile ? (
        <Sidebar
          collapsed={collapsed}
          isMobile={false}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      ) : mobileOpen ? (
        <>
          <div
            className="dashboard-layout__scrim"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <Sidebar
            isMobile
            collapsed={false}
            onClose={() => setMobileOpen(false)}
          />
        </>
      ) : null}

      <div className="dashboard-layout__main">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          isMobile={isMobile}
          sidebarCollapsed={collapsed}
        />
        <div className="dashboard-layout__content" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
