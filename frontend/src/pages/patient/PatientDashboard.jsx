import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatientPortalAppointments, getPatientPortalMe, getPatientPortalInvoices } from '../../services/patientPortalService';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-';
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [meRes, appointmentsRes, invoicesRes] = await Promise.all([
          getPatientPortalMe(),
          getPatientPortalAppointments(),
          getPatientPortalInvoices()
        ]);
        setProfile(meRes.data);
        setAppointments(appointmentsRes.data || []);
        setInvoices(invoicesRes.data || []);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu cổng bệnh nhân');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appointment) => new Date(appointment.date) >= now && !['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(appointment.status))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments]);

  const latestDoctor = appointments.find((appointment) => appointment.doctorId)?.doctorId;
  const paidTotal = invoices.reduce((sum, invoice) => sum + (Number(invoice.totalAmount) || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng quan bệnh nhân</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi lịch khám, hồ sơ và chi phí của bạn.</p>
        </div>
        <Link to="/patient/book" className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-sm">
          Đặt lịch mới
        </Link>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Mã bệnh nhân</p>
          <p className="text-xl font-extrabold text-blue-700 mt-3">{profile?.patient?.patientCode || '-'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Lịch sắp tới</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{loading ? '...' : upcomingAppointments.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Bác sĩ gần nhất</p>
          <p className="text-base font-extrabold text-slate-900 mt-3">{latestDoctor?.fullName || '-'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Tổng đã thanh toán</p>
          <p className="text-lg font-extrabold text-blue-700 mt-3">{formatCurrency(paidTotal)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900">Lịch khám sắp tới</h3>
            <Link to="/patient/appointments" className="text-sm font-bold text-blue-700">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment._id} className="p-5">
                <p className="font-extrabold text-slate-900">{formatDate(appointment.date)} - {appointment.shiftId?.name || '-'}</p>
                <p className="text-sm text-slate-500 font-semibold mt-1">{appointment.serviceId?.name || '-'} • BS. {appointment.doctorId?.fullName || '-'}</p>
              </div>
            ))}
            {!loading && upcomingAppointments.length === 0 && <div className="p-8 text-center text-slate-400 font-bold">Chưa có lịch sắp tới</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-extrabold text-slate-900 mb-5">Thông tin hồ sơ</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-50 pb-3">
              <span className="font-bold text-slate-500">Họ tên</span>
              <span className="font-extrabold text-slate-900 text-right">{profile?.patient?.fullName || '-'}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-50 pb-3">
              <span className="font-bold text-slate-500">SĐT</span>
              <span className="font-extrabold text-slate-900">{profile?.patient?.phone || '-'}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-50 pb-3">
              <span className="font-bold text-slate-500">Ngày sinh</span>
              <span className="font-extrabold text-slate-900">{formatDate(profile?.patient?.dob)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-bold text-slate-500">Địa chỉ</span>
              <span className="font-extrabold text-slate-900 text-right">{profile?.patient?.address || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
