import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Pencil,
  Trash2,
  Pill,
  Calendar,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Clock,
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
  usePrescriptions,
  usePatients,
  useDoctors,
} from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate, initialsFromName } from '../../../utils/helpers';
import PrescriptionForm from './PrescriptionForm';
import './PrescriptionDetailPage.css';

const PrescriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const prescriptions = usePrescriptions();
  const { list: listPatients } = usePatients();
  const { list: listDoctors } = useDoctors();
  const toast = useToast();

  const rx = prescriptions.find(id);
  const patient = rx ? listPatients().find((p) => p.id === rx.patientId) : null;
  const doctor = rx ? listDoctors().find((d) => d.id === rx.doctorId) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!rx) {
    return (
      <EmptyState
        icon={Pill}
        title="Prescription not found"
        description={`No prescription with ID ${id}.`}
        action={
          <Link to="/dashboard/prescriptions">
            <Button variant="primary" leftIcon={ArrowLeft}>
              Back to prescriptions
            </Button>
          </Link>
        }
      />
    );
  }

  const handleSave = async (values) => {
    await prescriptions.update(rx.id, values);
    toast.success('Prescription updated', `${rx.id} saved.`);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await prescriptions.remove(rx.id);
    toast.success('Prescription removed', `${rx.id} deleted.`);
    navigate('/dashboard/prescriptions', { replace: true });
  };

  const handleStatusChange = async (status) => {
    await prescriptions.update(rx.id, { status });
    toast.info(`Prescription ${status}`, `${rx.id} updated.`);
  };

  return (
    <div className="prescription-detail">
      <Link to="/dashboard/prescriptions" className="prescription-detail__back">
        <ArrowLeft size={16} aria-hidden="true" /> All prescriptions
      </Link>

      <Card padding={false} className="prescription-detail__hero">
        <div className="prescription-detail__hero-content">
          <span className="prescription-detail__icon">
            <Pill size={28} />
          </span>
          <div className="prescription-detail__hero-meta">
            <span className="prescription-detail__pill">{rx.id}</span>
            <h1>{rx.diagnosis}</h1>
            <p>
              Issued {formatDate(rx.issuedAt)} by <strong>{doctor?.name || 'Unknown doctor'}</strong>
            </p>
            <div className="prescription-detail__tags">
              <StatusBadge tone={rx.status}>{rx.status}</StatusBadge>
              <span className="prescription-detail__chip">
                {rx.items.length} medication{rx.items.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <div className="prescription-detail__hero-actions">
            <Button variant="outline" leftIcon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="ghost" leftIcon={Pencil} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            {rx.status === 'active' && (
              <Button variant="secondary" leftIcon={CheckCircle2} onClick={() => handleStatusChange('completed')}>
                Mark completed
              </Button>
            )}
            {rx.status === 'pending' && (
              <Button variant="primary" leftIcon={CheckCircle2} onClick={() => handleStatusChange('active')}>
                Activate
              </Button>
            )}
            {rx.status !== 'cancelled' && (
              <Button variant="ghost" leftIcon={XCircle} onClick={() => handleStatusChange('cancelled')}>
                Cancel
              </Button>
            )}
            <Button variant="danger" leftIcon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="prescription-detail__grid">
        <Card title="Patient" subtitle="Who's this prescription for.">
          {patient ? (
            <Link to={`/dashboard/patients/${patient.id}`} className="prescription-detail__link-card">
              <span className="prescription-detail__avatar">{initialsFromName(patient.name)}</span>
              <div>
                <p className="prescription-detail__name">{patient.name}</p>
                <p className="prescription-detail__meta">
                  {patient.id} · {patient.age} yrs · {patient.gender} · {patient.bloodGroup}
                </p>
              </div>
            </Link>
          ) : (
            <p className="prescription-detail__empty">Patient not found.</p>
          )}
        </Card>

        <Card title="Doctor" subtitle="Prescribed by">
          {doctor ? (
            <Link to={`/dashboard/doctors/${doctor.id}`} className="prescription-detail__link-card">
              <span className="prescription-detail__avatar prescription-detail__avatar--secondary">
                {initialsFromName(doctor.name)}
              </span>
              <div>
                <p className="prescription-detail__name">{doctor.name}</p>
                <p className="prescription-detail__meta">
                  {doctor.specialization} · {doctor.experience} yrs experience
                </p>
              </div>
            </Link>
          ) : (
            <p className="prescription-detail__empty">Doctor not found.</p>
          )}
        </Card>
      </div>

      <Card title="Medications" subtitle={`${rx.items.length} item${rx.items.length === 1 ? '' : 's'}`}>
        <ul className="prescription-detail__meds">
          {rx.items.map((item, index) => (
            <li key={index} className="prescription-detail__med">
              <span className="prescription-detail__med-num">#{index + 1}</span>
              <div className="prescription-detail__med-body">
                <p className="prescription-detail__med-name">{item.medication}</p>
                <p className="prescription-detail__med-sig">
                  <strong>{item.dosage}</strong> · {item.frequency} · {item.duration}
                </p>
                {item.instructions && (
                  <p className="prescription-detail__med-instructions">
                    <Clock size={12} aria-hidden="true" /> {item.instructions}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {rx.notes && (
        <Card title="Doctor's notes" subtitle="Additional guidance for the patient.">
          <p className="prescription-detail__notes">{rx.notes}</p>
        </Card>
      )}

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit prescription"
        subtitle={`Update ${rx.id}.`}
        size="lg"
      >
        <PrescriptionForm
          initialValues={rx}
          patients={listPatients()}
          doctors={listDoctors()}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete prescription?"
        confirmLabel="Delete prescription"
        body={
          <>
            You&apos;re about to permanently remove prescription <strong>{rx.id}</strong>.
            This action cannot be undone.
          </>
        }
      />
    </div>
  );
};

export default PrescriptionDetailPage;