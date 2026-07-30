import { forwardRef, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './DateInput.css';

const DateInput = forwardRef(function DateInput(
  {
    label,
    helperText,
    error,
    required,
    fullWidth = true,
    className,
    id,
    name,
    onChange,
    onBlur,
    value,
    min,
    max,
    placeholder = 'YYYY-MM-DD',
    ...rest
  },
  ref,
) {
  const inputRef = useRef(null);
  const setRefs = (node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const generatedId = id || `date-${name || Math.random().toString(36).slice(2, 8)}`;

  const openPicker = () => {
    if (!inputRef.current) return;
    try {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    } catch (err) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={classNames('ui-date', { 'ui-date--full': fullWidth, 'ui-date--error': Boolean(error) }, className)}>
      {label && (
        <label htmlFor={generatedId} className="ui-date__label">
          {label}
          {required && <span className="ui-date__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="ui-date__shell">
        <input
          ref={setRefs}
          id={generatedId}
          name={name}
          type="date"
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          min={min}
          max={max}
          placeholder={placeholder}
          className="ui-date__field"
          {...rest}
        />
        <button
          type="button"
          className="ui-date__picker-btn"
          onClick={openPicker}
          aria-label="Open date picker"
        >
          <Calendar size={16} />
        </button>
      </div>
      {error ? (
        <p className="ui-date__error">{error}</p>
      ) : helperText ? (
        <p className="ui-date__helper">{helperText}</p>
      ) : null}
    </div>
  );
});

export default DateInput;