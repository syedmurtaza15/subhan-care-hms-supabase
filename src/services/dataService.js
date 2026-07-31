/**
 * Data service — Supabase when configured, localStorage otherwise.
 *
 * The public surface (list / find / create / update / remove / replaceAll / reset)
 * is identical to the previous localStorage-only version. Consumers don't
 * change; only the implementation switches based on `isSupabaseConfigured()`.
 *
 * Each entity maps to a Supabase table of the same name. A small in-memory
 * cache mirrors the latest list so hooks can read synchronously after the
 * initial fetch.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { STORAGE_KEYS, storage } from '../utils/storage';
import { sleep } from '../utils/helpers';

const LS_KEYS = {
  patients: 'subhan_care.patients',
  doctors: 'subhan_care.doctors',
  appointments: 'subhan_care.appointments',
  invoices: 'subhan_care.invoices',
  staff: 'subhan_care.staff',
  profiles: 'subhan_care.profiles',
  prescriptions: 'subhan_care.prescriptions',
  inventory: 'subhan_care.inventory',
  medicalHistory: 'subhan_care.medical_history',
};

export const ENTITIES = Object.freeze({
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  INVOICES: 'invoices',
  STAFF: 'staff',
  PROFILES: 'profiles',
  PRESCRIPTIONS: 'prescriptions',
  INVENTORY: 'inventory',
  MEDICAL_HISTORY: 'medical_history',
});

// In-memory cache that the DataContext reads from.
const cache = {
  patients: [],
  doctors: [],
  appointments: [],
  invoices: [],
  staff: [],
  profiles: [],
  prescriptions: [],
  inventory: [],
  medicalHistory: [],
};

const subscribers = new Set();

const notify = () => {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('[dataService] subscriber error', error);
      }
    }
  });
};

export const subscribe = (cb) => {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
};

const readLsCollection = (entity) => storage.get(LS_KEYS[entity], []) || [];
const writeLsCollection = (entity, collection) => {
  storage.set(LS_KEYS[entity], collection);
};

const generateId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

const seedNow = () => new Date().toISOString();

const throwIfError = (error, context) => {
  if (!error) return;
  const wrapped = new Error(error.message || `Supabase error in ${context}`);
  wrapped.code = error.code;
  wrapped.details = error.details;
  wrapped.hint = error.hint;
  throw wrapped;
};

/**
 * Refresh the in-memory cache from the backend.
 * When Supabase is configured, fetches every table in parallel.
 * When not, no-op (cache stays whatever it was last set to).
 */
export const refreshAll = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }
  const [
    { data: patients, error: e1 },
    { data: doctors, error: e2 },
    { data: appointments, error: e3 },
    { data: invoices, error: e4 },
    { data: staff, error: e5 },
    { data: profiles, error: e6 },
    { data: prescriptions, error: e7 },
    { data: inventory, error: e8 },
    { data: medicalHistory, error: e9 },
  ] = await Promise.all([
    supabase.from('patients').select('*').order('created_at', { ascending: false }),
    supabase.from('doctors').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('*').order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('staff').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('prescriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('inventory').select('*').order('created_at', { ascending: false }),
    supabase.from('medical_history').select('*').order('created_at', { ascending: false }),
  ]);
  throwIfError(e1, 'patients');
  throwIfError(e2, 'doctors');
  throwIfError(e3, 'appointments');
  throwIfError(e4, 'invoices');
  throwIfError(e5, 'staff');
  throwIfError(e6, 'profiles');
  throwIfError(e7, 'prescriptions');
  throwIfError(e8, 'inventory');
  throwIfError(e9, 'medical_history');
  cache.patients = (patients || []).map((row) => fromRow(ENTITIES.PATIENTS, row));
  cache.doctors = (doctors || []).map((row) => fromRow(ENTITIES.DOCTORS, row));
  cache.appointments = (appointments || []).map((row) => fromRow(ENTITIES.APPOINTMENTS, row));
  cache.invoices = (invoices || []).map((row) => fromRow(ENTITIES.INVOICES, row));
  cache.staff = (staff || []).map((row) => fromRow(ENTITIES.STAFF, row));
  cache.profiles = (profiles || []).map((row) => fromRow(ENTITIES.PROFILES, row));
  cache.prescriptions = (prescriptions || []).map((row) => fromRow(ENTITIES.PRESCRIPTIONS, row));
  cache.inventory = (inventory || []).map((row) => fromRow(ENTITIES.INVENTORY, row));
  cache.medicalHistory = (medicalHistory || []).map((row) => fromRow(ENTITIES.MEDICAL_HISTORY, row));
  notify();
};

