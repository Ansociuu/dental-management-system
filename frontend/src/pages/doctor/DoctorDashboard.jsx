import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorTodayAppointments, updateAppointmentStatus } from '../../services/appointmentService';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  const loadData = async (dateVal) => {
    try {
      setLoading(true);
      setError('');
      const res = await getDoctorTodayAppointments({ date: dateVal });
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách ca khám.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleStartExam = async (aptId) => {
    try {
      // Cập nhật trạng thái cuộc hẹn thành IN_PROGRESS khi bác sĩ bắt đầu khám
      await updateAppointmentStatus(aptId, 'IN_PROGRESS');
      navigate(`/doctor/appointments/${aptId}`);
    } catch (err) {
      alert(err.message || 'Không thể bắt đầu ca khám');
    }
  };

  // Tính toán thống kê
  const totalCount = appointments.length;
  const waitingCount = appointments.filter(apt => apt.status === 'CHECKED_IN' || apt.status === 'CONFIRMED').length;
  const inProgressCount = appointments.filter(apt => apt.status === 'IN_PROGRESS').length;
  const completedCount = appointments.filter(apt => apt.status === 'COMPLETED').length;

  const calculateAge = (dobString) => {
    if (!dobString) return '—';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg border border-slate-200">Đợi xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg border border-blue-100">Đã xác nhận</span>;
      case 'CHECKED_IN':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-lg border border-amber-200 animate-pulse">Chờ khám</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded-lg border border-teal-200">Đang khám</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-600 rounded-lg border border-rose-100">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-500 rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ca Khám Trong Ngày</h1>
          <p className="text-slate-500 font-medium mt-1">Theo dõi danh sách bệnh nhân và tiếp nhận khám điều trị trực tiếp.</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200/80">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-bold text-slate-700 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-bold flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat 1 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số ca khám</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Bệnh nhân chờ khám</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{waitingCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px] animate-pulse">patient_list</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang khám</p>
            <p className="text-3xl font-black text-teal-600 mt-2">{inProgressCount}</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đã hoàn thành</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{completedCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600">groups</span>
            Danh sách khám điều trị
          </h3>
          <button
            onClick={() => loadData(selectedDate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Tải lại
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <span className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin block mx-auto mb-4"></span>
            <p className="text-slate-500 font-bold text-sm">Đang tải danh sách ca khám hôm nay...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">event_busy</span>
            <h4 className="text-lg font-bold text-slate-700 mb-1">Không có ca khám nào</h4>
            <p className="text-slate-400 text-sm">Hôm nay bạn không có lịch hẹn hoặc ca làm việc nào được lên lịch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-8 py-4 text-center">STT Khám</th>
                  <th className="px-6 py-4">Bệnh nhân</th>
                  <th className="px-6 py-4">Ca & Giờ hẹn</th>
                  <th className="px-6 py-4">Triệu chứng ban đầu</th>
                  <th className="px-6 py-4">Dịch vụ đăng ký</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-8 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {appointments.map((apt) => {
                  const p = apt.patientId || {};
                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-8 py-5 text-center font-black text-slate-800 text-lg">
                        <span className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-sm">
                          {apt.queueNumber || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xs shadow-inner">
                            {p.fullName ? p.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'BN'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{p.fullName || 'Ẩn danh'}</p>
                            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                              {p.patientCode || 'MEC-PT-XXXX'} • {p.gender} • {calculateAge(p.dob)} tuổi
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800">{apt.shiftId?.name || '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{apt.shiftId?.startTime || '—'} - {apt.shiftId?.endTime || '—'}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-600 font-medium max-w-[200px] truncate">
                        {apt.symptoms || 'Khám tổng quát định kỳ'}
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                          {apt.serviceId?.name || 'Chưa chọn'}
                        </span>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(apt.status)}</td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        {apt.status === 'CHECKED_IN' || apt.status === 'CONFIRMED' ? (
                          <button
                            onClick={() => handleStartExam(apt._id)}
                            className="bg-teal-500 hover:bg-teal-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-1.5 ml-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                            Bắt đầu khám
                          </button>
                        ) : apt.status === 'IN_PROGRESS' ? (
                          <button
                            onClick={() => navigate(`/doctor/appointments/${apt._id}`)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-1.5 ml-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                            Tiếp tục khám
                          </button>
                        ) : apt.status === 'COMPLETED' ? (
                          <button
                            onClick={() => navigate(`/doctor/appointments/${apt._id}`)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-1.5 ml-auto border border-slate-200"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Xem chi tiết
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
