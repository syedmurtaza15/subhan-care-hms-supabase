import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  DateInput,
  Input,
  Select,
  Textarea,
} from '../../../components/ui';
import { validateRequired, isEmpty } from '../../../utils/validators';
import './PrescriptionForm.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const FREQUENCY_OPTIONS = [
  { value: 'Once daily', label: 'Once daily' },
  { value: 'Twice daily', label: 'Twice daily' },
  { value: 'Three times daily', label: 'Three times daily' },
  { value: 'Four times daily', label: 'Four times daily' },
  { value: 'Every 4 hours', label: 'Every 4 hours' },
  { value: 'Every 6 hours', label: 'Every 6 hours' },
  { value: 'Every 8 hours', label: 'Every 8 hours' },
  { value: 'As needed', label: 'As needed (PRN)' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
];

const generateId = () =>
  `RX-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;

const PrescriptionForm = ({ initialValues, patients = [], doctors = [], onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
     
     patientId: initialValues?.patientId || patients[0]?.id || null,
doctorId: initialValues?.doctorId || doctors[0]?.id || null,
appointmentId: initialValues?.appointmentId || null,
      issuedAt: initialValues?.issuedAt
        ? new Date(initialValues.issuedAt).toISOString().split('T')[0]
        : today,
      status: initialValues?.status || 'active',
      diagnosis: initialValues?.diagnosis || '',
      notes: initialValues?.notes || '',
      items: initialValues?.items?.length
        ? initialValues.items
        : [{ medication: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }],
    };
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.id})`,
  }));
  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: `${d.name} · ${d.specialization}`,
  }));

  const validateAll = (vals) => {
    const errs = {
      patientId: validateRequired(vals.patientId, 'Patient'),
      doctorId: validateRequired(vals.doctorId, 'Doctor'),
      issuedAt: validateRequired(vals.issuedAt, 'Issue date'),
      diagnosis: validateRequired(vals.diagnosis, 'Diagnosis'),
    };
    if (!vals.items.length || vals.items.every((i) => !i.medication)) {
      errs.items = 'Add at least one medication';
    }
    vals.items.forEach((item, idx) => {
      if (item.medication && isEmpty(item.dosage)) {
        errs[`item-dosage-${idx}`] = 'Dosage required';
      }
    });
    return errs;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateAll(next));
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
      items: [
        ...prev.items,
        { medication: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' },
      ],
    }));
  };

  const removeItem = (index) => {
    setValues((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, idx) => idx !== index) : prev.items,
    }));
  };

  const handleSubmit = async (event) => {
    console.log("Prescription values:", values);
    event.preventDefault();
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.values(allErrors).some(Boolean)) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        issuedAt: new Date(values.issuedAt).toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="prescription-form" onSubmit={handleSubmit} noValidate>
      <div className="prescription-form__grid">
        <Input label="Prescription ID" name="id" value={values.id} onChange={handleChange} disabled />
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
        <Select
          label="Doctor"
          name="doctorId"
          value={values.doctorId}
          options={doctorOptions}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.doctorId ? errors.doctorId : ''}
          placeholder="Select doctor"
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
        <Select
          label="Status"
          name="status"
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={handleChange}
        />
      </div>

      <Input
        label="Diagnosis"
        name="diagnosis"
        value={values.diagnosis}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="e.g. Essential hypertension"
        required
        error={touched.diagnosis ? errors.diagnosis : ''}
      />

      <div className="prescription-form__items">
        <div className="prescription-form__items-header">
          <h3>Medications</h3>
          <Button type="button" variant="outline" size="small" leftIcon={Plus} onClick={addItem}>
            Add medication
          </Button>
        </div>
        {values.items.map((item, index) => (
          <div key={index} className="prescription-form__item">
            <div className="prescription-form__item-header">
              <span className="prescription-form__item-num">#{index + 1}</span>
              {values.items.length > 1 && (
                <button
                  type="button"
                  className="prescription-form__item-remove"
                  onClick={() => removeItem(index)}
                  aria-label="Remove medication"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="prescription-form__item-grid">
              <Input
                label="Medication"
                value={item.medication}
                onChange={(event) => updateItem(index, 'medication', event.target.value)}
                placeholder="e.g. Amlodipine 5mg"
              />
              <Input
                label="Dosage"
                value={item.dosage}
                onChange={(event) => updateItem(index, 'dosage', event.target.value)}
                placeholder="e.g. 1 tablet"
                error={touched[`item-dosage-${index}`] ? errors[`item-dosage-${index}`] : ''}
              />
              <Select
                label="Frequency"
                value={item.frequency}
                options={FREQUENCY_OPTIONS}
                onChange={(event) => updateItem(index, 'frequency', event.target.value)}
              />
              <Input
                label="Duration"
                value={item.duration}
                onChange={(event) => updateItem(index, 'duration', event.target.value)}
                placeholder="e.g. 30 days"
              />
              <Input
                label="Instructions"
                value={item.instructions}
                onChange={(event) => updateItem(index, 'instructions', event.target.value)}
                placeholder="e.g. Take with breakfast"
              />
            </div>
          </div>
        ))}
        {errors.items && <p className="prescription-form__error">{errors.items}</p>}
      </div>

      <Textarea
        label="Doctor's notes"
        name="notes"
        rows={3}
        value={values.notes}
        onChange={handleChange}
        placeholder="Additional instructions, lifestyle recommendations, follow-up plan…"
      />

      <div className="prescription-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialValues ? 'Save prescription' : 'Issue prescription'}
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionForm;