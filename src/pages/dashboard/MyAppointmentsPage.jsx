import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  XCircle,
  Stethoscope,
  CalendarCheck,
  CalendarDays,
} from 'lucide-react';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  StatusBadge,
} from '../../components/ui';
import { useAppointments, useDoctors, usePatients } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/helpers';
import './MyAppointmentsPage.css';

const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const appointments = useAppointments();
  const { list: listDoctors } = useDoctors();
  const { list: listPatients } = usePatients();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(null);

  const doctors = listDoctors();
  const patients = listPatients();

  // Find the patient record that matches this user's email, then filter appointments by that patient ID
  const myAppointments = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    if (!userEmail) return [];

    // Find the patient whose email matches the logged-in user
    const myPatient = patients.find(
      (p) => p.email?.toLowerCase() === userEmail
    );

    if (!myPatient) return [];

    return appointments
      .list()
      .filter((a) => a.patientId === myPatient.id)
      .sort((a, b) =>
        `${b.appointmentDate || ''}${b.appointmentTime || ''}`.localeCompare(
          `${a.appointmentDate || ''}${a.appointmentTime || ''}`
        )
      );
  }, [appointments, patients, user?.email]);

  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || 'Unknown';

  const upcoming = myAppointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed'
  );
  const past = myAppointments.filter(
    (a) => a.status === 'cancelled' || a.status === 'completed'
  );

  const handleCancel = async (appt) => {
    try {
      await appointments.update(appt.id, { status: 'cancelled' });
      toast.warning('Appointment cancelled', `${appt.id} marked as cancelled.`);
      setCancelling(null);
    } catch (error) {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const renderAppointment = (appt) => (
    <article key={appt.id} className="my-appointments__item">
      <div className="my-appointments__time">
        <strong>{formatTime(`1970-01-01T${appt.appointmentTime || appt.time}:00`)}</strong>
        <span>{formatDate(appt.appointmentDate || appt.date)}</span>
      </div>
      <div className="my-appointments__body">
        <div className="my-appointments__id-row">
          <span className="my-appointments__id">{appt.id}</span>
          <StatusBadge tone={appt.status}>{appt.status}</StatusBadge>
        </div>
        <p className="my-appointments__doctor">
          <Stethoscope size={14} aria-hidden="true" /> {doctorName(appt.doctorId)}
        </p>
        <p className="my-appointments__meta">
          {appt.duration} min ·{' '}
          {appt.mode === 'video' ? (
            <span className="my-appointments__mode my-appointments__mode--video">
              <Video size={11} aria-hidden="true" /> Video
            </span>
          ) : (
            <span className="my-appointments__mode my-appointments__mode--in-person">
              <MapPin size={11} aria-hidden="true" /> On-site
            </span>
          )}
        </p>
        <p className="my-appointments__reason">{appt.reason}</p>
      </div>
      {appt.status !== 'cancelled' && appt.status !== 'completed' && (
        <div className="my-appointments__actions">
          <Button
            variant="ghost"
            size="small"
            leftIcon={XCircle}
            onClick={() => setCancelling(appt)}
          >
            Cancel
          </Button>
        </div>
      )}
    </article>
  );

  return (
    <div className="my-appointments-page">
      <header className="my-appointments-page__header">
        <div>
          <span className="my-appointments-page__eyebrow">My Schedule</span>
          <h1>My Appointments</h1>
          <p>View and manage your upcoming and past appointments at Subhan Care.</p>
        </div>
      </header>

      <section className="my-appointments-page__stats">
        <div className="my-appointments-page__stat">
          <CalendarCheck size={18} aria-hidden="true" />
          <div>
            <p className="my-appointments-page__stat-label">Upcoming</p>
            <p className="my-appointments-page__stat-value">{upcoming.length}</p>
          </div>
        </div>
        <div className="my-appointments-page__stat">
          <CalendarDays size={18} aria-hidden="true" />
          <div>
            <p className="my-appointments-page__stat-label">Past / Cancelled</p>
            <p className="my-appointments-page__stat-value">{past.length}</p>
          </div>
        </div>
      </section>

      <Card title="Upcoming appointments" subtitle="Your scheduled consultations.">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No upcoming appointments"
            description="You don't have any scheduled appointments right now."
          />
        ) : (
          <div className="my-appointments__list">
            {upcoming.map(renderAppointment)}
          </div>
        )}
      </Card>

      {past.length > 0 && (
        <Card title="Past appointments" subtitle="Completed and cancelled consultations.">
          <div className="my-appointments__list">
            {past.map(renderAppointment)}
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => handleCancel(cancelling)}
        variant="danger"
        title="Cancel appointment?"
        confirmLabel="Cancel appointment"
        body={
          <>
            You're about to cancel appointment <strong>{cancelling?.id}</strong>.
          </>
        }
      />
    </div>
  );
};

export default MyAppointmentsPage;