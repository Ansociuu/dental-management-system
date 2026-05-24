import React, { useEffect, useMemo, useState } from 'react';
import { getFollowUpAppointments, updateAppointmentFollowUp } from '../../services/appointmentService';

const FOLLOW_UP_STATUS = {
  PENDING: {
    label: 'Chờ gọi',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'schedule'
  },
  CALLED: {
    label: 'Đã gọi',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'phone_in_talk'
  },
  UNREACHABLE: {
    label: 'Không nghe máy',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: 'phone_missed'
  }
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const FollowUpCalls = () => {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState(toDateInput(new Date()));
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getFollowUpAppointments({ date: filterDate, status: filterStatus });
      const items = res.data || [];
      setAppointments(items);
      setNotes(
        items.reduce((acc, item) => {
          acc[item._id] = item.followUpNote || '';
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách gọi lại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, [filterDate, filterStatus]);

  const stats = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        const status = item.followUpStatus || 'PENDING';
        acc[status] = (acc[status] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, PENDING: 0, CALLED: 0, UNREACHABLE: 0 }
    );
  }, [appointments]);

  const handleUpdate = async (id, followUpStatus) => {
    try {
      setSavingId(id);
      setError('');
      await updateAppointmentFollowUp(id, {
        followUpStatus,
        followUpNote: notes[id] || ''
      });
      setSuccess('Cập nhật trạng thái gọi lại thành công');
      await loadFollowUps();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái gọi lại');
    } finally {
      setSavingId('');
    }
  };

  const handleSaveNote = async (id) => {
    try {
      setSavingId(id);
      setError('');
      await updateAppointmentFollowUp(id, { followUpNote: notes[id] || '' });
      setSuccess('Đã lưu ghi chú gọi lại');
      await loadFollowUps();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể lưu ghi chú');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Chăm sóc sau khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Gọi lại sau khám</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gọi lại sau khám</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Theo dõi các bệnh nhân đã khám xong ngày hôm trước và cập nhật tình trạng sau khi gọi.
          </p>
        </div>
        <button
          type="button"
          onClick={loadFollowUps}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Tải lại
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng danh sách', value: stats.total, icon: 'groups', color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Chờ gọi', value: stats.PENDING, icon: 'schedule', color: 'text-amber-600 bg-amber-50' },
          { label: 'Đã gọi', value: stats.CALLED, icon: 'phone_in_talk', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Không nghe máy', value: stats.UNREACHABLE, icon: 'phone_missed', color: 'text-rose-600 bg-rose-50' }
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{item.value}</p>
              <p className="text-xs font-bold text-slate-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Ngày cần gọi</label>
          <input
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái gọi</label>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="PENDING">Chờ gọi</option>
            <option value="UNREACHABLE">Không nghe máy</option>
            <option value="CALLED">Đã gọi</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">info</span>
          Danh sách này lấy các ca đã hoàn thành vào ngày hôm trước.
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Đang tải danh sách gọi lại...</div>
        ) : appointments.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">phone_disabled</span>
            <p className="text-sm font-bold">Không có bệnh nhân nào trong danh sách này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 min-w-[220px]">Bệnh nhân</th>
                  <th className="px-6 py-5 min-w-[180px]">Thông tin khám</th>
                  <th className="px-6 py-5 min-w-[150px]">Trạng thái</th>
                  <th className="px-6 py-5 min-w-[280px]">Ghi chú tình trạng</th>
                  <th className="px-6 py-5 text-right min-w-[220px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => {
                  const status = appointment.followUpStatus || 'PENDING';
                  const config = FOLLOW_UP_STATUS[status] || FOLLOW_UP_STATUS.PENDING;
                  const isSaving = savingId === appointment._id;
                  return (
                    <tr key={appointment._id} className="hover:bg-blue-50/30 transition-colors align-top">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center border border-blue-100 shrink-0">
                            {appointment.patientId?.fullName?.split(' ').pop()?.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{appointment.patientId?.fullName || 'N/A'}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{appointment.patientId?.phone || '-'}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-0.5">{appointment.patientId?.patientCode || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-700">{formatDate(appointment.date)}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">BS. {appointment.doctorId?.fullName || '-'}</p>
                        <p className="text-xs text-blue-700 font-bold mt-1">{appointment.serviceId?.name || '-'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${config.badge}`}>
                          <span className="material-symbols-outlined text-[16px]">{config.icon}</span>
                          {config.label}
                        </span>
                        <p className="text-[11px] text-slate-400 font-semibold mt-2">
                          {appointment.followUpAt ? formatDateTime(appointment.followUpAt) : 'Chưa cập nhật'}
                        </p>
                        {appointment.followUpBy?.fullName && (
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Bởi {appointment.followUpBy.fullName}</p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <textarea
                          rows="3"
                          value={notes[appointment._id] || ''}
                          onChange={(event) => setNotes((prev) => ({ ...prev, [appointment._id]: event.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
                          placeholder="Nhập tình trạng bệnh nhân sau khi gọi..."
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleUpdate(appointment._id, 'CALLED')}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Đã gọi
                          </button>
                          {status !== 'CALLED' && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleUpdate(appointment._id, 'UNREACHABLE')}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                            >
                              Không nghe máy
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveNote(appointment._id)}
                            className="px-3 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            Lưu ghi chú
                          </button>
                        </div>
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

export default FollowUpCalls;
