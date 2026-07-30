import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Users,
  HeartPulse,
  Activity,
  Phone,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
  ConfirmDialog,
} from '../../../components/ui';
import { usePatients, useDoctors, useAppointments } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { initialsFromName, formatDate } from '../../../utils/helpers';
import PatientForm from './PatientForm';
import PatientFilters from './PatientFilters';
import './PatientsListPage.css';

const GENDER_OPTIONS = [
  { value: 'all', label: 'All genders' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const PatientsListPage = () => {
  const navigate = useNavigate();
  const patients = usePatients();
  const { list: listDoctors } = useDoctors();
  const { list: listAppointments } = useAppointments();
  const toast = useToast();

  const doctors = listDoctors();
  const appointments = listAppointments();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ gender: 'all', doctorId: 'all', status: 'all' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [editingPatient, setEditingPatient] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(null);

  const stats = useMemo(() => {
    const total = patients.list().length;
    const active = patients.list().filter((p) => p.status === 'active').length;
    const thisMonth = patients.list().filter((p) => {
      const created = new Date(p.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    const appointmentsCount = appointments.length;
    return { total, active, thisMonth, appointmentsCount };
  }, [patients, appointments]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return patients.list().filter((p) => {
      if (term) {
        const haystack = `${p.name} ${p.id} ${p.phone} ${p.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
      if (filters.doctorId !== 'all' && p.assignedDoctor !== filters.doctorId) return false;
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      return true;
    });
  }, [patients, searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const doctorName = (doctorId) => {
    const d = doctors.find((doc) => doc.id === doctorId);
    return d ? d.name : 'Unassigned';
  };

  const handleCreate = async (values) => {
    const created = await patients.create({ ...values, status: 'active' });
    toast.success('Patient added', `${created.name} is now in the directory.`);
    setShowCreate(false);
  };

  const handleEdit = async (values) => {
    const updated = await patients.update(editingPatient.id, values);
    toast.success('Patient updated', `${updated.name}'s record has been saved.`);
    setEditingPatient(null);
  };

  const handleDelete = async () => {
    if (!deletingPatient) return;
    await patients.remove(deletingPatient.id);
    toast.success('Patient removed', `${deletingPatient.name} was deleted.`);
    setDeletingPatient(null);
  };

  return (
    <div className="patients-page">
      <header className="patients-page__header">
        <div>
          <span className="patients-page__eyebrow">Patient Management</span>
          <h1>Patient Directory</h1>
          <p>
            Manage every registered patient in the Subhan Care network — search, filter, and
            dive into medical history with one click.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={UserPlus}
          onClick={() => {
            setEditingPatient(null);
            setShowCreate(true);
          }}
        >
          Add Patient
        </Button>
      </header>

      <section className="patients-page__stats">
        <div className="patients-page__stat">
          <Users size={18} aria-hidden="true" />
          <div>
            <p className="patients-page__stat-label">Total patients</p>
            <p className="patients-page__stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="patients-page__stat">
          <HeartPulse size={18} aria-hidden="true" />
          <div>
            <p className="patients-page__stat-label">Active records</p>
            <p className="patients-page__stat-value">{stats.active}</p>
          </div>
        </div>
        <div className="patients-page__stat">
          <Activity size={18} aria-hidden="true" />
          <div>
            <p className="patients-page__stat-label">New this month</p>
            <p className="patients-page__stat-value">{stats.thisMonth}</p>
          </div>
        </div>
        <div className="patients-page__stat">
          <Phone size={18} aria-hidden="true" />
          <div>
            <p className="patients-page__stat-label">Appointments on file</p>
            <p className="patients-page__stat-value">{stats.appointmentsCount}</p>
          </div>
        </div>
      </section>

      <Card padding={false}>
        <div className="patients-page__toolbar">
          <SearchInput
            value={searchTerm}
            placeholder="Search by name, ID, phone, or email…"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            type="button"
            className={`patients-page__filter-btn ${filterOpen ? 'is-active' : ''}`}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <Filter size={14} aria-hidden="true" /> Filters
            {(filters.gender !== 'all' || filters.doctorId !== 'all' || filters.status !== 'all') && (
              <span className="patients-page__filter-dot" />
            )}
          </button>
        </div>

        {filterOpen && (
          <PatientFilters
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setCurrentPage(1);
            }}
            doctors={doctors}
            genderOptions={GENDER_OPTIONS}
          />
        )}

        <div className="patients-page__tableWrap">
          <table className="patients-page__table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>ID</th>
                <th>Age</th>
                <th>Phone</th>
                <th>Assigned doctor</th>
                <th>Status</th>
                <th>Joined</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {currentPageItems.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <Link to={`/dashboard/patients/${patient.id}`} className="patients-page__name">
                      <span className="patients-page__avatar">{initialsFromName(patient.name)}</span>
                      <span>
                        <strong>{patient.name}</strong>
                        <small>{patient.email}</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="patients-page__pill">{patient.id}</span>
                  </td>
                  <td>
                    {patient.age} · {patient.gender}
                  </td>
                  <td>{patient.phone}</td>
                  <td>{doctorName(patient.assignedDoctor)}</td>
                  <td>
                    <StatusBadge tone={patient.status}>{patient.status}</StatusBadge>
                  </td>
                  <td>{formatDate(patient.createdAt)}</td>
                  <td>
                    <div className="patients-page__row-actions">
                      <button
                        type="button"
                        className="patients-page__icon-btn"
                        onClick={() => navigate(`/dashboard/patients/${patient.id}`)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="patients-page__icon-btn"
                        onClick={() => {
                          setEditingPatient(patient);
                          setShowCreate(false);
                        }}
                        title="Edit patient"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="patients-page__icon-btn patients-page__icon-btn--danger"
                        onClick={() => setDeletingPatient(patient)}
                        title="Delete patient"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentPageItems.length === 0 && (
            <EmptyState
              icon={Users}
              title="No patients found"
              description="Try clearing filters or add a new patient to get started."
              action={
                <Button
                  variant="primary"
                  leftIcon={UserPlus}
                  onClick={() => {
                    setEditingPatient(null);
                    setShowCreate(true);
                  }}
                >
                  Add Patient
                </Button>
              }
            />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
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
        isOpen={showCreate || Boolean(editingPatient)}
        onClose={() => {
          setShowCreate(false);
          setEditingPatient(null);
        }}
        title={editingPatient ? 'Edit patient' : 'Add new patient'}
        subtitle={
          editingPatient
            ? `Update ${editingPatient.name}'s medical record.`
            : 'Register a new patient in the Subhan Care directory.'
        }
        size="lg"
      >
        <PatientForm
          initialValues={editingPatient}
          doctors={doctors}
          onSubmit={editingPatient ? handleEdit : handleCreate}
          onCancel={() => {
            setShowCreate(false);
            setEditingPatient(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete patient?"
        confirmLabel="Delete patient"
        body={
          <>
            You&apos;re about to permanently remove{' '}
            <strong>{deletingPatient?.name}</strong> ({deletingPatient?.id}) from the
            directory. This action cannot be undone.
          </>
        }
      />
    </div>
  );
};

export default PatientsListPage;