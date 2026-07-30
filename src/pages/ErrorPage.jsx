import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  SearchX,
  ServerCrash,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '../components/ui';
import './ErrorPage.css';

const ErrorShell = ({ icon: Icon, iconBg, code, title, description, children }) => {
  return (
    <div className="error-page">
      <div className="error-page__bg" aria-hidden="true" />
      <div className="error-page__card">
        <span className="error-page__icon" style={{ background: iconBg }}>
          <Icon size={32} />
        </span>
        <p className="error-page__code">Error {code}</p>
        <h1 className="error-page__title">{title}</h1>
        <p className="error-page__description">{description}</p>
        {children}
      </div>
    </div>
  );
};

export const NotFoundPage = () => (
  <ErrorShell
    icon={SearchX}
    iconBg="linear-gradient(135deg, #0EA5E9, #075985)"
    code={404}
    title="Lost in the corridors"
    description="We couldn't find that page. It may have been moved, renamed, or it never existed in the first place."
  >
    <div className="error-page__actions">
      <Link to="/dashboard">
        <Button leftIcon={ArrowLeft} variant="primary">
          Back to dashboard
        </Button>
      </Link>
    </div>
  </ErrorShell>
);

export const ForbiddenPage = () => (
  <ErrorShell
    icon={ShieldAlert}
    iconBg="linear-gradient(135deg, #F59E0B, #B45309)"
    code={403}
    title="Access denied"
    description="Your role doesn't have permission to view this page. Reach out to your administrator if you think this is a mistake."
  >
    <div className="error-page__actions">
      <Link to="/dashboard">
        <Button leftIcon={ArrowLeft} variant="primary">
          Back to dashboard
        </Button>
      </Link>
    </div>
  </ErrorShell>
);

export const ServerErrorPage = () => (
  <ErrorShell
    icon={ServerCrash}
    iconBg="linear-gradient(135deg, #EF4444, #B91C1C)"
    code={500}
    title="Something went wrong on our end"
    description="The Subhan Care team has been notified. Please try again in a moment, or contact support if the problem persists."
  >
    <div className="error-page__actions">
      <button
        type="button"
        className="error-page__primary-btn"
        onClick={() => window.location.reload()}
      >
        Reload page
      </button>
      <Link to="/dashboard">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
    <div className="error-page__contact">
      <p>
        <Mail size={14} aria-hidden="true" /> support@subancare.com
      </p>
      <p>
        <Phone size={14} aria-hidden="true" /> +92 300 000 0000
      </p>
    </div>
  </ErrorShell>
);

export default NotFoundPage;