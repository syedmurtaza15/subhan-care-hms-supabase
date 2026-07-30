import { forwardRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './SearchInput.css';

const SearchInput = forwardRef(function SearchInput(
  { value, onChange, onClear, placeholder = 'Search…', className, inputClassName, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={classNames('ui-search', { 'ui-search--focused': focused }, className)}>
      <Search size={16} className="ui-search__icon" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={classNames('ui-search__input', inputClassName)}
        {...rest}
      />
      {value && (
        <button
          type="button"
          className="ui-search__clear"
          onClick={() => {
            onChange?.({ target: { value: '' } });
            onClear?.();
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});

export default SearchInput;