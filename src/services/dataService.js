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
    { data: prescriptions, error: e6 },
    { data: inventory, error: e7 },
    { data: medicalHistory, error: e8 },
  ] = await Promise.all([
    supabase.from('patients').select('*').order('created_at', { ascending: false }),
    supabase.from('doctors').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('*').order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('staff').select('*').order('created_at', { ascending: false }),
    supabase.from('prescriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('inventory').select('*').order('created_at', { ascending: false }),
    supabase.from('medical_history').select('*').order('created_at', { ascending: false }),
  ]);
  throwIfError(e1, 'patients');
  throwIfError(e2, 'doctors');
  throwIfError(e3, 'appointments');
  throwIfError(e4, 'invoices');
  throwIfError(e5, 'staff');
  throwIfError(e6, 'prescriptions');
  throwIfError(e7, 'inventory');
  throwIfError(e8, 'medical_history');
  cache.patients = patients || [];
  cache.doctors = doctors || [];
  cache.appointments = appointments || [];
  cache.invoices = invoices || [];
  cache.staff = staff || [];
  cache.prescriptions = prescriptions || [];
  cache.inventory = inventory || [];
  cache.medicalHistory = medicalHistory || [];
  notify();
};

// Hydrate cache from localStorage on first import (demo mode).
if (!isSupabaseConfigured) {
  cache.patients = readLsCollection(ENTITIES.PATIENTS);
  cache.doctors = readLsCollection(ENTITIES.DOCTORS);
  cache.appointments = readLsCollection(ENTITIES.APPOINTMENTS);
  cache.invoices = readLsCollection(ENTITIES.INVOICES);
  cache.staff = readLsCollection(ENTITIES.STAFF);
  cache.prescriptions = readLsCollection(ENTITIES.PRESCRIPTIONS);
  cache.inventory = readLsCollection(ENTITIES.INVENTORY);
  cache.medicalHistory = readLsCollection(ENTITIES.MEDICAL_HISTORY);
}

// Snake_case <-> camelCase mapper for the medical_history table.

const fromRow = (entity, row) => {

  if (!row) return row;


  if (entity === ENTITIES.MEDICAL_HISTORY) {

    return {

      id: row.id,

      patientId: row.patient_id,

      type: row.type,

      title: row.title,

      description: row.description,

      date: row.date,

      doctorId: row.doctor_id,

      attachments: row.attachments || [],

      createdAt: row.created_at,

      updatedAt: row.updated_at,

    };

  }


  if (entity === ENTITIES.PATIENTS) {

    return {

      id: row.id,

      name: row.name,

      age: row.age,

      gender: row.gender,

      phone: row.phone,

      email: row.email,

      bloodGroup: row.blood_group,

      address: row.address,

      emergencyContact: row.emergency_contact,

      allergies: row.allergies,

      assignedDoctor: row.assigned_doctor,

      notes: row.notes,

      status: row.status,

      createdAt: row.created_at,

      updatedAt: row.updated_at,

    };

  }


if (entity === ENTITIES.APPOINTMENTS) {

  return {

  id: row.id,

  patientId: row.patient_id,
  doctorId: row.doctor_id,

  appointmentDate: row.appointment_date,
  appointmentTime: row.appointment_time,

  type: row.type,
  status: row.status,

  reason: row.reason,
  notes: row.notes,

  createdAt: row.created_at,
  updatedAt: row.updated_at,
};

}


 if (entity === ENTITIES.DOCTORS) {
  console.log("Doctor row from Supabase:", row);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    specialization: row.specialization,
    qualification: row.qualification,
    experience: row.experience,
    consultationFee: Number(row.consultation_fee || 0),

    availability: Array.isArray(row.availability)
      ? row.availability
      : row.availability
        ? row.availability.split(',')
        : [],

    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

  if (entity === ENTITIES.PRESCRIPTIONS) {
  return {
    id: row.id,

    patientId: row.patient_id,
    doctorId: row.doctor_id,
    appointmentId: row.appointment_id,

    medicine: row.medicine,

    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    instructions: row.instructions,

    notes: row.notes,
    diagnosis: row.diagnosis,

    items: row.items || [],

    status: row.status,

    issuedAt: row.issued_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
  return {

    id: row.id,

    ...row,

    createdAt: row.created_at || row.createdAt,

    updatedAt: row.updated_at || row.updatedAt,

  };

};

const toRow = (entity, payload) => {
  const row = { ...payload };

  if (entity === ENTITIES.PATIENTS) {

    row.blood_group = row.bloodGroup;
    delete row.bloodGroup;

    row.emergency_contact = row.emergencyContact;
    delete row.emergencyContact;

    row.assigned_doctor = row.assignedDoctor;
    delete row.assignedDoctor;

  }


  if (entity === ENTITIES.DOCTORS) {

    row.consultation_fee = row.consultationFee;

    delete row.consultationFee;

  }

if (entity === ENTITIES.APPOINTMENTS) {

  row.patient_id = row.patientId;
  row.doctor_id = row.doctorId;

  row.appointment_date = row.appointmentDate || row.date;
  row.appointment_time = row.appointmentTime || row.time;


  delete row.patientId;
  delete row.doctorId;

  delete row.appointmentDate;
  delete row.appointmentTime;

  delete row.date;
  delete row.time;


  // remove fields not present in Supabase table
  delete row.duration;
  delete row.mode;

}

if (entity === ENTITIES.PRESCRIPTIONS) {
  return {
   

    patient_id: payload.patientId || null,
    doctor_id: payload.doctorId || null,
    appointment_id: payload.appointmentId || null,

    medicine: 
      payload.items?.[0]?.medication ||
      payload.medicine ||
      '',

    dosage:
      payload.items?.[0]?.dosage ||
      payload.dosage ||
      null,

    frequency:
      payload.items?.[0]?.frequency ||
      payload.frequency ||
      null,

    duration:
      payload.items?.[0]?.duration ||
      payload.duration ||
      null,

    instructions:
      payload.items?.[0]?.instructions ||
      payload.instructions ||
      null,

    notes: payload.notes || null,

    diagnosis: payload.diagnosis || null,

    items: payload.items || [],

    status: payload.status || 'active',

    issued_at:
      payload.issuedAt ||
      new Date().toISOString(),
  };
}




  if (entity === ENTITIES.MEDICAL_HISTORY) {

    row.patient_id = row.patientId;
    row.doctor_id = row.doctorId;

    delete row.patientId;
    delete row.doctorId;

  }


  delete row.id;
  delete row.createdAt;
  delete row.updatedAt;

  
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
      case ENTITIES.STAFF:
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
      case ENTITIES.STAFF:
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
