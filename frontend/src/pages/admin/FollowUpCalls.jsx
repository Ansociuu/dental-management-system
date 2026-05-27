/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { getFollowUpAppointments, updateAppointmentFollowUp } from '../../services/appointmentService';

const FOLLOW_UP_STATUS = {
  PENDING: {
    label: 'Chờ gọi',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: 'schedule'
  },
  CALLED: {
    label: 'Đã gọi',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'phone_in_talk'
  },
  UNREACHABLE: {
    label: 'Không nghe máy',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: 'phone_missed'
  }
};

const toDateInput = (date) => date.toISOString().slice(0, 10);
const getDateKey = (date) => toDateInput(new Date(date));
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

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

const buildCalendarDays = (currentMonth) => {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const calendarStart = addDays(start, -start.getDay());
  const calendarEnd = addDays(end, 6 - end.getDay());
  const days = [];
  let cursor = new Date(calendarStart);

  while (cursor <= calendarEnd) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  return days;
};

const getServiceNames = (appointment) => {
  if (appointment.servicesPerformed?.length) {
    return appointment.servicesPerformed
      .map((item) => item.serviceId?.name || 'Dịch vụ')
      .join(', ');
  }
  return appointment.serviceId?.name || '-';
};

const FollowUpCalls = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(toDateInput(new Date()));
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const monthRange = useMemo(() => ({
    dateFrom: toDateInput(startOfMonth(currentMonth)),
    dateTo: toDateInput(endOfMonth(currentMonth))
  }), [currentMonth]);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...monthRange, status: filterStatus };
      const res = await getFollowUpAppointments(params);
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách gọi lại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, [monthRange.dateFrom, monthRange.dateTo, filterStatus]);

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const dueDate = appointment.followUpDueDate || addDays(new Date(appointment.date), 1);
      const key = getDateKey(dueDate);
      if (!acc[key]) acc[key] = [];
      acc[key].push(appointment);
      return acc;
    }, {});
  }, [appointments]);

  const selectedDateAppointments = appointmentsByDate[selectedDate] || [];

  const stats = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        const status = item.followUpStatus || 'PENDING';
        acc[status] += 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, PENDING: 0, CALLED: 0, UNREACHABLE: 0 }
    );
  }, [appointments]);

  const openAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setNote(appointment.followUpNote || '');
  };

  const handleUpdate = async (followUpStatus) => {
    if (!selectedAppointment) return;
    try {
      setSaving(true);
      setError('');
      const payload = { followUpNote: note };
      if (followUpStatus) payload.followUpStatus = followUpStatus;
      const res = await updateAppointmentFollowUp(selectedAppointment._id, payload);
      const updated = res.data;
      setAppointments((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setSelectedAppointment(updated);
      setNote(updated.followUpNote || '');
      setSuccess('Đã cập nhật gọi lại sau khám');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật gọi lại sau khám');
    } finally {
      setSaving(false);
    }
  };

  const moveMonth = (offset) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const calendarDays = buildCalendarDays(currentMonth);
  const todayKey = toDateInput(new Date());
  const monthLabel = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Chăm sóc sau khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Gọi lại sau khám</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch gọi lại sau khám</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Theo dõi ca cần gọi theo ngày cần gọi, tức ngày sau khi hoàn tất khám.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => moveMonth(-1)} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h2 className="text-lg font-extrabold text-slate-900 capitalize min-w-[170px] text-center">{monthLabel}</h2>
              <button type="button" onClick={() => moveMonth(1)} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ gọi</option>
              <option value="UNREACHABLE">Không nghe máy</option>
              <option value="CALLED">Đã gọi</option>
            </select>
          </div>

          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 text-center text-xs font-black text-slate-500 uppercase">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div key={day} className="py-3">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const key = toDateInput(day);
              const items = appointmentsByDate[key] || [];
              const isOutside = day.getMonth() !== currentMonth.getMonth();
              const isSelected = key === selectedDate;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-[130px] border-r border-b border-slate-100 p-3 text-left align-top hover:bg-blue-50/40 transition-colors ${
                    isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : 'bg-white'
                  } ${isOutside ? 'opacity-45' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-extrabold ${key === todayKey ? 'bg-blue-700 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-slate-700'}`}>
                      {day.getDate()}
                    </span>
                    {items.length > 0 && <span className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{items.length}</span>}
                  </div>
                  <div className="space-y-1.5">
                    {items.slice(0, 3).map((appointment) => {
                      const status = appointment.followUpStatus || 'PENDING';
                      const config = FOLLOW_UP_STATUS[status] || FOLLOW_UP_STATUS.PENDING;
                      return (
                        <div key={appointment._id} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`}></span>
                          <span className="truncate">{appointment.patientId?.fullName || 'Bệnh nhân'}</span>
                        </div>
                      );
                    })}
                    {items.length > 3 && <p className="text-[11px] font-bold text-slate-400">+{items.length - 3} ca khác</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">{formatDate(selectedDate)}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">{selectedDateAppointments.length} ca cần theo dõi</p>
          </div>
          <div className="p-4 space-y-3 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-slate-400 font-bold">Đang tải...</div>
            ) : selectedDateAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-[44px] mb-3">event_available</span>
                <p className="text-sm font-bold">Không có ca cần gọi</p>
              </div>
            ) : selectedDateAppointments.map((appointment) => {
              const status = appointment.followUpStatus || 'PENDING';
              const config = FOLLOW_UP_STATUS[status] || FOLLOW_UP_STATUS.PENDING;
              return (
                <button
                  type="button"
                  key={appointment._id}
                  onClick={() => openAppointment(appointment)}
                  className="w-full text-left p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-100 transition-colors"
                >
                  <div className="flex justify-between gap-3 mb-3">
                    <div>
                      <p className="font-extrabold text-slate-900">{appointment.patientId?.fullName || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{appointment.patientId?.phone || '-'}</p>
                    </div>
                    <span className={`h-fit px-2.5 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 ${config.badge}`}>
                      <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Khám: {formatDate(appointment.date)}</p>
                  <p className="text-xs font-bold text-blue-700 mt-1 truncate">{getServiceNames(appointment)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Chi tiết gọi lại</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{selectedAppointment.patientId?.fullName || 'Bệnh nhân'}</p>
              </div>
              <button type="button" onClick={() => setSelectedAppointment(null)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bệnh nhân</p>
                  <p className="text-sm font-extrabold text-slate-900">{selectedAppointment.patientId?.fullName || '-'}</p>
                  <p className="text-sm font-bold text-slate-600 mt-1">{selectedAppointment.patientId?.phone || '-'}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{selectedAppointment.patientId?.patientCode || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Thông tin khám</p>
                  <p className="text-sm font-bold text-slate-700">Ngày khám: {formatDate(selectedAppointment.date)}</p>
                  <p className="text-sm font-bold text-slate-700">Bác sĩ: {selectedAppointment.doctorId?.fullName || '-'}</p>
                  <p className="text-sm font-bold text-blue-700">Dịch vụ: {getServiceNames(selectedAppointment)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kết quả khám</p>
                  <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{selectedAppointment.diagnosis || 'Chưa có chẩn đoán'}</p>
                  <p className="text-sm text-slate-500 font-medium whitespace-pre-wrap mt-2">{selectedAppointment.clinicalNotes || ''}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Trạng thái gọi</p>
                  {(() => {
                    const status = selectedAppointment.followUpStatus || 'PENDING';
                    const config = FOLLOW_UP_STATUS[status] || FOLLOW_UP_STATUS.PENDING;
                    return (
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${config.badge}`}>
                        <span className="material-symbols-outlined text-[16px]">{config.icon}</span>
                        {config.label}
                      </span>
                    );
                  })()}
                  <p className="text-xs text-slate-400 font-semibold mt-2">
                    Cập nhật: {formatDateTime(selectedAppointment.followUpAt)}
                  </p>
                  {selectedAppointment.followUpBy?.fullName && (
                    <p className="text-xs text-slate-400 font-semibold mt-1">Bởi {selectedAppointment.followUpBy.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ghi chú sau khi gọi</label>
                  <textarea
                    rows="7"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Nhập tình trạng bệnh nhân sau khi gọi..."
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-slate-100 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdate(null)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold"
              >
                Lưu ghi chú
              </button>
              {(selectedAppointment.followUpStatus || 'PENDING') !== 'CALLED' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdate('UNREACHABLE')}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold"
                >
                  Không nghe máy
                </button>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdate('CALLED')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold"
              >
                Đã gọi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpCalls;
