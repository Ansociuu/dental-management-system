import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default admin route redirects to Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="records" element={<PatientRecord />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="staff" element={<UserManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="reports/revenue" element={<RevenueReport />} />
          <Route path="reports/doctor-performance" element={<DoctorPerformanceReport />} />
          <Route path="reports/patients-services" element={<PatientServiceReport />} />
          <Route path="settings" element={<Settings />} />
          <Route path="doctor-profile" element={<DoctorProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
