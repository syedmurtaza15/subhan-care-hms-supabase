import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarClock,
  FileText,
  Receipt,
  Boxes,
  PieChart,
  Stethoscope,
  Pill,
  ClipboardList,
  Settings,
  BadgeHelp,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';
import Logo from '../ui/Logo';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/helpers';
import './Sidebar.css';

const MENU_GROUPS = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    title: 'Clinical',
    items: [
      { label: 'Patients', path: ROUTES.PATIENTS, icon: Users },
      { label: 'Doctors', path: ROUTES.DOCTORS, icon: Stethoscope, roles: [ROLES.ADMIN] },
      { label: 'Appointments', path: ROUTES.APPOINTMENTS, icon: CalendarClock },
      { label: 'Prescriptions', path: ROUTES.PRESCRIPTIONS, icon: Pill },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Inventory', path: ROUTES.INVENTORY, icon: Boxes },
      { label: 'Billing', path: ROUTES.BILLING, icon: Receipt },
      { label: 'Reports', path: ROUTES.REPORTS, icon: TrendingUp, roles: [ROLES.ADMIN] },
      { label: 'Staff', path: `${ROUTES.DASHBOARD}/staff`, icon: UserCog, roles: [ROLES.ADMIN] },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'My Profile', path: ROUTES.PROFILE, icon: BadgeHelp },
      { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
    ],
  },
];

const Sidebar = ({ collapsed = false, isMobile = false, onClose, onToggleCollapse }) => {
  const { user } = useAuth();

  const filteredGroups = useMemo(() => {
    if (!user?.role) return MENU_GROUPS;
    return MENU_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(user.role),
      ),
    })).filter((group) => group.items.length > 0);
  }, [user?.role]);

  return (
    <aside
      className={classNames('sidebar', {
        'sidebar--collapsed': collapsed && !isMobile,
        'sidebar--mobile': isMobile,
      })}
      aria-label="Primary navigation"
    >
      <div className="sidebar__brand">
        {collapsed && !isMobile ? (
          <Logo size="sm" variant="mark" />
        ) : (
          <Logo size="md" variant="full" tagline />
        )}
        {!isMobile && !collapsed && (
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {isMobile && (
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {!collapsed && !isMobile && (
        <div className="sidebar__role-card">
          <div className="sidebar__role-card-eyebrow">Logged in as</div>
          <div className="sidebar__role-card-name">{user?.name || 'Guest'}</div>
          <div className="sidebar__role-card-role">{user?.department || 'Subhan Care'}</div>
        </div>
      )}

      <nav className="sidebar__nav" aria-label="Main">
        <ul className="sidebar__group-list">
          {filteredGroups.map((group) => (
            <li key={group.title} className="sidebar__group">
              {!collapsed && !isMobile && (
                <p className="sidebar__group-title">{group.title}</p>
              )}
              <ul className="sidebar__item-list">
                {group.items.map(({ label, path, icon: Icon, end }) => {
                  const tooltip = collapsed || isMobile ? label : undefined;
                  return (
                    <li key={path}>
                      <NavLink
                        to={path}
                        end={end}
                        onClick={isMobile ? onClose : undefined}
                        className={({ isActive }) =>
                          classNames('sidebar__item', {
                            'sidebar__item--active': isActive,
                          })
                        }
                        title={tooltip}
                      >
                        <span className="sidebar__item-icon" aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        {(!collapsed && !isMobile) && <span className="sidebar__item-label">{label}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && !isMobile && (
        <div className="sidebar__footer">
          <div className="sidebar__footer-cta">
            <ClipboardList size={18} aria-hidden="true" />
            <div>
              <p className="sidebar__footer-title">All operational</p>
              <p className="sidebar__footer-body">
                Every module from Sprint 1-13 is wired and ready to use.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;