// Hydrate cache from localStorage on first import (demo mode).
if (!isSupabaseConfigured) {
  cache.patients = readLsCollection(ENTITIES.PATIENTS);
  cache.doctors = readLsCollection(ENTITIES.DOCTORS);
  cache.appointments = readLsCollection(ENTITIES.APPOINTMENTS);
  cache.invoices = readLsCollection(ENTITIES.INVOICES);
  cache.staff = readLsCollection(ENTITIES.STAFF);
  cache.profiles = readLsCollection(ENTITIES.PROFILES);
  cache.prescriptions = readLsCollection(ENTITIES.PRESCRIPTIONS);
  cache.inventory = readLsCollection(ENTITIES.INVENTORY);
  cache.medicalHistory = readLsCollection(ENTITIES.MEDICAL_HISTORY);
}

// The UI uses camelCase while PostgREST exposes the database's snake_case
// columns. Keep this conversion in one place so pages never need to know the
// database schema.
const FIELD_MAPS = {
  [ENTITIES.PATIENTS]: {
    bloodGroup: 'blood_group', emergencyContact: 'emergency_contact', assignedDoctor: 'assigned_doctor',
  },
  [ENTITIES.DOCTORS]: { consultationFee: 'consultation_fee' },
  [ENTITIES.APPOINTMENTS]: {
    patientId: 'patient_id', doctorId: 'doctor_id', appointmentDate: 'appointment_date', appointmentTime: 'appointment_time',
  },
  [ENTITIES.INVOICES]: {
    patientId: 'patient_id', appointmentId: 'appointment_id', invoiceDate: 'invoice_date',
    amountPaid: 'amount_paid', paymentMethod: 'payment_method',
  },
  [ENTITIES.INVENTORY]: { itemName: 'item_name', reorderLevel: 'reorder_level', unitPrice: 'unit_price', expiryDate: 'expiry_date' },
  [ENTITIES.STAFF]: { joinDate: 'joining_date' },
  [ENTITIES.PRESCRIPTIONS]: {
    patientId: 'patient_id', doctorId: 'doctor_id', appointmentId: 'appointment_id', issuedAt: 'issued_at',
  },
  [ENTITIES.MEDICAL_HISTORY]: { patientId: 'patient_id', doctorId: 'doctor_id' },
  [ENTITIES.PROFILES]: { fullName: 'full_name', avatarUrl: 'avatar_url' },
};

const INVOICE_NOTES_PREFIX = '__HMS_INVOICE__:';

