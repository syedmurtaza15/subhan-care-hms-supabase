import { useMemo, useState } from 'react';
import {
  UserPlus,
  Pencil,
  Trash2,
  Users,
  Briefcase,
  Mail,
  Phone,
} from 'lucide-react';
import {
  Button,
  Card,
  ConfirmDialog,
  DateInput,
  EmptyState,
  Input,
  Modal,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
} from '../../../components/ui';
import { useStaff } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { initialsFromName, formatDate } from '../../../utils/helpers';
import './StaffPage.css';

const ROLE_OPTIONS = [
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'BILLING_STAFF', label: 'Billing Staff' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
  { value: 'ADMIN', label: 'Administrator' },
];

const StaffForm = ({ initialValues, onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    role: initialValues?.role || 'RECEPTIONIST',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    department: initialValues?.department || 'Operations',
    joinDate: initialValues?.joinDate || new Date().toISOString().split('T')[0],
    status: initialValues?.status || 'active',
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.name || !values.email) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="staff-form" onSubmit={handleSubmit} noValidate>
      <div className="staff-form__grid">
        <Input label="Full name" name="name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
        <Select label="Role" name="role" value={values.role} options={ROLE_OPTIONS} onChange={(e) => setValues({ ...values, role: e.target.value })} />
        <Input label="Email" name="email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required />
        <Input label="Phone" name="phone" value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} />
        <Input label="Department" name="department" value={values.department} onChange={(e) => setValues({ ...values, department: e.target.value })} />
        <DateInput label="Join date" name="joinDate" value={values.joinDate} onChange={(e) => setValues({ ...values, joinDate: e.target.value })} />
      </div>
      <div className="staff-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>{initialValues ? 'Save' : 'Add staff'}</Button>
      </div>
    </form>
  );
};

const StaffPage = () => {
  const staff = useStaff();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const stats = useMemo(() => {
    const list = staff.list();
    return {
      total: list.length,
      active: list.filter((s) => s.status === 'active').length,
      departments: new Set(list.map((s) => s.department)).size,
    };
  }, [staff]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return staff.list().filter((s) => {
      if (!term) return true;
      const haystack = `${s.name} ${s.email} ${s.role} ${s.department}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [staff, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const roleLabel = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role;

  const handleCreate = async (values) => {
    await staff.create({ ...values, status: 'active' });
    toast.success('Staff added', `${values.name} is now on the team.`);
    setCreateOpen(false);
  };

  const handleEdit = async (values) => {
    await staff.update(editing.id, values);
    toast.success('Staff updated', `${values.name} saved.`);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await staff.remove(deleting.id);
    toast.success('Staff removed', `${deleting.name} was removed.`);
    setDeleting(null);
  };

  return (
    <div className="staff-page">
      <header className="staff-page__header">
        <div>
          <span className="staff-page__eyebrow">Staff Management</span>
          <h1>Staff Directory</h1>
          <p>Manage reception, pharmacy, billing and support staff accounts.</p>
        </div>
        <Button variant="primary" leftIcon={UserPlus} onClick={() => setCreateOpen(true)}>
          Add Staff
        </Button>
      </header>

      <section className="staff-page__stats">
        <div className="staff-page__stat">
          <Users size={18} aria-hidden="true" />
          <div>
            <p className="staff-page__stat-label">Total staff</p>
            <p className="staff-page__stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="staff-page__stat">
          <Briefcase size={18} aria-hidden="true" />
          <div>
            <p className="staff-page__stat-label">Departments</p>
            <p className="staff-page__stat-value">{stats.departments}</p>
          </div>
        </div>
        <div className="staff-page__stat">
          <Mail size={18} aria-hidden="true" />
          <div>
            <p className="staff-page__stat-label">Active members</p>
            <p className="staff-page__stat-value">{stats.active}</p>
          </div>
        </div>
      </section>

      <Card padding={false}>
        <div className="staff-page__toolbar">
          <SearchInput
            value={searchTerm}
            placeholder="Search by name, email, role…"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="staff-page__tableWrap">
          <table className="staff-page__table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="staff-page__name">
                      <span className="staff-page__avatar">{initialsFromName(member.name)}</span>
                      <span>
                        <strong>{member.name}</strong>
                        <small>{member.id}</small>
                      </span>
                    </div>
                  </td>
                  <td>{roleLabel(member.role)}</td>
                  <td>{member.department}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{formatDate(member.joinDate)}</td>
                  <td>
                    <StatusBadge tone={member.status}>{member.status}</StatusBadge>
                  </td>
                  <td>
                    <div className="staff-page__row-actions">
                      <button type="button" className="staff-page__icon-btn" onClick={() => setEditing(member)} title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="staff-page__icon-btn staff-page__icon-btn--danger"
                        onClick={() => setDeleting(member)}
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
              icon={Users}
              title="No staff members"
              description="Add your first team member to get started."
              action={
                <Button variant="primary" leftIcon={UserPlus} onClick={() => setCreateOpen(true)}>
                  Add Staff
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
        isOpen={createOpen || Boolean(editing)}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit staff' : 'Add staff member'}
        subtitle={editing ? `Update ${editing.name}'s profile.` : 'Bring a new team member onto Subhan Care.'}
        size="lg"
      >
        <StaffForm
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
        onConfirm={handleDelete}
        variant="danger"
        title="Remove staff member?"
        confirmLabel="Remove"
        body={
          <>
            You&apos;re about to remove <strong>{deleting?.name}</strong> ({deleting?.id}) from
            the directory.
          </>
        }
      />
    </div>
  );
};

export default StaffPage;