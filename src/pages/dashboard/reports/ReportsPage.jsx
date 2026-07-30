import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Users,
  Stethoscope,
  CalendarClock,
  Receipt,
  Pill,
  Wallet,
  Activity,
  Download,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Select,
} from '../../../components/ui';
import BarChart from '../../../components/ui/charts/BarChart';
import DonutChart from '../../../components/ui/charts/DonutChart';
import LineChart from '../../../components/ui/charts/LineChart';
import {
  useAppointments,
  useDoctors,
  useInvoices,
  useInventory,
  usePatients,
  usePrescriptions,
} from '../../../context/DataContext';
import { formatDate } from '../../../utils/helpers';
import './ReportsPage.css';
import '../../../components/ui/charts/Chart.css';

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const ReportsPage = () => {
  const patients = usePatients();
  const doctors = useDoctors();
  const appointments = useAppointments();
  const invoices = useInvoices();
  const prescriptions = usePrescriptions();
  const inventory = useInventory();
  const [range, setRange] = useState('30');

  const rangeDays = Number(range);
  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - rangeDays);
    return d;
  }, [rangeDays]);

  // Filter by date range
  const inRange = (iso) => {
    if (!iso) return false;
    return new Date(iso) >= since;
  };

  const inRangeAppointments = useMemo(
    () => appointments.list().filter((a) => inRange(a.issuedAt) || inRange(a.date)),
    [appointments, since],
  );
  const inRangeInvoices = useMemo(
    () => invoices.list().filter((i) => inRange(i.issuedAt)),
    [invoices, since],
  );
  const inRangePrescriptions = useMemo(
    () => prescriptions.list().filter((p) => inRange(p.issuedAt)),
    [prescriptions, since],
  );

  // === KPI metrics ===
  const kpis = useMemo(() => {
    const totalRevenue = inRangeInvoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const billedRevenue = inRangeInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const outstanding = billedRevenue - totalRevenue;
    const collectionRate = billedRevenue > 0 ? Math.round((totalRevenue / billedRevenue) * 100) : 0;
    return {
      totalRevenue,
      billedRevenue,
      outstanding,
      collectionRate,
      newPatients: patients.list().filter((p) => inRange(p.createdAt)).length,
      activePrescriptions: inRangePrescriptions.filter((p) => p.status === 'active').length,
      completedAppointments: inRangeAppointments.filter((a) => a.status === 'completed').length,
      cancelledAppointments: inRangeAppointments.filter((a) => a.status === 'cancelled').length,
      lowStockItems: inventory.list().filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock').length,
    };
  }, [patients, inRangeAppointments, inRangeInvoices, inRangePrescriptions, inventory, since]);

  // === Appointment status breakdown ===
  const appointmentStatus = useMemo(() => {
    const counts = { confirmed: 0, waiting: 0, followup: 0, completed: 0, cancelled: 0 };
    inRangeAppointments.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    });
    return [
      { label: 'Confirmed', value: counts.confirmed, color: '#2563EB' },
      { label: 'Waiting', value: counts.waiting, color: '#F59E0B' },
      { label: 'Follow-up', value: counts.followup, color: '#22C55E' },
      { label: 'Completed', value: counts.completed, color: '#0EA5E9' },
      { label: 'Cancelled', value: counts.cancelled, color: '#94A3B8' },
    ].filter((d) => d.value > 0);
  }, [inRangeAppointments]);

  // === Revenue by month (last 6 buckets) ===
  const revenueByMonth = useMemo(() => {
    const buckets = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const total = invoices.list().reduce((acc, inv) => {
        const issued = new Date(inv.issuedAt);
        if (issued.getMonth() === d.getMonth() && issued.getFullYear() === d.getFullYear()) {
          return acc + (inv.amountPaid || 0);
        }
        return acc;
      }, 0);
      buckets.push({ label, value: total });
    }
    return buckets;
  }, [invoices]);

  // === Top doctors by appointments ===
  const topDoctors = useMemo(() => {
    const map = {};
    inRangeAppointments.forEach((a) => {
      map[a.doctorId] = (map[a.doctorId] || 0) + 1;
    });
    return Object.entries(map)
      .map(([id, count]) => {
        const d = doctors.list().find((doc) => doc.id === id);
        return { label: d ? d.name.split(' ').slice(-1)[0] : 'Unknown', value: count };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [inRangeAppointments, doctors]);

  // === Patients by gender ===
  const patientsByGender = useMemo(() => {
    const counts = { Female: 0, Male: 0, Other: 0 };
    patients.list().forEach((p) => {
      if (counts[p.gender] !== undefined) counts[p.gender] += 1;
    });
    return [
      { label: 'Female', value: counts.Female, color: '#EC4899' },
      { label: 'Male', value: counts.Male, color: '#2563EB' },
      { label: 'Other', value: counts.Other, color: '#A78BFA' },
    ].filter((d) => d.value > 0);
  }, [patients]);

  // === Inventory value by category ===
  const inventoryByCategory = useMemo(() => {
    const map = {};
    inventory.list().forEach((i) => {
      map[i.category] = (map[i.category] || 0) + i.stock * i.unitPrice;
    });
    const colors = { Medication: '#2563EB', Supplies: '#0EA5E9', Equipment: '#A78BFA' };
    return Object.entries(map).map(([cat, value]) => ({
      label: cat,
      value: Math.round(value),
      color: colors[cat] || '#94A3B8',
    }));
  }, [inventory]);

  // === Top prescribed medications ===
  const topMeds = useMemo(() => {
    const map = {};
    inRangePrescriptions.forEach((rx) => {
      rx.items.forEach((it) => {
        map[it.medication] = (map[it.medication] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, value]) => ({ label: name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [inRangePrescriptions]);

  // === Invoice status breakdown ===
  const invoiceStatus = useMemo(() => {
    const counts = { paid: 0, unpaid: 0, partial: 0, overdue: 0 };
    inRangeInvoices.forEach((i) => {
      if (counts[i.status] !== undefined) counts[i.status] += 1;
    });
    return [
      { label: 'Paid', value: counts.paid, color: '#22C55E' },
      { label: 'Unpaid', value: counts.unpaid, color: '#F59E0B' },
      { label: 'Partial', value: counts.partial, color: '#0EA5E9' },
      { label: 'Overdue', value: counts.overdue, color: '#EF4444' },
    ].filter((d) => d.value > 0);
  }, [inRangeInvoices]);

  const formatRupees = (v) => `Rs ${Math.round(v).toLocaleString()}`;

  return (
    <div className="reports-page">
      <header className="reports-page__header">
        <div>
          <span className="reports-page__eyebrow">Reports Module</span>
          <h1>Operational Reports</h1>
          <p>
            Real-time analytics across patients, doctors, appointments, prescriptions,
            inventory and finance — all in one place.
          </p>
        </div>
        <div className="reports-page__actions">
          <Select
            name="range"
            value={range}
            options={RANGE_OPTIONS}
            onChange={(event) => setRange(event.target.value)}
          />
          <Button
            variant="outline"
            leftIcon={Download}
            onClick={() => window.print()}
          >
            Export
          </Button>
        </div>
      </header>

      <section className="reports-page__kpis">
        <div className="reports-page__kpi">
          <span className="reports-page__kpi-icon reports-page__kpi-icon--primary">
            <Wallet size={20} />
          </span>
          <div>
            <p className="reports-page__kpi-label">Revenue (last {rangeDays} days)</p>
            <p className="reports-page__kpi-value">{formatRupees(kpis.totalRevenue)}</p>
            <p className="reports-page__kpi-meta">
              Collection rate: <strong>{kpis.collectionRate}%</strong>
            </p>
          </div>
        </div>
        <div className="reports-page__kpi">
          <span className="reports-page__kpi-icon reports-page__kpi-icon--secondary">
            <Users size={20} />
          </span>
          <div>
            <p className="reports-page__kpi-label">New patients</p>
            <p className="reports-page__kpi-value">{kpis.newPatients}</p>
            <p className="reports-page__kpi-meta">
              Total in system: <strong>{patients.list().length}</strong>
            </p>
          </div>
        </div>
        <div className="reports-page__kpi">
          <span className="reports-page__kpi-icon reports-page__kpi-icon--info">
            <CalendarClock size={20} />
          </span>
          <div>
            <p className="reports-page__kpi-label">Appointments</p>
            <p className="reports-page__kpi-value">{inRangeAppointments.length}</p>
            <p className="reports-page__kpi-meta">
              Completed: <strong>{kpis.completedAppointments}</strong> · Cancelled: <strong>{kpis.cancelledAppointments}</strong>
            </p>
          </div>
        </div>
        <div className="reports-page__kpi">
          <span className="reports-page__kpi-icon reports-page__kpi-icon--warning">
            <Pill size={20} />
          </span>
          <div>
            <p className="reports-page__kpi-label">Active prescriptions</p>
            <p className="reports-page__kpi-value">{kpis.activePrescriptions}</p>
            <p className="reports-page__kpi-meta">
              Low / out of stock: <strong>{kpis.lowStockItems}</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="reports-page__row reports-page__row--two">
        <Card title="Revenue trend" subtitle="Last 6 months of collections">
          {revenueByMonth.some((d) => d.value > 0) ? (
            <LineChart
              data={revenueByMonth}
              valueFormatter={(v) => `Rs ${Math.round(v / 1000)}k`}
              yAxisLabel="Revenue (Rs)"
            />
          ) : (
            <EmptyState size="sm" icon={Activity} title="No revenue data yet" description="Invoices will appear once generated." />
          )}
        </Card>

        <Card title="Appointment mix" subtitle="Status distribution">
          {appointmentStatus.length ? (
            <DonutChart
              data={appointmentStatus}
              centerLabel="Total"
              centerValue={inRangeAppointments.length.toString()}
            />
          ) : (
            <EmptyState size="sm" icon={CalendarClock} title="No appointments" />
          )}
        </Card>
      </section>

      <section className="reports-page__row reports-page__row--two">
        <Card title="Top doctors" subtitle="By appointments in selected range">
          {topDoctors.length ? (
            <BarChart data={topDoctors} valueFormatter={(v) => v} yAxisLabel="Appointments" />
          ) : (
            <EmptyState size="sm" icon={Stethoscope} title="No appointments" />
          )}
        </Card>

        <Card title="Invoice status" subtitle="Distribution across the network">
          {invoiceStatus.length ? (
            <DonutChart
              data={invoiceStatus}
              centerLabel="Invoices"
              centerValue={inRangeInvoices.length.toString()}
            />
          ) : (
            <EmptyState size="sm" icon={Receipt} title="No invoices" />
          )}
        </Card>
      </section>

      <section className="reports-page__row reports-page__row--two">
        <Card title="Patient demographics" subtitle="By gender">
          {patientsByGender.length ? (
            <DonutChart
              data={patientsByGender}
              centerLabel="Total"
              centerValue={patients.list().length.toString()}
            />
          ) : (
            <EmptyState size="sm" icon={Users} title="No patients" />
          )}
        </Card>

        <Card title="Inventory value" subtitle="By category">
          {inventoryByCategory.length ? (
            <BarChart
              data={inventoryByCategory}
              valueFormatter={(v) => `${Math.round(v / 1000)}k`}
              yAxisLabel="Value (Rs)"
            />
          ) : (
            <EmptyState size="sm" icon={Pill} title="No inventory" />
          )}
        </Card>
      </section>

      <Card title="Top prescribed medications" subtitle={`Across ${inRangePrescriptions.length} prescriptions`}>
        {topMeds.length ? (
          <BarChart data={topMeds} valueFormatter={(v) => v} yAxisLabel="Times prescribed" />
        ) : (
          <EmptyState size="sm" icon={Pill} title="No prescription data" />
        )}
      </Card>

      <Card title="Outstanding receivables" subtitle="Patients to follow up with">
        {(() => {
          const outstanding = invoices.list().filter((i) => i.status !== 'paid');
          if (outstanding.length === 0) {
            return <EmptyState size="sm" icon={TrendingUp} title="All caught up!" description="No outstanding balances right now." />;
          }
          const totalDue = outstanding.reduce((acc, i) => acc + (i.total - (i.amountPaid || 0)), 0);
          return (
            <div className="reports-page__outstanding">
              <div className="reports-page__outstanding-total">
                <p>Total outstanding</p>
                <strong>{formatRupees(totalDue)}</strong>
                <span>across {outstanding.length} invoices</span>
              </div>
              <ul className="reports-page__outstanding-list">
                {outstanding.slice(0, 5).map((inv) => {
                  const patient = patients.list().find((p) => p.id === inv.patientId);
                  return (
                    <li key={inv.id}>
                      <div>
                        <p className="reports-page__outstanding-id">{inv.id}</p>
                        <p className="reports-page__outstanding-patient">
                          {patient?.name || 'Unknown'} · due {formatDate(inv.dueAt)}
                        </p>
                      </div>
                      <div className="reports-page__outstanding-side">
                        <span>{formatRupees(inv.total - (inv.amountPaid || 0))}</span>
                        <span className={`reports-page__outstanding-pill reports-page__outstanding-pill--${inv.status}`}>
                          {inv.status}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}
      </Card>
    </div>
  );
};

export default ReportsPage;