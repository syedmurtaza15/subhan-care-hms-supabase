import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  DateInput,
  Input,
  Select,
} from '../../../components/ui';
import { validateRequired } from '../../../utils/validators';
import './InvoiceForm.css';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'insurance', label: 'Insurance' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
];

const TAX_RATE = 0.05;

const generateId = () =>
  `INV-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;

const InvoiceForm = ({ initialValues, patients = [], onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => {
    const today = new Date();
    const due = new Date(today);
    due.setDate(today.getDate() + 14);
    return {
      id: initialValues?.id || generateId(),
      patientId: initialValues?.patientId || patients[0]?.id || '',
      appointmentId: initialValues?.appointmentId || '',
      issuedAt: initialValues?.issuedAt
        ? new Date(initialValues.issuedAt).toISOString().split('T')[0]
        : today.toISOString().split('T')[0],
      dueAt: initialValues?.dueAt
        ? new Date(initialValues.dueAt).toISOString().split('T')[0]
        : due.toISOString().split('T')[0],
      status: initialValues?.status || 'unpaid',
      paymentMethod: initialValues?.paymentMethod || 'cash',
      amountPaid: initialValues?.amountPaid || 0,
      items: initialValues?.items?.length
        ? initialValues.items
        : [{ description: '', quantity: 1, unitPrice: 0 }],
    };
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.id})`,
  }));

  const { subtotal, tax, total } = useMemo(() => {
    const sub = values.items.reduce(
      (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0,
    );
    const t = sub * TAX_RATE;
    return { subtotal: sub, tax: t, total: sub + t };
  }, [values.items]);

  const validateAll = (vals) => {
    const errs = {
      patientId: validateRequired(vals.patientId, 'Patient'),
      issuedAt: validateRequired(vals.issuedAt, 'Issue date'),
      dueAt: validateRequired(vals.dueAt, 'Due date'),
    };
    if (vals.items.length === 0 || vals.items.every((i) => !i.description)) {
      errs.items = 'Add at least one item';
    }
    return errs;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) setErrors(validateAll({ ...values, [name]: value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateAll(values));
  };

  const updateItem = (index, field, value) => {
    setValues((prev) => {
      const items = prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setValues((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index) => {
    setValues((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, idx) => idx !== index) : prev.items,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.values(allErrors).some(Boolean)) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        subtotal,
        tax,
        total,
        amountPaid: Number(values.amountPaid) || 0,
        issuedAt: new Date(values.issuedAt).toISOString(),
        dueAt: new Date(values.dueAt).toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="invoice-form" onSubmit={handleSubmit} noValidate>
      <div className="invoice-form__grid">
        <Input
          label="Invoice ID"
          name="id"
          value={values.id}
          onChange={handleChange}
          disabled
        />
        <Select
          label="Patient"
          name="patientId"
          value={values.patientId}
          options={patientOptions}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.patientId ? errors.patientId : ''}
          placeholder="Select patient"
        />
        <DateInput
          label="Issue date"
          name="issuedAt"
          value={values.issuedAt}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.issuedAt ? errors.issuedAt : ''}
        />
        <DateInput
          label="Due date"
          name="dueAt"
          value={values.dueAt}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.dueAt ? errors.dueAt : ''}
        />
        <Select
          label="Payment method"
          name="paymentMethod"
          value={values.paymentMethod}
          options={PAYMENT_METHODS}
          onChange={handleChange}
        />
        <Select
          label="Status"
          name="status"
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={handleChange}
        />
        <Input
          label="Amount paid"
          name="amountPaid"
          type="number"
          value={values.amountPaid}
          onChange={handleChange}
        />
      </div>

      <div className="invoice-form__items">
        <div className="invoice-form__items-header">
          <h3>Line items</h3>
          <Button type="button" variant="outline" size="small" leftIcon={Plus} onClick={addItem}>
            Add item
          </Button>
        </div>
        <div className="invoice-form__items-tableWrap">
          <table className="invoice-form__items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ width: 90 }}>Qty</th>
                <th style={{ width: 130 }}>Unit price</th>
                <th style={{ width: 110 }}>Total</th>
                <th style={{ width: 40 }} aria-label="remove" />
              </tr>
            </thead>
            <tbody>
              {values.items.map((item, index) => {
                const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                return (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        placeholder="e.g. Cardiology consultation"
                        onChange={(event) => updateItem(index, 'description', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, 'quantity', Number(event.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(event) => updateItem(index, 'unitPrice', Number(event.target.value))}
                      />
                    </td>
                    <td>
                      <strong>Rs {lineTotal.toLocaleString()}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="invoice-form__remove-btn"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.items && <p className="invoice-form__error">{errors.items}</p>}

        <div className="invoice-form__totals">
          <div>
            <span>Subtotal</span>
            <strong>Rs {subtotal.toLocaleString()}</strong>
          </div>
          <div>
            <span>Tax (5%)</span>
            <strong>Rs {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
          <div className="invoice-form__grand">
            <span>Grand total</span>
            <strong>Rs {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
        </div>
      </div>

      <div className="invoice-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialValues ? 'Save invoice' : 'Generate invoice'}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;