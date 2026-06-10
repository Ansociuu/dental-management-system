/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  generateSalaryPayslip,
  getSalaryBaseRate,
  getSalaryComplexities,
  getSalaryDoctorProfiles,
  getSalaryDoctorYearlyReport,
  getSalaryMonthlyReport,
  getSalaryShiftRules,
  getSalaryYearlyReport,
  updateSalaryBaseRate,
  updateSalaryComplexities,
  updateSalaryDoctorProfile,
  updateSalaryShiftRules
} from '../../services/salaryService';
import { useNavigate, useParams } from 'react-router-dom';

const currentMonth = () => new Date().toISOString().slice(0, 7);
const currentYear = () => new Date().getFullYear();
const currentDate = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const formatNumber = (value) => new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2
}).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const degreePrefixMap = {
  UNIVERSITY: 'BS.',
  MASTER: 'ThS.BS.',
  DOCTORATE: 'TS.BS.',
  ASSOCIATE_PROFESSOR: 'PGS.BS.',
  PROFESSOR: 'GS.BS.'
};
const stripDoctorPrefix = (name = '') => String(name)
  .replace(/^(GS\.BS\.|PGS\.BS\.|TS\.BS\.|ThS\.BS\.|BS\.)\s*/i, '')
  .trim();
const getDegreePrefix = (degreeLevel) => degreePrefixMap[degreeLevel] || 'BS.';
const getDoctorName = (doctor) => doctor?.fullName || doctor?.doctor?.fullName || '-';
const formatDoctorName = (doctor, degreeLevel) => {
  const fullName = getDoctorName(doctor);
  if (fullName === '-') return '-';
  return `${getDegreePrefix(degreeLevel)} ${stripDoctorPrefix(fullName)}`;
};
const formatProfileDoctorName = (row) => formatDoctorName(row?.doctor || row, row?.profile?.degreeLevel || row?.doctorDegreeLevel);
const getAppointmentServiceNames = (appointment) => {
  const performed = Array.isArray(appointment?.servicesPerformed)
    ? appointment.servicesPerformed
        .map((item) => item.serviceId?.name)
        .filter(Boolean)
    : [];
  if (performed.length > 0) return performed.join(', ');
  return appointment?.serviceId?.name || '-';
};
const toNumericInput = (value) => Number(String(value ?? '').replace(/[^0-9.]/g, ''));
const payslipStatusLabels = {
  APPROVED: 'Đã duyệt',
  PAID: 'Đã thanh toán',
  DRAFT: 'Nháp',
  FINALIZED: 'Đã chốt',
  CANCELLED: 'Đã hủy'
};
const getPayslipStatusLabel = (status) => payslipStatusLabels[status] || '-';
const salaryRateStatusLabels = {
  PENDING: 'Chờ áp dụng',
  ACTIVE: 'Đang áp dụng',
  INACTIVE: 'Ngừng hiệu lực'
};
const getSalaryRateStatusLabel = (status) => salaryRateStatusLabels[status] || status || '-';
const downloadCsv = (filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const payrollRouteMap = {
  baseRate: 'base-rate',
  doctorProfiles: 'doctor-profiles',
  shiftRules: 'shift-rules',
  complexities: 'complexities',
  payslip: 'payslip',
  salaryReport: 'salary-report'
};

const payrollKeyByRoute = Object.entries(payrollRouteMap).reduce((acc, [key, route]) => {
  acc[route] = key;
  return acc;
}, {});
payrollKeyByRoute['monthly-report'] = 'salaryReport';
payrollKeyByRoute['doctor-year-report'] = 'salaryReport';
payrollKeyByRoute['yearly-report'] = 'salaryReport';

const getPayrollPath = (key) => `/admin/payroll/${payrollRouteMap[key] || payrollRouteMap.baseRate}`;

const Alert = ({ type = 'error', children }) => {
  if (!children) return null;
  const classes = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-rose-50 border-rose-200 text-rose-700';
  return <div className={`mb-4 p-4 border rounded-xl text-sm font-bold ${classes}`}>{children}</div>;
};

const LoadingState = ({ label = 'Đang tải dữ liệu...' }) => (
  <div className="p-10 text-center text-slate-400 font-bold">{label}</div>
);

const EmptyState = ({ icon = 'inbox', label }) => (
  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
    <span className="material-symbols-outlined text-[44px] mb-3 opacity-60">{icon}</span>
    <p className="text-sm font-bold">{label}</p>
  </div>
);

const StatCard = ({ icon, label, value, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneMap[tone] || toneMap.blue}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xl font-black text-slate-900 truncate">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase mt-1">{label}</p>
      </div>
    </div>
  );
};

const Panel = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[1.5rem] shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const PanelHeader = ({ eyebrow, title, actions }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span className="text-gray-900 font-semibold">Tính lương</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-[var(--color-primary)] font-semibold">{eyebrow}</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
    {actions}
  </div>
);

