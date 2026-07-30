import { HeartHandshake, ShieldCheck, Activity, Users } from 'lucide-react';
import Logo from '../ui/Logo';
import './AuthHero.css';

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'HIPAA-aligned access',
    body: 'Role-based controls keep every patient record in the right hands.',
  },
  {
    icon: Activity,
    title: 'Real-time ops',
    body: 'Appointments, vitals, and prescriptions synced across every clinic.',
  },
  {
    icon: Users,
    title: 'Care-team ready',
    body: 'Doctors, reception, pharmacy, and billing — all in one workspace.',
  },
];

/**
 * AuthHero - decorative right-hand panel on the auth layout.
 * Used by Login, Forgot Password, OTP, and Reset Password.
 */
const AuthHero = () => {
  return (
    <div className="auth-hero">
      <div className="auth-hero__overlay" aria-hidden="true" />
      <div className="auth-hero__glow" aria-hidden="true" />
      <div className="auth-hero__content">
        <div className="auth-hero__brand">
          <Logo size="lg" variant="full" />
        </div>

        <div className="auth-hero__topline">
          <HeartHandshake size={18} aria-hidden="true" />
          <span>Caring for patients, the modern way.</span>
        </div>

        <h1 className="auth-hero__title">
          One platform for every <span>Subhan Care</span> hospital team.
        </h1>
        <p className="auth-hero__subtitle">
          A unified workspace that ties together patient management, appointments,
          pharmacy, billing, and reporting — with the security posture healthcare
          demands.
        </p>

        <ul className="auth-hero__highlights">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="auth-hero__highlight">
              <span className="auth-hero__highlight-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <p className="auth-hero__highlight-title">{title}</p>
                <p className="auth-hero__highlight-body">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="auth-hero__quote">
          “With Subhan Care HMS, our team spends less time on paperwork and more time
          with patients.”
          <span>— Internal pilot feedback, 2026</span>
        </p>
      </div>
    </div>
  );
};

export default AuthHero;
