import { UserCog, Stethoscope, ClipboardList, Pill, Receipt } from 'lucide-react';
import { ROLE_LABEL, ROLES } from '../../constants/roles';
import { classNames } from '../../utils/helpers';
import './RoleSelector.css';

const ROLE_ICONS = {
  [ROLES.ADMIN]: UserCog,
  [ROLES.DOCTOR]: Stethoscope,
  [ROLES.RECEPTIONIST]: ClipboardList,
  [ROLES.PHARMACIST]: Pill,
  [ROLES.BILLING_STAFF]: Receipt,
};

/**
 * RoleSelector - quick role-select pill row shown on the Login screen.
 * Pre-fills the email/password fields with demo credentials per role.
 */
const RoleSelector = ({ activeRole, onSelect }) => {
  const roles = Object.values(ROLES);
  return (
    <div className="role-selector" role="radiogroup" aria-label="Demo role selection">
      <p className="role-selector__label">Sign in as</p>
      <div className="role-selector__pills">
        {roles.map((role) => {
          const Icon = ROLE_ICONS[role] || UserCog;
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={classNames('role-selector__pill', { 'role-selector__pill--active': isActive })}
              onClick={() => onSelect(role)}
            >
              <Icon size={14} aria-hidden="true" />
              <span>{ROLE_LABEL[role]}</span>
            </button>
          );
        })}
      </div>
      <p className="role-selector__hint">
        Demo credentials auto-fill when you pick a role. Tap to switch between roles.
      </p>
    </div>
  );
};

export default RoleSelector;
