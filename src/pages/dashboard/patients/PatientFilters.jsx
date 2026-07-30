import { Select } from '../../../components/ui';
import './PatientFilters.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const PatientFilters = ({ filters, onChange, doctors = [], genderOptions = [] }) => {
  const doctorOptions = [
    { value: 'all', label: 'All doctors' },
    ...doctors.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <div className="patient-filters">
      <div className="patient-filters__group">
        <Select
          label="Gender"
          name="gender"
          value={filters.gender}
          options={genderOptions}
          onChange={(event) => onChange({ ...filters, gender: event.target.value })}
        />
      </div>
      <div className="patient-filters__group">
        <Select
          label="Assigned doctor"
          name="doctorId"
          value={filters.doctorId}
          options={doctorOptions}
          onChange={(event) => onChange({ ...filters, doctorId: event.target.value })}
        />
      </div>
      <div className="patient-filters__group">
        <Select
          label="Status"
          name="status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
        />
      </div>
    </div>
  );
};

export default PatientFilters;