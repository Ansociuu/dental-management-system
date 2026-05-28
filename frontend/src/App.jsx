import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
import PatientLayout from './layouts/PatientLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import RoleManagement from './pages/admin/RoleManagement';
import DoctorProfile from './pages/admin/DoctorProfile';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import RevenueReport from './pages/admin/reports/RevenueReport';
import DoctorPerformanceReport from './pages/admin/reports/DoctorPerformanceReport';
import PatientServiceReport from './pages/admin/reports/PatientServiceReport';
import ServiceManagement from './pages/admin/ServiceManagement';
import Settings from './pages/admin/Settings';
import HolidaySettings from './pages/admin/HolidaySettings';
import ShiftSettings from './pages/admin/ShiftSettings';
import DoctorDutySchedule from './pages/admin/DoctorDutySchedule';
import AppointmentBooking from './pages/admin/AppointmentBooking';
import AppointmentMonitor from './pages/admin/AppointmentMonitor';
import FollowUpCalls from './pages/admin/FollowUpCalls';
import PaymentManagement from './pages/admin/PaymentManagement';
import PatientRecord from './pages/admin/PatientRecord';
import AccessDenied from './components/AccessDenied';
import { hasPermission } from './utils/permissions';

// Imports phân hệ Bác sĩ
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentDetail from './pages/doctor/DoctorAppointmentDetail';
import DoctorPatientRecord from './pages/doctor/DoctorPatientRecord';
import DoctorSelfDutySchedule from './pages/doctor/DoctorDutySchedule';
import DoctorSelfProfile from './pages/doctor/DoctorProfile';
import ReceptionistDutyScheduleView from './pages/receptionist/DutyScheduleView';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientBooking from './pages/patient/PatientBooking';
import PatientRecords from './pages/patient/PatientRecords';
import PatientInvoices from './pages/patient/PatientInvoices';

// Component bảo vệ các tuyến đường theo vai trò
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-semibold">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
          <p className="text-slate-400 text-sm">Đang tải thông tin hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Điều hướng ngược lại nếu không khớp phân quyền
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (user.role === 'PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    if (user.role === 'RECEPTIONIST') {
      return <Navigate to="/receptionist/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const PermissionRoute = ({ children, module, action = 'view' }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasPermission(user, module, action)) return <AccessDenied />;

  return children;
};

// Điều hướng mặc định dựa trên vai trò
const DefaultRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user.role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Default admin route redirects to Dashboard */}
            <Route index element={<PermissionRoute module="dashboard"><Dashboard /></PermissionRoute>} />
            <Route path="dashboard" element={<PermissionRoute module="dashboard"><Dashboard /></PermissionRoute>} />
            <Route path="appointments" element={<PermissionRoute module="appointments"><AppointmentManagement /></PermissionRoute>} />
            <Route path="appointments/book" element={<PermissionRoute module="appointments" action="create"><AppointmentBooking /></PermissionRoute>} />
            <Route path="appointments/monitor" element={<PermissionRoute module="appointments"><AppointmentMonitor /></PermissionRoute>} />
            <Route path="appointments/follow-ups" element={<PermissionRoute module="followUps"><FollowUpCalls /></PermissionRoute>} />
            <Route path="appointments/duty-schedules" element={<PermissionRoute module="doctorDuty"><DoctorDutySchedule /></PermissionRoute>} />
            <Route path="payments" element={<PermissionRoute module="payments"><PaymentManagement /></PermissionRoute>} />
            <Route path="users" element={<PermissionRoute module="users"><UserManagement /></PermissionRoute>} />
            <Route path="staff" element={<PermissionRoute module="users"><UserManagement /></PermissionRoute>} />
            <Route path="customers" element={<PermissionRoute module="patients"><CustomerManagement /></PermissionRoute>} />
            <Route path="records" element={<PermissionRoute module="records"><PatientRecord /></PermissionRoute>} />
            <Route path="services" element={<PermissionRoute module="services"><ServiceManagement /></PermissionRoute>} />
            <Route path="roles" element={<PermissionRoute module="roles"><RoleManagement /></PermissionRoute>} />
            <Route path="reports/revenue" element={<PermissionRoute module="reports"><RevenueReport /></PermissionRoute>} />
            <Route path="reports/doctor-performance" element={<PermissionRoute module="reports"><DoctorPerformanceReport /></PermissionRoute>} />
            <Route path="reports/patients-services" element={<PermissionRoute module="reports"><PatientServiceReport /></PermissionRoute>} />
            <Route path="settings" element={<PermissionRoute module="settings"><Settings /></PermissionRoute>} />
            <Route path="shifts" element={<PermissionRoute module="settings"><ShiftSettings /></PermissionRoute>} />
            <Route path="holidays" element={<PermissionRoute module="settings"><HolidaySettings /></PermissionRoute>} />
            <Route path="doctor-profile/new" element={<PermissionRoute module="users" action="create"><DoctorProfile /></PermissionRoute>} />
            <Route path="doctor-profile/:id" element={<PermissionRoute module="users" action="update"><DoctorProfile /></PermissionRoute>} />
          </Route>

          {/* Receptionist Routes */}
          <Route
            path="/receptionist"
            element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PermissionRoute module="dashboard"><Dashboard /></PermissionRoute>} />
            <Route path="appointments/book" element={<PermissionRoute module="appointments" action="create"><AppointmentBooking /></PermissionRoute>} />
            <Route path="appointments/monitor" element={<PermissionRoute module="appointments"><AppointmentMonitor /></PermissionRoute>} />
            <Route path="payments" element={<PermissionRoute module="payments"><PaymentManagement /></PermissionRoute>} />
            <Route path="follow-ups" element={<PermissionRoute module="followUps"><FollowUpCalls /></PermissionRoute>} />
            <Route path="patients" element={<PermissionRoute module="patients"><CustomerManagement /></PermissionRoute>} />
            <Route path="duty-schedules" element={<PermissionRoute module="doctorDuty"><ReceptionistDutyScheduleView /></PermissionRoute>} />
          </Route>

          {/* Doctor Routes */}
          <Route 
            path="/doctor" 
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PermissionRoute module="dashboard"><DoctorDashboard /></PermissionRoute>} />
            <Route path="appointments/:id" element={<PermissionRoute module="appointments"><DoctorAppointmentDetail /></PermissionRoute>} />
            <Route path="records" element={<PermissionRoute module="records"><DoctorPatientRecord /></PermissionRoute>} />
            <Route path="duty-schedules" element={<PermissionRoute module="doctorDuty"><DoctorSelfDutySchedule /></PermissionRoute>} />
            <Route path="profile" element={<DoctorSelfProfile />} />
          </Route>

          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="book" element={<PatientBooking />} />
            <Route path="records" element={<PatientRecords />} />
            <Route path="invoices" element={<PatientInvoices />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
