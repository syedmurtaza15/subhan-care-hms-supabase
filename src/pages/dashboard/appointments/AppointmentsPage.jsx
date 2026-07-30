import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Video,
  MapPin,
  Clock,
  Filter,
  CalendarDays,
  CalendarCheck,
  List,
  XCircle,
} from 'lucide-react';
import {
  Button,
  Calendar,
  Card,
  ConfirmDialog,
  EmptyState,
  Modal,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
} from '../../../components/ui';
import { useAppointments, usePatients, useDoctors, useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate, formatTime, initialsFromName } from '../../../utils/helpers';
import AppointmentForm from './AppointmentForm';
import './AppointmentsPage.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const appointments = useAppointments();
  const { list: listDoctors } = useDoctors();
  const { list: listPatients } = usePatients();
   const { refresh } = useData();
  const toast = useToast();

  const doctors = listDoctors();
  const patients = listPatients();

  const [view, setView] = useState('list'); // 'list' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', doctorId: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const doctorOptions = [
    { value: 'all', label: 'All doctors' },
    ...doctors.map((d) => ({ value: d.id, label: d.name })),
  ];

  const patientName = (id) => {
  console.log("Searching patient:", id, patients);
  console.log("Patients:", patients);
console.log("Doctors:", doctors);
console.log("Appointments:", appointments.list());
  return patients.find((p) => p.id === id)?.name || 'Unknown';
};

