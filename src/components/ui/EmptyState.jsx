import { classNames } from '../../utils/helpers';
import './EmptyState.css';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}) => {
  return (
    <div className={classNames('empty-state', `empty-state--${size}`, className)}>
      {Icon && (
        <span className="empty-state__icon" aria-hidden="true">
          <Icon size={32} />
        </span>
      )}
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;