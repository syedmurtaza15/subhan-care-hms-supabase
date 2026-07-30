import { CalendarClock, Clock, Plus, MapPin, Video } from 'lucide-react';
import { Card } from '../../components/ui';
import './PlaceholderPage.css';

const APPOINTMENTS = [
  { time: '09:00 AM', patient: 'Aisha Mehmood', doctor: 'Dr. Hamza Iqbal', status: 'Confirmed', mode: 'in-person' },
  { time: '09:30 AM', patient: 'Bilal Khan', doctor: 'Dr. Sana Yousuf', status: 'Waiting', mode: 'video' },
  { time: '10:15 AM', patient: 'Hira Tariq', doctor: 'Dr. Usman Ghani', status: 'Confirmed', mode: 'in-person' },
  { time: '11:00 AM', patient: 'Imran Aziz', doctor: 'Dr. Hamza Iqbal', status: 'Follow-up', mode: 'video' },
  { time: '11:45 AM', patient: 'Sana Iqbal', doctor: 'Dr. Sana Yousuf', status: 'Confirmed', mode: 'in-person' },
];

const AppointmentsPage = () => {
  return (
    <div className="placeholder-page">
      <header className="placeholder-page__header">
        <div>
          <span className="placeholder-page__eyebrow">Scheduling</span>
          <h1>Appointments</h1>
          <p>Today&apos;s queue across all departments. Slot conflicts and double bookings are blocked automatically.</p>
        </div>
        <button type="button" className="placeholder-page__cta">
          <Plus size={16} aria-hidden="true" /> Book appointment
        </button>
      </header>

      <div className="appointments-grid">
        <Card title="Today&apos;s queue" subtitle={`${APPOINTMENTS.length} appointments scheduled`} padding={false}>
          <ul className="appointments-list">
            {APPOINTMENTS.map((appt, index) => (
              <li className="appointments-list__item" key={`${appt.time}-${index}`}>
                <div className="appointments-list__time">
                  <Clock size={14} aria-hidden="true" /> {appt.time}
                </div>
                <div className="appointments-list__body">
                  <p className="appointments-list__title">{appt.patient}</p>
                  <p className="appointments-list__sub">
                    with <strong>{appt.doctor}</strong>
                  </p>
                </div>
                <span className={`appointments-list__mode appointments-list__mode--${appt.mode}`}>
                  {appt.mode === 'video' ? (
                    <Video size={12} aria-hidden="true" />
                  ) : (
                    <MapPin size={12} aria-hidden="true" />
                  )}
                  {appt.mode === 'video' ? 'Video' : 'On-site'}
                </span>
                <span className={`appointments-list__status appointments-list__status--${appt.status.toLowerCase()}`}>
                  <CalendarClock size={12} aria-hidden="true" /> {appt.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsPage;
