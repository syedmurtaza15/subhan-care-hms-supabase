import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  StatusBadge,
} from '../../../components/ui';
import { useInvoices, usePatients } from '../../../context/DataContext';
import { formatDate } from '../../../utils/helpers';
import './OutstandingPaymentsPage.css';

const OutstandingPaymentsPage = () => {
  const invoices = useInvoices();
  const { list: listPatients } = usePatients();
  const patients = listPatients();

  const outstanding = useMemo(() => {
    return invoices
      .list()
      .filter(
        (inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partial',
      )
      .sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || ''));
  }, [invoices]);

  const totalDue = outstanding.reduce(
    (acc, inv) => acc + Math.max(0, inv.total - (inv.amountPaid || 0)),
    0,
  );

  const overdueCount = outstanding.filter((inv) => inv.status === 'overdue').length;

  const patient = (id) => patients.find((p) => p.id === id);

  return (
    <div className="outstanding-page">
      <Link to="/dashboard/billing" className="outstanding-page__back">
        <ArrowLeft size={16} aria-hidden="true" /> Billing
      </Link>

      <header className="outstanding-page__header">
        <div>
          <span className="outstanding-page__eyebrow">Collections</span>
          <h1>Outstanding Payments</h1>
          <p>Track every unpaid or partially paid invoice across the Subhan Care network.</p>
        </div>
        <div className="outstanding-page__totals">
          <div className="outstanding-page__total-card">
            <p>Total due</p>
            <strong>Rs {totalDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
          <div className="outstanding-page__total-card outstanding-page__total-card--danger">
            <p>Overdue invoices</p>
            <strong>{overdueCount}</strong>
          </div>
        </div>
      </header>

      {outstanding.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No outstanding payments"
          description="Every invoice is fully paid - excellent collections work."
          action={
            <Link to="/dashboard/billing">
              <Button variant="primary">Back to billing</Button>
            </Link>
          }
        />
      ) : (
        <Card padding={false}>
          <ul className="outstanding-page__list">
            {outstanding.map((inv) => {
              const p = patient(inv.patientId);
              const balance = Math.max(0, inv.total - (inv.amountPaid || 0));
              return (
                <li key={inv.id} className="outstanding-page__row">
                  <div className="outstanding-page__id-block">
                    <Link to={`/dashboard/billing/${inv.id}`} className="outstanding-page__id">
                      {inv.id}
                    </Link>
                    <span className="outstanding-page__meta">
                      <Calendar size={11} aria-hidden="true" />
                      Issued {formatDate(inv.issuedAt)}
                    </span>
                  </div>
                  <div className="outstanding-page__patient">
                    <p className="outstanding-page__patient-name">{p?.name || 'Unknown'}</p>
                    <p className="outstanding-page__patient-meta">
                      {p && (
                        <>
                          <span><Phone size={11} aria-hidden="true" /> {p.phone}</span>
                          <span><Mail size={11} aria-hidden="true" /> {p.email}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="outstanding-page__money">
                    <span className="outstanding-page__total">
                      Rs {inv.total.toLocaleString()}
                    </span>
                    <span className="outstanding-page__paid">
                      Paid Rs {(inv.amountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="outstanding-page__due">
                    <span>Rs {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <small>due now</small>
                  </div>
                  <StatusBadge tone={inv.status}>{inv.status}</StatusBadge>
                  <Link to={`/dashboard/billing/${inv.id}`}>
                    <Button variant="primary" size="small" leftIcon={Wallet}>
                      Collect
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default OutstandingPaymentsPage;