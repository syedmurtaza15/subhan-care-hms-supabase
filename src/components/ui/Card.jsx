import { classNames } from '../../utils/helpers';
import './Card.css';

/**
 * Card - surface container using the UI Guide's 10px radius + 20px padding.
 * Optional title, subtitle, and action slot for header buttons.
 */
const Card = ({
  title,
  subtitle,
  action,
  children,
  elevation = 'md',
  padding = true,
  className,
  ...rest
}) => {
  return (
    <section
      className={classNames(
        'ui-card',
        `ui-card--${elevation}`,
        { 'ui-card--no-padding': !padding },
        className,
      )}
      {...rest}
    >
      {(title || subtitle || action) && (
        <header className="ui-card__header">
          <div className="ui-card__heading">
            {title && <h3 className="ui-card__title">{title}</h3>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="ui-card__action">{action}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
};

export default Card;
