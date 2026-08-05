-- ============================================================
-- Database Fix Script for Subhan Care HMS
-- Run this in the Supabase SQL Editor to fix:
-- 1. Empty doctors table (causes "Unknown" doctor names)
-- 2. Missing unique constraint (allows double-booking)
-- 3. Seed data for doctors, patients, and appointments
-- ============================================================

-- ============================================================
-- 1. SEED DOCTORS (if table is empty)
-- ============================================================
INSERT INTO public.doctors (name, specialization, phone, email, experience, consultation_fee, availability, schedule, status, bio)
SELECT * FROM (VALUES
  ('Dr. Hamza Iqbal', 'Cardiology', '+92 300 1112233', 'hamza.iqbal@subancare.com', 12, 3500, ARRAY['Mon','Tue','Wed','Thu','Fri'], '{"startTime":"09:00","endTime":"17:00","slotMinutes":30}'::jsonb, 'active', 'Senior cardiologist specializing in interventional procedures.'),
  ('Dr. Sana Yousuf', 'Neurology', '+92 311 2233445', 'sana.yousuf@subancare.com', 9, 4000, ARRAY['Mon','Wed','Thu','Sat'], '{"startTime":"10:00","endTime":"18:00","slotMinutes":45}'::jsonb, 'active', 'Consultant neurologist with focus on migraine & epilepsy.'),
  ('Dr. Usman Ghani', 'Orthopedics', '+92 333 4455667', 'usman.ghani@subancare.com', 14, 3000, ARRAY['Tue','Wed','Thu','Fri'], '{"startTime":"08:00","endTime":"16:00","slotMinutes":30}'::jsonb, 'active', 'Orthopedic surgeon specializing in sports injuries.'),
  ('Dr. Maryam Saleem', 'Pediatrics', '+92 321 7788990', 'maryam.saleem@subancare.com', 7, 2500, ARRAY['Mon','Tue','Wed','Fri','Sat'], '{"startTime":"09:30","endTime":"17:30","slotMinutes":30}'::jsonb, 'active', 'Pediatrician with a special interest in neonatology.')
) AS t(name, specialization, phone, email, experience, consultation_fee, availability, schedule, status, bio)
WHERE NOT EXISTS (SELECT 1 FROM public.doctors LIMIT 1);

-- ============================================================
-- 2. SEED PATIENTS (if table is empty)
-- assigned_doctor is a UUID, so we look up the doctor ID by email
-- ============================================================
INSERT INTO public.patients (name, age, gender, phone, email, blood_group, address, emergency_contact, allergies, notes, status, assigned_doctor)
SELECT
  t.name, t.age, t.gender, t.phone, t.email, t.blood_group, t.address, t.emergency_contact, t.allergies, t.notes, t.status,
  d.id
FROM (VALUES
  ('Aisha Mehmood', 32, 'Female', '+92 300 1234567', 'aisha.mehmood@example.com', 'O+', 'House 14, Street 7, Lahore', 'Imran Mehmood (+92 301 7654321)', 'Penicillin, pollen', 'Follows up every quarter for hypertension management.', 'active', 'hamza.iqbal@subancare.com'),
  ('Bilal Khan', 44, 'Male', '+92 321 5556677', 'bilal.khan@example.com', 'A+', 'Block C, Islamabad', 'Sara Khan (+92 321 1112233)', 'None', 'Routine cardiology check-ups.', 'active', 'sana.yousuf@subancare.com'),
  ('Hira Tariq', 28, 'Female', '+92 333 9988776', 'hira.tariq@example.com', 'B-', 'F-7, Markaz, Islamabad', 'Ahmed Tariq (+92 333 4455667)', 'Shellfish', 'Pregnant - 22 weeks. Antenatal care plan in place.', 'active', 'usman.ghani@subancare.com'),
  ('Imran Aziz', 51, 'Male', '+92 345 1110000', 'imran.aziz@example.com', 'AB+', 'DHA Phase 6, Karachi', 'Naila Aziz (+92 345 2221100)', 'Sulfa drugs', 'Type-2 diabetes, on Metformin.', 'inactive', 'hamza.iqbal@subancare.com'),
  ('Sana Iqbal', 35, 'Female', '+92 301 4477885', 'sana.iqbal@example.com', 'O-', 'PECHS, Karachi', 'Faisal Iqbal (+92 301 1122334)', 'Latex', 'Migraine episodes every 2-3 weeks.', 'active', 'sana.yousuf@subancare.com'),
  ('Yousuf Raza', 60, 'Male', '+92 312 6655443', 'yousuf.raza@example.com', 'A-', 'Gulberg, Lahore', 'Mariam Raza (+92 312 1122009)', 'None', 'Post-op recovery from knee replacement.', 'active', 'usman.ghani@subancare.com')
) AS t(name, age, gender, phone, email, blood_group, address, emergency_contact, allergies, notes, status, doctor_email)
JOIN public.doctors d ON d.email = t.doctor_email
WHERE NOT EXISTS (SELECT 1 FROM public.patients LIMIT 1);