const fromRow = (entity, row) => {
  if (!row) return row;

  const result = { ...row };
  Object.entries(FIELD_MAPS[entity] || {}).forEach(([camelKey, snakeKey]) => {
    if (Object.prototype.hasOwnProperty.call(row, snakeKey)) result[camelKey] = row[snakeKey];
    delete result[snakeKey];
  });
  result.createdAt = row.created_at || row.createdAt;
  result.updatedAt = row.updated_at || row.updatedAt;
  delete result.created_at;
  delete result.updated_at;

  if (entity === ENTITIES.DOCTORS) {
    result.consultationFee = Number(result.consultationFee || 0);
    result.availability = Array.isArray(result.availability)
      ? result.availability
      : result.availability ? result.availability.split(',') : [];
  }

  if (entity === ENTITIES.APPOINTMENTS) {
    result.appointmentDate = row.appointment_date || '';
    result.appointmentTime = row.appointment_time || '';
    // Temporary display aliases keep older routes safe while they consume the
    // canonical appointmentDate / appointmentTime fields.
    result.date = result.appointmentDate;
    result.time = result.appointmentTime;
  }

  if (entity === ENTITIES.PRESCRIPTIONS) result.items = Array.isArray(result.items) ? result.items : [];
  if (entity === ENTITIES.INVENTORY) {
    result.itemName = result.itemName || '';
    result.stock = Number(result.stock || 0);
    result.reorderLevel = Number(result.reorderLevel || 0);
    result.unitPrice = Number(result.unitPrice || 0);
    result.name = result.itemName;
  }
  if (entity === ENTITIES.INVOICES) {
    result.subtotal = Number(result.subtotal || 0);
    result.tax = Number(result.tax || 0);
    result.total = Number(result.total || 0);
    result.amountPaid = Number(result.amountPaid || 0);
    result.items = [];
    if (typeof row.notes === 'string' && row.notes.startsWith(INVOICE_NOTES_PREFIX)) {
      try {
        const stored = JSON.parse(row.notes.slice(INVOICE_NOTES_PREFIX.length));
        result.items = Array.isArray(stored.items) ? stored.items : [];
        result.notes = stored.notes || '';
      } catch {
        result.items = [];
      }
    }
    result.issuedAt = result.invoiceDate;
    result.dueAt = result.invoiceDate;
  }
  if (entity === ENTITIES.MEDICAL_HISTORY) {
    // Support both the current database fields and the fields used by the UI.
    result.recordedAt = row.recorded_at || row.date;
    result.recordedBy = row.recorded_by || row.doctor_name || '';
    result.summary = row.summary || row.description || '';
    result.details = row.details || '';
  }

  return result;
};

const toRow = (entity, payload) => {
  const row = { ...payload };
  Object.entries(FIELD_MAPS[entity] || {}).forEach(([camelKey, snakeKey]) => {
    if (Object.prototype.hasOwnProperty.call(row, camelKey)) {
      row[snakeKey] = row[camelKey];
      delete row[camelKey];
    }
  });

  if (entity === ENTITIES.APPOINTMENTS) {
    delete row.date;
    delete row.time;
    delete row.duration;
    delete row.mode;
  }

  if (entity === ENTITIES.INVOICES) {
    // The database deliberately has no items column. Persist the existing
    // line-item UI safely inside its notes field without changing the schema.
    if (Array.isArray(payload.items)) {
      row.notes = `${INVOICE_NOTES_PREFIX}${JSON.stringify({
        items: payload.items,
        notes: payload.notes || '',
      })}`;
    }
    delete row.items;
    delete row.issuedAt;
    delete row.dueAt;
  }

  if (entity === ENTITIES.INVENTORY) {
    // SKU and unit are presentation-only fields from the old local model.
    delete row.sku;
    delete row.unit;
  }

  if (entity === ENTITIES.PRESCRIPTIONS && Array.isArray(payload.items)) {
    const firstItem = payload.items[0] || {};
    if (!Object.prototype.hasOwnProperty.call(row, 'medicine')) row.medicine = firstItem.medication || '';
    if (!Object.prototype.hasOwnProperty.call(row, 'dosage')) row.dosage = firstItem.dosage || null;
    if (!Object.prototype.hasOwnProperty.call(row, 'frequency')) row.frequency = firstItem.frequency || null;
    if (!Object.prototype.hasOwnProperty.call(row, 'duration')) row.duration = firstItem.duration || null;
    if (!Object.prototype.hasOwnProperty.call(row, 'instructions')) row.instructions = firstItem.instructions || null;
  }

  if (entity === ENTITIES.MEDICAL_HISTORY) {
    // The deployed medical_history table stores its text summary as description.
    if (Object.prototype.hasOwnProperty.call(row, 'summary')) {
      row.description = row.summary;
      delete row.summary;
    }
    if (Object.prototype.hasOwnProperty.call(row, 'recordedAt')) {
      row.date = row.recordedAt;
      delete row.recordedAt;
    }
    delete row.recordedBy;
    delete row.details;
  }

  delete row.id;
  delete row.createdAt;
  delete row.updatedAt;
  // Empty values are not valid UUID foreign keys in Postgres.
  ['patient_id', 'doctor_id', 'appointment_id'].forEach((key) => {
    if (row[key] === '') row[key] = null;
  });
  return row;
};

