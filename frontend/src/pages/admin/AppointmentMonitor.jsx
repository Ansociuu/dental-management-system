import React, { useState, useEffect } from 'react';
import { monitorAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getShifts } from '../../services/shiftService';
import apiFetch from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AppointmentMonitor = () => {
  const { user } = useAuth();
  const canCompleteAppointment = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [appointments, setAppointments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFilters = async () => {
    try {
      const shiftsRes = await getShifts();
      setShifts(shiftsRes.data);
      
      // Get unique doctors from backend list
      const res = await apiFetch('/appointments/monitor');
      const uniqueDoctors = [];
      const seen = new Set();
      res.data?.forEach(item => {
        if (item.doctorId && !seen.has(item.doctorId._id)) {
          seen.add(item.doctorId._id);
          uniqueDoctors.push(item.doctorId);
        }
      });
      setDoctors(uniqueDoctors);
    } catch (err) {
      // ignore
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = { date: filterDate };
      if (filterDoctor) params.doctorId = filterDoctor;
      if (filterShift) params.shiftId = filterShift;
      if (filterStatus) params.status = filterStatus;
      
      const res = await monitorAppointments(params);
      setAppointments(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterDoctor, filterShift, filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      setError('');
      await updateAppointmentStatus(id, status);
      setSuccess(`Đã cập nhật trạng thái lịch khám!`);
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xác nhận', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: 'pending_actions' };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: 'check_circle' };
      case 'CHECKED_IN':
        return { label: 'Đã Check-in', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: 'how_to_reg' };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: 'task_alt' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: 'cancel' };
      case 'NO_SHOW':
        return { label: 'Không đến', color: 'text-slate-500 bg-slate-100 border-slate-200', icon: 'event_busy' };
      default:
        return { label: status, color: 'text-slate-700 bg-slate-50 border-slate-200', icon: 'info' };
    }
  };

  const getShiftBadgeColor = (shiftName) => {
    if (shiftName?.includes('Sáng')) return 'bg-amber-100 text-amber-700';
    if (shiftName?.includes('Chiều')) return 'bg-sky-100 text-sky-700';
    return 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Lịch khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Điều phối & Giám sát</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Theo dõi & Điều phối lịch khám</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Giám sát thời gian thực danh sách khám bệnh, số thứ tự và cập nhật trạng thái điều phối.
          </p>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Ngày khám</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Bác sĩ</label>
          <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Tất cả bác sĩ</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Ca khám</label>
          <select value={filterShift} onChange={e => setFilterShift(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Tất cả ca</option>
            {shifts.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CHECKED_IN">Đã Check-in</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="NO_SHOW">Không đến</option>
          </select>
        </div>
      </div>

      {/* Monitor list */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Đang tải danh sách lịch khám...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 block mb-3">monitor_heart</span>
            <p className="text-slate-500 font-medium">Không có lịch khám nào khớp với bộ lọc</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-center w-24">STT</th>
                <th className="px-6 py-5">Bệnh nhân</th>
                <th className="px-6 py-5">Ca khám & Giờ</th>
                <th className="px-6 py-5">Bác sĩ phụ trách</th>
                <th className="px-6 py-5">Dịch vụ</th>
                <th className="px-6 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Điều phối nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt) => {
                const statusCfg = getStatusConfig(apt.status);
                return (
                  <tr key={apt._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-4 text-center">
                      <span className="inline-flex w-8 h-8 rounded-full bg-slate-100 font-extrabold text-slate-800 items-center justify-center border border-slate-200">
                        {apt.queueNumber || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900">{apt.patientId?.fullName || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{apt.patientId?.phone} • {apt.patientId?.patientCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getShiftBadgeColor(apt.shiftId?.name)}`}>
                          {apt.shiftId?.name || 'Ca khám'}
                        </span>
                        <p className="text-xs font-semibold text-slate-700 mt-1">{apt.shiftId?.startTime} — {apt.shiftId?.endTime}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{apt.doctorId?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-blue-700">{apt.serviceId?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${statusCfg.color}`}>
                        <span className="material-symbols-outlined text-[16px]">{statusCfg.icon}</span>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'PENDING' && (
                          <button onClick={() => handleStatusChange(apt._id, 'CONFIRMED')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Xác nhận</button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button onClick={() => handleStatusChange(apt._id, 'CHECKED_IN')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">Check-in</button>
                        )}
                        {canCompleteAppointment && apt.status === 'CHECKED_IN' && (
                          <button onClick={() => handleStatusChange(apt._id, 'COMPLETED')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">Hoàn thành</button>
                        )}
                        {['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(apt.status) && (
                          <button onClick={() => handleStatusChange(apt._id, 'CANCELLED')} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Hủy lịch"><span className="material-symbols-outlined text-[18px]">block</span></button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                          <button onClick={() => handleStatusChange(apt._id, 'NO_SHOW')} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors" title="Báo vắng"><span className="material-symbols-outlined text-[18px]">event_busy</span></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AppointmentMonitor;
