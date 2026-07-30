import { useState } from 'react';
import {
  Bell,
  Lock,
  Globe,
  Palette,
  Save,
  User,
  ShieldCheck,
  Smartphone,
  Mail,
} from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Select,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './SettingsPage.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

const LANGUAGES = [
  { value: 'en', label: 'English (US)' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'ar', label: 'العربية (Arabic)' },
];

const TIMEZONES = [
  { value: 'PKT', label: 'Pakistan Standard Time (PKT, UTC+5)' },
  { value: 'IST', label: 'India Standard Time (IST, UTC+5:30)' },
  { value: 'GST', label: 'Gulf Standard Time (GST, UTC+4)' },
  { value: 'UTC', label: 'UTC' },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    appointmentReminders: true,
    billingReminders: true,
    inventoryAlerts: true,
  });
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'PKT',
    accent: 'blue',
    density: 'comfortable',
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    loginAlerts: true,
  });

  const handleSave = (label) => {
    toast.success('Settings saved', `${label} updated successfully.`);
  };

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <div>
          <span className="settings-page__eyebrow">Account</span>
          <h1>Settings</h1>
          <p>Personalize how Subhan Care looks, notifies you, and protects your account.</p>
        </div>
      </header>

      <div className="settings-page__tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`settings-page__tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card title="Profile" subtitle="How your name appears across the Subhan Care workspace.">
          <div className="settings-form">
            <div className="settings-form__grid">
              <Input
                label="Full name"
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                leftIcon={Mail}
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                leftIcon={Smartphone}
                placeholder="+92 300 0000000"
              />
              <Input
                label="Department"
                value={profile.department}
                onChange={(event) => setProfile({ ...profile, department: event.target.value })}
              />
            </div>
            <div className="settings-form__actions">
              <Button variant="primary" leftIcon={Save} onClick={() => handleSave('Profile')}>
                Save profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card title="Notifications" subtitle="Pick how Subhan Care reaches you.">
          <ul className="settings-list">
            <li className="settings-list__row">
              <span className="settings-list__icon"><Mail size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Email notifications</p>
                <p className="settings-list__sub">Daily digest at 8:00 AM</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(event) => setNotifications({ ...notifications, email: event.target.checked })}
                />
                <span />
              </label>
            </li>
            <li className="settings-list__row">
              <span className="settings-list__icon"><Smartphone size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">SMS / push notifications</p>
                <p className="settings-list__sub">Real-time alerts on your phone</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(event) => setNotifications({ ...notifications, push: event.target.checked })}
                />
                <span />
              </label>
            </li>
            <li className="settings-list__row">
              <span className="settings-list__icon"><Bell size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Appointment reminders</p>
                <p className="settings-list__sub">Notify 30 minutes before each visit</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={notifications.appointmentReminders}
                  onChange={(event) => setNotifications({ ...notifications, appointmentReminders: event.target.checked })}
                />
                <span />
              </label>
            </li>
            <li className="settings-list__row">
              <span className="settings-list__icon"><Bell size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Billing reminders</p>
                <p className="settings-list__sub">Send reminders for outstanding invoices</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={notifications.billingReminders}
                  onChange={(event) => setNotifications({ ...notifications, billingReminders: event.target.checked })}
                />
                <span />
              </label>
            </li>
            <li className="settings-list__row">
              <span className="settings-list__icon"><Bell size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Inventory alerts</p>
                <p className="settings-list__sub">Low-stock and expiry warnings</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={notifications.inventoryAlerts}
                  onChange={(event) => setNotifications({ ...notifications, inventoryAlerts: event.target.checked })}
                />
                <span />
              </label>
            </li>
          </ul>
          <div className="settings-form__actions">
            <Button variant="primary" leftIcon={Save} onClick={() => handleSave('Notifications')}>
              Save notifications
            </Button>
          </div>
        </Card>
      )}

      {tab === 'preferences' && (
        <Card title="Preferences" subtitle="Make Subhan Care look and feel your way.">
          <div className="settings-form">
            <div className="settings-form__grid">
              <Select
                label="Language"
                name="language"
                value={preferences.language}
                options={LANGUAGES}
                onChange={(event) => setPreferences({ ...preferences, language: event.target.value })}
              />
              <Select
                label="Time zone"
                name="timezone"
                value={preferences.timezone}
                options={TIMEZONES}
                onChange={(event) => setPreferences({ ...preferences, timezone: event.target.value })}
              />
              <Select
                label="UI density"
                name="density"
                value={preferences.density}
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                ]}
                onChange={(event) => setPreferences({ ...preferences, density: event.target.value })}
              />
              <Select
                label="Accent color"
                name="accent"
                value={preferences.accent}
                options={[
                  { value: 'blue', label: 'Subhan Care blue' },
                  { value: 'green', label: 'Forest green' },
                ]}
                onChange={(event) => setPreferences({ ...preferences, accent: event.target.value })}
              />
            </div>
            <div className="settings-form__actions">
              <Button variant="primary" leftIcon={Save} onClick={() => handleSave('Preferences')}>
                Save preferences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'security' && (
        <Card title="Security" subtitle="Protect your Subhan Care account.">
          <ul className="settings-list">
            <li className="settings-list__row">
              <span className="settings-list__icon"><ShieldCheck size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Two-factor authentication</p>
                <p className="settings-list__sub">Add an extra step on sign-in via authenticator app</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={security.twoFactor}
                  onChange={(event) => setSecurity({ ...security, twoFactor: event.target.checked })}
                />
                <span />
              </label>
            </li>
            <li className="settings-list__row">
              <span className="settings-list__icon"><Lock size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Login alerts</p>
                <p className="settings-list__sub">Email when we detect a new device or location</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={security.loginAlerts}
                  onChange={(event) => setSecurity({ ...security, loginAlerts: event.target.checked })}
                />
                <span />
              </label>
            </li>
            <li className="settings-list__row settings-list__row--wide">
              <span className="settings-list__icon"><Globe size={16} aria-hidden="true" /></span>
              <div>
                <p className="settings-list__title">Session timeout (minutes)</p>
                <p className="settings-list__sub">Sign out automatically after this period of inactivity</p>
              </div>
              <Input
                type="number"
                value={security.sessionTimeout}
                onChange={(event) => setSecurity({ ...security, sessionTimeout: event.target.value })}
              />
            </li>
          </ul>
          <div className="settings-form__actions">
            <Button variant="primary" leftIcon={Save} onClick={() => handleSave('Security')}>
              Save security
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;