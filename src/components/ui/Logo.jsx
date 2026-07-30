import { HeartPulse } from 'lucide-react';
import './Logo.css';

/**
 * Brand logo - used in auth layout, navbar, sidebar header.
 * Variants: 'full' (mark + wordmark) or 'mark' (icon only).
 */
const Logo = ({ variant = 'full', size = 'md', tagline = false }) => {
  const sizeClass = `logo--${size}`;
  return (
    <div className={`logo ${sizeClass}`}>
      <span className="logo__mark" aria-hidden="true">
        <HeartPulse size={size === 'sm' ? 18 : size === 'lg' ? 30 : 22} strokeWidth={2.4} />
      </span>
      {variant === 'full' && (
        <div className="logo__text">
          <span className="logo__brand">Subhan Care</span>
          {tagline && <span className="logo__tag">Hospital Management Suite</span>}
        </div>
      )}
    </div>
  );
};

export default Logo;