const supabaseCreate = async (entity, payload) => {
  const row = toRow(entity, payload);
  const { data, error } = await supabase
    .from(entity)
    .insert([row])
    .select()
    .single();
  throwIfError(error, `${entity}.create`);
  return fromRow(entity, data);
};

const supabaseUpdate = async (entity, id, patch) => {
  const row = toRow(entity, patch);
  const { data, error } = await supabase
    .from(entity)
    .update(row)
    .eq('id', id)
    .select()
    .single();
  throwIfError(error, `${entity}.update`);
  return fromRow(entity, data);
};

const supabaseRemove = async (entity, id) => {
  const { error } = await supabase.from(entity).delete().eq('id', id);
  throwIfError(error, `${entity}.remove`);
  return { success: true };
};

const lsCreate = async (entity, payload) => {
  await sleep(280);
  
  // Validate invoice totals to prevent manipulation
  if (entity === ENTITIES.INVOICES && payload.items) {
    const calculatedSubtotal = payload.items.reduce(
      (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    );
    const calculatedTax = calculatedSubtotal * 0.05;
    const calculatedTotal = calculatedSubtotal + calculatedTax;
    
    if (Math.abs(payload.subtotal - calculatedSubtotal) > 0.01 ||
        Math.abs(payload.tax - calculatedTax) > 0.01 ||
        Math.abs(payload.total - calculatedTotal) > 0.01) {
      const error = new Error('Invoice total mismatch detected. Values will be recalculated.');
      error.code = 'VALIDATION_ERROR';
      // Recalculate and override
      payload.subtotal = calculatedSubtotal;
      payload.tax = calculatedTax;
      payload.total = calculatedTotal;
    }
  }
  
  const collection = readLsCollection(entity);
  const record = {
    id: payload.id || generateId(entity.slice(0, 3).toUpperCase()),
    createdAt: seedNow(),
    updatedAt: seedNow(),
    ...payload,
  };
  writeLsCollection(entity, [record, ...collection]);
  cache[entity] = [record, ...collection];
  notify();
  return record;
};

const lsUpdate = async (entity, id, patch) => {
  await sleep(220);
  
  // Validate invoice totals on update
  if (entity === ENTITIES.INVOICES && patch.items) {
    const calculatedSubtotal = patch.items.reduce(
      (acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    );
    const calculatedTax = calculatedSubtotal * 0.05;
    const calculatedTotal = calculatedSubtotal + calculatedTax;
    
    if (Math.abs(patch.subtotal - calculatedSubtotal) > 0.01 ||
        Math.abs(patch.tax - calculatedTax) > 0.01 ||
        Math.abs(patch.total - calculatedTotal) > 0.01) {
      const error = new Error('Invoice total mismatch detected. Values will be recalculated.');
      error.code = 'VALIDATION_ERROR';
      patch.subtotal = calculatedSubtotal;
      patch.tax = calculatedTax;
      patch.total = calculatedTotal;
    }
  }
  
  // Validate payment amounts
  if (entity === ENTITIES.INVOICES && patch.amountPaid !== undefined) {
    const collection = readLsCollection(entity);
    const existing = collection.find((item) => item.id === id);
    if (existing) {
      const newAmountPaid = Number(patch.amountPaid);
      if (newAmountPaid < 0) {
        const error = new Error('Payment amount cannot be negative.');
        error.code = 'INVALID_PAYMENT';
        throw error;
      }
      if (newAmountPaid > existing.total) {
        const error = new Error('Payment amount cannot exceed invoice total.');
        error.code = 'INVALID_PAYMENT';
        throw error;
      }
      // Auto-update status based on payment
      if (newAmountPaid >= existing.total) {
        patch.status = 'paid';
      } else if (newAmountPaid > 0) {
        patch.status = 'partial';
      }
    }
  }
  
  const collection = readLsCollection(entity);
  let updated = null;
  const next = collection.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, ...patch, updatedAt: seedNow() };
    return updated;
  });
  writeLsCollection(entity, next);
  cache[entity] = next;
  notify();
  if (!updated) {
    const error = new Error(`${entity} record not found: ${id}`);
    error.code = 'NOT_FOUND';
    throw error;
  }
  return updated;
};

