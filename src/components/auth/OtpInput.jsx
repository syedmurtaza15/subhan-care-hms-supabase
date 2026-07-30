import { useCallback, useEffect, useRef } from 'react';
import { classNames } from '../../utils/helpers';
import './OtpInput.css';

const OtpInput = ({ length = 6, value, onChange, autoFocus = true, disabled = false, error = false }) => {
  const refs = useRef([]);

  const focusField = useCallback((index) => {
    if (refs.current[index]) {
      refs.current[index].focus();
      refs.current[index].select?.();
    }
  }, []);

  useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus();
    }
  }, [autoFocus]);

  const chars = (value || '').padEnd(length, ' ').split('');

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const currentValue = (value || '').padEnd(length, ' ').split('');
    currentValue[index] = digit || ' ';
    const next = currentValue.join('').trimEnd();
    onChange?.(next);
    if (digit && index < length - 1) focusField(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      const currentValue = (value || '').padEnd(length, ' ').split('');
      if (currentValue[index]?.trim()) {
        currentValue[index] = ' ';
        onChange?.(currentValue.join('').trimEnd());
      } else if (index > 0) {
        focusField(index - 1);
        const updated = (value || '').padEnd(length, ' ').split('');
        updated[index - 1] = ' ';
        onChange?.(updated.join('').trimEnd());
      }
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      focusField(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      focusField(index + 1);
      event.preventDefault();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange?.(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      focusField(focusIndex);
      event.preventDefault();
    }
  };

  return (
    <div className={classNames('otp-input', { 'otp-input--error': error, 'otp-input--disabled': disabled })}>
      {Array.from({ length }).map((_, index) => {
        const char = (chars[index] || '').trim();
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className="otp-input__cell"
            aria-label={`Digit ${index + 1}`}
          />
        );
      })}
    </div>
  );
};

export default OtpInput;
