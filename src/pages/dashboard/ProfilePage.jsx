import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABEL } from '../../constants/roles';
import { initialsFromName } from '../../utils/helpers';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <Card padding={false} className="profile-page__hero">
        <div className="profile-page__hero-content">
          <span className="profile-page__avatar" aria-hidden="true">
            {initialsFromName(user?.name || 'Guest')}
          </span>
          <div>
            <h1>{user?.name || 'Guest User'}</h1>
            <p>{user?.role ? ROLE_LABEL[user.role] : '—'} · Subhan Care</p>
            <span className="profile-page__verified">
              <ShieldCheck size={14} aria-hidden="true" /> Verified account
            </span>
          </div>
        </div>
      </Card>

      <div className="profile-page__grid">
        <Card title="Contact info" subtitle="How we reach you for notifications and scheduling.">
          <ul className="profile-page__items">
            <li>
              <Mail size={16} aria-hidden="true" />
              <div>
                <p className="profile-page__item-label">Email</p>
                <p className="profile-page__item-value">{user?.email || '—'}</p>
              </div>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <div>
                <p className="profile-page__item-label">Phone</p>
                <p className="profile-page__item-value">+92 300 000 0000</p>
              </div>
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              <div>
                <p className="profile-page__item-label">Branch</p>
                <p className="profile-page__item-value">Subhan Care Central Hospital</p>
              </div>
            </li>
          </ul>
        </Card>

        <Card title="Recent activity" subtitle="Last 24 hours">
          <ul className="profile-page__timeline">
            <li>
              <span className="profile-page__timeline-dot" aria-hidden="true" />
              <div>
                <p>Signed in from a new browser</p>
                <span>2 hours ago · Chrome on macOS</span>
              </div>
            </li>
            <li>
              <span className="profile-page__timeline-dot" aria-hidden="true" />
              <div>
                <p>Password rotated</p>
                <span>1 week ago</span>
              </div>
            </li>
            <li>
              <span className="profile-page__timeline-dot" aria-hidden="true" />
              <div>
                <p>Two-factor authentication enabled</p>
                <span>2 weeks ago</span>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
