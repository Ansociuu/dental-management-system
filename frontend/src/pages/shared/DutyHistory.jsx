import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDutyHistory } from '../../services/dutyService';
import { getUsers } from '../../services/userService';

const toDateInput = (date) => date.toISOString().slice(0, 10);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatDate = (dateValue) => new Date(dateValue).toLocaleDateString('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const statusSegments = [
  { key: 'completed', label: 'Hoàn thành', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { key: 'active', label: 'Đang xử lý', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'cancelled', label: 'Hủy', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
  { key: 'noShow', label: 'Vắng', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' }
];

const StatCard = ({ icon, label, value, tone }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-h-[112px]">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ stats }) => {
  const total = stats.total || 0;

  if (!total) {
    return <div className="h-2.5 rounded-full bg-slate-100" />;
  }

  return (
    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
      {statusSegments.map((segment) => {
        const width = ((stats[segment.key] || 0) / total) * 100;
        if (width <= 0) return null;
        return (
          <div
            key={segment.key}
            className={`${segment.color} h-full`}
            style={{ width: `${width}%` }}
          />
        );
      })}
    </div>
  );
};

const DutyHistory = ({ scope = 'doctor' }) => {
  const isAdmin = scope === 'admin';
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(toDateInput(startOfMonth(today)));
  const [dateTo, setDateTo] = useState(toDateInput(today));
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        startDate: dateFrom,
        endDate: dateTo,
        page,
        limit: pagination.limit
      };

      if (isAdmin && doctorId) {
        params.doctorId = doctorId;
      }

      const res = await getDutyHistory(params);
      setItems(res.data || []);
      setPagination(res.pagination || { page, limit: pagination.limit, totalItems: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử ca trực');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, doctorId, isAdmin, pagination.limit]);

  useEffect(() => {
    if (!isAdmin) return;

    const loadDoctors = async () => {
      try {
        const res = await getUsers({ role: 'DOCTOR' });
        setDoctors(res.data || []);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách bác sĩ');
      }
    };

    loadDoctors();
  }, [isAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadHistory(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  const totals = useMemo(() => items.reduce((acc, item) => {
    const stats = item.appointmentStats || {};
    acc.shifts += 1;
    acc.appointments += stats.total || 0;
    acc.completed += stats.completed || 0;
    acc.active += stats.active || 0;
    acc.cancelled += stats.cancelled || 0;
    acc.noShow += stats.noShow || 0;
    return acc;
  }, { shifts: 0, appointments: 0, completed: 0, active: 0, cancelled: 0, noShow: 0 }), [items]);

  const completionRate = totals.appointments
    ? Math.round((totals.completed / totals.appointments) * 100)
    : 0;
  const canGoPrev = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Lịch hẹn</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Lịch sử ca trực</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch sử ca trực bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 max-w-3xl">
            {isAdmin
              ? 'Theo dõi các ca trực đã qua của tất cả bác sĩ, hiệu suất xử lý lịch khám và thời gian ca trực tại thời điểm phát sinh.'
              : 'Xem lại các ca trực đã qua, số lượng lịch khám và kết quả xử lý trong từng ca của bạn.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadHistory(pagination.page)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Tải lại
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={toDateInput(today)}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          {isAdmin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Bác sĩ</label>
              <select
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Tất cả bác sĩ</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="rounded-xl bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">Khoảng đang xem</p>
              <p className="font-extrabold mt-1">{dateFrom} - {dateTo}</p>
            </div>
            <span className="material-symbols-outlined text-[28px] text-blue-300">date_range</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard icon="event_available" label="Ca trực" value={loading ? '...' : totals.shifts.toLocaleString('vi-VN')} tone="bg-blue-50 text-blue-700" />
        <StatCard icon="groups" label="Tổng lịch khám" value={loading ? '...' : totals.appointments.toLocaleString('vi-VN')} tone="bg-indigo-50 text-indigo-700" />
        <StatCard icon="check_circle" label="Hoàn thành" value={loading ? '...' : totals.completed.toLocaleString('vi-VN')} tone="bg-emerald-50 text-emerald-700" />
        <StatCard icon="monitoring" label="Tỷ lệ hoàn thành" value={loading ? '...' : `${completionRate}%`} tone="bg-amber-50 text-amber-700" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Tổng quan trạng thái</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">{pagination.totalItems.toLocaleString('vi-VN')} ca trực phù hợp</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined">donut_large</span>
            </div>
          </div>

          <ProgressBar stats={{ total: totals.appointments, ...totals }} />

          <div className="grid grid-cols-2 gap-3 mt-5">
            {statusSegments.map((segment) => (
              <div key={segment.key} className={`rounded-xl border ${segment.border} ${segment.bg} p-3`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${segment.color}`} />
                  <span className={`text-xs font-bold ${segment.text}`}>{segment.label}</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mt-3">
                  {loading ? '...' : (totals[segment.key] || 0).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase">Ghi chú dữ liệu</p>
            <p className="text-sm font-semibold text-slate-700 mt-2 leading-6">
              Giờ ca trực trong lịch sử được lấy từ snapshot tại thời điểm đăng ký ca, nên khi cấu hình ca hiện tại thay đổi thì dữ liệu lịch sử vẫn giữ nguyên.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Dòng thời gian ca trực</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Mỗi ca hiển thị bác sĩ, thời gian snapshot và phân bổ trạng thái lịch khám.</p>
            </div>
            <p className="text-xs text-slate-400 font-bold">
              Trang {pagination.page} / {pagination.totalPages || 1}
            </p>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <span className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin block mx-auto mb-4"></span>
              <p className="text-slate-500 font-bold text-sm">Đang tải lịch sử ca trực...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">event_busy</span>
              <h4 className="text-lg font-bold text-slate-700 mb-1">Không có dữ liệu lịch sử</h4>
              <p className="text-slate-400 text-sm">Thử thay đổi khoảng ngày hoặc bộ lọc bác sĩ.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const stats = item.appointmentStats || {};
                const total = stats.total || 0;
                const cancelledAndNoShow = (stats.cancelled || 0) + (stats.noShow || 0);
                const itemCompletionRate = total ? Math.round(((stats.completed || 0) / total) * 100) : 0;

                return (
                  <article key={item.dutyId} className="p-6 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                      <div className="xl:w-[310px] shrink-0 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                          <span className="material-symbols-outlined text-[24px]">schedule</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-slate-900">{formatDate(item.date)}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            {item.shift?.name || 'Ca trực'} • {item.shift?.startTime || '-'} - {item.shift?.endTime || '-'}
                          </p>
                          {isAdmin && (
                            <p className="text-xs font-semibold text-slate-400 mt-1 truncate">
                              BS. {item.doctor?.fullName || '-'}{item.doctor?.specialization ? ` • ${item.doctor.specialization}` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-extrabold">
                              {total.toLocaleString('vi-VN')} lịch
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                              {itemCompletionRate}% hoàn thành
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-right">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Hoàn thành</p>
                              <p className="text-sm font-extrabold text-emerald-700">{stats.completed || 0}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Đang xử lý</p>
                              <p className="text-sm font-extrabold text-blue-700">{stats.active || 0}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Hủy/Vắng</p>
                              <p className="text-sm font-extrabold text-rose-700">{cancelledAndNoShow}</p>
                            </div>
                          </div>
                        </div>

                        <ProgressBar stats={stats} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
              type="button"
              disabled={!canGoPrev || loading}
              onClick={() => loadHistory(pagination.page - 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Trang trước
            </button>
            <span className="text-sm font-bold text-slate-500">
              {pagination.totalItems.toLocaleString('vi-VN')} kết quả
            </span>
            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() => loadHistory(pagination.page + 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Trang sau
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DutyHistory;
