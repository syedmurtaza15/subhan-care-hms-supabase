import { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';
import './Textarea.css';

const Textarea = forwardRef(function Textarea(
  {
    label,
    helperText,
    error,
    required,
    fullWidth = true,
    className,
    id,
    name,
    rows = 4,
    ...rest
  },
  ref,
) {
  const generatedId = id || `ta-${name || Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={classNames('ui-textarea', { 'ui-textarea--full': fullWidth, 'ui-textarea--error': Boolean(error) }, className)}>
      {label && (
        <label htmlFor={generatedId} className="ui-textarea__label">
          {label}
          {required && <span className="ui-textarea__required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={generatedId}
        name={name}
        rows={rows}
        className="ui-textarea__field"
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? (
        <p className="ui-textarea__error">{error}</p>
      ) : helperText ? (
        <p className="ui-textarea__helper">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;