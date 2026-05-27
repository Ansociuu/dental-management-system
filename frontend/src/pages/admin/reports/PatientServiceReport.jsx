/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { getPatientsServicesReport } from '../../../services/reportService';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const toDateInput = (date) => date.toISOString().slice(0, 10);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const PatientServiceReport = () => {
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
      const res = await getPatientsServicesReport({ dateFrom, dateTo });
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo bệnh nhân và dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateFrom, dateTo]);

  const totals = report?.totals || {};
  const ageData = report?.ageGroups || [];
  const genderData = report?.genderGroups || [];
  const services = report?.services || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bệnh nhân & Dịch vụ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Bệnh nhân lấy từ hồ sơ thật, dịch vụ lấy từ dòng phiếu thu đã thanh toán.</p>
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
          <span>Doanh thu dịch vụ</span>
          <span>{loading ? '...' : formatCurrency(totals.serviceRevenue)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Tổng bệnh nhân</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : (totals.totalPatients || 0).toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Bệnh nhân mới</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : (totals.newPatients || 0).toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Lượt dịch vụ đã thu</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : (totals.serviceCount || 0).toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Dịch vụ có doanh thu</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : services.length.toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Phân bổ độ tuổi bệnh nhân mới</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Tính theo bệnh nhân tạo mới trong bộ lọc ngày.</p>
          <div className="w-full h-[300px]">
            {ageData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ageData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                    {ageData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {genderData.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {genderData.map((item) => (
                <span key={item.name} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
                  {item.name}: {item.value}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Dịch vụ sử dụng nhiều nhất</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Top dịch vụ dựa trên các dòng phiếu thu đã thanh toán.</p>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {services.length === 0 ? (
              <div className="py-14 text-center text-slate-400 font-bold">Chưa có dịch vụ trong bộ lọc</div>
            ) : services.slice(0, 10).map((service, index) => (
              <div key={`${service.serviceId || service.name}-${index}`} className="flex items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-indigo-500' : index === 2 ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{service.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{service.invoiceCount} phiếu thu</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-slate-700">{service.count} <span className="text-xs font-medium text-slate-500">lượt</span></p>
                  <p className="text-xs font-bold text-blue-700 mt-1">{formatCurrency(service.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientServiceReport;
