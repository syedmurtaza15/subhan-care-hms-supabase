import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { dataService, ENTITIES, refreshAll, subscribe } from '../services/dataService';
import { isSupabaseConfigured } from '../lib/supabase';
import { seedIfEmpty } from '../services/seedData';

const DataContext = createContext(null);

const createEntityHook = (entity) => () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx[entity];
};

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState(() => dataService.list(ENTITIES.PATIENTS));
  const [doctors, setDoctors] = useState(() => dataService.list(ENTITIES.DOCTORS));
  const [appointments, setAppointments] = useState(() =>
    dataService.list(ENTITIES.APPOINTMENTS),
  );
  const [invoices, setInvoices] = useState(() => dataService.list(ENTITIES.INVOICES));
  const [staff, setStaff] = useState(() => dataService.list(ENTITIES.STAFF));
  const [prescriptions, setPrescriptions] = useState(() =>
    dataService.list(ENTITIES.PRESCRIPTIONS),
  );
  const [inventory, setInventory] = useState(() => dataService.list(ENTITIES.INVENTORY));
  const [medicalHistory, setMedicalHistory] = useState(() =>
    dataService.list(ENTITIES.MEDICAL_HISTORY),
  );
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState(null);

  // Seed localStorage on first mount (demo mode only).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      seedIfEmpty();
    }
  }, []);

  // Initial fetch (Supabase mode).
  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured) {
      return undefined;
    }
    setIsLoading(true);
    setLoadError(null);
    refreshAll()
      .then(() => {
        if (!cancelled) {
          setPatients(dataService.list(ENTITIES.PATIENTS));
          setDoctors(dataService.list(ENTITIES.DOCTORS));
          setAppointments(dataService.list(ENTITIES.APPOINTMENTS));
          setInvoices(dataService.list(ENTITIES.INVOICES));
          setStaff(dataService.list(ENTITIES.STAFF));
          setPrescriptions(dataService.list(ENTITIES.PRESCRIPTIONS));
          setInventory(dataService.list(ENTITIES.INVENTORY));
          setMedicalHistory(dataService.list(ENTITIES.MEDICAL_HISTORY));
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAllFromCache = useCallback(() => {
    setPatients(dataService.list(ENTITIES.PATIENTS));
    setDoctors(dataService.list(ENTITIES.DOCTORS));
    setAppointments(dataService.list(ENTITIES.APPOINTMENTS));
    setInvoices(dataService.list(ENTITIES.INVOICES));
    setStaff(dataService.list(ENTITIES.STAFF));
    setPrescriptions(dataService.list(ENTITIES.PRESCRIPTIONS));
    setInventory(dataService.list(ENTITIES.INVENTORY));
    setMedicalHistory(dataService.list(ENTITIES.MEDICAL_HISTORY));
  }, []);

  // Subscribe to dataService notifications (so every CRUD updates us).
  useEffect(() => subscribe(refreshAllFromCache), [refreshAllFromCache]);

  const wrap = useCallback(
    (entity, setter) => ({
      list: () => dataService.list(entity),
      find: (id) => dataService.find(entity, id),
      create: async (payload) => {
        const created = await dataService.create(entity, payload);
        return created;
      },
      update: async (id, patch) => {
        const updated = await dataService.update(entity, id, patch);
        return updated;
      },
      remove: async (id) => {
        const result = await dataService.remove(entity, id);
        return result;
      },
      replaceAll: async (collection) => {
        const next = await dataService.replaceAll(entity, collection);
        return next;
      },
      reset: () => {
        dataService.reset(entity);
        refreshAllFromCache();
      },
      state: setter,
    }),
    [refreshAllFromCache],
  );

  const refresh = useCallback(async () => {
    if (isSupabaseConfigured) {
      await refreshAll();
    }
    refreshAllFromCache();
  }, [refreshAllFromCache]);

  const value = useMemo(
    () => ({
      [ENTITIES.PATIENTS]: wrap(ENTITIES.PATIENTS, setPatients),
      [ENTITIES.DOCTORS]: wrap(ENTITIES.DOCTORS, setDoctors),
      [ENTITIES.APPOINTMENTS]: wrap(ENTITIES.APPOINTMENTS, setAppointments),
      [ENTITIES.INVOICES]: wrap(ENTITIES.INVOICES, setInvoices),
      [ENTITIES.STAFF]: wrap(ENTITIES.STAFF, setStaff),
      [ENTITIES.PRESCRIPTIONS]: wrap(ENTITIES.PRESCRIPTIONS, setPrescriptions),
      [ENTITIES.INVENTORY]: wrap(ENTITIES.INVENTORY, setInventory),
      [ENTITIES.MEDICAL_HISTORY]: wrap(ENTITIES.MEDICAL_HISTORY, setMedicalHistory),
      isLoading,
      loadError,
      refresh,
    }),
    [wrap, isLoading, loadError, refresh],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

export const usePatients = createEntityHook(ENTITIES.PATIENTS);
export const useDoctors = createEntityHook(ENTITIES.DOCTORS);
export const useAppointments = createEntityHook(ENTITIES.APPOINTMENTS);
export const useInvoices = createEntityHook(ENTITIES.INVOICES);
export const useStaff = createEntityHook(ENTITIES.STAFF);
export const usePrescriptions = createEntityHook(ENTITIES.PRESCRIPTIONS);
export const useInventory = createEntityHook(ENTITIES.INVENTORY);
export const useMedicalHistory = createEntityHook(ENTITIES.MEDICAL_HISTORY);

export default DataContext;