const lsRemove = async (entity, id) => {
  await sleep(200);
  const collection = readLsCollection(entity);
  const next = collection.filter((item) => item.id !== id);
  writeLsCollection(entity, next);
  cache[entity] = next;
  notify();
  return { success: true };
};

const lsReplaceAll = async (entity, collection) => {
  await sleep(150);
  writeLsCollection(entity, collection);
  cache[entity] = collection;
  notify();
  return collection;
};

const lsReset = (entity) => {
  writeLsCollection(entity, []);
  cache[entity] = [];
  notify();
};

export const dataService = {
  list(entity) {
    const user = storage.get(STORAGE_KEYS.AUTH_USER);
    const data = cache[entity] || [];
    
    // Role-based filtering for list operations
    if (!user) return [];
    
    switch (entity) {
      case ENTITIES.INVOICES:
        if (!['ADMIN', 'BILLING_STAFF'].includes(user.role)) return [];
        break;
      case ENTITIES.INVENTORY:
        if (!['ADMIN', 'PHARMACIST'].includes(user.role)) return [];
        break;
      case ENTITIES.PROFILES:
        if (user.role !== 'ADMIN') return [];
        break;
    }
    
    return data;
  },
  find(entity, id) {
    const user = storage.get(STORAGE_KEYS.AUTH_USER);
    const item = (cache[entity] || []).find((item) => item.id === id) || null;
    
    if (!item || !user) return null;
    
    // Role-based access control for individual records
    switch (entity) {
      case ENTITIES.PATIENTS:
        if (!['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF'].includes(user.role)) {
          return null;
        }
        break;
      case ENTITIES.INVOICES:
        if (!['ADMIN', 'BILLING_STAFF'].includes(user.role)) {
          return null;
        }
        break;
      case ENTITIES.INVENTORY:
        if (!['ADMIN', 'PHARMACIST'].includes(user.role)) {
          return null;
        }
        break;
      case ENTITIES.PROFILES:
        if (user.role !== 'ADMIN') {
          return null;
        }
        break;
      case ENTITIES.DOCTORS:
      case ENTITIES.APPOINTMENTS:
      case ENTITIES.PRESCRIPTIONS:
      case ENTITIES.MEDICAL_HISTORY:
        // All authenticated users can read these for basic operations
        break;
    }
    
    return item;
  },
  async create(entity, payload) {
    if (isSupabaseConfigured && supabase) {
      const created = await supabaseCreate(entity, payload);
      cache[entity] = [created, ...(cache[entity] || [])];
      notify();
      return created;
    }
    return lsCreate(entity, payload);
  },
  async update(entity, id, patch) {
    if (isSupabaseConfigured && supabase) {
      const updated = await supabaseUpdate(entity, id, patch);
      cache[entity] = (cache[entity] || []).map((item) =>
        item.id === id ? updated : item,
      );
      notify();
      return updated;
    }
    return lsUpdate(entity, id, patch);
  },
  async remove(entity, id) {
    if (isSupabaseConfigured && supabase) {
      await supabaseRemove(entity, id);
      cache[entity] = (cache[entity] || []).filter((item) => item.id !== id);
      notify();
      return { success: true };
    }
    return lsRemove(entity, id);
  },
  async replaceAll(entity, collection) {
    if (isSupabaseConfigured && supabase) {
      // Supabase has no bulk replace; wipe + reinsert.
      const { error: delErr } = await supabase
        .from(entity)
        .delete()
        .neq('id', '');
      throwIfError(delErr, `${entity}.replaceAll.delete`);
      if (collection.length > 0) {
        const rows = collection.map((c) => toRow(entity, c));
        const { error: insErr } = await supabase.from(entity).insert(rows);
        throwIfError(insErr, `${entity}.replaceAll.insert`);
      }
      await refreshAll();
      return collection;
    }
    return lsReplaceAll(entity, collection);
  },
  reset(entity) {
    if (isSupabaseConfigured && supabase) {
      // Fire and forget; refresh pulls the empty state.
      supabase.from(entity).delete().neq('id', '').then(() => refreshAll());
      return;
    }
    lsReset(entity);
  },
  refresh: refreshAll,
};

export const ID = generateId;
