import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  HeartPulse,
  AlertTriangle,
  FileText,
  Plus,
  Stethoscope,
} from 'lucide-react';
import {
  Button,
  Card,
  StatusBadge,
  Modal,
  ConfirmDialog,
  EmptyState,
} from '../../../components/ui';
import {
  usePatients,
  useDoctors,
  useAppointments,
  useInvoices,
} from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { initialsFromName, formatDate, formatTime } from '../../../utils/helpers';
import PatientForm from './PatientForm';
import './PatientDetailPage.css';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const patients = usePatients();
  const { list: listDoctors } = useDoctors();
  const { list: listAppointments } = useAppointments();
  const { list: listInvoices } = useInvoices();
  const toast = useToast();

  const patient = patients.find(id);
  const doctors = listDoctors();
  const appointments = listAppointments().filter((a) => a.patientId === id);
  const invoices = listInvoices().filter((i) => i.patientId === id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const doctor = useMemo(
    () => doctors.find((d) => d.id === patient?.assignedDoctor),
    [doctors, patient],
  );

  if (!patient) {
    return (
      <div className="patient-detail">
        <EmptyState
          icon={HeartPulse}
          title="Patient not found"
          description={`We couldn't find a patient with ID ${id}. They may have been removed.`}
          action={
            <Link to="/dashboard/patients">
              <Button variant="primary" leftIcon={ArrowLeft}>
                Back to directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleSave = async (values) => {
    await patients.update(patient.id, values);
    toast.success('Patient updated', `${values.name}'s record has been saved.`);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await patients.remove(patient.id);
    toast.success('Patient removed', `${patient.name} was deleted from the directory.`);
    navigate('/dashboard/patients', { replace: true });
  };

  return (
    <div className="patient-detail">
      <Link to="/dashboard/patients" className="patient-detail__back">
        <ArrowLeft size={16} aria-hidden="true" /> Patient directory
      </Link>

      <Card padding={false} className="patient-detail__hero">
        <div className="patient-detail__hero-content">
          <span className="patient-detail__avatar">{initialsFromName(patient.name)}</span>
          <div className="patient-detail__hero-meta">
            <span className="patient-detail__pill">{patient.id}</span>
            <h1>{patient.name}</h1>
            <p>
              {patient.age} years · {patient.gender} · Blood group {patient.bloodGroup}
            </p>
            <div className="patient-detail__hero-tags">
              <StatusBadge tone={patient.status}>{patient.status}</StatusBadge>
              <span className="patient-detail__chip">
                <Calendar size={12} aria-hidden="true" /> Joined {formatDate(patient.createdAt)}
              </span>
              <span className="patient-detail__chip">
                <Stethoscope size={12} aria-hidden="true" /> {doctor?.name || 'Unassigned'}
              </span>
            </div>
          </div>
          <div className="patient-detail__hero-actions">
            <Button variant="outline" leftIcon={Pencil} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" leftIcon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="patient-detail__grid">
        <Card title="Contact information" subtitle="How we reach the patient and their emergency contact.">
          <ul className="patient-detail__contact">
            <li>
              <Mail size={16} aria-hidden="true" />
              <div>
                <span>Email</span>
                <strong>{patient.email || '—'}</strong>
              </div>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <div>
                <span>Phone</span>
                <strong>{patient.phone}</strong>
              </div>
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              <div>
                <span>Address</span>
                <strong>{patient.address || '—'}</strong>
              </div>
            </li>
            <li>
              <AlertTriangle size={16} aria-hidden="true" />
              <div>
                <span>Emergency contact</span>
                <strong>{patient.emergencyContact || '—'}</strong>
              </div>
            </li>
          </ul>
        </Card>

        <Card title="Medical snapshot" subtitle="Quick clinical overview.">
          <ul className="patient-detail__contact">
            <li>
              <HeartPulse size={16} aria-hidden="true" />
              <div>
                <span>Allergies</span>
                <strong>{patient.allergies || 'None recorded'}</strong>
              </div>
            </li>
            <li>
              <FileText size={16} aria-hidden="true" />
              <div>
                <span>Clinical notes</span>
                <strong>{patient.notes || 'No additional notes'}</strong>
              </div>
            </li>
          </ul>
          <Link
            to={`/dashboard/patients/${patient.id}/history`}
            className="patient-detail__history-btn"
          >
            <FileText size={16} aria-hidden="true" />
            Open Medical History
          </Link>
        </Card>
      </div>

      <Card title="Appointments" subtitle={`${appointments.length} on file`}>
        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            size="sm"
            title="No appointments yet"
            description="Schedule one to start tracking this patient's visits."
            action={
              <Link to={`/dashboard/appointments/new?patientId=${patient.id}`}>
                <Button leftIcon={Plus} variant="primary" size="small">
                  Book appointment
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="patient-detail__appt-list">
            {appointments
              .slice()
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .map((appt) => (
                <li key={appt.id}>
                  <div>
                    <p className="patient-detail__appt-when">
                      {formatDate(appt.date)} · {formatTime(`1970-01-01T${appt.time}:00`)}
                    </p>
                    <p className="patient-detail__appt-reason">{appt.reason}</p>
                  </div>
                  <StatusBadge tone={appt.status}>{appt.status}</StatusBadge>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <Card title="Invoices" subtitle={`${invoices.length} on file`}>
        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            size="sm"
            title="No invoices yet"
            description="Create the first invoice for this patient from the billing page."
          />
        ) : (
          <ul className="patient-detail__appt-list">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <div>
                  <p className="patient-detail__appt-when">{inv.id}</p>
                  <p className="patient-detail__appt-reason">
                    Rs {inv.total.toLocaleString()} · Issued {formatDate(inv.issuedAt)}
                  </p>
                </div>
                <StatusBadge tone={inv.status}>{inv.status}</StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit patient"
        subtitle={`Update ${patient.name}'s medical record.`}
        size="lg"
      >
        <PatientForm
          initialValues={patient}
          doctors={doctors}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete patient?"
        variant="danger"
        confirmLabel="Delete patient"
        body={
          <>
            You&apos;re about to permanently remove <strong>{patient.name}</strong> ({patient.id}).
            This will also remove all linked appointments and invoices. This action cannot be
            undone.
          </>
        }
      />
    </div>
  );
};

export default PatientDetailPage;