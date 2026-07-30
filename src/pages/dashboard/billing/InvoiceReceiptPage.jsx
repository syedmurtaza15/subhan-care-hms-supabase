import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Pencil,
  Trash2,
  CheckCircle2,
  Banknote,
  Receipt,
  Download,
  Wallet,
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
  useInvoices,
  usePatients,
} from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/helpers';
import InvoiceForm from './InvoiceForm';
import './InvoiceReceiptPage.css';

const PAYMENT_METHOD_LABEL = {
  cash: 'Cash',
  card: 'Card',
  bank: 'Bank transfer',
  insurance: 'Insurance',
};

const InvoiceReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoices = useInvoices();
  const { list: listPatients } = usePatients();
  const toast = useToast();

  const invoice = invoices.find(id);
  const patient = invoice ? listPatients().find((p) => p.id === invoice.patientId) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const balance = useMemo(() => {
    if (!invoice) return 0;
    return Math.max(0, invoice.total - (invoice.amountPaid || 0));
  }, [invoice]);

  if (!invoice) {
    return (
      <EmptyState
        icon={Receipt}
        title="Invoice not found"
        description={`No invoice with ID ${id}.`}
        action={
          <Link to="/dashboard/billing">
            <Button variant="primary" leftIcon={ArrowLeft}>
              Back to billing
            </Button>
          </Link>
        }
      />
    );
  }

  const handleSave = async (values) => {
    await invoices.update(invoice.id, values);
    toast.success('Invoice updated', `${invoice.id} saved.`);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await invoices.remove(invoice.id);
    toast.success('Invoice removed', `${invoice.id} was deleted.`);
    navigate('/dashboard/billing', { replace: true });
  };

  const handleMarkPaid = async () => {
    const amountPaid = (invoice.amountPaid || 0) + Number(paymentAmount || 0);
    const newStatus = amountPaid >= invoice.total ? 'paid' : 'partial';
    await invoices.update(invoice.id, { amountPaid, status: newStatus });
    toast.success('Payment recorded', `New balance is Rs ${Math.max(0, invoice.total - amountPaid).toLocaleString()}.`);
    setPaymentOpen(false);
    setPaymentAmount(0);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="receipt-page">
      <Link to="/dashboard/billing" className="receipt-page__back">
        <ArrowLeft size={16} aria-hidden="true" /> All invoices
      </Link>

      <header className="receipt-page__header">
        <div>
          <span className="receipt-page__eyebrow">Invoice Receipt</span>
          <h1>{invoice.id}</h1>
          <p>
            Issued to <strong>{patient?.name || 'Unknown patient'}</strong> on{' '}
            {formatDate(invoice.issuedAt)}.
          </p>
        </div>
        <div className="receipt-page__actions">
          <Button variant="outline" leftIcon={Printer} onClick={handlePrint}>
            Print
          </Button>
          <Button variant="outline" leftIcon={Download}>
            Download
          </Button>
          <Button variant="ghost" leftIcon={Pencil} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          {balance > 0 && (
            <Button variant="primary" leftIcon={Wallet} onClick={() => {
              setPaymentAmount(balance);
              setPaymentOpen(true);
            }}>
              Record Payment
            </Button>
          )}
          <Button variant="danger" leftIcon={Trash2} onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </header>

      <Card padding={false} className="receipt-page__card">
        <div className="receipt-page__card-header">
          <div>
            <p className="receipt-page__brand">Subhan Care Hospital</p>
            <p className="receipt-page__address">
              Block 5, Hospital Avenue, Lahore · +92 300 000 0000
            </p>
          </div>
          <div className="receipt-page__meta">
            <p>
              Invoice <strong>{invoice.id}</strong>
            </p>
            <p>Issued {formatDate(invoice.issuedAt)}</p>
            <p>Due {formatDate(invoice.dueAt)}</p>
            <StatusBadge tone={invoice.status}>{invoice.status}</StatusBadge>
          </div>
        </div>

        <div className="receipt-page__billto">
          <p className="receipt-page__billto-label">Bill to</p>
          {patient ? (
            <p>
              <strong>{patient.name}</strong> ({patient.id})
              <br />
              {patient.email || ''} · {patient.phone}
            </p>
          ) : (
            <p>Patient not found.</p>
          )}
        </div>

        <div className="receipt-page__itemsWrap">
          <table className="receipt-page__items">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ width: 80 }}>Qty</th>
                <th style={{ width: 130 }}>Unit price</th>
                <th style={{ width: 130 }}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>Rs {Number(item.unitPrice).toLocaleString()}</td>
                  <td>
                    <strong>Rs {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-page__totals">
          <div>
            <span>Subtotal</span>
            <strong>Rs {invoice.subtotal.toLocaleString()}</strong>
          </div>
          <div>
            <span>Tax</span>
            <strong>Rs {invoice.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
          <div className="receipt-page__grand">
            <span>Total</span>
            <strong>Rs {invoice.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
          <div>
            <span>Amount paid</span>
            <strong>Rs {(invoice.amountPaid || 0).toLocaleString()}</strong>
          </div>
          <div className="receipt-page__balance">
            <span>Balance</span>
            <strong>Rs {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
        </div>

        <div className="receipt-page__payment">
          <p className="receipt-page__payment-label">
            <Banknote size={14} aria-hidden="true" /> Payment method
          </p>
          <p className="receipt-page__payment-value">
            {PAYMENT_METHOD_LABEL[invoice.paymentMethod] || invoice.paymentMethod}
          </p>
        </div>

        <footer className="receipt-page__footer">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>
            Thank you for choosing Subhan Care. For billing queries, contact finance@subancare.com.
          </span>
        </footer>
      </Card>

      <Modal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record payment"
        subtitle={`Mark a payment against invoice ${invoice.id}.`}
        size="sm"
      >
        <div className="receipt-page__payment-form">
          <p className="receipt-page__payment-info">
            Balance due: <strong>Rs {balance.toLocaleString()}</strong>
          </p>
          <label htmlFor="payment-amount">Amount received</label>
          <input
            id="payment-amount"
            type="number"
            min="0"
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(event.target.value)}
            placeholder="0"
          />
          <div className="receipt-page__payment-actions">
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleMarkPaid} disabled={!paymentAmount}>
              Record payment
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit invoice"
        subtitle={`Update ${invoice.id}.`}
        size="lg"
      >
        <InvoiceForm
          initialValues={invoice}
          patients={listPatients()}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete invoice?"
        confirmLabel="Delete invoice"
        body={
          <>
            You&apos;re about to permanently remove invoice <strong>{invoice.id}</strong>.
            This action cannot be undone.
          </>
        }
      />
    </div>
  );
};

export default InvoiceReceiptPage;