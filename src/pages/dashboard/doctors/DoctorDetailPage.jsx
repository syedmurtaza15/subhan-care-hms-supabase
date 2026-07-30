import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Calendar,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Stethoscope,
  Clock,
  Plus,
  User,
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
  useDoctors,
  useAppointments,
  usePatients,
} from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { initialsFromName, formatDate, formatTime } from '../../../utils/helpers';
import DoctorForm from './DoctorForm';
import './DoctorDetailPage.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctors = useDoctors();
  const { list: listAppointments } = useAppointments();
  const { list: listPatients } = usePatients();
  const toast = useToast();

  const doctor = doctors.find(id);
  const appointments = listAppointments().filter((a) => a.doctorId === id);
  const patients = listPatients();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'confirmed' || a.status === 'waiting' || a.status === 'followup')
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments],
  );

  if (!doctor) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="Doctor not found"
        description={`No doctor with ID ${id} is on the roster.`}
        action={
          <Link to="/dashboard/doctors">
            <Button variant="primary" leftIcon={ArrowLeft}>
              Back to roster
            </Button>
          </Link>
        }
      />
    );
  }

  const patientName = (patientId) => {
    const p = patients.find((x) => x.id === patientId);
    return p ? p.name : 'Unknown';
  };

  const handleSave = async (values) => {
    await doctors.update(doctor.id, values);
    toast.success('Doctor updated', `${values.name}'s profile has been saved.`);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await doctors.remove(doctor.id);
    toast.success('Doctor removed', `${doctor.name} was removed from the roster.`);
    navigate('/dashboard/doctors', { replace: true });
  };

  return (
    <div className="doctor-detail">
      <Link to="/dashboard/doctors" className="doctor-detail__back">
        <ArrowLeft size={16} aria-hidden="true" /> Doctor roster
      </Link>

      <Card padding={false} className="doctor-detail__hero">
        <div className="doctor-detail__hero-content">
          <span className="doctor-detail__avatar">{initialsFromName(doctor.name)}</span>
          <div>
            <h1>{doctor.name}</h1>
            <p>{doctor.specialization} · {doctor.experience} yrs experience</p>
            <div className="doctor-detail__tags">
              <StatusBadge tone={doctor.status}>{doctor.status}</StatusBadge>
              <span className="doctor-detail__chip">
                <Award size={12} aria-hidden="true" /> Fee Rs {doctor.consultationFee.toLocaleString()}
              </span>
              <span className="doctor-detail__chip">
                <Clock size={12} aria-hidden="true" /> {doctor.schedule?.startTime} - {doctor.schedule?.endTime}
              </span>
            </div>
          </div>
          <div className="doctor-detail__hero-actions">
            <Button variant="outline" leftIcon={Pencil} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" leftIcon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="doctor-detail__grid">
        <Card title="Contact" subtitle="How patients and staff can reach this clinician.">
          <ul className="doctor-detail__contact">
            <li>
              <Mail size={16} aria-hidden="true" />
              <div>
                <span>Email</span>
                <strong>{doctor.email}</strong>
              </div>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <div>
                <span>Phone</span>
                <strong>{doctor.phone}</strong>
              </div>
            </li>
          </ul>
        </Card>

        <Card title="Schedule & Availability" subtitle="When patients can book this doctor.">
          <div className="doctor-detail__schedule">
            <div className="doctor-detail__schedule-row">
              <span>Working hours</span>
              <strong>
                {doctor.schedule?.startTime || '—'} - {doctor.schedule?.endTime || '—'}
              </strong>
            </div>
            <div className="doctor-detail__schedule-row">
              <span>Slot length</span>
              <strong>{doctor.schedule?.slotMinutes || 30} minutes</strong>
            </div>
            <div className="doctor-detail__schedule-days">
              {WEEKDAYS.map((day) => {
                const active = doctor.availability?.includes(day);
                return (
                  <span
                    key={day}
                    className={`doctor-detail__day ${active ? 'is-active' : ''}`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="doctor-detail__bio">{doctor.bio || 'No biography added yet.'}</p>
        </Card>
      </div>

      <Card
        title="Upcoming appointments"
        subtitle={`${upcoming.length} scheduled`}
        action={
          <Link to={`/dashboard/appointments/new?doctorId=${doctor.id}`}>
            <Button variant="primary" size="small" leftIcon={Plus}>
              Book appointment
            </Button>
          </Link>
        }
      >
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            size="sm"
            title="No upcoming appointments"
            description="This doctor's calendar is empty."
          />
        ) : (
          <ul className="doctor-detail__appts">
            {upcoming.map((appt) => (
              <li key={appt.id}>
                <div className="doctor-detail__appt-when">
                  <strong>{formatDate(appt.date)}</strong>
                  <span>{formatTime(`1970-01-01T${appt.time}:00`)} · {appt.duration} min</span>
                </div>
                <div className="doctor-detail__appt-patient">
                  <User size={14} aria-hidden="true" />
                  <span>{patientName(appt.patientId)}</span>
                </div>
                <p className="doctor-detail__appt-reason">{appt.reason}</p>
                <StatusBadge tone={appt.status}>{appt.status}</StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit doctor"
        subtitle={`Update ${doctor.name}'s profile.`}
        size="lg"
      >
        <DoctorForm
          initialValues={doctor}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete doctor?"
        confirmLabel="Delete doctor"
        body={
          <>
            You&apos;re about to permanently remove <strong>{doctor.name}</strong> from the
            roster. Their scheduled appointments will need to be reassigned.
          </>
        }
      />
    </div>
  );
};

export default DoctorDetailPage;