import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { initialsFromName } from '../../utils/helpers';
import { classNames } from '../../utils/helpers';
import { ROLE_LABEL } from '../../constants/roles';
import './Navbar.css';

const NOTIFICATIONS = [
  {
    id: 'n-1',
    title: '3 appointments due today',
    detail: 'Dr. Iqbal has 6 patients scheduled before noon.',
    time: '8m ago',
    unread: true,
  },
  {
    id: 'n-2',
    title: 'New lab results uploaded',
    detail: 'CBC + Lipid panel for patient Aisha Mehmood.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'n-3',
    title: 'Inventory low — Paracetamol 500mg',
    detail: 'Only 14 packs left. Reorder threshold is 30.',
    time: '3h ago',
    unread: false,
  },
];

/**
 * Top navigation bar used inside the DashboardLayout.
 * Holds menu toggle, search, theme switch, notifications and user menu.
 */
const Navbar = ({ onToggleSidebar, isMobile, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const closeMenus = useCallback(() => {
    setNotifOpen(false);
    setUserMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        closeMenus();
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [closeMenus]);

  const unreadCount = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/login', { replace: true });
  };

  const initials = initialsFromName(user?.name || 'User');
  const roleLabel = user?.role ? ROLE_LABEL[user.role] : '';

  return (
    <header className="navbar" role="banner">
      <div className="navbar__left">
        <button
          type="button"
          className="navbar__menu-btn"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>
        <div className="navbar__brand">
          {(!isMobile || sidebarCollapsed) && <Logo size="sm" />}
        </div>
      </div>

      <div className="navbar__search">
        <Search size={18} className="navbar__search-icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search patients, doctors, invoices, reports…"
          aria-label="Global search"
          className="navbar__search-input"
        />
        <kbd className="navbar__search-kbd">⌘K</kbd>
      </div>

      <div className="navbar__actions">
        <button
          type="button"
          className="navbar__icon-btn"
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="navbar__menu-wrap" ref={notifRef}>
          <button
            type="button"
            className="navbar__icon-btn navbar__notification-btn"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setUserMenuOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="navbar__notification-dot">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="navbar__dropdown navbar__dropdown--notifications">
              <header className="navbar__dropdown-header">
                <span>Notifications</span>
                <button type="button" className="navbar__dropdown-link">
                  Mark all read
                </button>
              </header>
              <ul className="navbar__notification-list">
                {NOTIFICATIONS.map((item) => (
                  <li
                    key={item.id}
                    className={classNames('navbar__notification-item', {
                      'navbar__notification-item--unread': item.unread,
                    })}
                  >
                    <p className="navbar__notification-title">{item.title}</p>
                    <p className="navbar__notification-detail">{item.detail}</p>
                    <span className="navbar__notification-time">{item.time}</span>
                  </li>
                ))}
              </ul>
              <footer className="navbar__dropdown-footer">
                <Link to="/dashboard/notifications">View all activity</Link>
              </footer>
            </div>
          )}
        </div>

        <div className="navbar__menu-wrap" ref={userMenuRef}>
          <button
            type="button"
            className="navbar__user"
            onClick={() => {
              setUserMenuOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
          >
            <span className="navbar__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="navbar__user-meta">
              <span className="navbar__user-name">{user?.name || 'Guest'}</span>
              <span className="navbar__user-role">{roleLabel}</span>
            </span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {userMenuOpen && (
            <div className="navbar__dropdown navbar__dropdown--user">
              <div className="navbar__user-card">
                <span className="navbar__avatar navbar__avatar--lg" aria-hidden="true">
                  {initials}
                </span>
                <div>
                  <p className="navbar__user-name">{user?.name || 'Guest'}</p>
                  <p className="navbar__user-role">{user?.email}</p>
                </div>
              </div>
              <ul className="navbar__user-menu">
                <li>
                  <Link to="/dashboard/profile" onClick={closeMenus}>
                    <User size={16} aria-hidden="true" /> My Profile
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/settings" onClick={closeMenus}>
                    <Settings size={16} aria-hidden="true" /> Settings
                  </Link>
                </li>
                <li>
                  <button type="button" className="navbar__user-action navbar__user-action--danger" onClick={handleLogout}>
                    <LogOut size={16} aria-hidden="true" /> Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
