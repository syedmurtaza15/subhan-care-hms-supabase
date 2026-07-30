import { Loader2 } from 'lucide-react';
import { BUTTON_SIZES, BUTTON_VARIANTS } from '../../constants/ui';
import { classNames } from '../../utils/helpers';
import './Button.css';

/**
 * Primary Button component. Implements 5 variants and 3 sizes from the UI guide.
 * Pure presentational - all states (loading / disabled / icon) handled in one place.
 *
 * Props:
 *  - variant (default 'primary')
 *  - size (default 'medium')
 *  - isLoading
 *  - leftIcon / rightIcon (a Lucide icon component)
 *  - fullWidth
 *  - ...rest pass-through to <button>
 */
const Button = ({
  variant = BUTTON_VARIANTS.PRIMARY,
  size = BUTTON_SIZES.MEDIUM,
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={classNames('ui-button', `ui-button--${variant}`, `ui-button--${size}`, {
        'ui-button--full': fullWidth,
        'ui-button--loading': isLoading,
        'ui-button--icon-only': !children && (LeftIcon || RightIcon),
      }, className)}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="ui-button__spinner" aria-hidden="true" />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon size={18} aria-hidden="true" />}
          {children && <span>{children}</span>}
          {RightIcon && <RightIcon size={18} aria-hidden="true" />}
        </>
      )}
    </button>
  );
};

export default Button;
