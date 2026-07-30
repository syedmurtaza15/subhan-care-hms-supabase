import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { INPUT_TYPES } from '../../constants/ui';
import { classNames } from '../../utils/helpers';
import './Input.css';

/**
 * Input component - single-line text input with optional label, helper text,
 * error message, left/right adornments, and a password show/hide toggle.
 */
const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    type = INPUT_TYPES.TEXT,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    id,
    name,
    autoComplete,
    required,
    className,
    inputClassName,
    fullWidth = true,
    ...rest
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === INPUT_TYPES.PASSWORD;
  const effectiveType = isPassword && showPassword ? INPUT_TYPES.TEXT : type;
  const generatedId = id || `input-${name || Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={classNames('ui-input', { 'ui-input--full': fullWidth, 'ui-input--error': Boolean(error) }, className)}>
      {label && (
        <label htmlFor={generatedId} className="ui-input__label">
          {label}
          {required && <span className="ui-input__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="ui-input__shell">
        {LeftIcon && (
          <span className="ui-input__icon ui-input__icon--left" aria-hidden="true">
            <LeftIcon size={18} />
          </span>
        )}
        <input
          ref={ref}
          id={generatedId}
          name={name}
          type={effectiveType}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
          className={classNames(
            'ui-input__field',
            { 'ui-input__field--with-left': LeftIcon, 'ui-input__field--with-right': isPassword || RightIcon },
            inputClassName,
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="ui-input__icon ui-input__icon--right"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {!isPassword && RightIcon && (
          <span className="ui-input__icon ui-input__icon--right" aria-hidden="true">
            <RightIcon size={18} />
          </span>
        )}
      </div>
      {error ? (
        <p id={`${generatedId}-error`} className="ui-input__error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${generatedId}-helper`} className="ui-input__helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
