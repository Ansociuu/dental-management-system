/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { getPatientPortalInvoices } from '../../services/patientPortalService';

const PAYMENT_METHOD_LABELS = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ'
};

const formatDateTime = (date) => date ? new Date(date).toLocaleString('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}) : '-';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);

const PatientInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getPatientPortalInvoices();
      setInvoices(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải phiếu thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Phiếu thu của tôi</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Danh sách các chi phí khám đã thanh toán.</p>
        </div>
        <button onClick={loadInvoices} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700">Tải lại</button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-4">Mã phiếu</th>
              <th className="px-6 py-4">Ngày thu</th>
              <th className="px-6 py-4">Bác sĩ</th>
              <th className="px-6 py-4">Phương thức</th>
              <th className="px-6 py-4 text-right">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={invoice._id} onClick={() => setSelected(invoice)} className="hover:bg-blue-50/40 cursor-pointer">
                <td className="px-6 py-4 font-black text-slate-900">{invoice.invoiceCode}</td>
                <td className="px-6 py-4 font-semibold text-slate-600">{formatDateTime(invoice.paidAt)}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{invoice.doctorId?.fullName || '-'}</td>
                <td className="px-6 py-4 font-semibold text-slate-600">{PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod}</td>
                <td className="px-6 py-4 text-right font-black text-blue-700">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            ))}
            {!loading && invoices.length === 0 && <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-bold">Chưa có phiếu thu</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selected.invoiceCode}</h3>
                <p className="text-sm text-slate-500 font-semibold mt-1">{formatDateTime(selected.paidAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2">Dịch vụ</th>
                    <th className="py-2 text-right">SL</th>
                    <th className="py-2 text-right">Đơn giá</th>
                    <th className="py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.items.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="py-3 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3 text-right font-semibold">{item.quantity}</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-black text-blue-700">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Tổng tiền</span><span className="font-black text-slate-900">{formatCurrency(selected.totalAmount)}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Phương thức</span><span className="font-bold text-slate-700">{PAYMENT_METHOD_LABELS[selected.paymentMethod] || selected.paymentMethod}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInvoices;
