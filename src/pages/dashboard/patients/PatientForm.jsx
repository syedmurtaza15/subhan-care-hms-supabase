import { useState } from 'react';
import { Input, Select, Textarea, Button } from '../../../components/ui';
import {
  validateEmail,
  validateRequired,
  isEmpty,
} from '../../../utils/validators';
import './PatientForm.css';

const GENDERS = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Other', label: 'Other' },
];

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const PatientForm = ({ initialValues, doctors = [], onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    age: initialValues?.age || '',
    gender: initialValues?.gender || 'Female',
    phone: initialValues?.phone || '',
    email: initialValues?.email || '',
    bloodGroup: initialValues?.bloodGroup || 'O+',
    address: initialValues?.address || '',
    emergencyContact: initialValues?.emergencyContact || '',
    allergies: initialValues?.allergies || 'None',
    notes: initialValues?.notes || '',
    assignedDoctor: initialValues?.assignedDoctor || (doctors[0]?.id ?? ''),
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctorOptions = doctors.map((d) => ({ value: d.id, label: d.name }));
  const bloodOptions = BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }));

  const validateAll = (vals) => ({
    name: validateRequired(vals.name, 'Full name'),
    age: isEmpty(vals.age) ? 'Age is required' : Number(vals.age) < 0 || Number(vals.age) > 130 ? 'Enter a valid age' : '',
    phone: validateRequired(vals.phone, 'Phone number'),
    email: vals.email && !validateEmail(vals.email) ? '' : validateEmail(vals.email || ''),
    assignedDoctor: validateRequired(vals.assignedDoctor, 'Assigned doctor'),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateAll(next));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const nextTouched = { ...touched, [name]: true };
    setTouched(nextTouched);
    setErrors(validateAll(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.values(allErrors).some(Boolean)) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        age: Number(values.age),
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="patient-form" onSubmit={handleSubmit} noValidate>
      <div className="patient-form__grid">
        <Input
          label="Full name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Aisha Mehmood"
          required
          error={touched.name ? errors.name : ''}
        />
        <Input
          label="Phone"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+92 300 0000000"
          required
          error={touched.phone ? errors.phone : ''}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="optional@example.com"
          error={touched.email ? errors.email : ''}
        />
        <Input
          label="Age"
          name="age"
          type="number"
          value={values.age}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="32"
          required
          error={touched.age ? errors.age : ''}
        />
        <Select
          label="Gender"
          name="gender"
          value={values.gender}
          options={GENDERS}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Select
          label="Blood group"
          name="bloodGroup"
          value={values.bloodGroup}
          options={bloodOptions}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Select
          label="Assigned doctor"
          name="assignedDoctor"
          value={values.assignedDoctor}
          options={doctorOptions}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.assignedDoctor ? errors.assignedDoctor : ''}
          placeholder="Pick a doctor"
        />
        <Input
          label="Emergency contact"
          name="emergencyContact"
          value={values.emergencyContact}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Name + number"
        />
      </div>
      <Input
        label="Address"
        name="address"
        value={values.address}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="House 14, Street 7, Lahore"
      />
      <Input
        label="Allergies"
        name="allergies"
        value={values.allergies}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="e.g. Penicillin, pollen"
      />
      <Textarea
        label="Notes"
        name="notes"
        rows={3}
        value={values.notes}
        onChange={handleChange}
        placeholder="Additional clinical notes…"
      />

      <div className="patient-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialValues ? 'Save changes' : 'Add patient'}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;