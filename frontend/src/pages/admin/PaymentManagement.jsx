/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import {
  createInvoiceFromAppointment,
  getInvoiceById,
  getInvoices,
  getPendingInvoices
} from '../../services/invoiceService';

const PAYMENT_METHODS = {
  CASH: { label: 'Tiền mặt', icon: 'payments', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  BANK_TRANSFER: { label: 'Chuyển khoản', icon: 'account_balance', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  CARD: { label: 'Thẻ', icon: 'credit_card', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

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

const getAppointmentItems = (appointment) => {
  if (Array.isArray(appointment?.billingItems) && appointment.billingItems.length > 0) {
    return appointment.billingItems;
  }

  if (Array.isArray(appointment?.servicesPerformed) && appointment.servicesPerformed.length > 0) {
    return appointment.servicesPerformed.map((item) => {
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(item.priceAtAppointment || item.serviceId?.price) || 0;
      return {
        serviceId: item.serviceId?._id || item.serviceId,
        name: item.serviceId?.name || 'Dịch vụ điều trị',
        quantity,
        unitPrice,
        lineTotal: quantity * unitPrice
      };
    });
  }

  const unitPrice = Number(appointment?.servicePriceAtBooking || appointment?.serviceId?.price) || 0;
  return [{
    serviceId: appointment?.serviceId?._id || appointment?.serviceId,
    name: appointment?.serviceNameAtBooking || appointment?.serviceId?.name || 'Dịch vụ khám',
    quantity: 1,
    unitPrice,
    lineTotal: unitPrice
  }];
};

const Receipt = ({ invoice }) => {
  if (!invoice) return null;

  const payment = PAYMENT_METHODS[invoice.paymentMethod] || PAYMENT_METHODS.CASH;

  return (
    <div id="receipt-print-area" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm print:shadow-none print:border-none print:rounded-none">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
        <div>
          <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Mec Dental</p>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Phiếu thu khám bệnh</h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">Mã phiếu: {invoice.invoiceCode}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase">Ngày thu</p>
          <p className="text-sm font-extrabold text-slate-800 mt-1">{formatDateTime(invoice.paidAt)}</p>
          <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-xl text-xs font-bold border ${payment.badge}`}>
            <span className="material-symbols-outlined text-[15px]">{payment.icon}</span>
            {payment.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-slate-50 rounded-xl p-4 print:bg-white print:border print:border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bệnh nhân</p>
          <p className="font-extrabold text-slate-900">{invoice.patientId?.fullName || '-'}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {invoice.patientId?.patientCode || '-'} • {invoice.patientId?.phone || '-'}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 print:bg-white print:border print:border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Thông tin ca khám</p>
          <p className="font-extrabold text-slate-900">BS. {invoice.doctorId?.fullName || '-'}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Ngày khám: {formatDate(invoice.appointmentId?.date)} • STT {invoice.appointmentId?.queueNumber || '-'}
          </p>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-xl mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold">
            <tr>
              <th className="px-4 py-3 text-left">Dịch vụ</th>
              <th className="px-4 py-3 text-center w-20">SL</th>
              <th className="px-4 py-3 text-right w-36">Đơn giá</th>
              <th className="px-4 py-3 text-right w-36">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items?.map((item, index) => (
              <tr key={`${item.serviceId || item.name}-${index}`}>
                <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-center font-semibold text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-600">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-extrabold text-slate-900">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-2 mb-5">
        <div className="w-full max-w-sm flex justify-between text-sm font-semibold text-slate-500">
          <span>Tạm tính</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="w-full max-w-sm flex justify-between text-sm font-semibold text-slate-500">
          <span>Giảm giá</span>
          <span>{formatCurrency(invoice.discountAmount)}</span>
        </div>
        <div className="w-full max-w-sm flex justify-between border-t border-slate-200 pt-3">
          <span className="text-base font-black text-slate-900">Tổng đã thu</span>
          <span className="text-xl font-black text-blue-700">{formatCurrency(invoice.paidAmount)}</span>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 font-semibold flex flex-col sm:flex-row justify-between gap-2">
        <p>Thu ngân: <span className="text-slate-800 font-bold">{invoice.cashierId?.fullName || '-'}</span></p>
        {invoice.note && <p>Ghi chú: <span className="text-slate-800 font-bold">{invoice.note}</span></p>}
      </div>
    </div>
  );
};

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingDate, setPendingDate] = useState(toDateInput(new Date()));
  const [paidDateFrom, setPaidDateFrom] = useState(toDateInput(new Date()));
  const [paidDateTo, setPaidDateTo] = useState(toDateInput(new Date()));
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPending = async () => {
    try {
      setLoadingPending(true);
      setError('');
      const res = await getPendingInvoices({ date: pendingDate });
      setPendingAppointments(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách chờ thanh toán');
    } finally {
      setLoadingPending(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      setError('');
      const params = {};
      if (paidDateFrom) params.dateFrom = paidDateFrom;
      if (paidDateTo) params.dateTo = paidDateTo;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
      const res = await getInvoices(params);
      setInvoices(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [pendingDate]);

  useEffect(() => {
    loadInvoices();
  }, [paidDateFrom, paidDateTo, paymentMethodFilter]);

  const paidStats = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.count += 1;
        acc.total += Number(invoice.totalAmount) || 0;
        return acc;
      },
      { count: 0, total: 0 }
    );
  }, [invoices]);

  const pendingTotal = useMemo(() => {
    return pendingAppointments.reduce((sum, appointment) => {
      const total = appointment.billingTotal ?? getAppointmentItems(appointment).reduce((itemSum, item) => itemSum + item.lineTotal, 0);
      return sum + total;
    }, 0);
  }, [pendingAppointments]);

  const openPaymentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentMethod('CASH');
    setNote('');
    setError('');
  };

  const closePaymentModal = () => {
    if (submitting) return;
    setSelectedAppointment(null);
    setNote('');
  };

  const handleCreateInvoice = async () => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await createInvoiceFromAppointment(selectedAppointment._id, {
        paymentMethod,
        note
      });
      setSuccess('Thanh toán hóa đơn thành công');
      setSelectedAppointment(null);
      setSelectedInvoice(res.data);
      await Promise.all([loadPending(), loadInvoices()]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể tạo hóa đơn thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      setError('');
      const res = await getInvoiceById(invoiceId);
      setSelectedInvoice(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết hóa đơn');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Thu ngân</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Thanh toán chi phí khám</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thanh toán chi phí khám bệnh</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Thu tiền cho các ca khám đã hoàn thành và in phiếu thu nội bộ.
          </p>
        </div>
        <button
          type="button"
          onClick={() => activeTab === 'pending' ? loadPending() : loadInvoices()}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Tải lại
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{pendingAppointments.length}</p>
            <p className="text-xs font-bold text-slate-400">Ca chờ thanh toán</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{paidStats.count}</p>
            <p className="text-xs font-bold text-slate-400">Phiếu đã thu trong bộ lọc</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{formatCurrency(paidStats.total)}</p>
            <p className="text-xs font-bold text-slate-400">Tổng đã thu</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 mb-6 p-2 inline-flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Chờ thanh toán
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paid')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
            activeTab === 'paid'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          Đã thanh toán
        </button>
      </div>

      {activeTab === 'pending' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ngày khám</label>
              <input
                type="date"
                value={pendingDate}
                onChange={(event) => setPendingDate(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700 font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">info</span>
              Chỉ hiển thị ca đã hoàn thành và chưa có phiếu thu.
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 font-bold flex items-center justify-between gap-2">
              <span>Tạm thu dự kiến</span>
              <span className="text-blue-700">{formatCurrency(pendingTotal)}</span>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            {loadingPending ? (
              <div className="p-12 text-center text-slate-400 font-semibold">Đang tải danh sách chờ thanh toán...</div>
            ) : pendingAppointments.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">price_check</span>
                <p className="text-sm font-bold">Không có ca khám nào đang chờ thanh toán</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-5 min-w-[220px]">Bệnh nhân</th>
                      <th className="px-6 py-5 min-w-[190px]">Ca khám</th>
                      <th className="px-6 py-5 min-w-[260px]">Dịch vụ đã làm</th>
                      <th className="px-6 py-5 text-right min-w-[150px]">Tổng tiền</th>
                      <th className="px-6 py-5 text-right min-w-[150px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingAppointments.map((appointment) => {
                      const items = getAppointmentItems(appointment);
                      const total = appointment.billingTotal ?? items.reduce((sum, item) => sum + item.lineTotal, 0);
                      return (
                        <tr key={appointment._id} className="hover:bg-blue-50/30 transition-colors align-top">
                          <td className="px-6 py-5">
                            <p className="font-extrabold text-slate-900">{appointment.patientId?.fullName || '-'}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{appointment.patientId?.phone || '-'}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-0.5">{appointment.patientId?.patientCode || '-'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-700">{formatDate(appointment.date)}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{appointment.shiftId?.name || 'Ca khám'} • STT {appointment.queueNumber || '-'}</p>
                            <p className="text-xs text-blue-700 font-bold mt-1">BS. {appointment.doctorId?.fullName || '-'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              {items.map((item, index) => (
                                <div key={`${item.serviceId || item.name}-${index}`} className="flex justify-between gap-4 text-xs">
                                  <span className="font-bold text-slate-700">{item.name} x{item.quantity}</span>
                                  <span className="font-semibold text-slate-500">{formatCurrency(item.lineTotal)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-blue-700">{formatCurrency(total)}</td>
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => openPaymentModal(appointment)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                              Thanh toán
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Từ ngày</label>
              <input
                type="date"
                value={paidDateFrom}
                onChange={(event) => setPaidDateFrom(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Đến ngày</label>
              <input
                type="date"
                value={paidDateTo}
                onChange={(event) => setPaidDateTo(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phương thức</label>
              <select
                value={paymentMethodFilter}
                onChange={(event) => setPaymentMethodFilter(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Tất cả</option>
                {Object.entries(PAYMENT_METHODS).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 font-bold flex items-center justify-between gap-2">
              <span>Tổng đã thu</span>
              <span>{formatCurrency(paidStats.total)}</span>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            {loadingInvoices ? (
              <div className="p-12 text-center text-slate-400 font-semibold">Đang tải danh sách phiếu thu...</div>
            ) : invoices.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">receipt_long</span>
                <p className="text-sm font-bold">Không có phiếu thu nào trong bộ lọc</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-5 min-w-[150px]">Mã phiếu</th>
                      <th className="px-6 py-5 min-w-[210px]">Bệnh nhân</th>
                      <th className="px-6 py-5 min-w-[180px]">Ngày thu</th>
                      <th className="px-6 py-5 min-w-[150px]">Phương thức</th>
                      <th className="px-6 py-5 text-right min-w-[150px]">Số tiền</th>
                      <th className="px-6 py-5 text-right min-w-[150px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((invoice) => {
                      const payment = PAYMENT_METHODS[invoice.paymentMethod] || PAYMENT_METHODS.CASH;
                      return (
                        <tr key={invoice._id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-5 font-black text-slate-900">{invoice.invoiceCode}</td>
                          <td className="px-6 py-5">
                            <p className="font-extrabold text-slate-900">{invoice.patientId?.fullName || '-'}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{invoice.patientId?.patientCode || '-'} • {invoice.patientId?.phone || '-'}</p>
                          </td>
                          <td className="px-6 py-5 font-semibold text-slate-600">{formatDateTime(invoice.paidAt)}</td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${payment.badge}`}>
                              <span className="material-symbols-outlined text-[16px]">{payment.icon}</span>
                              {payment.label}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-blue-700">{formatCurrency(invoice.totalAmount)}</td>
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewInvoice(invoice._id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              Xem phiếu
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Xác nhận thanh toán</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">{selectedAppointment.patientId?.fullName || '-'} • {formatDate(selectedAppointment.date)}</p>
              </div>
              <button onClick={closePaymentModal} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">Bệnh nhân</p>
                  <p className="font-extrabold text-slate-900 mt-1">{selectedAppointment.patientId?.fullName || '-'}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">{selectedAppointment.patientId?.phone || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">Bác sĩ</p>
                  <p className="font-extrabold text-slate-900 mt-1">{selectedAppointment.doctorId?.fullName || '-'}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">{selectedAppointment.shiftId?.name || 'Ca khám'} • STT {selectedAppointment.queueNumber || '-'}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-blue-500 uppercase">Tổng phải thu</p>
                  <p className="font-black text-blue-700 text-xl mt-1">
                    {formatCurrency(selectedAppointment.billingTotal ?? getAppointmentItems(selectedAppointment).reduce((sum, item) => sum + item.lineTotal, 0))}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Dịch vụ</th>
                      <th className="px-4 py-3 text-center w-20">SL</th>
                      <th className="px-4 py-3 text-right w-36">Đơn giá</th>
                      <th className="px-4 py-3 text-right w-36">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getAppointmentItems(selectedAppointment).map((item, index) => (
                      <tr key={`${item.serviceId || item.name}-${index}`}>
                        <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900">{formatCurrency(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phương thức thanh toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {Object.entries(PAYMENT_METHODS).map(([value, config]) => (
                      <option key={value} value={value}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ghi chú</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ghi chú thanh toán nếu có"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={closePaymentModal}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">price_check</span>
                {submitting ? 'Đang thanh toán...' : 'Xác nhận đã thu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Chi tiết phiếu thu</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">{selectedInvoice.invoiceCode}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  In
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
              <Receipt invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
