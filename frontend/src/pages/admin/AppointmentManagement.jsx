import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getUsers } from '../../services/userService';

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApt, setSelectedApt] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [docRes, aptRes] = await Promise.all([
        getUsers({ role: 'DOCTOR' }),
        getAppointments()
      ]);
      setDoctors(docRes.data || []);
      setAppointments(aptRes.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setError('');
      await updateAppointmentStatus(id, newStatus);
      setSuccess('Cập nhật trạng thái thành công!');
      loadData();
      if (selectedApt && selectedApt._id === id) setSelectedApt(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', icon: 'schedule' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-400', icon: 'pending_actions' },
      CHECKED_IN: { label: 'Chờ khám', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-400', icon: 'stethoscope' },
      COMPLETED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400', icon: 'check_circle' },
      CANCELLED: { label: 'Đã hủy', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', dot: 'bg-rose-400', icon: 'cancel' },
      NO_SHOW: { label: 'Vắng mặt', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-400', icon: 'event_busy' },
    };
    return map[status] || map.PENDING;
  };

  // Filter
  const filtered = appointments.filter(apt => {
    if (selectedDoctor !== 'ALL' && (!apt.doctorId || apt.doctorId._id !== selectedDoctor)) return false;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      const n = apt.patientId?.fullName?.toLowerCase() || '';
      const p = apt.patientId?.phone || '';
      return n.includes(t) || p.includes(t);
    }
    return true;
  });

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
  const totalCells = 42;
  const calendarDays = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(calYear, calMonth - 1, prevMonthDays - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, currentMonth: true, date: new Date(calYear, calMonth, d) });
  }
  const remaining = totalCells - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, currentMonth: false, date: new Date(calYear, calMonth + 1, d) });
  }

  const isSameDay = (d1, d2) => {
    const a = new Date(d1), b = new Date(d2);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const isToday = (d) => isSameDay(d, new Date());

  const getAptsForDay = (date) => filtered.filter(apt => isSameDay(apt.date, date));

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const goToday = () => { setCalMonth(new Date().getMonth()); setCalYear(new Date().getFullYear()); };

  const stats = { total: appointments.length, pending: 0, active: 0, completed: 0, cancelled: 0 };
  appointments.forEach(a => {
    if (a.status === 'PENDING') stats.pending++;
    else if (a.status === 'CONFIRMED' || a.status === 'CHECKED_IN') stats.active++;
    else if (a.status === 'COMPLETED') stats.completed++;
    else stats.cancelled++;
  });

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
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>Lịch
            </button>
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-[16px]">list</span>Danh sách
            </button>
          </div>
          <button onClick={() => navigate('/admin/appointments/book')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20">
            <span className="material-symbols-outlined text-[18px]">add</span>Đặt ca hẹn mới
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng', value: stats.total, icon: 'event', c: 'text-indigo-600 bg-indigo-50' },
          { label: 'Chờ / Xác nhận', value: stats.pending + stats.active, icon: 'pending_actions', c: 'text-amber-600 bg-amber-50' },
          { label: 'Hoàn thành', value: stats.completed, icon: 'check_circle', c: 'text-emerald-600 bg-emerald-50' },
          { label: 'Hủy / Vắng', value: stats.cancelled, icon: 'event_busy', c: 'text-rose-600 bg-rose-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.c} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-xs font-bold text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500">
          <option value="ALL">Tất cả bác sĩ</option>
          {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input type="text" placeholder="Tìm bệnh nhân..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {/* === CALENDAR VIEW === */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_left</span>
              </button>
              <h2 className="text-lg font-extrabold text-slate-800 min-w-[180px] text-center">{monthNames[calMonth]} {calYear}</h2>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_right</span>
              </button>
              <button onClick={goToday} className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">Hôm nay</button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {dayNames.map(d => (
              <div key={d} className="py-3 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((cell, idx) => {
                const dayApts = getAptsForDay(cell.date);
                const today = isToday(cell.date);
                return (
                  <div key={idx} className={`min-h-[120px] border-b border-r border-slate-100 p-1.5 relative transition-colors ${cell.currentMonth ? 'bg-white' : 'bg-slate-50/60'} ${today ? 'ring-2 ring-inset ring-blue-400/40' : ''}`}>
                    {/* Day Number */}
                    <div className={`text-right mb-1 pr-1`}>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${today ? 'bg-blue-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                        {cell.day}
                      </span>
                    </div>
                    {/* Appointment chips */}
                    <div className="space-y-0.5 overflow-y-auto max-h-[80px]">
                      {dayApts.slice(0, 4).map(apt => {
                        const sc = getStatusConfig(apt.status);
                        return (
                          <button key={apt._id} onClick={() => setSelectedApt(apt)}
                            className={`w-full text-left px-1.5 py-1 rounded-md text-[10px] font-bold truncate border cursor-pointer hover:shadow-sm transition-all ${sc.bg} ${sc.color}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${sc.dot}`}></span>
                            {apt.patientId?.fullName || 'BN'}
                          </button>
                        );
                      })}
                      {dayApts.length > 4 && (
                        <p className="text-[10px] font-bold text-slate-400 text-center">+{dayApts.length - 4} khác</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === LIST VIEW === */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">calendar_today</span>
              <p className="text-sm font-bold">Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
              {filtered.map(apt => {
                const sc = getStatusConfig(apt.status);
                return (
                  <div key={apt._id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4 group cursor-pointer" onClick={() => setSelectedApt(apt)}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-slate-400 uppercase leading-none">STT</span>
                        <span className="text-base font-extrabold text-blue-600 leading-tight">{apt.queueNumber || '—'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{apt.patientId?.fullName || 'N/A'}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs font-medium text-slate-500">
                          <span>{new Date(apt.date).toLocaleDateString('vi-VN')}</span>
                          <span>BS. {apt.doctorId?.fullName || '—'}</span>
                          <span>{apt.serviceId?.name || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.status === 'PENDING' && <button onClick={(e) => { e.stopPropagation(); handleStatusChange(apt._id, 'CONFIRMED'); }} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold">Xác nhận</button>}
                      {apt.status === 'CONFIRMED' && <button onClick={(e) => { e.stopPropagation(); handleStatusChange(apt._id, 'CHECKED_IN'); }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Check-in</button>}
                      {apt.status === 'CHECKED_IN' && <button onClick={(e) => { e.stopPropagation(); handleStatusChange(apt._id, 'COMPLETED'); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold">Hoàn thành</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === DETAIL POPOVER/MODAL === */}
      {selectedApt && (() => {
        const sc = getStatusConfig(selectedApt.status);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedApt(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className={`px-6 py-4 border-b flex justify-between items-center ${sc.bg}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[22px] ${sc.color}`}>{sc.icon}</span>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">Chi tiết lịch hẹn</h2>
                    <span className={`text-xs font-bold ${sc.color}`}>{sc.label}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedApt(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bệnh nhân</p>
                    <p className="text-sm font-extrabold text-slate-800">{selectedApt.patientId?.fullName || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{selectedApt.patientId?.phone || ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bác sĩ phụ trách</p>
                    <p className="text-sm font-extrabold text-slate-800">BS. {selectedApt.doctorId?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày khám</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(selectedApt.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ca khám</p>
                    <p className="text-sm font-bold text-slate-700">{selectedApt.shiftId?.name || '—'} ({selectedApt.shiftId?.startTime} — {selectedApt.shiftId?.endTime})</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dịch vụ</p>
                    <p className="text-sm font-bold text-slate-700">{selectedApt.serviceId?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Số thứ tự</p>
                    <p className="text-2xl font-extrabold text-blue-600">{selectedApt.queueNumber || '—'}</p>
                  </div>
                </div>
                {selectedApt.symptoms && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Triệu chứng / Ghi chú</p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">{selectedApt.symptoms}</p>
                  </div>
                )}
              </div>
              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 justify-end">
                {selectedApt.status === 'PENDING' && (
                  <button onClick={() => handleStatusChange(selectedApt._id, 'CONFIRMED')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all">Xác nhận hẹn</button>
                )}
                {selectedApt.status === 'CONFIRMED' && (
                  <button onClick={() => handleStatusChange(selectedApt._id, 'CHECKED_IN')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all">Check-in</button>
                )}
                {selectedApt.status === 'CHECKED_IN' && (
                  <button onClick={() => handleStatusChange(selectedApt._id, 'COMPLETED')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all">Hoàn thành khám</button>
                )}
                {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(selectedApt.status) && (
                  <button onClick={() => handleStatusChange(selectedApt._id, 'CANCELLED')} className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all">Hủy lịch</button>
                )}
                <button onClick={() => setSelectedApt(null)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-all">Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AppointmentManagement;
