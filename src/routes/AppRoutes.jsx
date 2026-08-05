import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OtpVerificationPage from '../pages/auth/OtpVerificationPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import MyAppointmentsPage from '../pages/dashboard/MyAppointmentsPage';
import PatientsListPage from '../pages/dashboard/patients/PatientsListPage';
import PatientDetailPage from '../pages/dashboard/patients/PatientDetailPage';
import PatientHistoryPage from '../pages/dashboard/patients/PatientHistoryPage';
import DoctorsListPage from '../pages/dashboard/doctors/DoctorsListPage';
import DoctorDetailPage from '../pages/dashboard/doctors/DoctorDetailPage';
import AppointmentsPage from '../pages/dashboard/appointments/AppointmentsPage';
import AppointmentDetailPage from '../pages/dashboard/appointments/AppointmentDetailPage';
import BillingPage from '../pages/dashboard/billing/BillingPage';
import InvoiceReceiptPage from '../pages/dashboard/billing/InvoiceReceiptPage';
import OutstandingPaymentsPage from '../pages/dashboard/billing/OutstandingPaymentsPage';
import PrescriptionsPage from '../pages/dashboard/prescriptions/PrescriptionsPage';
import PrescriptionDetailPage from '../pages/dashboard/prescriptions/PrescriptionDetailPage';
import InventoryPage from '../pages/dashboard/inventory/InventoryPage';
import StaffPage from '../pages/dashboard/staff/StaffPage';
import ProfilePage from '../pages/dashboard/ProfilePage';
import SettingsPage from '../pages/dashboard/SettingsPage';
import ReportsPage from '../pages/dashboard/reports/ReportsPage';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '../pages/ErrorPage';
import { ROUTES } from '../constants/routes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public, unauthenticated only */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicOnlyRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.SIGNUP}
        element={
          <PublicOnlyRoute>
            <AuthLayout>
              <SignUpPage />
            </AuthLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <PublicOnlyRoute>
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.OTP_VERIFICATION}
        element={
          <AuthLayout>
            <OtpVerificationPage />
          </AuthLayout>
        }
      />
      <Route
        path={ROUTES.RESET_PASSWORD}
        element={
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        }
      />

      {/* Public error pages */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/server-error" element={<ServerErrorPage />} />

      {/* Protected dashboard area */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Patients - Admin, Receptionist can view/create/edit. Doctor & Billing Staff can view only */}
        <Route 
          path="patients" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <PatientsListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="patients/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
              <PatientsListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="patients/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <PatientDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="patients/:id/history" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <PatientHistoryPage />
            </ProtectedRoute>
          } 
        />

        {/* Doctors - Admin, Receptionist, Doctor, Billing Staff */}
        <Route 
          path="doctors" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <DoctorsListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="doctors/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DoctorsListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="doctors/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <DoctorDetailPage />
            </ProtectedRoute>
          } 
        />

        {/* Appointments - Admin, Receptionist, Doctor, Billing Staff (view only) */}
        <Route 
          path="appointments" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <AppointmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="appointments/calendar" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <AppointmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="appointments/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
              <AppointmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="appointments/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'BILLING_STAFF']}>
              <AppointmentDetailPage />
            </ProtectedRoute>
          } 
        />

        {/* My Appointments - Patient only */}
        <Route 
          path="my-appointments" 
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MyAppointmentsPage />
            </ProtectedRoute>
          } 
        />

        {/* Billing - Admin, Billing Staff only */}
        <Route 
          path="billing" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BILLING_STAFF']}>
              <BillingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="billing/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BILLING_STAFF']}>
              <BillingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="billing/outstanding" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BILLING_STAFF']}>
              <OutstandingPaymentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="billing/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BILLING_STAFF']}>
              <InvoiceReceiptPage />
            </ProtectedRoute>
          } 
        />

        {/* Prescriptions - All authenticated users */}
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="prescriptions/new" element={<PrescriptionsPage />} />
        <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />

        {/* Inventory - Admin, Pharmacist only */}
        <Route 
          path="inventory" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
              <InventoryPage />
            </ProtectedRoute>
          } 
        />

        {/* Reports - Admin only */}
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />

        {/* Staff - Admin only */}
        <Route 
          path="staff" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StaffPage />
            </ProtectedRoute>
          } 
        />

        {/* Account - All authenticated users */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;