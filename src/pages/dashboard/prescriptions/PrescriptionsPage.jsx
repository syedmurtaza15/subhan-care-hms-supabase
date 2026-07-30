import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Stethoscope,
} from 'lucide-react';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Modal,
  Pagination,
  SearchInput,
  Select,
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
import './PrescriptionsPage.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PrescriptionsPage = () => {
  const navigate = useNavigate();
  const prescriptions = usePrescriptions();
  const { list: listPatients } = usePatients();
  const { list: listDoctors } = useDoctors();
  const toast = useToast();

  const patients = listPatients();
  const doctors = listDoctors();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', doctorId: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const patientName = (id) => patients.find((p) => p.id === id)?.name || 'Unknown';
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || 'Unknown';

  const stats = useMemo(() => {
    const list = prescriptions.list();
    return {
      total: list.length,
      active: list.filter((p) => p.status === 'active').length,
      pending: list.filter((p) => p.status === 'pending').length,
      completed: list.filter((p) => p.status === 'completed').length,
    };
  }, [prescriptions]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return prescriptions.list().filter((p) => {
      if (term) {
        const medNames = p.items.map((i) => i.medication).join(' ');
        const haystack = `${p.id} ${p.diagnosis} ${patientName(p.patientId)} ${doctorName(p.doctorId)} ${medNames}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.doctorId !== 'all' && p.doctorId !== filters.doctorId) return false;
      return true;
    });
  }, [prescriptions, searchTerm, filters, patients, doctors]);

  const sorted = useMemo(
    () => filtered.slice().sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || '')),
    [filtered],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const doctorOptions = [
    { value: 'all', label: 'All doctors' },
    ...doctors.map((d) => ({ value: d.id, label: d.name })),
  ];

  const handleCreate = async (values) => {
    const created = await prescriptions.create({
  ...values,
  patientId: values.patientId || null,
  doctorId: values.doctorId || null,
  appointmentId: values.appointmentId || null,
  status: 'active',
});
    toast.success('Prescription issued', `${created.id} created for ${patientName(created.patientId)}.`);
    setCreateOpen(false);
  };

  const handleEdit = async (values) => {
    const updated = await prescriptions.update(editing.id, values);
    toast.success('Prescription updated', `${updated.id} saved.`);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await prescriptions.remove(deleting.id);
    toast.success('Prescription removed', `${deleting.id} was deleted.`);
    setDeleting(null);
  };

  const handleMarkStatus = async (rx, status) => {
    await prescriptions.update(rx.id, { status });
    toast.info(`Prescription ${status}`, `${rx.id} updated.`);
  };

  return (
    <div className="prescriptions-page">
      <header className="prescriptions-page__header">
        <div>
          <span className="prescriptions-page__eyebrow">Prescription Module</span>
          <h1>Prescriptions</h1>
          <p>
            Every active medication, dosage and refill — linked to the patient, doctor and
            appointment that issued it.
          </p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
          New Prescription
        </Button>
      </header>

      <section className="prescriptions-page__stats">
        <div className="prescriptions-page__stat">
          <Pill size={18} aria-hidden="true" />
          <div>
            <p className="prescriptions-page__stat-label">Total prescriptions</p>
            <p className="prescriptions-page__stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="prescriptions-page__stat">
          <CheckCircle2 size={18} aria-hidden="true" />
          <div>
            <p className="prescriptions-page__stat-label">Active</p>
            <p className="prescriptions-page__stat-value">{stats.active}</p>
          </div>
        </div>
        <div className="prescriptions-page__stat">
          <Clock size={18} aria-hidden="true" />
          <div>
            <p className="prescriptions-page__stat-label">Pending</p>
            <p className="prescriptions-page__stat-value">{stats.pending}</p>
          </div>
        </div>
        <div className="prescriptions-page__stat">
          <Stethoscope size={18} aria-hidden="true" />
          <div>
            <p className="prescriptions-page__stat-label">Completed</p>
            <p className="prescriptions-page__stat-value">{stats.completed}</p>
          </div>
        </div>
      </section>

      <Card padding={false}>
        <div className="prescriptions-page__toolbar">
          <SearchInput
            value={searchTerm}
            placeholder="Search by ID, diagnosis, patient, doctor or medication…"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="prescriptions-page__filters">
            <Select
              name="status"
              value={filters.status}
              options={STATUS_FILTERS}
              onChange={(event) => {
                setFilters((f) => ({ ...f, status: event.target.value }));
                setCurrentPage(1);
              }}
            />
            <Select
              name="doctorId"
              value={filters.doctorId}
              options={doctorOptions}
              onChange={(event) => {
                setFilters((f) => ({ ...f, doctorId: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="prescriptions-page__tableWrap">
          <table className="prescriptions-page__table">
            <thead>
              <tr>
                <th>Prescription</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Medications</th>
                <th>Issued</th>
                <th>Status</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((rx) => (
                <tr key={rx.id}>
                  <td>
                    <button
                      type="button"
                      className="prescriptions-page__id-btn"
                      onClick={() => navigate(`/dashboard/prescriptions/${rx.id}`)}
                    >
                      <Pill size={14} aria-hidden="true" />
                      {rx.id}
                    </button>
                  </td>
                  <td>
                    <div className="prescriptions-page__patient">
                      <span className="prescriptions-page__avatar">
                        {initialsFromName(patientName(rx.patientId))}
                      </span>
                      <span>
                        <strong>{patientName(rx.patientId)}</strong>
                        <small>{rx.patientId}</small>
                      </span>
                    </div>
                  </td>
                  <td>{doctorName(rx.doctorId)}</td>
                  <td className="prescriptions-page__diag">{rx.diagnosis}</td>
                  <td>
                    <div className="prescriptions-page__meds">
                      {rx.items.slice(0, 2).map((it, i) => (
                        <span key={i} className="prescriptions-page__med">{it.medication}</span>
                      ))}
                      {rx.items.length > 2 && (
                        <span className="prescriptions-page__med-more">+{rx.items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(rx.issuedAt)}</td>
                  <td>
                    <StatusBadge tone={rx.status}>{rx.status}</StatusBadge>
                  </td>
                  <td>
                    <div className="prescriptions-page__row-actions">
                      <button
                        type="button"
                        className="prescriptions-page__icon-btn"
                        onClick={() => navigate(`/dashboard/prescriptions/${rx.id}`)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="prescriptions-page__icon-btn"
                        onClick={() => {
                          setEditing(rx);
                          setCreateOpen(false);
                        }}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="prescriptions-page__icon-btn prescriptions-page__icon-btn--danger"
                        onClick={() => setDeleting(rx)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageItems.length === 0 && (
            <EmptyState
              icon={Pill}
              title="No prescriptions found"
              description="Try clearing filters or issue a new prescription."
              action={
                <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
                  New Prescription
                </Button>
              }
            />
          )}
        </div>

        {sorted.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </Card>

      <Modal
        isOpen={createOpen || Boolean(editing)}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit prescription' : 'New prescription'}
        subtitle={editing ? `Update ${editing.id}.` : 'Issue a new prescription to a patient.'}
        size="lg"
      >
        <PrescriptionForm
          initialValues={editing}
          patients={patients}
          doctors={doctors}
          onSubmit={editing ? handleEdit : handleCreate}
          onCancel={() => {
            setCreateOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete prescription?"
        confirmLabel="Delete prescription"
        body={
          <>
            You&apos;re about to permanently remove prescription <strong>{deleting?.id}</strong>.
            This cannot be undone.
          </>
        }
      />
    </div>
  );
};

export default PrescriptionsPage;