import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './Select.css';

const Select = forwardRef(function Select(
  {
    label,
    helperText,
    error,
    options = [],
    placeholder = 'Select an option',
    required,
    fullWidth = true,
    className,
    id,
    name,
    value,
    onChange,
    onBlur,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = id || `select-${name || Math.random().toString(36).slice(2, 8)}`;
  const isPlaceholder = !value;

  return (
    <div className={classNames('ui-select', { 'ui-select--full': fullWidth, 'ui-select--error': Boolean(error) }, className)}>
      {label && (
        <label htmlFor={generatedId} className="ui-select__label">
          {label}
          {required && <span className="ui-select__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="ui-select__shell">
        <select
          ref={ref}
          id={generatedId}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={classNames('ui-select__field', { 'ui-select__field--placeholder': isPlaceholder })}
          aria-invalid={Boolean(error)}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown size={16} className="ui-select__chevron" aria-hidden="true" />
      </div>
      {error ? (
        <p className="ui-select__error">{error}</p>
      ) : helperText ? (
        <p className="ui-select__helper">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;