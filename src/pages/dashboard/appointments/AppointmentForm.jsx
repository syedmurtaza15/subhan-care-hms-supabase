import { useMemo, useState } from 'react';
import {
  Button,
  DateInput,
  Input,
  Select,
  Textarea,
  TimeSlotPicker,
} from '../../../components/ui';
import {
  useAppointments,
  useDoctors,
  usePatients,
} from '../../../context/DataContext';
import { validateRequired } from '../../../utils/validators';
import './AppointmentForm.css';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const MODE_OPTIONS = [
  { value: 'in-person', label: 'In-person' },
  { value: 'video', label: 'Video call' },
];

const AppointmentForm = ({
  initialValues,
  defaultPatientId,
  defaultDoctorId,
  onSubmit,
  onCancel,
}) => {
  const { list: listAppointments } = useAppointments();
  const doctors = useDoctors().list();
  const patients = usePatients().list();
  const allAppointments = listAppointments();

  const today = new Date().toISOString().split('T')[0];

  const [values, setValues] = useState(() => ({
    patientId: initialValues?.patientId || defaultPatientId || patients[0]?.id || '',
    doctorId: initialValues?.doctorId || defaultDoctorId || doctors[0]?.id || '',
    date: initialValues?.date || today,
    time: initialValues?.time || '09:00',
    duration: initialValues?.duration || 30,
    status: initialValues?.status || 'confirmed',
    mode: initialValues?.mode || 'in-person',
    reason: initialValues?.reason || '',
    notes: initialValues?.notes || '',
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctor = useMemo(
    () => doctors.find((d) => d.id === values.doctorId),
    [doctors, values.doctorId],
  );

  const takenSlots = useMemo(() => {
    return allAppointments
      .filter(
        (a) =>
          a.doctorId === values.doctorId &&
          a.date === values.date &&
          a.id !== initialValues?.id &&
          a.status !== 'cancelled',
      )
      .map((a) => a.time);
  }, [allAppointments, values.doctorId, values.date, initialValues?.id]);

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.id})`,
  }));
  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: `${d.name} · ${d.specialization}`,
  }));

  const validateAll = (vals) => ({
    patientId: validateRequired(vals.patientId, 'Patient'),
    doctorId: validateRequired(vals.doctorId, 'Doctor'),
    date: validateRequired(vals.date, 'Date'),
    time: validateRequired(vals.time, 'Time slot'),
    reason: validateRequired(vals.reason, 'Reason for visit'),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    if (name === 'doctorId' && next.time) {
      // Reset time when switching doctor - schedule may differ
      next.time = '';
    }
    setValues(next);
    if (touched[name]) setErrors(validateAll(next));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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
      await onSubmit({ ...values, duration: Number(values.duration) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="appointment-form" onSubmit={handleSubmit} noValidate>
      <div className="appointment-form__grid">
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
          label="Appointment date"
          name="date"
          value={values.date}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.date ? errors.date : ''}
        />
        <Select
          label="Duration (minutes)"
          name="duration"
          value={String(values.duration)}
          options={[
            { value: '15', label: '15 min' },
            { value: '30', label: '30 min' },
            { value: '45', label: '45 min' },
            { value: '60', label: '60 min' },
          ]}
          onChange={handleChange}
        />
        <Select
          label="Consultation mode"
          name="mode"
          value={values.mode}
          options={MODE_OPTIONS}
          onChange={handleChange}
        />
        <Select
          label="Status"
          name="status"
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={handleChange}
        />
      </div>

      <div className="appointment-form__timeslot">
        <label className="appointment-form__timeslot-label">
          Available time slots
          {doctor?.schedule && (
            <span className="appointment-form__timeslot-meta">
              {doctor.schedule.startTime} - {doctor.schedule.endTime} ({doctor.schedule.slotMinutes} min slots)
            </span>
          )}
        </label>
        <TimeSlotPicker
          startTime={doctor?.schedule?.startTime}
          endTime={doctor?.schedule?.endTime}
          slotMinutes={doctor?.schedule?.slotMinutes || 30}
          takenSlots={takenSlots}
          value={values.time}
          onChange={(slot) => setValues({ ...values, time: slot })}
        />
        {touched.time && errors.time && (
          <p className="appointment-form__error">{errors.time}</p>
        )}
      </div>

      <Input
        label="Reason for visit"
        name="reason"
        value={values.reason}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Routine cardiology follow-up"
        required
        error={touched.reason ? errors.reason : ''}
      />
      <Textarea
        label="Additional notes"
        name="notes"
        rows={3}
        value={values.notes}
        onChange={handleChange}
        placeholder="Symptoms, prep instructions, follow-up details…"
      />

      <div className="appointment-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialValues ? 'Save changes' : 'Book appointment'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;