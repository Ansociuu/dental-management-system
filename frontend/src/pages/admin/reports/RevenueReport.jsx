/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInvoices } from '../../../services/invoiceService';

const PAYMENT_METHOD_LABELS = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ'
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const formatShortCurrency = (value) => {
  const amount = Number(value) || 0;
  const formatCompact = (number) => new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 1
  }).format(number);

  if (amount >= 1000000000) return `${formatCompact(amount / 1000000000)} tỷ`;
  if (amount >= 1000000) return `${formatCompact(amount / 1000000)} tr`;
  return formatCurrency(amount);
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

const getDateKey = (date) => toDateInput(new Date(date));

const RevenueReport = () => {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(toDateInput(startOfMonth(today)));
  const [dateTo, setDateTo] = useState(toDateInput(today));
  const [paymentMethod, setPaymentMethod] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { dateFrom, dateTo };
      if (paymentMethod) params.paymentMethod = paymentMethod;
      const res = await getInvoices(params);
      setInvoices(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [dateFrom, dateTo, paymentMethod]);

  const report = useMemo(() => {
    const dailyMap = new Map();
    const methodTotals = {};
    let totalRevenue = 0;

    invoices.forEach((invoice) => {
      const amount = Number(invoice.totalAmount) || 0;
      totalRevenue += amount;

      const dateKey = getDateKey(invoice.paidAt);
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + amount);

      const method = invoice.paymentMethod || 'CASH';
      methodTotals[method] = (methodTotals[method] || 0) + amount;
    });

    const chartData = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date,
        label: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue
      }));

    const methodData = Object.entries(methodTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([method, value]) => ({
        method,
        label: PAYMENT_METHOD_LABELS[method] || method,
        value,
        percent: totalRevenue ? Math.round((value / totalRevenue) * 100) : 0
      }));

    return {
      totalRevenue,
      invoiceCount: invoices.length,
      averageInvoice: invoices.length ? totalRevenue / invoices.length : 0,
      chartData,
      methodData
    };
  }, [invoices]);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Báo cáo doanh thu</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Doanh thu được tính từ các phiếu thu đã thanh toán.
          </p>
        </div>
        <button
          type="button"
          onClick={loadInvoices}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Tải lại
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100">
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
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Phương thức</label>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Tất cả</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 font-bold flex items-center justify-between gap-2">
          <span>Tổng doanh thu</span>
          <span>{formatShortCurrency(report.totalRevenue)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Tổng doanh thu</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : formatCurrency(report.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Số phiếu thu</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : report.invoiceCount.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-500">Giá trị trung bình</p>
          <p className="text-[28px] font-extrabold text-slate-800 mt-4">{loading ? '...' : formatCurrency(report.averageInvoice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[420px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Doanh thu theo ngày</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Dựa trên thời điểm thanh toán phiếu thu.</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            {report.chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[48px] mb-3">bar_chart_off</span>
                <p className="text-sm font-bold">Chưa có doanh thu trong bộ lọc</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                    tickFormatter={formatShortCurrency}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => `Ngày ${label}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={4} dot={{ r: 4, fill: '#1d4ed8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-[420px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Phân bổ phương thức</h3>
          {report.methodData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-6 flex-1">
              {report.methodData.map((item, index) => {
                const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600'];
                return (
                  <div key={item.method}>
                    <div className="flex justify-between items-end mb-2 gap-4">
                      <span className="text-sm font-bold text-slate-600">{item.label}</span>
                      <span className="text-sm font-extrabold text-slate-800 whitespace-nowrap">
                        {formatShortCurrency(item.value)} <span className="text-slate-400 font-semibold">({item.percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[index % colors.length]} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Phiếu thu gần nhất</h3>
          <span className="text-xs font-bold text-slate-400">{report.invoiceCount} phiếu</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Mã phiếu</th>
                <th className="px-6 py-4">Bệnh nhân</th>
                <th className="px-6 py-4">Ngày thu</th>
                <th className="px-6 py-4">Phương thức</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 10).map((invoice) => (
                <tr key={invoice._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-black text-slate-900">{invoice.invoiceCode}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{invoice.patientId?.fullName || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">{formatDateTime(invoice.paidAt)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-700">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
              ))}
              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold">Không có phiếu thu trong bộ lọc</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
