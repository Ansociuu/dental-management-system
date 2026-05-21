import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getUsers } from '../../services/userService';

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load doctors
      const docRes = await getUsers({ role: 'DOCTOR' });
      setDoctors(docRes.data || []);

      // Load appointments
      const aptRes = await getAppointments();
      setAppointments(aptRes.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thông tin ca hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setError('');
      await updateAppointmentStatus(id, newStatus);
      setSuccess('Cập nhật trạng thái lịch hẹn thành công!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CHECKED_IN':
        return { label: 'Đã check-in', color: 'text-blue-700 font-bold', bg: 'bg-blue-50 border-blue-200', icon: 'stethoscope' };
      case 'PENDING':
        return { label: 'Chờ xác nhận', color: 'text-slate-600 font-bold', bg: 'bg-slate-50 border-slate-200', icon: 'schedule' };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'text-amber-700 font-bold', bg: 'bg-amber-50 border-amber-200', icon: 'pending_actions' };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'text-emerald-700 font-bold', bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'text-rose-700 font-bold', bg: 'bg-rose-50 border-rose-200', icon: 'cancel' };
      case 'NO_SHOW':
        return { label: 'Vắng mặt', color: 'text-red-700 font-bold', bg: 'bg-red-50 border-red-200', icon: 'event_busy' };
      default:
        return { label: status, color: 'text-slate-700 font-bold', bg: 'bg-slate-100 border-slate-200', icon: 'info' };
    }
  };

  // Filters & Search
  const filteredAppointments = appointments.filter(apt => {
    // Tab Filter
    if (activeTab === 'pending' && apt.status !== 'PENDING') return false;
    if (activeTab === 'confirmed' && apt.status !== 'CONFIRMED' && apt.status !== 'CHECKED_IN') return false;
    if (activeTab === 'completed' && apt.status !== 'COMPLETED') return false;
    if (activeTab === 'cancelled' && apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW') return false;

    // Doctor Filter
    if (selectedDoctor !== 'ALL' && (!apt.doctorId || apt.doctorId._id !== selectedDoctor)) return false;

    // Search Term Filter
    if (searchTerm) {
      const patName = apt.patientId?.fullName || '';
      const patPhone = apt.patientId?.phone || '';
      const term = searchTerm.toLowerCase();
      return patName.toLowerCase().includes(term) || patPhone.includes(term);
    }

    return true;
  });

  const getStats = () => {
    const stats = { total: appointments.length, pending: 0, active: 0, completed: 0, cancelled: 0 };
    appointments.forEach(apt => {
      if (apt.status === 'PENDING') stats.pending++;
      else if (apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN') stats.active++;
      else if (apt.status === 'COMPLETED') stats.completed++;
      else if (apt.status === 'CANCELLED' || apt.status === 'NO_SHOW') stats.cancelled++;
    });
    return stats;
  };

  const stats = getStats();

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Hệ thống</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Quản lý Lịch hẹn</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ lịch hẹn nha khoa</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Danh sách lịch hẹn tính đến: {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/appointments/book')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Đặt ca hẹn mới
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng lịch hẹn', value: stats.total, icon: 'event', color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Đăng ký toàn bộ' },
          { label: 'Chờ khám / Xác nhận', value: stats.pending + stats.active, icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Cần tiếp nhận' },
          { label: 'Đã hoàn thành', value: stats.completed, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Hồ sơ đã đóng' },
          { label: 'Đã hủy / Vắng', value: stats.cancelled, icon: 'event_busy', color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Không khám' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-800 mb-1">{stat.value}</p>
              <p className="text-sm font-bold text-slate-500 mb-2">{stat.label}</p>
              <p className="text-xs text-slate-400 font-medium">{stat.desc}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="xl:col-span-1 space-y-6">
          {/* Doctor Filter */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">person_search</span>
              Lọc theo Bác sĩ
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedDoctor('ALL')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selectedDoctor === 'ALL' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả bác sĩ
              </button>
              {doctors.map(doc => (
                <button 
                  key={doc._id}
                  onClick={() => setSelectedDoctor(doc._id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedDoctor === doc._id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {doc.fullName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Timeline List */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex gap-6">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'pending', label: 'Đợi duyệt' },
                  { id: 'confirmed', label: 'Xác nhận' },
                  { id: 'completed', label: 'Hoàn thành' },
                  { id: 'cancelled', label: 'Hủy/Vắng' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`text-sm font-bold transition-colors relative pb-1 ${activeTab === tab.id ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Tìm bệnh nhân..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-semibold">Đang tải danh sách ca hẹn...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">calendar_today</span>
                <p className="text-sm font-bold">Không tìm thấy ca hẹn nào thỏa mãn</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto">
                {filteredAppointments.map(apt => {
                  const statusInfo = getStatusConfig(apt.status);
                  return (
                    <div key={apt._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center font-bold text-slate-700 shadow-inner">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">STT</span>
                          <span className="text-lg text-blue-600 leading-tight mt-0.5">{apt.queueNumber || '—'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-extrabold text-slate-900">{apt.patientId ? apt.patientId.fullName : 'Không rõ bệnh nhân'}</h4>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 shadow-sm ${statusInfo.bg} ${statusInfo.color}`}>
                              <span className="material-symbols-outlined text-[12px]">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span>{apt.patientId ? apt.patientId.phone : '—'}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">medical_services</span>{apt.serviceId ? apt.serviceId.name : '—'}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span>BS. {apt.doctorId ? apt.doctorId.fullName : 'Chưa xếp'}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{new Date(apt.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown status changer / controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {apt.status === 'PENDING' && (
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'CONFIRMED')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Xác nhận hẹn
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'CHECKED_IN')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Check-in
                          </button>
                        )}
                        {apt.status === 'CHECKED_IN' && (
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'COMPLETED')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Xong khám
                          </button>
                        )}
                        {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW' && (
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'CANCELLED')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 rounded-lg text-xs font-bold transition-all"
                          >
                            Hủy lịch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagement;
