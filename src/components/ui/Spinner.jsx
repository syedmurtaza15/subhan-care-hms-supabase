import { Loader2 } from 'lucide-react';
import { SPINNER_SIZES } from '../../constants/ui';
import { classNames } from '../../utils/helpers';
import './Spinner.css';

const SIZE_MAP = {
  [SPINNER_SIZES.SMALL]: 16,
  [SPINNER_SIZES.MEDIUM]: 24,
  [SPINNER_SIZES.LARGE]: 36,
};

const Spinner = ({ size = SPINNER_SIZES.MEDIUM, label, className, ...rest }) => {
  const dimension = SIZE_MAP[size] || SIZE_MAP[SPINNER_SIZES.MEDIUM];
  return (
    <span
      role="status"
      className={classNames('ui-spinner', `ui-spinner--${size}`, className)}
      {...rest}
    >
      <Loader2 size={dimension} className="ui-spinner__icon" aria-hidden="true" />
      {label && <span className="ui-spinner__label">{label}</span>}
      <span className="visually-hidden">{label || 'Loading…'}</span>
    </span>
  );
};

export default Spinner;
