import { useEffect, useState } from 'react';
import { getConfigChangeLogs } from '../services/configChangeLogService';

const actionLabels = {
  CREATE: { label: 'Tạo mới', icon: 'add_circle', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  UPDATE: { label: 'Cập nhật', icon: 'edit', color: 'text-blue-700 bg-blue-50 border-blue-100' },
  DELETE: { label: 'Xóa', icon: 'delete', color: 'text-rose-700 bg-rose-50 border-rose-100' },
  STATUS_CHANGE: { label: 'Đổi trạng thái', icon: 'published_with_changes', color: 'text-amber-700 bg-amber-50 border-amber-100' }
};

const fieldLabels = {
  name: 'Tên',
  startTime: 'Giờ bắt đầu',
  endTime: 'Giờ kết thúc',
  maxPatients: 'Số bệnh nhân tối đa',
  status: 'Trạng thái',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  holidayType: 'Loại ngày nghỉ',
  notes: 'Ghi chú',
  description: 'Mô tả',
  price: 'Giá',
  duration: 'Thời gian',
  category: 'Nhóm dịch vụ',
  complexityCoefficient: 'Hệ số độ khó',
  effectiveFrom: 'Ngày hiệu lực',
  effectiveTo: 'Ngày kết thúc',
  note: 'Ghi chú'
};

const statusLabels = {
  ACTIVE: 'Đang áp dụng',
  INACTIVE: 'Tạm ngưng',
  SCHEDULED: 'Sắp áp dụng',
  EXPIRED: 'Hết hiệu lực'
};

const holidayTypeLabels = {
  LE: 'Nghỉ lễ',
  TOAN_PHONG_KHAM: 'Toàn phòng khám',
  DAC_BIET: 'Đặc biệt'
};

const formatDateTime = (value) => new Date(value).toLocaleString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const formatValue = (field, value) => {
  if (value === undefined || value === null || value === '') return 'Trống';
  if (field === 'status') return statusLabels[value] || value;
  if (field === 'holidayType') return holidayTypeLabels[value] || value;
  if (field === 'price') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
  }
  if (field === 'duration') return `${value} phút`;
  if (['startDate', 'endDate', 'effectiveFrom', 'effectiveTo'].includes(field)) {
    return new Date(value).toLocaleDateString('vi-VN');
  }
  return String(value);
};

const summarizeLog = (log) => {
  if (log.action === 'CREATE') return 'Đã tạo cấu hình mới.';
  if (log.action === 'DELETE') return 'Đã xóa cấu hình khỏi danh sách.';

  const fields = log.changedFields || [];
  if (fields.length === 0) return 'Không có thay đổi dữ liệu.';

  return fields.slice(0, 3).map((field) => {
    const before = formatValue(field, log.before?.[field]);
    const after = formatValue(field, log.after?.[field]);
    return `${fieldLabels[field] || field}: ${before} -> ${after}`;
  }).join('; ');
};

const ConfigChangeHistory = ({ resourceType, title = 'Lịch sử thay đổi', refreshKey = 0 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getConfigChangeLogs({ resourceType, limit: 12 });
      setLogs(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử thay đổi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [resourceType, refreshKey]);

  return (
    <section className="mt-8 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Theo dõi người thao tác, thời điểm và dữ liệu thay đổi gần nhất.</p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center"
          title="Tải lại lịch sử"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
        </button>
      </div>

      {error && <div className="m-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-slate-400 font-bold text-sm">Đang tải lịch sử...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-[42px] text-slate-300">history</span>
          <p className="text-slate-400 font-bold text-sm mt-2">Chưa có thay đổi nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log) => {
            const config = actionLabels[log.action] || actionLabels.UPDATE;
            return (
              <article key={log._id} className="px-6 py-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-900">{log.resourceName || 'Cấu hình'}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${config.color}`}>{config.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium mt-1">{summarizeLog(log)}</p>
                      {(log.changedFields || []).length > 3 && (
                        <p className="text-xs text-slate-400 font-semibold mt-1">+{log.changedFields.length - 3} trường khác</p>
                      )}
                    </div>
                  </div>
                  <div className="lg:text-right shrink-0">
                    <p className="text-xs font-extrabold text-slate-700">{formatDateTime(log.createdAt)}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{log.actorName || 'Hệ thống'}{log.actorRole ? ` • ${log.actorRole}` : ''}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ConfigChangeHistory;
