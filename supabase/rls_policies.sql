-- ============================================================
-- RLS Policies for Subhan Care HMS
-- Enables Row Level Security on all tables and creates
-- role-based access policies.
-- ============================================================

-- Helper function to get the current user's role from profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(p.role, 'DOCTOR')::text
  FROM public.profiles p
  WHERE p.id = auth.uid()
$$;

-- ============================================================
-- PATIENTS
-- ============================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients are viewable by all authenticated users"
  ON public.patients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Patients can be created by Admin, Receptionist, Doctor, Billing Staff"
  ON public.patients FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF')
  );

CREATE POLICY "Patients can be updated by Admin, Receptionist, Doctor, Billing Staff"
  ON public.patients FOR UPDATE
  USING (public.current_user_role() IN ('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF'));

CREATE POLICY "Patients can be deleted by Admin only"
  ON public.patients FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- DOCTORS
-- ============================================================
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors are viewable by all authenticated users"
  ON public.doctors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can be created by Admin only"
  ON public.doctors FOR INSERT
  WITH CHECK (public.current_user_role() = 'ADMIN');

CREATE POLICY "Doctors can be updated by Admin only"
  ON public.doctors FOR UPDATE
  USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "Doctors can be deleted by Admin only"
  ON public.doctors FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- APPOINTMENTS
-- ============================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments are viewable by all authenticated users"
  ON public.appointments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Appointments can be created by Admin, Receptionist, Doctor"
  ON public.appointments FOR INSERT
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'RECEPTIONIST', 'DOCTOR'));

CREATE POLICY "Appointments can be updated by Admin, Receptionist, Doctor"
  ON public.appointments FOR UPDATE
  USING (public.current_user_role() IN ('ADMIN', 'RECEPTIONIST', 'DOCTOR'));

CREATE POLICY "Appointments can be deleted by Admin only"
  ON public.appointments FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prescriptions are viewable by all authenticated users"
  ON public.prescriptions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Prescriptions can be created by Admin, Doctor"
  ON public.prescriptions FOR INSERT
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'DOCTOR'));

CREATE POLICY "Prescriptions can be updated by Admin, Doctor"
  ON public.prescriptions FOR UPDATE
  USING (public.current_user_role() IN ('ADMIN', 'DOCTOR'));

CREATE POLICY "Prescriptions can be deleted by Admin only"
  ON public.prescriptions FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- INVOICES
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices are viewable by Admin, Billing Staff"
  ON public.invoices FOR SELECT
  USING (public.current_user_role() IN ('ADMIN', 'BILLING_STAFF'));

CREATE POLICY "Invoices can be created by Admin, Billing Staff"
  ON public.invoices FOR INSERT
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'BILLING_STAFF'));

CREATE POLICY "Invoices can be updated by Admin, Billing Staff"
  ON public.invoices FOR UPDATE
  USING (public.current_user_role() IN ('ADMIN', 'BILLING_STAFF'));

CREATE POLICY "Invoices can be deleted by Admin only"
  ON public.invoices FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- INVENTORY
-- ============================================================
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventory is viewable by Admin, Pharmacist"
  ON public.inventory FOR SELECT
  USING (public.current_user_role() IN ('ADMIN', 'PHARMACIST'));

CREATE POLICY "Inventory can be created by Admin, Pharmacist"
  ON public.inventory FOR INSERT
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'PHARMACIST'));

CREATE POLICY "Inventory can be updated by Admin, Pharmacist"
  ON public.inventory FOR UPDATE
  USING (public.current_user_role() IN ('ADMIN', 'PHARMACIST'));

CREATE POLICY "Inventory can be deleted by Admin only"
  ON public.inventory FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- STAFF
-- ============================================================
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff is viewable by Admin only"
  ON public.staff FOR SELECT
  USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "Staff can be created by Admin only"
  ON public.staff FOR INSERT
  WITH CHECK (public.current_user_role() = 'ADMIN');

CREATE POLICY "Staff can be updated by Admin only"
  ON public.staff FOR UPDATE
  USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "Staff can be deleted by Admin only"
  ON public.staff FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile, Admin can view all"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR public.current_user_role() = 'ADMIN'
  );

CREATE POLICY "Profiles can be created by the trigger only"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile, Admin can update all"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR public.current_user_role() = 'ADMIN'
  );

CREATE POLICY "Profiles can be deleted by Admin only"
  ON public.profiles FOR DELETE
  USING (public.current_user_role() = 'ADMIN');

-- ============================================================
-- MEDICAL HISTORY
-- ============================================================
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical history is viewable by all authenticated users"
  ON public.medical_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Medical history can be created by Admin, Doctor"
  ON public.medical_history FOR INSERT
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'DOCTOR'));

CREATE POLICY "Medical history can be updated by Admin, Doctor"
  ON public.medical_history FOR UPDATE
  USING (public.current_user_role() IN ('ADMIN', 'DOCTOR'));

CREATE POLICY "Medical history can be deleted by Admin only"
  ON public.medical_history FOR DELETE
  USING (public.current_user_role() = 'ADMIN');