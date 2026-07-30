import { useMemo } from 'react';
import {
  Activity,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  BadgeCheck,
  Sparkles,
  ArrowUpRight,
  Bed,
  Heart,
  Receipt,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAppointments, useInvoices, usePatients } from '../../context/DataContext';
import { ROLE_LABEL } from '../../constants/roles';
import { formatDate } from '../../utils/helpers';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const patients = usePatients();
  const appointments = useAppointments();
  const invoices = useInvoices();

  const firstName = (user?.name || 'there').split(' ')[0];

  const stats = useMemo(() => {
    const apptList = appointments.list();
    const invoiceList = invoices.list();
    const today = new Date().toISOString().split('T')[0];
    return {
      activePatients: patients.list().filter((p) => p.status === 'active').length,
      todaysAppointments: apptList.filter((a) => a.date === today && a.status !== 'cancelled').length,
      pendingPrescriptions: apptList.filter((a) => a.status === 'waiting').length,
      outstanding: invoiceList
        .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partial')
        .reduce((acc, inv) => acc + (inv.total - (inv.amountPaid || 0)), 0),
    };
  }, [patients, appointments, invoices]);

  const STATS = [
    {
      label: 'Active patients',
      value: stats.activePatients,
      delta: '+ live records',
      icon: Users,
      tone: 'primary',
    },
    {
      label: "Today's appointments",
      value: stats.todaysAppointments,
      delta: 'on today\'s calendar',
      icon: Calendar,
      tone: 'secondary',
    },
    {
      label: 'Outstanding invoices',
      value: `Rs ${stats.outstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      delta: 'awaiting payment',
      icon: Receipt,
      tone: 'warning',
    },
    {
      label: 'Total appointments',
      value: appointments.list().length,
      delta: 'across all doctors',
      icon: Activity,
      tone: 'danger',
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__hero">
        <div>
          <span className="dashboard-page__eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Welcome back, {firstName}!
          </span>
          <h1 className="dashboard-page__title">
            Today is <span>{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </h1>
          <p className="dashboard-page__subtitle">
            You&apos;re signed in as <strong>{user?.role ? ROLE_LABEL[user.role] : 'Staff'}</strong>.
            Here&apos;s what&apos;s happening across Subhan Care today.
          </p>
        </div>
        <div className="dashboard-page__hero-illu" aria-hidden="true">
          <Heart size={44} />
        </div>
      </header>

      <section className="dashboard-page__stats">
        {STATS.map(({ label, value, delta, icon: Icon, tone }) => (
          <Card key={label} elevation="sm" padding={false} className="dashboard-page__stat">
            <div className="dashboard-page__stat-body">
              <div className={`dashboard-page__stat-icon dashboard-page__stat-icon--${tone}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="dashboard-page__stat-label">{label}</p>
                <p className="dashboard-page__stat-value">{value}</p>
                <p className="dashboard-page__stat-delta">{delta}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="dashboard-page__grid">
        <Card title="Recent activity" subtitle="What happened across Subhan Care in the last few hours.">
          <ul className="dashboard-page__activity">
            <li className="dashboard-page__activity-item">
              <span className="dashboard-page__activity-icon" aria-hidden="true">
                <Stethoscope size={18} />
              </span>
              <div>
                <p className="dashboard-page__activity-title">Patient records online</p>
                <p className="dashboard-page__activity-body">
                  {stats.activePatients} active patient records in the Subhan Care directory.
                </p>
                <span className="dashboard-page__activity-time">Updated continuously</span>
              </div>
            </li>
            <li className="dashboard-page__activity-item">
              <span className="dashboard-page__activity-icon" aria-hidden="true">
                <FileText size={18} />
              </span>
              <div>
                <p className="dashboard-page__activity-title">Appointments scheduled</p>
                <p className="dashboard-page__activity-body">
                  {appointments.list().length} appointments across all doctors, with{' '}
                  {stats.todaysAppointments} happening today.
                </p>
                <span className="dashboard-page__activity-time">Live data</span>
              </div>
            </li>
            <li className="dashboard-page__activity-item">
              <span className="dashboard-page__activity-icon" aria-hidden="true">
                <BadgeCheck size={18} />
              </span>
              <div>
                <p className="dashboard-page__activity-title">Billing snapshot</p>
                <p className="dashboard-page__activity-body">
                  Rs {stats.outstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })} in
                  outstanding payments waiting to be collected.
                </p>
                <span className="dashboard-page__activity-time">Just now</span>
              </div>
            </li>
          </ul>
        </Card>

        <Card title="Quick actions" subtitle="Get to where you need to go in a click.">
          <div className="dashboard-page__quick">
            {[
              { label: 'New appointment', to: '/dashboard/appointments/new', icon: Calendar, accent: 'primary' },
              { label: 'New patient', to: '/dashboard/patients', icon: Users, accent: 'secondary' },
              { label: 'Generate invoice', to: '/dashboard/billing/new', icon: FileText, accent: 'warning' },
              { label: 'Outstanding', to: '/dashboard/billing/outstanding', icon: Activity, accent: 'danger' },
            ].map(({ label, to, icon: Icon, accent }) => (
              <a key={label} href={to} className={`dashboard-page__quick-link dashboard-page__quick-link--${accent}`}>
                <span className="dashboard-page__quick-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="dashboard-page__quick-label">{label}</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;