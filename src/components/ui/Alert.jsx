import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './Alert.css';

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

/**
 * Alert - inline feedback / status banner. Defaults to error for auth flows.
 */
const Alert = ({ type = 'error', title, children, className, ...rest }) => {
  const Icon = ICONS[type] || AlertCircle;
  return (
    <div
      role="alert"
      className={classNames(
        'ui-alert',
        `ui-alert--${type}`,
        className,
      )}
      {...rest}
    >
      <span className="ui-alert__icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className="ui-alert__content">
        {title && <p className="ui-alert__title">{title}</p>}
        <div className="ui-alert__message">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
