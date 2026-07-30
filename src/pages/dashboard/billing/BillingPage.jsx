import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Receipt,
  Eye,
  Pencil,
  Trash2,
  FileText,
  AlertCircle,
  Wallet,
  TrendingUp,
  Banknote,
  Search,
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
  useInvoices,
  usePatients,
  useAppointments,
} from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/helpers';
import InvoiceForm from './InvoiceForm';
import './BillingPage.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
];

const BillingPage = () => {
  const navigate = useNavigate();
  const invoices = useInvoices();
  const { list: listPatients } = usePatients();
  const { list: listAppointments } = useAppointments();
  const toast = useToast();

  const patients = listPatients();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const stats = useMemo(() => {
    const list = invoices.list();
    const totalBilled = list.reduce((acc, inv) => acc + inv.total, 0);
    const totalCollected = list.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const outstanding = list
      .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partial')
      .reduce((acc, inv) => acc + (inv.total - (inv.amountPaid || 0)), 0);
    const overdue = list.filter((inv) => inv.status === 'overdue').length;
    return { totalBilled, totalCollected, outstanding, overdue, count: list.length };
  }, [invoices]);

  const patientName = (id) => patients.find((p) => p.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return invoices.list().filter((inv) => {
      if (term) {
        const haystack = `${inv.id} ${patientName(inv.patientId)} ${inv.items.map((i) => i.description).join(' ')}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.status !== 'all' && inv.status !== filters.status) return false;
      return true;
    });
  }, [invoices, searchTerm, filters, patients]);

  const sorted = useMemo(
    () => filtered.slice().sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || '')),
    [filtered],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const outstandingInvoices = useMemo(
    () =>
      invoices
        .list()
        .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partial')
        .sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || '')),
    [invoices],
  );

  const handleCreate = async (values) => {
    const created = await invoices.create(values);
    toast.success('Invoice generated', `${created.id} created for ${patientName(created.patientId)}.`);
    setCreateOpen(false);
  };

  const handleEdit = async (values) => {
    const updated = await invoices.update(editing.id, values);
    toast.success('Invoice updated', `${updated.id} saved.`);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await invoices.remove(deleting.id);
    toast.success('Invoice removed', `${deleting.id} was deleted.`);
    setDeleting(null);
  };

  return (
    <div className="billing-page">
      <header className="billing-page__header">
        <div>
          <span className="billing-page__eyebrow">Billing &amp; Invoices</span>
          <h1>Finance Center</h1>
          <p>
            Generate invoices, track payments, and chase outstanding balances across the
            Subhan Care network.
          </p>
        </div>
        <div className="billing-page__header-actions">
          <Link to="/dashboard/billing/outstanding">
            <Button variant="outline" leftIcon={AlertCircle}>
              Outstanding ({stats.overdue})
            </Button>
          </Link>
          <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
            Generate Invoice
          </Button>
        </div>
      </header>

      <section className="billing-page__stats">
        <div className="billing-page__stat">
          <Receipt size={18} aria-hidden="true" />
          <div>
            <p className="billing-page__stat-label">Total billed</p>
            <p className="billing-page__stat-value">Rs {stats.totalBilled.toLocaleString()}</p>
          </div>
        </div>
        <div className="billing-page__stat">
          <Wallet size={18} aria-hidden="true" />
          <div>
            <p className="billing-page__stat-label">Collected</p>
            <p className="billing-page__stat-value">Rs {stats.totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="billing-page__stat">
          <TrendingUp size={18} aria-hidden="true" />
          <div>
            <p className="billing-page__stat-label">Outstanding</p>
            <p className="billing-page__stat-value">Rs {stats.outstanding.toLocaleString()}</p>
          </div>
        </div>
        <div className="billing-page__stat">
          <Banknote size={18} aria-hidden="true" />
          <div>
            <p className="billing-page__stat-label">Invoices</p>
            <p className="billing-page__stat-value">{stats.count}</p>
          </div>
        </div>
      </section>

      <Card padding={false}>
        <div className="billing-page__toolbar">
          <SearchInput
            value={searchTerm}
            placeholder="Search by ID, patient or item…"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            name="status"
            value={filters.status}
            options={STATUS_FILTERS}
            onChange={(event) => {
              setFilters({ status: event.target.value });
              setCurrentPage(1);
            }}
            placeholder="Status"
          />
        </div>

        <div className="billing-page__tableWrap">
          <table className="billing-page__table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Issued</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Method</th>
                <th>Status</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link to={`/dashboard/billing/${inv.id}`} className="billing-page__invoice-id">
                      <FileText size={14} aria-hidden="true" />
                      {inv.id}
                    </Link>
                  </td>
                  <td>{patientName(inv.patientId)}</td>
                  <td>{formatDate(inv.issuedAt)}</td>
                  <td>Rs {inv.total.toLocaleString()}</td>
                  <td>Rs {(inv.amountPaid || 0).toLocaleString()}</td>
                  <td>
                    <span className="billing-page__method">{inv.paymentMethod || '—'}</span>
                  </td>
                  <td>
                    <StatusBadge tone={inv.status}>{inv.status}</StatusBadge>
                  </td>
                  <td>
                    <div className="billing-page__row-actions">
                      <button
                        type="button"
                        className="billing-page__icon-btn"
                        onClick={() => navigate(`/dashboard/billing/${inv.id}`)}
                        title="View receipt"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="billing-page__icon-btn"
                        onClick={() => {
                          setEditing(inv);
                          setCreateOpen(false);
                        }}
                        title="Edit invoice"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="billing-page__icon-btn billing-page__icon-btn--danger"
                        onClick={() => setDeleting(inv)}
                        title="Delete invoice"
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
              icon={Receipt}
              title="No invoices found"
              description="Try clearing filters or generate a new invoice."
              action={
                <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
                  Generate Invoice
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

      {outstandingInvoices.length > 0 && (
        <Card title="Outstanding payments" subtitle={`${outstandingInvoices.length} invoices need follow-up`}>
          <ul className="billing-page__outstanding">
            {outstandingInvoices.slice(0, 5).map((inv) => (
              <li key={inv.id}>
                <div>
                  <Link to={`/dashboard/billing/${inv.id}`} className="billing-page__invoice-id">
                    {inv.id}
                  </Link>
                  <p className="billing-page__outstanding-patient">{patientName(inv.patientId)}</p>
                </div>
                <div className="billing-page__outstanding-side">
                  <span>Rs {(inv.total - (inv.amountPaid || 0)).toLocaleString()} due</span>
                  <StatusBadge tone={inv.status}>{inv.status}</StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        isOpen={createOpen || Boolean(editing)}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit invoice' : 'Generate invoice'}
        subtitle={editing ? `Update ${editing.id}.` : 'Create a new invoice for a patient.'}
        size="lg"
      >
        <InvoiceForm
          initialValues={editing}
          patients={patients}
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
        title="Delete invoice?"
        confirmLabel="Delete invoice"
        body={
          <>
            You&apos;re about to permanently remove invoice <strong>{deleting?.id}</strong>.
            This cannot be undone.
          </>
        }
      />
    </div>
  );
};

export default BillingPage;