/**
 * Seed data for the Subhan Care HMS modules.
 * Persisted to localStorage on first load so the app demos nicely.
 */

import { storage } from '../utils/storage';

const KEYS = {
  patients: 'subhan_care.patients',
  doctors: 'subhan_care.doctors',
  appointments: 'subhan_care.appointments',
  invoices: 'subhan_care.invoices',
  staff: 'subhan_care.staff',
  prescriptions: 'subhan_care.prescriptions',
  inventory: 'subhan_care.inventory',
  medicalHistory: 'subhan_care.medical_history',
};

export const seedIfEmpty = () => {
  // Patients
  if (!storage.get(KEYS.patients)) {
    storage.set(KEYS.patients, [
      {
        id: 'PT-2391', name: 'Aisha Mehmood', age: 32, gender: 'Female',
        phone: '+92 300 1234567', email: 'aisha.mehmood@example.com',
        bloodGroup: 'O+', address: 'House 14, Street 7, Lahore',
        emergencyContact: 'Imran Mehmood (+92 301 7654321)',
        allergies: 'Penicillin, pollen',
        notes: 'Follows up every quarter for hypertension management.',
        status: 'active', assignedDoctor: 'DR-HAMZA',
        createdAt: '2026-05-14T09:00:00.000Z', updatedAt: '2026-06-22T14:30:00.000Z',
      },
      {
        id: 'PT-2392', name: 'Bilal Khan', age: 44, gender: 'Male',
        phone: '+92 321 5556677', email: 'bilal.khan@example.com',
        bloodGroup: 'A+', address: 'Block C, Islamabad',
        emergencyContact: 'Sara Khan (+92 321 1112233)', allergies: 'None',
        notes: 'Routine cardiology check-ups.',
        status: 'active', assignedDoctor: 'DR-SANA',
        createdAt: '2026-04-08T10:30:00.000Z', updatedAt: '2026-06-18T08:15:00.000Z',
      },
      {
        id: 'PT-2393', name: 'Hira Tariq', age: 28, gender: 'Female',
        phone: '+92 333 9988776', email: 'hira.tariq@example.com',
        bloodGroup: 'B-', address: 'F-7, Markaz, Islamabad',
        emergencyContact: 'Ahmed Tariq (+92 333 4455667)', allergies: 'Shellfish',
        notes: 'Pregnant - 22 weeks. Antenatal care plan in place.',
        status: 'active', assignedDoctor: 'DR-USMAN',
        createdAt: '2026-03-19T11:45:00.000Z', updatedAt: '2026-07-01T09:00:00.000Z',
      },
      {
        id: 'PT-2394', name: 'Imran Aziz', age: 51, gender: 'Male',
        phone: '+92 345 1110000', email: 'imran.aziz@example.com',
        bloodGroup: 'AB+', address: 'DHA Phase 6, Karachi',
        emergencyContact: 'Naila Aziz (+92 345 2221100)', allergies: 'Sulfa drugs',
        notes: 'Type-2 diabetes, on Metformin.',
        status: 'inactive', assignedDoctor: 'DR-HAMZA',
        createdAt: '2026-02-22T13:15:00.000Z', updatedAt: '2026-05-30T10:00:00.000Z',
      },
      {
        id: 'PT-2395', name: 'Sana Iqbal', age: 35, gender: 'Female',
        phone: '+92 301 4477885', email: 'sana.iqbal@example.com',
        bloodGroup: 'O-', address: 'PECHS, Karachi',
        emergencyContact: 'Faisal Iqbal (+92 301 1122334)', allergies: 'Latex',
        notes: 'Migraine episodes every 2-3 weeks.',
        status: 'active', assignedDoctor: 'DR-SANA',
        createdAt: '2026-01-30T14:00:00.000Z', updatedAt: '2026-06-25T16:30:00.000Z',
      },
      {
        id: 'PT-2396', name: 'Yousuf Raza', age: 60, gender: 'Male',
        phone: '+92 312 6655443', email: 'yousuf.raza@example.com',
        bloodGroup: 'A-', address: 'Gulberg, Lahore',
        emergencyContact: 'Mariam Raza (+92 312 1122009)', allergies: 'None',
        notes: 'Post-op recovery from knee replacement.',
        status: 'active', assignedDoctor: 'DR-USMAN',
        createdAt: '2026-04-02T12:00:00.000Z', updatedAt: '2026-06-12T15:20:00.000Z',
      },
    ]);
  }

  // Doctors
  if (!storage.get(KEYS.doctors)) {
    storage.set(KEYS.doctors, [
      {
        id: 'DR-HAMZA', name: 'Dr. Hamza Iqbal', specialization: 'Cardiology',
        phone: '+92 300 1112233', email: 'hamza.iqbal@subancare.com',
        experience: 12, consultationFee: 3500,
        availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        schedule: { startTime: '09:00', endTime: '17:00', slotMinutes: 30 },
        status: 'active',
        bio: 'Senior cardiologist specializing in interventional procedures.',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-06-15T09:00:00.000Z',
      },
      {
        id: 'DR-SANA', name: 'Dr. Sana Yousuf', specialization: 'Neurology',
        phone: '+92 311 2233445', email: 'sana.yousuf@subancare.com',
        experience: 9, consultationFee: 4000,
        availability: ['Mon', 'Wed', 'Thu', 'Sat'],
        schedule: { startTime: '10:00', endTime: '18:00', slotMinutes: 45 },
        status: 'active',
        bio: 'Consultant neurologist with focus on migraine & epilepsy.',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-06-18T11:00:00.000Z',
      },
      {
        id: 'DR-USMAN', name: 'Dr. Usman Ghani', specialization: 'Orthopedics',
        phone: '+92 333 4455667', email: 'usman.ghani@subancare.com',
        experience: 14, consultationFee: 3000,
        availability: ['Tue', 'Wed', 'Thu', 'Fri'],
        schedule: { startTime: '08:00', endTime: '16:00', slotMinutes: 30 },
        status: 'active',
        bio: 'Orthopedic surgeon specializing in sports injuries.',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-06-22T08:30:00.000Z',
      },
      {
        id: 'DR-MARYAM', name: 'Dr. Maryam Saleem', specialization: 'Pediatrics',
        phone: '+92 321 7788990', email: 'maryam.saleem@subancare.com',
        experience: 7, consultationFee: 2500,
        availability: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
        schedule: { startTime: '09:30', endTime: '17:30', slotMinutes: 30 },
        status: 'active',
        bio: 'Pediatrician with a special interest in neonatology.',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-06-25T12:00:00.000Z',
      },
    ]);
  }

  // Appointments
  if (!storage.get(KEYS.appointments)) {
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const dPlus = (n) => {
      const x = new Date(today);
      x.setDate(x.getDate() + n);
      return fmt(x);
    };
    storage.set(KEYS.appointments, [
      { id: 'APT-1001', patientId: 'PT-2391', doctorId: 'DR-HAMZA', date: dPlus(0), time: '09:30', duration: 30, status: 'confirmed', mode: 'in-person', reason: 'Routine cardiology follow-up', notes: '', createdAt: '2026-06-30T08:00:00.000Z', updatedAt: '2026-06-30T08:00:00.000Z' },
      { id: 'APT-1002', patientId: 'PT-2392', doctorId: 'DR-SANA', date: dPlus(0), time: '11:00', duration: 45, status: 'waiting', mode: 'video', reason: 'Migraine evaluation', notes: 'Patient reports light sensitivity.', createdAt: '2026-06-30T08:15:00.000Z', updatedAt: '2026-06-30T08:15:00.000Z' },
      { id: 'APT-1003', patientId: 'PT-2393', doctorId: 'DR-USMAN', date: dPlus(1), time: '10:30', duration: 30, status: 'confirmed', mode: 'in-person', reason: 'Antenatal check-up', notes: '', createdAt: '2026-06-28T14:00:00.000Z', updatedAt: '2026-06-28T14:00:00.000Z' },
      { id: 'APT-1004', patientId: 'PT-2394', doctorId: 'DR-HAMZA', date: dPlus(2), time: '14:00', duration: 30, status: 'followup', mode: 'in-person', reason: 'BP medication review', notes: '', createdAt: '2026-06-29T09:00:00.000Z', updatedAt: '2026-06-29T09:00:00.000Z' },
      { id: 'APT-1005', patientId: 'PT-2395', doctorId: 'DR-SANA', date: dPlus(3), time: '16:00', duration: 45, status: 'confirmed', mode: 'video', reason: 'Migraine treatment plan', notes: '', createdAt: '2026-06-30T10:00:00.000Z', updatedAt: '2026-06-30T10:00:00.000Z' },
      { id: 'APT-1006', patientId: 'PT-2396', doctorId: 'DR-USMAN', date: dPlus(-2), time: '11:30', duration: 30, status: 'completed', mode: 'in-person', reason: 'Post-op follow-up', notes: 'Recovery progressing well.', createdAt: '2026-06-25T09:00:00.000Z', updatedAt: '2026-06-27T12:00:00.000Z' },
      { id: 'APT-1007', patientId: 'PT-2391', doctorId: 'DR-HAMZA', date: dPlus(-7), time: '15:00', duration: 30, status: 'cancelled', mode: 'in-person', reason: 'BP monitoring', notes: 'Cancelled by patient.', createdAt: '2026-06-20T08:00:00.000Z', updatedAt: '2026-06-23T08:00:00.000Z' },
    ]);
  }

  // Invoices
  if (!storage.get(KEYS.invoices)) {
    storage.set(KEYS.invoices, [
      { id: 'INV-5001', patientId: 'PT-2391', appointmentId: 'APT-1001', items: [{ description: 'Cardiology consultation', quantity: 1, unitPrice: 3500 }, { description: 'ECG (12-lead)', quantity: 1, unitPrice: 1500 }], subtotal: 5000, tax: 250, total: 5250, amountPaid: 5250, paymentMethod: 'card', status: 'paid', issuedAt: '2026-07-05T10:00:00.000Z', dueAt: '2026-07-12T10:00:00.000Z' },
      { id: 'INV-5002', patientId: 'PT-2393', appointmentId: 'APT-1003', items: [{ description: 'Antenatal visit', quantity: 1, unitPrice: 3000 }, { description: 'Ultrasound', quantity: 1, unitPrice: 4500 }], subtotal: 7500, tax: 375, total: 7875, amountPaid: 0, paymentMethod: 'cash', status: 'unpaid', issuedAt: '2026-07-05T11:00:00.000Z', dueAt: '2026-07-19T11:00:00.000Z' },
      { id: 'INV-5003', patientId: 'PT-2395', appointmentId: 'APT-1005', items: [{ description: 'Neurology consultation', quantity: 1, unitPrice: 4000 }], subtotal: 4000, tax: 200, total: 4200, amountPaid: 2000, paymentMethod: 'cash', status: 'partial', issuedAt: '2026-07-01T08:00:00.000Z', dueAt: '2026-07-15T08:00:00.000Z' },
      { id: 'INV-5004', patientId: 'PT-2394', appointmentId: 'APT-1004', items: [{ description: 'Cardiology consultation', quantity: 1, unitPrice: 3500 }, { description: 'Blood pressure monitoring', quantity: 1, unitPrice: 800 }], subtotal: 4300, tax: 215, total: 4515, amountPaid: 0, paymentMethod: 'card', status: 'overdue', issuedAt: '2026-06-20T09:00:00.000Z', dueAt: '2026-06-27T09:00:00.000Z' },
    ]);
  }

  // Staff
  if (!storage.get(KEYS.staff)) {
    storage.set(KEYS.staff, [
      { id: 'STF-001', name: 'Fatima Riaz', role: 'RECEPTIONIST', email: 'fatima.riaz@subancare.com', phone: '+92 301 1122334', department: 'Front Desk', joinDate: '2025-11-12', status: 'active', createdAt: '2025-11-12T08:00:00.000Z', updatedAt: '2025-11-12T08:00:00.000Z' },
      { id: 'STF-002', name: 'Bilal Ahmed', role: 'PHARMACIST', email: 'bilal.ahmed@subancare.com', phone: '+92 333 6655443', department: 'Pharmacy', joinDate: '2025-08-01', status: 'active', createdAt: '2025-08-01T08:00:00.000Z', updatedAt: '2025-08-01T08:00:00.000Z' },
      { id: 'STF-003', name: 'Hina Tariq', role: 'BILLING_STAFF', email: 'hina.tariq@subancare.com', phone: '+92 345 7788990', department: 'Finance', joinDate: '2026-01-15', status: 'active', createdAt: '2026-01-15T08:00:00.000Z', updatedAt: '2026-01-15T08:00:00.000Z' },
    ]);
  }

  // Prescriptions (Sprint 7-9)
  if (!storage.get(KEYS.prescriptions)) {
    storage.set(KEYS.prescriptions, [
      { id: 'RX-3001', patientId: 'PT-2391', doctorId: 'DR-HAMZA', appointmentId: 'APT-1001', issuedAt: '2026-07-05T10:00:00.000Z', status: 'active', diagnosis: 'Essential hypertension', notes: 'Monitor BP twice daily. Reduce sodium intake.', items: [{ medication: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning with water' }, { medication: 'Losartan 50mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' }] },
      { id: 'RX-3002', patientId: 'PT-2395', doctorId: 'DR-SANA', appointmentId: 'APT-1005', issuedAt: '2026-07-01T09:00:00.000Z', status: 'active', diagnosis: 'Chronic migraine with aura', notes: 'Avoid known triggers. Sleep 8 hours regularly.', items: [{ medication: 'Sumatriptan 50mg', dosage: '1 tablet', frequency: 'As needed', duration: '10 days', instructions: 'Take at onset of migraine, max 2/day' }, { medication: 'Propranolol 40mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '60 days', instructions: 'Take with meals' }] },
      { id: 'RX-3003', patientId: 'PT-2393', doctorId: 'DR-USMAN', appointmentId: 'APT-1003', issuedAt: '2026-07-06T11:00:00.000Z', status: 'active', diagnosis: 'Antenatal supplement', notes: 'Continue prenatal vitamins. Next visit in 4 weeks.', items: [{ medication: 'Folic Acid 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '90 days', instructions: 'Take with breakfast' }, { medication: 'Iron + Calcium combo', dosage: '1 tablet', frequency: 'Once daily', duration: '90 days', instructions: 'Take with lunch' }] },
      { id: 'RX-3004', patientId: 'PT-2394', doctorId: 'DR-HAMZA', appointmentId: 'APT-1004', issuedAt: '2026-06-20T09:00:00.000Z', status: 'completed', diagnosis: 'Type 2 diabetes - medication review', notes: 'HbA1c to be repeated in 3 months.', items: [{ medication: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with breakfast and dinner' }] },
      { id: 'RX-3005', patientId: 'PT-2392', doctorId: 'DR-SANA', appointmentId: 'APT-1002', issuedAt: '2026-07-05T12:00:00.000Z', status: 'pending', diagnosis: 'Tension headache, recurrent', notes: 'Review in 2 weeks if symptoms persist.', items: [{ medication: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: 'As needed', duration: '14 days', instructions: 'Max 8 tablets/day, space 4-6 hours apart' }] },
    ]);
  }

  // Inventory (Sprint 7-9)
  if (!storage.get(KEYS.inventory)) {
    const today = new Date();
    const inMonths = (n) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() + n);
      return d.toISOString().split('T')[0];
    };
    storage.set(KEYS.inventory, [
      { id: 'INV-MED-001', name: 'Amlodipine 5mg', category: 'Medication', sku: 'MED-AML-05', stock: 240, reorderLevel: 50, unit: 'tablets', unitPrice: 12, supplier: 'PharmaCorp', expiryDate: inMonths(8), status: 'in-stock' },
      { id: 'INV-MED-002', name: 'Paracetamol 500mg', category: 'Medication', sku: 'MED-PAR-50', stock: 14, reorderLevel: 30, unit: 'tablets', unitPrice: 3, supplier: 'MediSource', expiryDate: inMonths(14), status: 'low-stock' },
      { id: 'INV-MED-003', name: 'Metformin 500mg', category: 'Medication', sku: 'MED-MET-50', stock: 180, reorderLevel: 60, unit: 'tablets', unitPrice: 8, supplier: 'PharmaCorp', expiryDate: inMonths(11), status: 'in-stock' },
      { id: 'INV-MED-004', name: 'Losartan 50mg', category: 'Medication', sku: 'MED-LST-50', stock: 95, reorderLevel: 40, unit: 'tablets', unitPrice: 18, supplier: 'CardioMed', expiryDate: inMonths(7), status: 'in-stock' },
      { id: 'INV-MED-005', name: 'Surgical Gloves (M)', category: 'Supplies', sku: 'SUP-GLV-M', stock: 6, reorderLevel: 20, unit: 'boxes', unitPrice: 450, supplier: 'MediSource', expiryDate: inMonths(24), status: 'low-stock' },
      { id: 'INV-MED-006', name: 'N95 Respirator Mask', category: 'Supplies', sku: 'SUP-MSK-N95', stock: 320, reorderLevel: 100, unit: 'pieces', unitPrice: 95, supplier: 'SafeHealth', expiryDate: inMonths(36), status: 'in-stock' },
      { id: 'INV-MED-007', name: 'Syringe 5ml', category: 'Supplies', sku: 'SUP-SYR-5', stock: 0, reorderLevel: 50, unit: 'pieces', unitPrice: 12, supplier: 'MediSource', expiryDate: inMonths(18), status: 'out-of-stock' },
      { id: 'INV-MED-008', name: 'Folic Acid 5mg', category: 'Medication', sku: 'MED-FOL-5', stock: 145, reorderLevel: 40, unit: 'tablets', unitPrice: 4, supplier: 'PharmaCorp', expiryDate: inMonths(20), status: 'in-stock' },
      { id: 'INV-MED-009', name: 'Sumatriptan 50mg', category: 'Medication', sku: 'MED-SUM-50', stock: 22, reorderLevel: 25, unit: 'tablets', unitPrice: 85, supplier: 'NeuroMed', expiryDate: inMonths(5), status: 'low-stock' },
      { id: 'INV-MED-010', name: 'Propranolol 40mg', category: 'Medication', sku: 'MED-PRP-40', stock: 60, reorderLevel: 30, unit: 'tablets', unitPrice: 14, supplier: 'PharmaCorp', expiryDate: inMonths(16), status: 'in-stock' },
    ]);
  }

  // Medical History (Sprint 7-9)
  if (!storage.get(KEYS.medicalHistory)) {
    storage.set(KEYS.medicalHistory, [
      { id: 'MH-9001', patientId: 'PT-2391', type: 'lab-result', title: 'Lipid Panel', recordedAt: '2026-05-14T09:00:00.000Z', recordedBy: 'Dr. Hamza Iqbal', summary: 'Total cholesterol 195 mg/dL, LDL 110, HDL 55, Triglycerides 130. Within healthy range.', details: 'Patient counseled on diet and exercise.' },
      { id: 'MH-9002', patientId: 'PT-2391', type: 'vitals', title: 'Routine vitals', recordedAt: '2026-05-14T09:15:00.000Z', recordedBy: 'Nurse Ayesha', summary: 'BP 138/86, HR 78, Temp 98.4F, SpO2 98%.', details: '' },
      { id: 'MH-9003', patientId: 'PT-2392', type: 'diagnosis', title: 'Migraine - chronic', recordedAt: '2026-04-08T10:30:00.000Z', recordedBy: 'Dr. Sana Yousuf', summary: 'Recurrent migraine with aura, ~3-4 episodes per month.', details: 'Started on Propranolol prophylaxis. Identified stress and sleep deprivation as triggers.' },
      { id: 'MH-9004', patientId: 'PT-2393', type: 'lab-result', title: 'CBC + Urinalysis', recordedAt: '2026-03-19T11:45:00.000Z', recordedBy: 'Dr. Usman Ghani', summary: 'All values within normal range for pregnancy.', details: 'Hemoglobin 11.8 g/dL, platelets 250k, no protein in urine.' },
      { id: 'MH-9005', patientId: 'PT-2394', type: 'diagnosis', title: 'Type 2 Diabetes Mellitus', recordedAt: '2026-02-22T13:15:00.000Z', recordedBy: 'Dr. Hamza Iqbal', summary: 'Newly diagnosed T2DM. HbA1c 7.8%.', details: 'Started on Metformin 500mg BID. Lifestyle modification plan discussed.' },
      { id: 'MH-9006', patientId: 'PT-2396', type: 'procedure', title: 'Knee Replacement - Post-op', recordedAt: '2026-04-02T12:00:00.000Z', recordedBy: 'Dr. Usman Ghani', summary: 'Total knee replacement surgery, left knee.', details: 'Surgery successful. Patient mobilized day 1 post-op. Physiotherapy plan initiated.' },
    ]);
  }
};