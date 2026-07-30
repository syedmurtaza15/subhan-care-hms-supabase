import { classNames } from '../../utils/helpers';
import './StatusBadge.css';

const VARIANTS = {
  // neutral
  default: 'default',
  // status
  active: 'active',
  inactive: 'inactive',
  confirmed: 'active',
  pending: 'pending',
  waiting: 'pending',
  cancelled: 'inactive',
  completed: 'completed',
  followup: 'followup',
  // finance
  paid: 'paid',
  unpaid: 'unpaid',
  overdue: 'overdue',
  partial: 'partial',
  refunded: 'refunded',
  // priority
  high: 'high',
  medium: 'medium',
  low: 'low',
  // generic colors
  primary: 'primary',
  secondary: 'secondary',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  success: 'active',
};

const StatusBadge = ({ tone = 'default', size = 'md', children, dot = true, className }) => {
  const mappedTone = VARIANTS[tone] || VARIANTS.default;
  return (
    <span className={classNames('status-badge', `status-badge--${mappedTone}`, `status-badge--${size}`, className)}>
      {dot && <span className="status-badge__dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default StatusBadge;