const BaseRateSettings = () => {
  const [baseHourlyRate, setBaseHourlyRate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(currentDate());
  const [effectiveTo, setEffectiveTo] = useState('');
  const [note, setNote] = useState('');
  const [rates, setRates] = useState([]);
  const [activeRate, setActiveRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getSalaryBaseRate();
      setBaseHourlyRate(res.data?.baseHourlyRate || 210000);
      setActiveRate(res.data?.activeRate || null);
      setRates(res.data?.rates || []);
    } catch (err) {
      setError(err.message || 'Không thể tải số tiền một giờ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const value = toNumericInput(baseHourlyRate);
      if (value <= 0) {
        setError('Số tiền một giờ phải lớn hơn 0');
        return;
      }
      const res = await updateSalaryBaseRate({
        baseHourlyRate: value,
        effectiveFrom,
        effectiveTo: effectiveTo || null,
        note
      });
      setSuccess('Đã lưu mức tiền cơ bản một giờ');
      setBaseHourlyRate(res.data?.baseHourlyRate || value);
      setActiveRate(res.data?.activeRate || null);
      setRates(res.data?.rates || []);
      setNote('');
      setEffectiveTo('');
    } catch (err) {
      setError(err.message || 'Không thể lưu số tiền một giờ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PanelHeader
        eyebrow="Tiền một giờ"
        title="Thiết lập mức tiền cơ bản cho một giờ"
        actions={(
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-black shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu thiết lập'}
          </button>
        )}
      />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      <Panel className="p-6">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-stretch">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2 xl:col-span-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Số tiền một giờ</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">payments</span>
                    <input
                      type="number"
                      min="1"
                      value={baseHourlyRate}
                      onChange={(event) => setBaseHourlyRate(event.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Ngày áp dụng</label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(event) => setEffectiveFrom(event.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={effectiveTo}
                    onChange={(event) => setEffectiveTo(event.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Ghi chú</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ví dụ: áp dụng từ tháng mới"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                <p className="text-xs font-black text-blue-500 uppercase">Đang áp dụng</p>
                <p className="text-2xl font-black text-blue-800 mt-2">{formatCurrency(activeRate?.baseHourlyRate || baseHourlyRate)}</p>
                <p className="text-xs font-bold text-blue-500 mt-2">
                  Từ {formatDate(activeRate?.effectiveFrom)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 font-black min-w-[150px]">Mức tiền</th>
                    <th className="px-5 py-4 font-black min-w-[140px]">Ngày áp dụng</th>
                    <th className="px-5 py-4 font-black min-w-[140px]">Ngày kết thúc</th>
                    <th className="px-5 py-4 font-black min-w-[140px]">Trạng thái</th>
                    <th className="px-5 py-4 font-black min-w-[220px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rates.map((rate) => (
                    <tr key={rate._id} className="hover:bg-blue-50/30">
                      <td className="px-5 py-4 font-black text-slate-900">{formatCurrency(rate.baseHourlyRate)}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{formatDate(rate.effectiveFrom)}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{rate.effectiveTo ? formatDate(rate.effectiveTo) : '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${
                          rate.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : rate.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {getSalaryRateStatusLabel(rate.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-500">{rate.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
};

const DoctorCoefficientSettings = () => {
  const [rows, setRows] = useState([]);
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getSalaryDoctorProfiles();
      setRows(res.data || []);
      setDegreeLevels(res.meta?.degreeLevels || []);
    } catch (err) {
      setError(err.message || 'Không thể tải hệ số bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const defaultCoefficient = (degreeLevel) => (
    degreeLevels.find((degree) => degree.value === degreeLevel)?.coefficient || 1.2
  );

  const updateRow = (doctorId, patch) => {
    setRows((prev) => prev.map((row) => {
      if (row.doctor._id !== doctorId) return row;
      return { ...row, profile: { ...row.profile, ...patch } };
    }));
  };

  const saveRow = async (row) => {
    try {
      setSavingId(row.doctor._id);
      setError('');
      setSuccess('');
      await updateSalaryDoctorProfile(row.doctor._id, {
        degreeLevel: row.profile.degreeLevel,
        doctorCoefficient: Number(row.profile.doctorCoefficient)
      });
      setSuccess(`Đã lưu hệ số cho ${formatProfileDoctorName(row)}`);
      await load();
    } catch (err) {
      setError(err.message || 'Không thể lưu hệ số bác sĩ');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div>
      <PanelHeader eyebrow="Hệ số bác sĩ" title="Thiết lập hệ số bác sĩ theo bằng cấp" />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : rows.length === 0 ? (
          <EmptyState icon="person_off" label="Chưa có bác sĩ trong hệ thống" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-black min-w-[240px]">Bác sĩ</th>
                  <th className="px-6 py-4 font-black min-w-[190px]">Bằng cấp</th>
                  <th className="px-6 py-4 font-black min-w-[150px]">Hệ số</th>
                  <th className="px-6 py-4 font-black text-right min-w-[130px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.doctor._id} className="hover:bg-blue-50/30">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">{formatProfileDoctorName(row)}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{row.doctor.email || row.doctor.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={row.profile.degreeLevel}
                        onChange={(event) => updateRow(row.doctor._id, {
                          degreeLevel: event.target.value,
                          doctorCoefficient: defaultCoefficient(event.target.value)
                        })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:border-blue-500"
                      >
                        {degreeLevels.map((degree) => (
                          <option key={degree.value} value={degree.value}>{degree.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={row.profile.doctorCoefficient}
                        onChange={(event) => updateRow(row.doctor._id, { doctorCoefficient: event.target.value })}
                        className="w-28 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => saveRow(row)}
                        disabled={savingId === row.doctor._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-black"
                      >
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        {savingId === row.doctor._id ? 'Lưu...' : 'Lưu'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

const ShiftCoefficientSettings = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getSalaryShiftRules();
      setMatrix(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải hệ số ca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRule = (shiftId, dayType, value) => {
    setMatrix((prev) => prev.map((group) => {
      if (group.shift._id !== shiftId) return group;
      return {
        ...group,
        rules: group.rules.map((rule) => (
          rule.dayType === dayType ? { ...rule, shiftCoefficient: value } : rule
        ))
      };
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const rules = matrix.flatMap((group) => group.rules.map((rule) => ({
        shiftId: group.shift._id,
        dayType: rule.dayType,
        shiftCoefficient: Number(rule.shiftCoefficient)
      })));
      await updateSalaryShiftRules(rules);
      setSuccess('Đã lưu hệ số ngày/ca');
      await load();
    } catch (err) {
      setError(err.message || 'Không thể lưu hệ số ca');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PanelHeader
        eyebrow="Hệ số ngày/ca"
        title="Thiết lập hệ số ca làm việc các ngày trong tuần"
        actions={(
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-black shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu ma trận'}
          </button>
        )}
      />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : matrix.length === 0 ? (
          <EmptyState icon="event_busy" label="Chưa có ca làm việc để thiết lập" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-black min-w-[180px]">Ca làm việc</th>
                  {matrix[0]?.rules.map((rule) => (
                    <th key={rule.dayType} className="px-3 py-4 font-black text-center min-w-[150px]">{rule.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrix.map((group) => (
                  <tr key={group.shift._id} className="hover:bg-blue-50/30">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{group.shift.name}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{group.shift.startTime} - {group.shift.endTime}</p>
                    </td>
                    {group.rules.map((rule) => (
                      <td key={rule.dayType} className="px-3 py-4 text-center">
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={rule.shiftCoefficient}
                          onChange={(event) => updateRule(group.shift._id, rule.dayType, event.target.value)}
                          className="w-20 px-2 py-2 border border-slate-200 rounded-xl text-sm font-black text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

const ComplexityEntry = () => {
  const [month, setMonth] = useState(currentMonth());
  const [doctorId, setDoctorId] = useState('');
  const [rows, setRows] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { month };
      if (doctorId) params.doctorId = doctorId;
      const res = await getSalaryComplexities(params);
      setRows(res.data || []);
      setDoctors(res.meta?.doctors || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách ca phức tạp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month, doctorId]);

  const updateRow = (appointmentId, patch) => {
    setRows((prev) => prev.map((row) => (
      row.appointment._id === appointmentId
        ? { ...row, complexity: { ...row.complexity, ...patch } }
        : row
    )));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const items = rows.map((row) => ({
        appointmentId: row.appointment._id,
        complexityCoefficient: Number(row.complexity.complexityCoefficient) || 0,
        note: row.complexity.note || ''
      }));
      await updateSalaryComplexities(items);
      setSuccess('Đã lưu hệ số bệnh nhân phức tạp');
      await load();
    } catch (err) {
      setError(err.message || 'Không thể lưu hệ số bệnh nhân');
    } finally {
      setSaving(false);
    }
  };

  const totalComplexity = useMemo(() => rows.reduce(
    (sum, row) => sum + (Number(row.complexity?.complexityCoefficient) || 0),
    0
  ), [rows]);

  return (
    <div>
      <PanelHeader
        eyebrow="Ca phức tạp"
        title="Nhập hệ số các ca cần xử lý phức tạp trong tháng"
        actions={(
          <button
            type="button"
            onClick={save}
            disabled={saving || rows.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-black shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu hệ số'}
          </button>
        )}
      />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard icon="fact_check" label="Ca đã hoàn thành" value={rows.length} tone="blue" />
        <StatCard icon="finance_mode" label="Tổng hệ số phức tạp" value={formatNumber(totalComplexity)} tone="amber" />
        <StatCard icon="calendar_month" label="Tháng đang nhập" value={month} tone="emerald" />
      </div>

      <Panel className="p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_120px] gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase">Tháng</label>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase">Bác sĩ</label>
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Tất cả bác sĩ</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>{formatDoctorName(doctor, doctor.degreeLevel)}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-black"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Tải
          </button>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : rows.length === 0 ? (
          <EmptyState icon="clinical_notes" label="Không có ca đã hoàn thành trong bộ lọc" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-black min-w-[210px]">Bệnh nhân</th>
                  <th className="px-5 py-4 font-black min-w-[210px]">Bác sĩ / ca</th>
                  <th className="px-5 py-4 font-black min-w-[150px]">Hệ số</th>
                  <th className="px-5 py-4 font-black min-w-[260px]">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.appointment._id} className="hover:bg-blue-50/30 align-top">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{row.appointment.patientId?.fullName || '-'}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{row.appointment.patientId?.patientCode || '-'} • {getAppointmentServiceNames(row.appointment)}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-1">{formatDate(row.appointment.date)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{formatDoctorName(row.appointment.doctorId, row.appointment.doctorProfile?.degreeLevel)}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{row.appointment.shiftId?.name || '-'} • STT {row.appointment.queueNumber || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        max="0.5"
                        step="0.1"
                        value={row.complexity?.complexityCoefficient ?? 0}
                        onChange={(event) => updateRow(row.appointment._id, { complexityCoefficient: event.target.value })}
                        className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-center focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={row.complexity?.note || ''}
                        onChange={(event) => updateRow(row.appointment._id, { note: event.target.value })}
                        placeholder="Ví dụ: ca khó, điều trị kéo dài"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

const DoctorMonthlyPayslip = () => {
  const [month, setMonth] = useState(currentMonth());
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [payslip, setPayslip] = useState(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await getSalaryDoctorProfiles();
      const list = res.data || [];
      setDoctors(list);
      if (!doctorId && list[0]?.doctor?._id) setDoctorId(list[0].doctor._id);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bác sĩ');
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const generate = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const res = await generateSalaryPayslip({ doctorId, month });
      setPayslip(res.data);
      setSuccess('Đã chốt phiếu lương bác sĩ');
    } catch (err) {
      setError(err.message || 'Không thể lập phiếu lương');
    } finally {
      setSubmitting(false);
    }
  };

  const exportPayslipCsv = () => {
    if (!payslip) return;
    downloadCsv(`phieu-luong-${payslip.doctor?.fullName || 'bac-si'}-${payslip.month}.csv`, [
      'Ngày',
      'Ca làm',
      'Loại ngày',
      'Tiền một giờ',
      'Giờ làm',
      'Hệ số ca',
      'Hệ số bệnh nhân',
      'Giờ quy đổi',
      'Thành tiền'
    ], (payslip.lines || []).map((line) => [
      formatDate(line.date),
      line.shiftName || '',
      line.dayTypeLabel || '',
      line.baseHourlyRate || payslip.baseHourlyRate || 0,
      line.workingHours || 0,
      line.shiftCoefficient || 0,
      line.patientComplexityTotal || 0,
      line.convertedHours || 0,
      line.amount || 0
    ]));
  };

  return (
    <div>
      <PanelHeader
        eyebrow="Phiếu lương bác sĩ"
        title="Lập và chốt phiếu lương cho một bác sĩ trong một tháng"
        actions={(
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={submitting || !doctorId}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-black shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">request_quote</span>
              {submitting ? 'Đang chốt...' : 'Chốt phiếu lương'}
            </button>
            <button type="button" onClick={exportPayslipCsv} disabled={!payslip} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="Xuất Excel">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button type="button" onClick={() => window.print()} disabled={!payslip} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="In / PDF">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        )}
      />
      <Alert>{error}</Alert>
      <Alert type="success">{success}</Alert>

      <Panel className="p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase">Tháng</label>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase">Bác sĩ</label>
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              {loadingDoctors ? <option>Đang tải...</option> : doctors.map((row) => (
                <option key={row.doctor._id} value={row.doctor._id}>{formatProfileDoctorName(row)}</option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {!payslip ? (
        <Panel>
          <EmptyState icon="request_quote" label="Chọn bác sĩ và chốt phiếu lương để xem chi tiết" />
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <StatCard icon="event_available" label="Số ca" value={payslip.totalShifts} tone="blue" />
            <StatCard icon="schedule" label="Giờ quy đổi" value={formatNumber(payslip.totalConvertedHours)} tone="violet" />
            <StatCard icon="person" label="Hệ số bác sĩ" value={`${payslip.doctorDegreeLabel} • ${payslip.doctorCoefficient}`} tone="amber" />
            <StatCard icon="payments" label="Tổng lương" value={formatCurrency(payslip.totalAmount)} tone="emerald" />
          </div>

          <Panel className="overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-3">
              <div>
                <p className="text-xs font-black text-blue-700 uppercase">Phiếu lương {payslip.month}</p>
                <h3 className="text-xl font-black text-slate-900 mt-1">{formatDoctorName(payslip.doctor, payslip.doctorDegreeLevel)}</h3>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Tiền một giờ</p>
                <p className="font-black text-slate-900 mt-1">{formatCurrency(payslip.baseHourlyRate)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 font-black min-w-[190px]">Ca làm</th>
                    <th className="px-5 py-4 font-black min-w-[140px]">Tiền/giờ</th>
                    <th className="px-5 py-4 font-black min-w-[150px]">Hệ số</th>
                    <th className="px-5 py-4 font-black min-w-[260px]">Bệnh nhân</th>
                    <th className="px-5 py-4 font-black text-right min-w-[150px]">Giờ quy đổi</th>
                    <th className="px-5 py-4 font-black text-right min-w-[150px]">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslip.lines?.map((line) => (
                    <tr key={`${line.dutyId}-${line.date}`} className="hover:bg-blue-50/30 align-top">
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900">{formatDate(line.date)}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1">{line.shiftName} • {line.startTime}-{line.endTime}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">{formatNumber(line.workingHours)} giờ thực tế</p>
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900">{formatCurrency(line.baseHourlyRate || payslip.baseHourlyRate)}</td>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900">Ca: {formatNumber(line.shiftCoefficient)}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1">BN: {formatNumber(line.patientComplexityTotal)}</p>
                      </td>
                      <td className="px-5 py-4">
                        {line.appointments?.length ? (
                          <div className="space-y-2">
                            {line.appointments.map((appointment) => (
                              <div key={appointment.appointmentId} className="text-xs">
                                <p className="font-black text-slate-800">{appointment.patientName}</p>
                                <p className="font-semibold text-slate-500">{appointment.serviceName} • HS {formatNumber(appointment.complexityCoefficient)}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Không có ca hoàn thành</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-slate-900">{formatNumber(line.convertedHours)}</td>
                      <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
};

const MonthlySalaryReport = () => {
  const [month, setMonth] = useState(currentMonth());
  const [doctorId, setDoctorId] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [doctors, setDoctors] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    try {
      const res = await getSalaryDoctorProfiles();
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bác sĩ');
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { month, status };
      if (doctorId !== 'ALL') params.doctorId = doctorId;
      const res = await getSalaryMonthlyReport(params);
      setRows(res.data || []);
      setSummary(res.summary || null);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo tháng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    load();
  }, [month, doctorId, status]);

  const chartData = rows.map((row) => ({
    name: row.doctor?.fullName || '-',
    amount: row.totalAmount,
    hours: row.totalConvertedHours
  }));
  const hasReportData = rows.length > 0;

  const exportCsv = () => {
    downloadCsv(`bao-cao-luong-thang-${month}.csv`, [
      'Bác sĩ',
      'Email',
      'Tháng',
      'Trạng thái',
      'Số ca',
      'Số bệnh nhân',
      'Giờ làm',
      'Giờ quy đổi',
      'Phụ cấp',
      'Khấu trừ',
      'Tổng lương'
    ], rows.map((row) => [
      row.doctor?.fullName || '',
      row.doctor?.email || '',
      row.month || month,
      getPayslipStatusLabel(row.status),
      row.totalShifts || 0,
      row.totalAppointments || 0,
      row.totalWorkingHours || 0,
      row.totalConvertedHours || 0,
      row.totalAllowance || 0,
      row.totalDeduction || 0,
      row.totalAmount || 0
    ]));
  };

  return (
    <div>
      <PanelHeader
        eyebrow="Tất cả bác sĩ / tháng"
        title="Báo cáo tiền lương tất cả bác sĩ trong một tháng"
        actions={(
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="min-w-[220px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Tất cả bác sĩ</option>
              {doctors.map((row) => (
                <option key={row.doctor._id} value={row.doctor._id}>{formatProfileDoctorName(row)}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-[170px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Đã chốt trở lên</option>
              <option value="FINALIZED">Đã chốt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
            <button type="button" onClick={load} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl" title="Xem báo cáo">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button type="button" onClick={exportCsv} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="Xuất Excel">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button type="button" onClick={() => window.print()} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="In / PDF">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        )}
      />
      <Alert>{error}</Alert>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
        <StatCard icon="groups" label="Bác sĩ có phiếu" value={summary?.totalDoctors || 0} tone="blue" />
        <StatCard icon="description" label="Phiếu hợp lệ" value={summary?.totalPayslips || 0} tone="amber" />
        <StatCard icon="event_available" label="Tổng ca" value={summary?.totalShifts || 0} tone="amber" />
        <StatCard icon="schedule" label="Giờ làm" value={formatNumber(summary?.totalWorkingHours)} tone="violet" />
        <StatCard icon="payments" label="Tổng lương" value={formatCurrency(summary?.totalAmount)} tone="emerald" />
      </div>

      <Panel className="p-5 mb-5">
        {loading ? <LoadingState /> : !hasReportData ? <EmptyState icon="bar_chart" label="Không có phiếu lương hợp lệ trong tháng được chọn" /> : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, key) => key === 'amount' ? formatCurrency(value) : formatNumber(value)} />
                <Legend />
                <Bar dataKey="amount" name="Tổng lương" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <ReportTable rows={rows} loading={loading} />
    </div>
  );
};

const ReportTable = ({ rows, loading }) => (
  <Panel className="overflow-hidden">
    {loading ? (
      <LoadingState />
    ) : rows.length === 0 ? (
      <EmptyState icon="receipt_long" label="Không có dòng lương trong bộ lọc" />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-5 py-4 font-black min-w-[220px]">Bác sĩ</th>
              <th className="px-5 py-4 font-black min-w-[120px]">Trạng thái</th>
              <th className="px-5 py-4 font-black min-w-[100px]">Số ca</th>
              <th className="px-5 py-4 font-black min-w-[120px]">Giờ làm</th>
              <th className="px-5 py-4 font-black min-w-[140px]">Giờ quy đổi</th>
              <th className="px-5 py-4 font-black min-w-[150px]">Hệ số bác sĩ</th>
              <th className="px-5 py-4 font-black text-right min-w-[130px]">Phụ cấp</th>
              <th className="px-5 py-4 font-black text-right min-w-[130px]">Khấu trừ</th>
              <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.payslipId || row.doctor?._id || row.month} className="hover:bg-blue-50/30">
                <td className="px-5 py-4">
                  <p className="font-black text-slate-900">{formatDoctorName(row.doctor, row.doctorDegreeLevel)}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{row.month}</p>
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">{getPayslipStatusLabel(row.status)}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{row.totalShifts}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalWorkingHours)}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalConvertedHours)}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{row.doctorDegreeLabel} • {row.doctorCoefficient}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalAllowance)}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalDeduction)}</td>
                <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(row.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Panel>
);

const DoctorYearlySalaryReport = () => {
  const [year, setYear] = useState(currentYear());
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('ALL');
  const [doctors, setDoctors] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    try {
      const res = await getSalaryDoctorProfiles();
      const list = res.data || [];
      setDoctors(list);
      if (!doctorId && list[0]?.doctor?._id) setDoctorId(list[0].doctor._id);
    } catch (err) {
      setError(err.message || 'Không thể tải bác sĩ');
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const load = async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      setError('');
      const res = await getSalaryDoctorYearlyReport({ doctorId, year, status });
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo năm của bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [doctorId, year, status]);

  const rows = report?.months || [];
  const hasReportData = rows.some((row) => row.payslipId || row.totalAmount > 0);
  const chartData = rows.map((row) => ({
    month: row.month.slice(5),
    amount: row.totalAmount,
    hours: row.totalConvertedHours
  }));
  const exportCsv = () => {
    downloadCsv(`bao-cao-luong-${report?.doctor?.fullName || 'bac-si'}-${year}.csv`, [
      'Tháng',
      'Trạng thái',
      'Số ca',
      'Giờ làm',
      'Giờ quy đổi',
      'Phụ cấp',
      'Khấu trừ',
      'Tổng lương'
    ], rows.map((row) => [
      row.month,
      getPayslipStatusLabel(row.status),
      row.totalShifts || 0,
      row.totalWorkingHours || 0,
      row.totalConvertedHours || 0,
      row.totalAllowance || 0,
      row.totalDeduction || 0,
      row.totalAmount || 0
    ]));
  };

  return (
    <div>
      <PanelHeader
        eyebrow="Một bác sĩ / năm"
        title="Báo cáo tiền lương của một bác sĩ trong một năm"
        actions={(
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="min-w-[260px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              {doctors.map((row) => (
                <option key={row.doctor._id} value={row.doctor._id}>{formatProfileDoctorName(row)}</option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="w-32 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-[170px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Đã chốt trở lên</option>
              <option value="FINALIZED">Đã chốt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
            <button type="button" onClick={load} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl" title="Xem báo cáo">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button type="button" onClick={exportCsv} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="Xuất Excel">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button type="button" onClick={() => window.print()} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="In / PDF">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        )}
      />
      <Alert>{error}</Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
        <StatCard icon="description" label="Phiếu hợp lệ" value={report?.summary?.totalPayslips || 0} tone="amber" />
        <StatCard icon="event_available" label="Tổng ca" value={report?.summary?.totalShifts || 0} tone="blue" />
        <StatCard icon="schedule" label="Giờ làm" value={formatNumber(report?.summary?.totalWorkingHours)} tone="violet" />
        <StatCard icon="payments" label="Phụ cấp" value={formatCurrency(report?.summary?.totalAllowance)} tone="blue" />
        <StatCard icon="remove_circle" label="Khấu trừ" value={formatCurrency(report?.summary?.totalDeduction)} tone="amber" />
        <StatCard icon="payments" label="Tổng lương năm" value={formatCurrency(report?.summary?.totalAmount)} tone="emerald" />
      </div>

      <Panel className="p-5 mb-5">
        {loading ? <LoadingState /> : !hasReportData ? <EmptyState icon="show_chart" label="Không có phiếu lương hợp lệ của bác sĩ trong năm đã chọn" /> : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, key) => key === 'amount' ? formatCurrency(value) : formatNumber(value)} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Tổng lương" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : !hasReportData ? (
          <EmptyState icon="calendar_month" label="Không có dữ liệu báo cáo" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-black min-w-[120px]">Tháng</th>
                  <th className="px-5 py-4 font-black min-w-[130px]">Trạng thái</th>
                  <th className="px-5 py-4 font-black min-w-[100px]">Số ca</th>
                  <th className="px-5 py-4 font-black min-w-[120px]">Giờ làm</th>
                  <th className="px-5 py-4 font-black min-w-[140px]">Giờ quy đổi</th>
                  <th className="px-5 py-4 font-black text-right min-w-[130px]">Phụ cấp</th>
                  <th className="px-5 py-4 font-black text-right min-w-[130px]">Khấu trừ</th>
                  <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.month} className="hover:bg-blue-50/30">
                    <td className="px-5 py-4 font-black text-slate-900">{row.month}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{getPayslipStatusLabel(row.status)}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{row.totalShifts}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalWorkingHours)}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalConvertedHours)}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalAllowance)}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalDeduction)}</td>
                    <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(row.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

const YearlySalaryReport = () => {
  const [year, setYear] = useState(currentYear());
  const [doctorId, setDoctorId] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [doctors, setDoctors] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    try {
      const res = await getSalaryDoctorProfiles();
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bác sĩ');
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { year, status };
      if (doctorId !== 'ALL') params.doctorId = doctorId;
      const res = await getSalaryYearlyReport(params);
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo năm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    load();
  }, [year, doctorId, status]);

  const rows = report?.rows || [];
  const months = report?.months || [];
  const chartData = months.map((month) => ({
    month: month.month.slice(5),
    amount: month.totalAmount,
    doctors: month.totalDoctors
  }));
  const hasReportData = rows.length > 0;

  const exportCsv = () => {
    const headers = [
      'Bác sĩ',
      'Email',
      'Số phiếu',
      'Tổng ca',
      'Giờ làm',
      'Giờ quy đổi',
      'Hệ số ca TB',
      'Tổng hệ số phức tạp',
      'Phụ cấp',
      'Khấu trừ',
      'Tổng lương'
    ];
    const csvRows = rows.map((row) => [
      row.doctor?.fullName || '',
      row.doctor?.email || '',
      row.totalPayslips || 0,
      row.totalShifts || 0,
      row.totalWorkingHours || 0,
      row.totalConvertedHours || 0,
      row.averageShiftCoefficient || 0,
      row.totalComplexityCoefficient || 0,
      row.totalAllowance || 0,
      row.totalDeduction || 0,
      row.totalAmount || 0
    ]);
    const csv = [headers, ...csvRows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-luong-bac-si-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PanelHeader
        eyebrow="Tất cả bác sĩ / năm"
        title="Báo cáo tiền lương tất cả bác sĩ trong một năm"
        actions={(
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <input
              type="number"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="w-32 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="min-w-[220px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Tất cả bác sĩ</option>
              {doctors.map((row) => (
                <option key={row.doctor._id} value={row.doctor._id}>{formatProfileDoctorName(row)}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-[170px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Đã chốt trở lên</option>
              <option value="FINALIZED">Đã chốt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
            <button type="button" onClick={load} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl" title="Xem báo cáo">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button type="button" onClick={exportCsv} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="Xuất Excel">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button type="button" onClick={() => window.print()} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="In / PDF">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        )}
      />
      <Alert>{error}</Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <StatCard icon="groups" label="Bác sĩ trong báo cáo" value={report?.summary?.totalDoctors || 0} tone="blue" />
        <StatCard icon="description" label="Phiếu hợp lệ" value={report?.summary?.totalPayslips || 0} tone="amber" />
        <StatCard icon="event_available" label="Tổng ca năm" value={report?.summary?.totalShifts || 0} tone="blue" />
        <StatCard icon="payments" label="Tổng lương năm" value={formatCurrency(report?.summary?.totalAmount)} tone="emerald" />
      </div>

      <Panel className="p-5 mb-5">
        {loading ? <LoadingState /> : !hasReportData ? <EmptyState icon="bar_chart" label="Chưa có phiếu lương hợp lệ trong bộ lọc" /> : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, key) => key === 'amount' ? formatCurrency(value) : value} />
                <Legend />
                <Bar dataKey="amount" name="Tổng lương" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : !hasReportData ? (
          <EmptyState icon="calendar_month" label="Không có dữ liệu báo cáo" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-black min-w-[220px]">Bác sĩ</th>
                  <th className="px-5 py-4 font-black min-w-[120px]">Phiếu</th>
                  <th className="px-5 py-4 font-black min-w-[120px]">Tổng ca</th>
                  <th className="px-5 py-4 font-black min-w-[140px]">Giờ làm</th>
                  <th className="px-5 py-4 font-black min-w-[150px]">Giờ quy đổi</th>
                  <th className="px-5 py-4 font-black min-w-[150px]">Hệ số ca TB</th>
                  <th className="px-5 py-4 font-black min-w-[150px]">Hệ số phức tạp</th>
                  <th className="px-5 py-4 font-black text-right min-w-[140px]">Phụ cấp</th>
                  <th className="px-5 py-4 font-black text-right min-w-[140px]">Khấu trừ</th>
                  <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương năm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.doctor?._id || row.doctor?.fullName} className="hover:bg-blue-50/30">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{formatDoctorName(row.doctor, row.doctorDegreeLevel)}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{row.doctor?.specialization || row.doctor?.email || '-'}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">{row.totalPayslips}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{row.totalShifts}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalWorkingHours)}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalConvertedHours)}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.averageShiftCoefficient)}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalComplexityCoefficient)}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalAllowance)}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalDeduction)}</td>
                    <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(row.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {hasReportData && (
        <Panel className="overflow-hidden mt-5">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-black text-slate-900">Tổng hợp theo tháng</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 font-black min-w-[120px]">Tháng</th>
                  <th className="px-5 py-4 font-black min-w-[140px]">Bác sĩ có phiếu</th>
                  <th className="px-5 py-4 font-black min-w-[120px]">Tổng ca</th>
                  <th className="px-5 py-4 font-black min-w-[140px]">Giờ làm</th>
                  <th className="px-5 py-4 font-black min-w-[150px]">Giờ quy đổi</th>
                  <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {months.map((month) => (
                  <tr key={month.month} className="hover:bg-blue-50/30">
                    <td className="px-5 py-4 font-black text-slate-900">{month.month}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{month.totalDoctors}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{month.totalShifts}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(month.totalWorkingHours)}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(month.totalConvertedHours)}</td>
                    <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(month.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
};

const SalaryReport = () => {
  const [periodType, setPeriodType] = useState('MONTH');
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const [doctorId, setDoctorId] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [doctors, setDoctors] = useState([]);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [yearlyDoctorReport, setYearlyDoctorReport] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMonthly = periodType === 'MONTH';
  const isAllDoctors = doctorId === 'ALL';
  const reportScopeLabel = isAllDoctors ? 'Tất cả bác sĩ' : 'Một bác sĩ';
  const periodLabel = isMonthly ? `Tháng ${month}` : `Năm ${year}`;

  const loadDoctors = async () => {
    try {
      const res = await getSalaryDoctorProfiles();
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bác sĩ');
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      if (isMonthly) {
        const params = { month, status };
        if (!isAllDoctors) params.doctorId = doctorId;
        const res = await getSalaryMonthlyReport(params);
        setMonthlyRows(res.data || []);
        setMonthlySummary(res.summary || null);
        setYearlyDoctorReport(null);
        setYearlyReport(null);
        return;
      }

      if (!isAllDoctors) {
        const res = await getSalaryDoctorYearlyReport({ doctorId, year, status });
        setYearlyDoctorReport(res.data);
        setYearlyReport(null);
        setMonthlyRows([]);
        setMonthlySummary(null);
        return;
      }

      const res = await getSalaryYearlyReport({ year, status });
      setYearlyReport(res.data);
      setYearlyDoctorReport(null);
      setMonthlyRows([]);
      setMonthlySummary(null);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo lương');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    load();
  }, [periodType, month, year, doctorId, status]);

  const currentRows = isMonthly
    ? monthlyRows
    : isAllDoctors
      ? yearlyReport?.rows || []
      : yearlyDoctorReport?.months || [];

  const hasReportData = isMonthly
    ? monthlyRows.length > 0
    : isAllDoctors
      ? (yearlyReport?.rows || []).length > 0
      : (yearlyDoctorReport?.months || []).some((row) => row.payslipId || row.totalAmount > 0);

  const summary = isMonthly
    ? monthlySummary
    : isAllDoctors
      ? yearlyReport?.summary
      : yearlyDoctorReport?.summary;

  const exportCsv = () => {
    if (isMonthly) {
      downloadCsv(`bao-cao-luong-thang-${month}.csv`, [
        'Bác sĩ',
        'Email',
        'Tháng',
        'Trạng thái',
        'Số ca',
        'Số bệnh nhân',
        'Giờ làm',
        'Giờ quy đổi',
        'Phụ cấp',
        'Khấu trừ',
        'Tổng lương'
      ], monthlyRows.map((row) => [
        row.doctor?.fullName || '',
        row.doctor?.email || '',
        row.month || month,
        getPayslipStatusLabel(row.status),
        row.totalShifts || 0,
        row.totalAppointments || 0,
        row.totalWorkingHours || 0,
        row.totalConvertedHours || 0,
        row.totalAllowance || 0,
        row.totalDeduction || 0,
        row.totalAmount || 0
      ]));
      return;
    }

    if (!isAllDoctors) {
      const rows = yearlyDoctorReport?.months || [];
      downloadCsv(`bao-cao-luong-${yearlyDoctorReport?.doctor?.fullName || 'bac-si'}-${year}.csv`, [
        'Tháng',
        'Trạng thái',
        'Số ca',
        'Giờ làm',
        'Giờ quy đổi',
        'Phụ cấp',
        'Khấu trừ',
        'Tổng lương'
      ], rows.map((row) => [
        row.month,
        getPayslipStatusLabel(row.status),
        row.totalShifts || 0,
        row.totalWorkingHours || 0,
        row.totalConvertedHours || 0,
        row.totalAllowance || 0,
        row.totalDeduction || 0,
        row.totalAmount || 0
      ]));
      return;
    }

    const rows = yearlyReport?.rows || [];
    downloadCsv(`bao-cao-luong-bac-si-${year}.csv`, [
      'Bác sĩ',
      'Email',
      'Số phiếu',
      'Tổng ca',
      'Giờ làm',
      'Giờ quy đổi',
      'Hệ số ca TB',
      'Tổng hệ số phức tạp',
      'Phụ cấp',
      'Khấu trừ',
      'Tổng lương'
    ], rows.map((row) => [
      row.doctor?.fullName || '',
      row.doctor?.email || '',
      row.totalPayslips || 0,
      row.totalShifts || 0,
      row.totalWorkingHours || 0,
      row.totalConvertedHours || 0,
      row.averageShiftCoefficient || 0,
      row.totalComplexityCoefficient || 0,
      row.totalAllowance || 0,
      row.totalDeduction || 0,
      row.totalAmount || 0
    ]));
  };

  const chartData = isMonthly
    ? monthlyRows.map((row) => ({
        name: row.doctor?.fullName || '-',
        amount: row.totalAmount,
        hours: row.totalConvertedHours
      }))
    : isAllDoctors
      ? (yearlyReport?.months || []).map((row) => ({
          month: row.month.slice(5),
          amount: row.totalAmount,
          doctors: row.totalDoctors
        }))
      : (yearlyDoctorReport?.months || []).map((row) => ({
          month: row.month.slice(5),
          amount: row.totalAmount,
          hours: row.totalConvertedHours
        }));

  const title = isMonthly
    ? 'Báo cáo tiền lương theo tháng'
    : isAllDoctors
      ? 'Báo cáo tiền lương tất cả bác sĩ theo năm'
      : 'Báo cáo tiền lương một bác sĩ theo năm';

  return (
    <div>
      <PanelHeader
        eyebrow="Báo cáo lương"
        title={title}
        actions={(
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPeriodType('MONTH')}
                className={`px-4 py-2 rounded-lg text-sm font-black transition-colors ${isMonthly ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Theo tháng
              </button>
              <button
                type="button"
                onClick={() => setPeriodType('YEAR')}
                className={`px-4 py-2 rounded-lg text-sm font-black transition-colors ${!isMonthly ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Theo năm
              </button>
            </div>
            {isMonthly ? (
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
              />
            ) : (
              <input
                type="number"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="w-32 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
              />
            )}
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="min-w-[240px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Tất cả bác sĩ</option>
              {doctors.map((row) => (
                <option key={row.doctor._id} value={row.doctor._id}>{formatProfileDoctorName(row)}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-[170px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Đã chốt trở lên</option>
              <option value="FINALIZED">Đã chốt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
            <button type="button" onClick={load} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl" title="Xem báo cáo">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button type="button" onClick={exportCsv} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="Xuất Excel">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
            <button type="button" onClick={() => window.print()} disabled={!hasReportData} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-xl" title="In / PDF">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        )}
      />
      <Alert>{error}</Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-5">
        <StatCard icon="manage_search" label="Phạm vi" value={reportScopeLabel} tone="blue" />
        <StatCard icon="calendar_month" label="Kỳ báo cáo" value={periodLabel} tone="violet" />
        <StatCard icon="description" label="Phiếu hợp lệ" value={summary?.totalPayslips || 0} tone="amber" />
        <StatCard icon="event_available" label="Tổng ca" value={summary?.totalShifts || 0} tone="blue" />
        <StatCard icon="payments" label={isMonthly ? 'Tổng lương tháng' : 'Tổng lương năm'} value={formatCurrency(summary?.totalAmount)} tone="emerald" />
      </div>

      <Panel className="p-5 mb-5">
        {loading ? <LoadingState /> : !hasReportData ? (
          <EmptyState icon="bar_chart" label="Không có phiếu lương hợp lệ trong bộ lọc" />
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={isMonthly ? 'name' : 'month'}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={isMonthly ? -12 : 0}
                  textAnchor={isMonthly ? 'end' : 'middle'}
                  height={isMonthly ? 70 : 40}
                />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}tr`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, key) => key === 'amount' ? formatCurrency(value) : formatNumber(value)} />
                <Legend />
                <Bar dataKey="amount" name="Tổng lương" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      {isMonthly && <ReportTable rows={monthlyRows} loading={loading} />}

      {!isMonthly && !isAllDoctors && (
        <Panel className="overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : !hasReportData ? (
            <EmptyState icon="calendar_month" label="Không có dữ liệu báo cáo" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 font-black min-w-[120px]">Tháng</th>
                    <th className="px-5 py-4 font-black min-w-[130px]">Trạng thái</th>
                    <th className="px-5 py-4 font-black min-w-[100px]">Số ca</th>
                    <th className="px-5 py-4 font-black min-w-[120px]">Giờ làm</th>
                    <th className="px-5 py-4 font-black min-w-[140px]">Giờ quy đổi</th>
                    <th className="px-5 py-4 font-black text-right min-w-[130px]">Phụ cấp</th>
                    <th className="px-5 py-4 font-black text-right min-w-[130px]">Khấu trừ</th>
                    <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRows.map((row) => (
                    <tr key={row.month} className="hover:bg-blue-50/30">
                      <td className="px-5 py-4 font-black text-slate-900">{row.month}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{getPayslipStatusLabel(row.status)}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{row.totalShifts}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalWorkingHours)}</td>
                      <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalConvertedHours)}</td>
                      <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalAllowance)}</td>
                      <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalDeduction)}</td>
                      <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(row.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {!isMonthly && isAllDoctors && (
        <>
          <Panel className="overflow-hidden">
            {loading ? (
              <LoadingState />
            ) : !hasReportData ? (
              <EmptyState icon="calendar_month" label="Không có dữ liệu báo cáo" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 font-black min-w-[220px]">Bác sĩ</th>
                      <th className="px-5 py-4 font-black min-w-[120px]">Phiếu</th>
                      <th className="px-5 py-4 font-black min-w-[120px]">Tổng ca</th>
                      <th className="px-5 py-4 font-black min-w-[140px]">Giờ làm</th>
                      <th className="px-5 py-4 font-black min-w-[150px]">Giờ quy đổi</th>
                      <th className="px-5 py-4 font-black min-w-[150px]">Hệ số ca TB</th>
                      <th className="px-5 py-4 font-black min-w-[150px]">Hệ số phức tạp</th>
                      <th className="px-5 py-4 font-black text-right min-w-[140px]">Phụ cấp</th>
                      <th className="px-5 py-4 font-black text-right min-w-[140px]">Khấu trừ</th>
                      <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương năm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRows.map((row) => (
                      <tr key={row.doctor?._id || row.doctor?.fullName} className="hover:bg-blue-50/30">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">{formatDoctorName(row.doctor, row.doctorDegreeLevel)}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">{row.doctor?.specialization || row.doctor?.email || '-'}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-700">{row.totalPayslips}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{row.totalShifts}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalWorkingHours)}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalConvertedHours)}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.averageShiftCoefficient)}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalComplexityCoefficient)}</td>
                        <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalAllowance)}</td>
                        <td className="px-5 py-4 text-right font-bold text-slate-700">{formatCurrency(row.totalDeduction)}</td>
                        <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {hasReportData && (
            <Panel className="overflow-hidden mt-5">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-black text-slate-900">Tổng hợp theo tháng</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 font-black min-w-[120px]">Tháng</th>
                      <th className="px-5 py-4 font-black min-w-[140px]">Bác sĩ có phiếu</th>
                      <th className="px-5 py-4 font-black min-w-[120px]">Tổng ca</th>
                      <th className="px-5 py-4 font-black min-w-[140px]">Giờ làm</th>
                      <th className="px-5 py-4 font-black min-w-[150px]">Giờ quy đổi</th>
                      <th className="px-5 py-4 font-black text-right min-w-[160px]">Tổng lương</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(yearlyReport?.months || []).map((row) => (
                      <tr key={row.month} className="hover:bg-blue-50/30">
                        <td className="px-5 py-4 font-black text-slate-900">{row.month}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{row.totalDoctors}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{row.totalShifts}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalWorkingHours)}</td>
                        <td className="px-5 py-4 font-bold text-slate-700">{formatNumber(row.totalConvertedHours)}</td>
                        <td className="px-5 py-4 text-right font-black text-blue-700">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
};

const Payroll = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeKey = payrollKeyByRoute[section] || 'baseRate';

  useEffect(() => {
    if (!section || !payrollKeyByRoute[section]) {
      navigate(getPayrollPath(activeKey), { replace: true });
    }
  }, [section, activeKey, navigate]);

  const activeView = {
    baseRate: <BaseRateSettings />,
    doctorProfiles: <DoctorCoefficientSettings />,
    shiftRules: <ShiftCoefficientSettings />,
    complexities: <ComplexityEntry />,
    payslip: <DoctorMonthlyPayslip />,
    monthlyReport: <MonthlySalaryReport />,
    doctorYearReport: <DoctorYearlySalaryReport />,
    yearlyReport: <YearlySalaryReport />,
    salaryReport: <SalaryReport />
  }[activeKey] || <BaseRateSettings />;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Quản trị</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Tính lương</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tính lương bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Quản lý hệ số, nhập độ khó ca bệnh, lập phiếu lương và xem báo cáo.
          </p>
        </div>
      </div>

      <div className="min-w-0">
        {activeView}
      </div>
    </div>
  );
};

export default Payroll;
