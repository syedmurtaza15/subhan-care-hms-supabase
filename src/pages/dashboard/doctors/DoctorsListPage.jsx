import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  Stethoscope,
  Search,
  Star,
  Calendar,
  Award,
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
import { useDoctors, useAppointments, usePatients } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { initialsFromName, formatDate } from '../../../utils/helpers';
import DoctorForm from './DoctorForm';
import './DoctorsListPage.css';

const SPECIALIZATIONS = [
  { value: 'all', label: 'All specializations' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'General Medicine', label: 'General Medicine' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const DoctorsListPage = () => {
  const navigate = useNavigate();
  const doctors = useDoctors();
  const { list: listAppointments } = useAppointments();
  const { list: listPatients } = usePatients();
  const toast = useToast();

  const appointments = listAppointments();
  const patients = listPatients();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ specialization: 'all', status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState(null);

  const stats = useMemo(() => {
    const list = doctors.list();
    return {
      total: list.length,
      active: list.filter((d) => d.status === 'active').length,
      specializations: new Set(list.map((d) => d.specialization)).size,
      upcoming: appointments.filter((a) => a.status === 'confirmed' || a.status === 'waiting').length,
    };
  }, [doctors, appointments]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return doctors.list().filter((d) => {
      if (term) {
        const haystack = `${d.name} ${d.specialization} ${d.email} ${d.phone}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.specialization !== 'all' && d.specialization !== filters.specialization) {
        return false;
      }
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      return true;
    });
  }, [doctors, searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const doctorStats = (doctorId) => {
    const upcoming = appointments.filter(
      (a) => a.doctorId === doctorId && (a.status === 'confirmed' || a.status === 'waiting'),
    ).length;
    const totalPatients = new Set(
      appointments.filter((a) => a.doctorId === doctorId).map((a) => a.patientId),
    ).size;
    return { upcoming, totalPatients };
  };

  const handleCreate = async (values) => {
    const created = await doctors.create({ ...values, status: 'active' });
    toast.success('Doctor added', `${created.name} is now on the roster.`);
    setShowCreate(false);
  };

  const handleEdit = async (values) => {
    const updated = await doctors.update(editingDoctor.id, values);
    toast.success('Doctor updated', `${updated.name}'s profile has been saved.`);
    setEditingDoctor(null);
  };

  const handleDelete = async () => {
    if (!deletingDoctor) return;
    await doctors.remove(deletingDoctor.id);
    toast.success('Doctor removed', `${deletingDoctor.name} was removed from the roster.`);
    setDeletingDoctor(null);
  };
  console.log("Doctors:", doctors);
  return (
    <div className="doctors-page">
      <header className="doctors-page__header">
        <div>
          <span className="doctors-page__eyebrow">Doctor Management</span>
          <h1>Doctor Roster</h1>
          <p>
            Manage every Subhan Care clinician — profiles, availability, schedules and
            specialization filters.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={UserPlus}
          onClick={() => {
            setEditingDoctor(null);
            setShowCreate(true);
          }}
        >
          Add Doctor
        </Button>
      </header>

      <section className="doctors-page__stats">
        <div className="doctors-page__stat">
          <Stethoscope size={18} aria-hidden="true" />
          <div>
            <p className="doctors-page__stat-label">Total doctors</p>
            <p className="doctors-page__stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="doctors-page__stat">
          <Award size={18} aria-hidden="true" />
          <div>
            <p className="doctors-page__stat-label">Specializations</p>
            <p className="doctors-page__stat-value">{stats.specializations}</p>
          </div>
        </div>
        <div className="doctors-page__stat">
          <Calendar size={18} aria-hidden="true" />
          <div>
            <p className="doctors-page__stat-label">Upcoming appointments</p>
            <p className="doctors-page__stat-value">{stats.upcoming}</p>
          </div>
        </div>
        <div className="doctors-page__stat">
          <Star size={18} aria-hidden="true" />
          <div>
            <p className="doctors-page__stat-label">Active on roster</p>
            <p className="doctors-page__stat-value">{stats.active}</p>
          </div>
        </div>
      </section>

      <Card padding={false}>
        <div className="doctors-page__toolbar">
          <SearchInput
            value={searchTerm}
            placeholder="Search by name, specialization, email…"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="doctors-page__filter-row">
            <Select
              name="specialization"
              value={filters.specialization}
              options={SPECIALIZATIONS}
              onChange={(event) => {
                setFilters((f) => ({ ...f, specialization: event.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Specialization"
            />
            <Select
              name="status"
              value={filters.status}
              options={STATUS_OPTIONS}
              onChange={(event) => {
                setFilters((f) => ({ ...f, status: event.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Status"
            />
          </div>
        </div>

        <div className="doctors-page__cards">
          {currentPageItems.map((doctor) => {
            const ds = doctorStats(doctor.id);
            return (
              <article key={doctor.id} className="doctor-card">
                <header className="doctor-card__header">
                  <span className="doctor-card__avatar">{initialsFromName(doctor.name)}</span>
                  <div className="doctor-card__meta">
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialization}</p>
                    <StatusBadge tone={doctor.status}>{doctor.status}</StatusBadge>
                  </div>
                </header>
                <ul className="doctor-card__stats">
                  <li>
                    <span>Experience</span>
                    <strong>{doctor.experience} yrs</strong>
                  </li>
                  <li>
                    <span>Fee</span>
                    <strong>Rs 0</strong>
                  </li>
                  <li>
                    <span>Upcoming</span>
                    <strong>{ds.upcoming} appts</strong>
                  </li>
                  <li>
                    <span>Patients</span>
                    <strong>{ds.totalPatients} on file</strong>
                  </li>
                </ul>
               <div className="doctor-card__chips">
  {Array.isArray(doctor.availability) && doctor.availability.length > 0 ? (
    doctor.availability.map((day) => (
      <span key={day} className="doctor-card__chip">
        {day}
      </span>
    ))
  ) : (
    <span className="doctor-card__chip doctor-card__chip--muted">
      {doctor.availability || 'Not set'}
    </span>
  )}
</div>
                <div className="doctor-card__actions">
                  <Link to={`/dashboard/doctors/${doctor.id}`}>
                    <Button variant="outline" size="small" leftIcon={Eye}>
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="small"
                    leftIcon={Pencil}
                    onClick={() => {
                      setEditingDoctor(doctor);
                      setShowCreate(false);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    leftIcon={Trash2}
                    onClick={() => setDeletingDoctor(doctor)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
          {currentPageItems.length === 0 && (
            <EmptyState
              icon={Stethoscope}
              title="No doctors found"
              description="Try clearing filters or add a new doctor to get started."
              action={
                <Button
                  variant="primary"
                  leftIcon={UserPlus}
                  onClick={() => {
                    setEditingDoctor(null);
                    setShowCreate(true);
                  }}
                >
                  Add Doctor
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
        isOpen={showCreate || Boolean(editingDoctor)}
        onClose={() => {
          setShowCreate(false);
          setEditingDoctor(null);
        }}
        title={editingDoctor ? 'Edit doctor' : 'Add new doctor'}
        subtitle={
          editingDoctor
            ? `Update ${editingDoctor.name}'s profile and availability.`
            : 'Onboard a new clinician to the Subhan Care roster.'
        }
        size="lg"
      >
        <DoctorForm
          initialValues={editingDoctor}
          onSubmit={editingDoctor ? handleEdit : handleCreate}
          onCancel={() => {
            setShowCreate(false);
            setEditingDoctor(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingDoctor)}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete doctor?"
        confirmLabel="Delete doctor"
        body={
          <>
            You&apos;re about to remove <strong>{deletingDoctor?.name}</strong> from the
            roster. Their future appointments will need to be reassigned.
          </>
        }
      />
    </div>
  );
};

export default DoctorsListPage;