-- ============================================================
-- 3. ADD PARTIAL UNIQUE INDEX FOR DOUBLE-BOOKING PREVENTION
-- Uses a PARTIAL index that only applies to non-cancelled appointments.
-- This allows cancelled appointments to have the same date/time as active ones.
-- ============================================================

-- Drop old constraint if it exists
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_doctor_date_time_unique;

-- Clean up duplicates among non-cancelled appointments
UPDATE public.appointments
SET status = 'cancelled'
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY doctor_id, appointment_date, appointment_time
      ORDER BY created_at
    ) as rn
    FROM public.appointments
    WHERE status IS DISTINCT FROM 'cancelled'
  ) ranked
  WHERE rn > 1
);

-- Create a PARTIAL unique index that only applies to non-cancelled appointments
-- This is the correct approach: cancelled appointments don't block re-booking
CREATE UNIQUE INDEX IF NOT EXISTS appointments_doctor_date_time_unique
  ON public.appointments (doctor_id, appointment_date, appointment_time)
  WHERE status IS DISTINCT FROM 'cancelled';

-- ============================================================
-- 4. VERIFY: Check what's in the tables
-- ============================================================
SELECT 'doctors' as table_name, COUNT(*) as row_count FROM public.doctors
UNION ALL
SELECT 'patients', COUNT(*) FROM public.patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles;

-- ============================================================
-- 5. FIX PROFILES: Ensure all users have correct roles
-- ============================================================
-- UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'your-email@example.com';
-- UPDATE public.profiles SET role = 'DOCTOR' WHERE email = 'your-email@example.com';

-- ============================================================
-- 6. SEED APPOINTMENTS (if table is empty)
-- ============================================================
DO $$
DECLARE
  doc1 uuid; doc2 uuid; doc3 uuid; doc4 uuid;
  pat1 uuid; pat2 uuid; pat3 uuid; pat4 uuid; pat5 uuid; pat6 uuid;
  today_date date := CURRENT_DATE;
BEGIN
  SELECT id INTO doc1 FROM public.doctors WHERE email = 'hamza.iqbal@subancare.com' LIMIT 1;
  SELECT id INTO doc2 FROM public.doctors WHERE email = 'sana.yousuf@subancare.com' LIMIT 1;
  SELECT id INTO doc3 FROM public.doctors WHERE email = 'usman.ghani@subancare.com' LIMIT 1;
  SELECT id INTO doc4 FROM public.doctors WHERE email = 'maryam.saleem@subancare.com' LIMIT 1;

  SELECT id INTO pat1 FROM public.patients WHERE email = 'aisha.mehmood@example.com' LIMIT 1;
  SELECT id INTO pat2 FROM public.patients WHERE email = 'bilal.khan@example.com' LIMIT 1;
  SELECT id INTO pat3 FROM public.patients WHERE email = 'hira.tariq@example.com' LIMIT 1;
  SELECT id INTO pat4 FROM public.patients WHERE email = 'imran.aziz@example.com' LIMIT 1;
  SELECT id INTO pat5 FROM public.patients WHERE email = 'sana.iqbal@example.com' LIMIT 1;
  SELECT id INTO pat6 FROM public.patients WHERE email = 'yousuf.raza@example.com' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.appointments LIMIT 1) THEN
    INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes) VALUES
      (pat1, doc1, today_date, '09:30', 'confirmed', 'Routine cardiology follow-up', ''),
      (pat2, doc2, today_date, '11:00', 'waiting', 'Migraine evaluation', 'Patient reports light sensitivity.'),
      (pat3, doc3, today_date + 1, '10:30', 'confirmed', 'Antenatal check-up', ''),
      (pat4, doc1, today_date + 2, '14:00', 'followup', 'BP medication review', ''),
      (pat5, doc2, today_date + 3, '16:00', 'confirmed', 'Migraine treatment plan', ''),
      (pat6, doc3, today_date - 2, '11:30', 'completed', 'Post-op follow-up', 'Recovery progressing well.'),
      (pat1, doc1, today_date - 7, '15:00', 'cancelled', 'BP monitoring', 'Cancelled by patient.');

    RAISE NOTICE 'Appointments seeded successfully!';
  ELSE
    RAISE NOTICE 'Appointments table already has data, skipping seed.';
  END IF;
END $$;
