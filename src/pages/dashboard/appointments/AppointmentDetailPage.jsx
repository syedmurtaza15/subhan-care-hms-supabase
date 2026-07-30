import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Pencil,
  Trash2,
  XCircle,
  User,
  Stethoscope,
  FileText,
} from 'lucide-react';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Modal,
  StatusBadge,
} from '../../../components/ui';
import {
  useAppointments,
  useDoctors,
  usePatients,
} from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate, formatTime, initialsFromName } from '../../../utils/helpers';
import AppointmentForm from './AppointmentForm';
import './AppointmentDetailPage.css';

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const appointments = useAppointments();
  const { list: listDoctors } = useDoctors();
  const { list: listPatients } = usePatients();
  const toast = useToast();

  const appt = appointments.find(id);
  const patient = appt ? listPatients().find((p) => p.id === appt.patientId) : null;
  const doctor = appt ? listDoctors().find((d) => d.id === appt.doctorId) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!appt) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="Appointment not found"
        description={`No appointment with ID ${id}.`}
        action={
          <Link to="/dashboard/appointments">
            <Button variant="primary" leftIcon={ArrowLeft}>
              Back to appointments
            </Button>
          </Link>
        }
      />
    );
  }

  const handleSave = async (values) => {
    await appointments.update(appt.id, values);
    toast.success('Appointment updated', `${appt.id} has been rescheduled.`);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await appointments.remove(appt.id);
    toast.success('Appointment removed', `${appt.id} has been deleted.`);
    navigate('/dashboard/appointments', { replace: true });
  };

  const handleCancel = async () => {
    await appointments.update(appt.id, { status: 'cancelled' });
    toast.warning('Appointment cancelled', `${appt.id} marked as cancelled.`);
  };

  return (
    <div className="appointment-detail">
      <Link to="/dashboard/appointments" className="appointment-detail__back">
        <ArrowLeft size={16} aria-hidden="true" /> All appointments
      </Link>

      <Card padding={false} className="appointment-detail__hero">
        <div className="appointment-detail__hero-content">
          <div className="appointment-detail__hero-meta">
            <span className="appointment-detail__pill">{appt.id}</span>
            <h1>{formatDate(appt.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h1>
            <p>
              {formatTime(`1970-01-01T${appt.time}:00`)} · {appt.duration} min ·{' '}
              {appt.mode === 'video' ? (
                <span className="appointment-detail__mode"><Video size={12} aria-hidden="true" /> Video</span>
              ) : (
                <span className="appointment-detail__mode"><MapPin size={12} aria-hidden="true" /> On-site</span>
              )}
            </p>
            <div className="appointment-detail__tags">
              <StatusBadge tone={appt.status}>{appt.status}</StatusBadge>
            </div>
          </div>
          <div className="appointment-detail__hero-actions">
            <Button variant="outline" leftIcon={Pencil} onClick={() => setEditOpen(true)}>
              Reschedule
            </Button>
            {appt.status !== 'cancelled' && (
              <Button variant="ghost" leftIcon={XCircle} onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button variant="danger" leftIcon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="appointment-detail__grid">
        <Card title="Patient" subtitle="Who's this appointment for.">
          {patient ? (
            <Link to={`/dashboard/patients/${patient.id}`} className="appointment-detail__link-card">
              <span className="appointment-detail__avatar">{initialsFromName(patient.name)}</span>
              <div>
                <p className="appointment-detail__name">{patient.name}</p>
                <p className="appointment-detail__meta">
                  {patient.id} · {patient.age} yrs · {patient.gender}
                </p>
              </div>
            </Link>
          ) : (
            <p className="appointment-detail__empty">Patient record not found.</p>
          )}
        </Card>

        <Card title="Doctor" subtitle="Who's leading the consultation.">
          {doctor ? (
            <Link to={`/dashboard/doctors/${doctor.id}`} className="appointment-detail__link-card">
              <span className="appointment-detail__avatar appointment-detail__avatar--secondary">
                {initialsFromName(doctor.name)}
              </span>
              <div>
                <p className="appointment-detail__name">{doctor.name}</p>
                <p className="appointment-detail__meta">
                  {doctor.specialization} · {doctor.experience} yrs experience
                </p>
              </div>
            </Link>
          ) : (
            <p className="appointment-detail__empty">Doctor record not found.</p>
          )}
        </Card>
      </div>

      <Card title="Reason for visit" subtitle="What the patient needs from this appointment.">
        <p className="appointment-detail__reason">{appt.reason}</p>
        {appt.notes && (
          <div className="appointment-detail__notes">
            <p className="appointment-detail__notes-label">
              <FileText size={14} aria-hidden="true" /> Additional notes
            </p>
            <p>{appt.notes}</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Reschedule appointment"
        subtitle="Update date, time, doctor or status."
        size="lg"
      >
        <AppointmentForm
          initialValues={appt}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete appointment?"
        confirmLabel="Delete appointment"
        body={
          <>
            You&apos;re about to permanently delete <strong>{appt.id}</strong>. This action cannot be
            undone.
          </>
        }
      />
    </div>
  );
};

export default AppointmentDetailPage;