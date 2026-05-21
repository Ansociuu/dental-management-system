import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import PatientRecord from './pages/admin/PatientRecord';
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
import PatientManagementTemp from './pages/admin/PatientManagementTemp';

// Component bảo vệ các tuyến đường Admin
const ProtectedRoute = ({ children }) => {
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

  return children;
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
              <ProtectedRoute>
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
            <Route path="appointments/duty-schedules" element={<DoctorDutySchedule />} />
            <Route path="records" element={<PatientRecord />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="staff" element={<UserManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="patients-temp" element={<PatientManagementTemp />} />
            <Route path="services" element={<ServiceManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="reports/revenue" element={<RevenueReport />} />
            <Route path="reports/doctor-performance" element={<DoctorPerformanceReport />} />
            <Route path="reports/patients-services" element={<PatientServiceReport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="shifts" element={<ShiftSettings />} />
            <Route path="holidays" element={<HolidaySettings />} />
            <Route path="doctor-profile" element={<DoctorProfile />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
