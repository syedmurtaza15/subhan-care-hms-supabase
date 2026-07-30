import { useState } from 'react';
import { Input, Select, Textarea, Button } from '../../../components/ui';
import {
  validateEmail,
  validateRequired,
  isEmpty,
} from '../../../utils/validators';
import './DoctorForm.css';

const SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
  'ENT',
  'Gynecology',
  'Ophthalmology',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DoctorForm = ({ initialValues, onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    specialization: initialValues?.specialization || 'General Medicine',
    phone: initialValues?.phone || '',
    email: initialValues?.email || '',
    experience: initialValues?.experience || 1,
    consultationFee: initialValues?.consultationFee || 2000,
    availability: initialValues?.availability || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    schedule: initialValues?.schedule || { startTime: '09:00', endTime: '17:00', slotMinutes: 30 },
    bio: initialValues?.bio || '',
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specializationOptions = SPECIALIZATIONS.map((s) => ({ value: s, label: s }));

  const validateAll = (vals) => ({
    name: validateRequired(vals.name, 'Doctor name'),
    specialization: validateRequired(vals.specialization, 'Specialization'),
    phone: validateRequired(vals.phone, 'Phone'),
    email: validateEmail(vals.email || ''),
    experience: isEmpty(vals.experience) ? 'Experience is required' : Number(vals.experience) < 0 ? 'Enter a valid number' : '',
    consultationFee: isEmpty(vals.consultationFee) ? 'Consultation fee is required' : Number(vals.consultationFee) <= 0 ? 'Fee must be positive' : '',
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

  const toggleDay = (day) => {
    const set = new Set(values.availability);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    setValues({ ...values, availability: Array.from(set) });
  };

  const updateSchedule = (field, value) => {
    setValues({
      ...values,
      schedule: { ...values.schedule, [field]: value },
    });
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
        experience: Number(values.experience),
        consultationFee: Number(values.consultationFee),
        schedule: {
          ...values.schedule,
          slotMinutes: Number(values.schedule.slotMinutes) || 30,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="doctor-form" onSubmit={handleSubmit} noValidate>
      <div className="doctor-form__grid">
        <Input
          label="Full name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Dr. Hamza Iqbal"
          required
          error={touched.name ? errors.name : ''}
        />
        <Select
          label="Specialization"
          name="specialization"
          value={values.specialization}
          options={specializationOptions}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.specialization ? errors.specialization : ''}
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
          placeholder="doctor@subancare.com"
          required
          error={touched.email ? errors.email : ''}
        />
        <Input
          label="Experience (years)"
          name="experience"
          type="number"
          value={values.experience}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.experience ? errors.experience : ''}
        />
        <Input
          label="Consultation fee (Rs)"
          name="consultationFee"
          type="number"
          value={values.consultationFee}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.consultationFee ? errors.consultationFee : ''}
        />
        <Input
          label="Schedule start"
          type="time"
          name="scheduleStart"
          value={values.schedule.startTime}
          onChange={(e) => updateSchedule('startTime', e.target.value)}
        />
        <Input
          label="Schedule end"
          type="time"
          name="scheduleEnd"
          value={values.schedule.endTime}
          onChange={(e) => updateSchedule('endTime', e.target.value)}
        />
        <Input
          label="Slot minutes"
          name="slotMinutes"
          type="number"
          value={values.schedule.slotMinutes}
          onChange={(e) => updateSchedule('slotMinutes', e.target.value)}
        />
      </div>

      <div className="doctor-form__days">
        <label className="doctor-form__days-label">Weekly availability</label>
        <div className="doctor-form__day-row">
          {WEEKDAYS.map((day) => {
            const active = values.availability.includes(day);
            return (
              <button
                key={day}
                type="button"
                className={`doctor-form__day ${active ? 'is-active' : ''}`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <Textarea
        label="Short bio"
        name="bio"
        rows={3}
        value={values.bio}
        onChange={handleChange}
        placeholder="Senior cardiologist specializing in interventional procedures."
      />

      <div className="doctor-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialValues ? 'Save changes' : 'Add doctor'}
        </Button>
      </div>
    </form>
  );
};

export default DoctorForm;