const doctorName = (id) => {
  console.log("Searching doctor:", id, doctors);
  return doctors.find((d) => d.id === id)?.name || 'Unknown';
};

  const stats = useMemo(() => {
    const list = appointments.list();
    const today = new Date().toISOString().split('T')[0];
    return {
      total: list.length,
      today: list.filter((a) => a.date === today && a.status !== 'cancelled').length,
      waiting: list.filter((a) => a.status === 'waiting').length,
      completed: list.filter((a) => a.status === 'completed').length,
    };
  }, [appointments]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return appointments.list().filter((a) => {
      if (term) {
        const haystack = `${a.id} ${patientName(a.patientId)} ${doctorName(a.doctorId)} ${a.reason}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.doctorId !== 'all' && a.doctorId !== filters.doctorId) return false;
      return true;
    });
  }, [appointments, searchTerm, filters, patients, doctors]);

  const sorted = useMemo(
  () =>
    filtered.slice().sort((a, b) =>
      `${b.appointmentDate || ''}${b.appointmentTime || ''}`.localeCompare(
        `${a.appointmentDate || ''}${a.appointmentTime || ''}`
      )
    ),
  [filtered]
);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Calendar markers
  const markers = useMemo(() => {
    const map = {};
    appointments.list().forEach((a) => {
      map[a.date] = (map[a.date] || 0) + 1;
    });
    return map;
  }, [appointments]);

  const dayAppointments = useMemo(() => {
    return appointments
      .list()
      .filter((a) => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const handleCreate = async (values) => {
   const created = await appointments.create(values);

await refresh();

    toast.success('Appointment booked', `${created.id} scheduled for ${formatDate(created.date)}.`);
    setCreateOpen(false);
  };

  const handleEdit = async (values) => {
    const updated = await appointments.update(editing.id, values);
    toast.success('Appointment updated', `${updated.id} has been rescheduled.`);
    setEditing(null);
  };

  const handleDelete = async (id) => {
  try {
    console.log("Cancelling appointment ID:", id);

    await appointments.update(id, {
      status: "CANCELLED",
    });

    await refresh();

    setDeleting(null);

    toast.success("Appointment cancelled successfully");

  } catch (error) {
    console.error("Cancel appointment error:", error);
    toast.error(error.message || "Failed to cancel appointment");
  }
};

  const handleCancel = async (appt) => {
    await appointments.update(appt.id, { status: 'cancelled' });
    toast.warning('Appointment cancelled', `${appt.id} marked as cancelled.`);
  };

  return (
    <div className="appointments-page">
      <header className="appointments-page__header">
        <div>
          <span className="appointments-page__eyebrow">Scheduling</span>
          <h1>Appointments</h1>
          <p>Book, reschedule and track every consultation across Subhan Care.</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
          Book Appointment
        </Button>
      </header>

      <section className="appointments-page__stats">
        <div className="appointments-page__stat">
          <CalendarIcon size={18} aria-hidden="true" />
          <div>
            <p className="appointments-page__stat-label">Total appointments</p>
            <p className="appointments-page__stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="appointments-page__stat">
          <CalendarDays size={18} aria-hidden="true" />
          <div>
            <p className="appointments-page__stat-label">Today</p>
            <p className="appointments-page__stat-value">{stats.today}</p>
          </div>
        </div>
        <div className="appointments-page__stat">
          <Clock size={18} aria-hidden="true" />
          <div>
            <p className="appointments-page__stat-label">Waiting</p>
            <p className="appointments-page__stat-value">{stats.waiting}</p>
          </div>
        </div>
        <div className="appointments-page__stat">
          <CalendarCheck size={18} aria-hidden="true" />
          <div>
            <p className="appointments-page__stat-label">Completed</p>
            <p className="appointments-page__stat-value">{stats.completed}</p>
          </div>
        </div>
      </section>

      <div className="appointments-page__view-toggle">
        <button
          type="button"
          className={view === 'list' ? 'is-active' : ''}
          onClick={() => setView('list')}
        >
          <List size={14} aria-hidden="true" /> List view
        </button>
        <button
          type="button"
          className={view === 'calendar' ? 'is-active' : ''}
          onClick={() => setView('calendar')}
        >
          <CalendarIcon size={14} aria-hidden="true" /> Calendar view
        </button>
      </div>

      {view === 'list' && (
        <Card padding={false}>
          <div className="appointments-page__toolbar">
            <SearchInput
              value={searchTerm}
              placeholder="Search by ID, patient, doctor, reason…"
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="appointments-page__filters">
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

          <div className="appointments-page__list">
            {pageItems.map((appt) => (
              <article key={appt.id} className="appointment-row">
                <div className="appointment-row__time">
                  <strong>{formatTime(`1970-01-01T${appt.time}:00`)}</strong>
                  <span>{formatDate(appt.date)}</span>
                </div>
                <div className="appointment-row__body">
                  <div className="appointment-row__id-row">
                    <span className="appointment-row__id">{appt.id}</span>
                    <StatusBadge tone={appt.status}>{appt.status}</StatusBadge>
                  </div>
                  <p className="appointment-row__patient">{patientName(appt.patientId)}</p>
                  <p className="appointment-row__meta">
                    with <strong>{doctorName(appt.doctorId)}</strong> · {appt.duration} min ·{' '}
                    {appt.mode === 'video' ? (
                      <span className="appointment-row__mode appointment-row__mode--video">
                        <Video size={11} aria-hidden="true" /> Video
                      </span>
                    ) : (
                      <span className="appointment-row__mode appointment-row__mode--in-person">
                        <MapPin size={11} aria-hidden="true" /> On-site
                      </span>
                    )}
                  </p>
                  <p className="appointment-row__reason">{appt.reason}</p>
                </div>
                <div className="appointment-row__actions">
                  <button
                    type="button"
                    className="appointment-row__icon-btn"
                    title="View details"
                    onClick={() => navigate(`/dashboard/appointments/${appt.id}`)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    className="appointment-row__icon-btn"
                    title="Reschedule / edit"
                    onClick={() => {
                      setEditing(appt);
                      setCreateOpen(false);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  {appt.status !== 'cancelled' && (
                    <button
                      type="button"
                      className="appointment-row__icon-btn"
                      title="Cancel appointment"
                      onClick={() => handleCancel(appt)}
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="appointment-row__icon-btn appointment-row__icon-btn--danger"
                    title="Delete"
                    onClick={() => setDeleting(appt)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {pageItems.length === 0 && (
              <EmptyState
                icon={CalendarIcon}
                title="No appointments found"
                description="Try clearing filters or book a new appointment."
                action={
                  <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
                    Book Appointment
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
      )}

      {view === 'calendar' && (
        <div className="appointments-page__calendar-grid">
          <Calendar value={selectedDate} onChange={setSelectedDate} markers={markers} />

          <Card
            title={formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            subtitle={`${dayAppointments.length} appointments scheduled`}
            action={
              <Button
                variant="primary"
                size="small"
                leftIcon={Plus}
                onClick={() => setCreateOpen(true)}
              >
                Book for this day
              </Button>
            }
          >
            {dayAppointments.length === 0 ? (
              <EmptyState
                size="sm"
                icon={CalendarIcon}
                title="Nothing scheduled"
                description="No appointments on this date yet."
              />
            ) : (
              <ul className="appointments-page__day-list">
                {dayAppointments.map((appt) => (
                  <li key={appt.id} className={`appointments-page__day-item appointments-page__day-item--${appt.status}`}>
                    <span className="appointments-page__day-time">
                      {formatTime(`1970-01-01T${appt.time}:00`)}
                    </span>
                    <div>
                      <p className="appointments-page__day-patient">{patientName(appt.patientId)}</p>
                      <p className="appointments-page__day-reason">
                        {appt.reason} · <strong>{doctorName(appt.doctorId)}</strong>
                      </p>
                    </div>
                    <StatusBadge tone={appt.status}>{appt.status}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <Modal
        isOpen={createOpen || Boolean(editing)}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Reschedule appointment' : 'Book new appointment'}
        subtitle={
          editing
            ? `Update details for ${editing.id}.`
            : 'Choose patient, doctor and an open time slot.'
        }
        size="lg"
      >
        <AppointmentForm
          initialValues={editing}
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
  onConfirm={() => handleDelete(deleting.id)}
  variant="danger"
  title="Cancel appointment?"
  confirmLabel="Cancel appointment"
  body={
    <>
      You&apos;re about to cancel appointment <strong>{deleting?.id}</strong>.
    </>
  }
/>
    </div>
  );
};

export default AppointmentsPage;