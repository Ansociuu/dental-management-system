/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getDoctorPerformanceReport } from '../../../services/reportService';

const toDateInput = (date) => date.toISOString().slice(0, 10);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const formatShortCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1000000000) return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(amount / 1000000000)} tỷ`;
  if (amount >= 1000000) return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(amount / 1000000)} tr`;
  return formatCurrency(amount);
};

const DoctorPerformanceReport = () => {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toDateInput(startOfMonth(today)));
  const [dateTo, setDateTo] = useState(toDateInput(today));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDoctorPerformanceReport({ dateFrom, dateTo });
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo hiệu suất bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo]);

  const chartData = useMemo(() => {
    return (report?.doctors || []).map((doctor) => ({
      name: doctor.doctorName,
      shortName: doctor.doctorName?.replace(/^BS\.?\s*/i, '') || doctor.doctorName,
      completed: doctor.completedAppointments,
      revenue: Math.round((doctor.revenue || 0) / 1000000)
    }));
  }, [report]);

  const doctors = report?.doctors || [];
  const totals = report?.totals || {};

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hiệu suất bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Số ca khám lấy từ lịch hẹn, doanh thu lấy từ phiếu thu đã thanh toán.</p>
        </div>
        <button
          type="button"
          onClick={loadReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Tải lại
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 font-bold flex items-center justify-between gap-2">
          <span>Doanh thu đã thu</span>
          <span>{loading ? '...' : formatShortCurrency(totals.revenue)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Bác sĩ doanh thu cao nhất</p>
          <p className="text-lg font-extrabold text-slate-800 mt-4">{report?.topByRevenue?.doctorName || '-'}</p>
          <p className="text-sm font-bold text-blue-700 mt-1">{formatCurrency(report?.topByRevenue?.revenue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Bác sĩ khám nhiều nhất</p>
          <p className="text-lg font-extrabold text-slate-800 mt-4">{report?.topByCompleted?.doctorName || '-'}</p>
          <p className="text-sm font-bold text-blue-700 mt-1">{(report?.topByCompleted?.completedAppointments || 0).toLocaleString('vi-VN')} ca hoàn tất</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Tổng ca hoàn tất</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : (totals.completedAppointments || 0).toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Số ca hoàn tất & doanh thu</h3>
          <div className="flex-1 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold">Chưa có dữ liệu trong bộ lọc</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip
                    formatter={(value, name) => [name === 'Doanh thu (triệu)' ? `${value} tr` : value, name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                  <Bar dataKey="completed" name="Ca hoàn tất" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Doanh thu (triệu)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[450px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Chi tiết hiệu suất</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                <tr>
                  <th className="px-4 py-3">Bác sĩ</th>
                  <th className="px-4 py-3 text-right">Hoàn tất</th>
                  <th className="px-4 py-3 text-right">Hóa đơn</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doctor) => (
                  <tr key={doctor.doctorId} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{doctor.doctorName}</p>
                      <p className="text-xs text-slate-400 font-semibold">{doctor.specialization || '-'}</p>
                    </td>
                    <td className="px-4 py-4 text-right font-extrabold text-slate-700">{doctor.completedAppointments}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-500">{doctor.invoiceCount}</td>
                    <td className="px-4 py-4 text-right font-extrabold text-blue-700">{formatCurrency(doctor.revenue)}</td>
                  </tr>
                ))}
                {!loading && doctors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-slate-400 font-bold">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPerformanceReport;
