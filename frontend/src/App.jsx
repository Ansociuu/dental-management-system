import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
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

// Imports phân hệ Bác sĩ
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentDetail from './pages/doctor/DoctorAppointmentDetail';
import DoctorPatientRecord from './pages/doctor/DoctorPatientRecord';
import DoctorSelfDutySchedule from './pages/doctor/DoctorDutySchedule';
import DoctorSelfProfile from './pages/doctor/DoctorProfile';
import ReceptionistDutyScheduleView from './pages/receptionist/DutyScheduleView';

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
    if (user.role === 'RECEPTIONIST') {
      return <Navigate to="/receptionist/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Điều hướng mặc định dựa trên vai trò
const DefaultRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
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
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<AppointmentManagement />} />
            <Route path="appointments/book" element={<AppointmentBooking />} />
            <Route path="appointments/monitor" element={<AppointmentMonitor />} />
            <Route path="appointments/follow-ups" element={<FollowUpCalls />} />
            <Route path="appointments/duty-schedules" element={<DoctorDutySchedule />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="staff" element={<UserManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="reports/revenue" element={<RevenueReport />} />
            <Route path="reports/doctor-performance" element={<DoctorPerformanceReport />} />
            <Route path="reports/patients-services" element={<PatientServiceReport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="shifts" element={<ShiftSettings />} />
            <Route path="holidays" element={<HolidaySettings />} />
            <Route path="doctor-profile/new" element={<DoctorProfile />} />
            <Route path="doctor-profile/:id" element={<DoctorProfile />} />
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
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments/book" element={<AppointmentBooking />} />
            <Route path="appointments/monitor" element={<AppointmentMonitor />} />
            <Route path="follow-ups" element={<FollowUpCalls />} />
            <Route path="patients" element={<CustomerManagement />} />
            <Route path="duty-schedules" element={<ReceptionistDutyScheduleView />} />
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
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments/:id" element={<DoctorAppointmentDetail />} />
            <Route path="records" element={<DoctorPatientRecord />} />
            <Route path="duty-schedules" element={<DoctorSelfDutySchedule />} />
            <Route path="profile" element={<DoctorSelfProfile />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
