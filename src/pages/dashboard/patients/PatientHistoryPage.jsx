import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Pill,
  Activity,
  FlaskConical,
  Stethoscope,
  HeartPulse,
  ClipboardList,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  StatusBadge,
} from '../../../components/ui';
import {
  usePatients,
  useAppointments,
  useInvoices,
  usePrescriptions,
  useMedicalHistory,
} from '../../../context/DataContext';
import { formatDate, formatTime, initialsFromName } from '../../../utils/helpers';
import './PatientHistoryPage.css';

const TABS = [
  { id: 'visits', label: 'Visits', icon: Stethoscope },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'records', label: 'Records', icon: ClipboardList },
  { id: 'labs', label: 'Lab results', icon: FlaskConical },
  { id: 'billing', label: 'Billing', icon: FileText },
];

const RECORD_ICON = {
  'lab-result': FlaskConical,
  vitals: HeartPulse,
  diagnosis: Activity,
  procedure: ClipboardList,
};

const PatientHistoryPage = () => {
  const { id } = useParams();
  const patients = usePatients();
  const { list: listAppointments } = useAppointments();
  const { list: listInvoices } = useInvoices();
  const { list: listPrescriptions } = usePrescriptions();
  const { list: listMedicalHistory } = useMedicalHistory();
  const patient = patients.find(id);
  const [tab, setTab] = useState('visits');

  const visits = useMemo(
    () =>
      listAppointments()
        .filter((a) => a.patientId === id && a.status !== 'cancelled')
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [listAppointments, id],
  );

  const prescriptions = useMemo(
    () =>
      listPrescriptions()
        .filter((p) => p.patientId === id)
        .sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || '')),
    [listPrescriptions, id],
  );

  const records = useMemo(
    () =>
      listMedicalHistory()
        .filter((r) => r.patientId === id)
        .sort((a, b) => (b.recordedAt || '').localeCompare(a.recordedAt || '')),
    [listMedicalHistory, id],
  );

  const labResults = useMemo(
    () => records.filter((r) => r.type === 'lab-result'),
    [records],
  );

  const invoices = useMemo(
    () => listInvoices().filter((i) => i.patientId === id),
    [listInvoices, id],
  );

  if (!patient) {
    return (
      <EmptyState
        icon={FileText}
        title="Patient not found"
        description="Open the directory and pick a patient to view their history."
        action={
          <Link to="/dashboard/patients">
            <Button variant="primary" leftIcon={ArrowLeft}>
              Back to directory
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="patient-history">
      <Link to={`/dashboard/patients/${patient.id}`} className="patient-history__back">
        <ArrowLeft size={16} aria-hidden="true" /> Back to profile
      </Link>

      <header className="patient-history__header">
        <div>
          <span className="patient-history__eyebrow">Medical history</span>
          <h1>{patient.name}</h1>
          <p>
            Full chronological record for <strong>{patient.id}</strong> — visits,
            prescriptions, lab results and invoices.
          </p>
        </div>
        <Link to={`/dashboard/patients/${patient.id}`}>
          <Button variant="outline">View profile</Button>
        </Link>
      </header>

      <div className="patient-history__tabs">
        {TABS.map(({ id: tabId, label, icon: Icon }) => {
          const counts = {
            visits: visits.length,
            prescriptions: prescriptions.length,
            records: records.length,
            labs: labResults.length,
            billing: invoices.length,
          };
          return (
            <button
              key={tabId}
              type="button"
              className={`patient-history__tab ${tab === tabId ? 'is-active' : ''}`}
              onClick={() => setTab(tabId)}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
              <span className="patient-history__tab-count">{counts[tabId]}</span>
            </button>
          );
        })}
      </div>

      {tab === 'visits' && (
        <Card title="Visit timeline" subtitle={`${visits.length} visits on file`}>
          {visits.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              size="sm"
              title="No visits yet"
              description="This patient hasn't been seen by a Subhan Care clinician."
            />
          ) : (
            <ol className="patient-history__timeline">
              {visits.map((visit) => (
                <li key={visit.id}>
                  <span className="patient-history__timeline-dot" />
                  <div>
                    <p className="patient-history__timeline-when">
                      {formatDate(visit.date)} ·{' '}
                      {formatTime(`1970-01-01T${visit.time}:00`)} · {visit.duration} min
                    </p>
                    <p className="patient-history__timeline-title">{visit.reason}</p>
                    {visit.notes && (
                      <p className="patient-history__timeline-notes">{visit.notes}</p>
                    )}
                    <StatusBadge tone={visit.status}>{visit.status}</StatusBadge>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      {tab === 'prescriptions' && (
        <Card title="Prescriptions" subtitle={`${prescriptions.length} prescriptions on file`}>
          {prescriptions.length === 0 ? (
            <EmptyState
              icon={Pill}
              size="sm"
              title="No prescriptions yet"
              description="This patient hasn't been prescribed any medication."
            />
          ) : (
            <ul className="patient-history__prescriptions">
              {prescriptions.map((rx) => (
                <li key={rx.id}>
                  <Link to={`/dashboard/prescriptions/${rx.id}`} className="patient-history__rx-link">
                    <div className="patient-history__rx-header">
                      <span className="patient-history__rx-id">{rx.id}</span>
                      <StatusBadge tone={rx.status}>{rx.status}</StatusBadge>
                    </div>
                    <p className="patient-history__rx-diagnosis">{rx.diagnosis}</p>
                    <p className="patient-history__rx-when">
                      Issued {formatDate(rx.issuedAt)} · {rx.items.length} medication
                      {rx.items.length === 1 ? '' : 's'}
                    </p>
                    <ul className="patient-history__rx-items">
                      {rx.items.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.medication}</strong> · {item.dosage} · {item.frequency}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'records' && (
        <Card title="Medical records" subtitle={`${records.length} entries`}>
          {records.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              size="sm"
              title="No records yet"
              description="No medical records have been logged for this patient."
            />
          ) : (
            <ul className="patient-history__records">
              {records.map((rec) => {
                const Icon = RECORD_ICON[rec.type] || ClipboardList;
                return (
                  <li key={rec.id}>
                    <span className="patient-history__record-icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="patient-history__record-title">{rec.title}</p>
                      <p className="patient-history__record-when">
                        {formatDate(rec.recordedAt)} · by {rec.recordedBy}
                      </p>
                      <p className="patient-history__record-summary">{rec.summary}</p>
                      {rec.details && (
                        <p className="patient-history__record-details">{rec.details}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {tab === 'labs' && (
        <Card title="Lab results" subtitle={`${labResults.length} reports`}>
          {labResults.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              size="sm"
              title="No lab results uploaded"
              description="Lab integrations will be added in a later sprint."
            />
          ) : (
            <ul className="patient-history__records">
              {labResults.map((rec) => (
                <li key={rec.id}>
                  <span className="patient-history__record-icon">
                    <FlaskConical size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="patient-history__record-title">{rec.title}</p>
                    <p className="patient-history__record-when">
                      {formatDate(rec.recordedAt)} · by {rec.recordedBy}
                    </p>
                    <p className="patient-history__record-summary">{rec.summary}</p>
                    {rec.details && (
                      <p className="patient-history__record-details">{rec.details}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'billing' && (
        <Card title="Billing summary" subtitle={`${invoices.length} invoices generated`}>
          {invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              size="sm"
              title="No invoices yet"
              description="Create one from the billing page."
            />
          ) : (
            <ul className="patient-history__invoices">
              {invoices.map((inv) => (
                <li key={inv.id}>
                  <div>
                    <Link to={`/dashboard/billing/${inv.id}`} className="patient-history__invoice-when">
                      {inv.id}
                    </Link>
                    <p className="patient-history__invoice-meta">
                      {inv.items.length} item(s) · Issued {formatDate(inv.issuedAt)}
                    </p>
                  </div>
                  <div className="patient-history__invoice-side">
                    <span className="patient-history__invoice-amount">
                      Rs {inv.total.toLocaleString()}
                    </span>
                    <StatusBadge tone={inv.status}>{inv.status}</StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

export default PatientHistoryPage;