import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import AuthHero from '../components/auth/AuthHero';
import './AuthLayout.css';

/**
 * AuthLayout - two-column shell for Login / Forgot / OTP / Reset flows.
 * Mobile collapses to a stacked layout with brand-on-top + form below.
 */
const AuthLayout = ({ children, subtitle }) => {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__left">
        <div className="auth-layout__brand">
          <Link to="/" aria-label="Subhan Care home">
            <Logo size="md" variant="full" />
          </Link>
          <span className="auth-layout__chip">v2.0</span>
        </div>
        <main className="auth-layout__panel" role="main">
          <div className="auth-layout__panel-inner">{children}</div>
        </main>
        <footer className="auth-layout__footer">
          <div className="auth-layout__footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Support</a>
          </div>
          <p>© {new Date().getFullYear()} Subhan Care Hospital Network. All rights reserved.</p>
        </footer>
      </aside>
      <aside className="auth-layout__hero" aria-hidden={false}>
        <AuthHero />
      </aside>
    </div>
  );
};

export default AuthLayout;
