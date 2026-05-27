/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { getPatientPortalAppointments, getPatientPortalMe, updatePatientPortalMe } from '../../services/patientPortalService';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-';

const PatientRecords = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [meRes, appointmentsRes] = await Promise.all([
        getPatientPortalMe(),
        getPatientPortalAppointments({ status: 'COMPLETED' })
      ]);
      setProfile(meRes.data);
      setAppointments(appointmentsRes.data || []);
      setForm({
        fullName: meRes.data?.patient?.fullName || '',
        email: meRes.data?.user?.email || '',
        phone: meRes.data?.patient?.phone || '',
        address: meRes.data?.patient?.address || ''
      });
    } catch (err) {
      setError(err.message || 'Không thể tải hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const servicesPerformed = useMemo(() => {
    return appointments.flatMap((appointment) => {
      const items = appointment.servicesPerformed?.length
        ? appointment.servicesPerformed
        : appointment.serviceId
          ? [{ serviceId: appointment.serviceId, quantity: 1, priceAtAppointment: appointment.serviceId.price }]
          : [];
      return items.map((item, index) => ({
        id: `${appointment._id}-${item.serviceId?._id || index}`,
        date: appointment.date,
        name: item.serviceId?.name || 'Dịch vụ',
        doctor: appointment.doctorId?.fullName || '-',
        quantity: item.quantity || 1
      }));
    });
  }, [appointments]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await updatePatientPortalMe(form);
      setProfile(res.data);
      setSuccess('Đã cập nhật thông tin hồ sơ');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hồ sơ của tôi</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Xem thông tin cá nhân, lịch sử khám và dịch vụ đã thực hiện.</p>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">Thông tin cá nhân</h3>
          <p className="text-xs font-bold text-blue-700">{profile?.patient?.patientCode || '-'}</p>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Họ tên</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">SĐT</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold" />
          </div>
          <button disabled={saving || loading} className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold">
            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Lịch sử khám hoàn tất</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="p-5">
                  <p className="font-extrabold text-slate-900">{formatDate(appointment.date)} • BS. {appointment.doctorId?.fullName || '-'}</p>
                  <p className="text-sm text-slate-500 font-semibold mt-1">{appointment.diagnosis || appointment.clinicalNotes || 'Chưa có ghi chú kết quả'}</p>
                  {appointment.prescription?.length > 0 && (
                    <p className="text-xs text-blue-700 font-bold mt-2">Có {appointment.prescription.length} dòng đơn thuốc</p>
                  )}
                </div>
              ))}
              {!loading && appointments.length === 0 && <div className="p-8 text-center text-slate-400 font-bold">Chưa có lịch sử khám hoàn tất</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Dịch vụ đã thực hiện</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Ngày</th>
                    <th className="px-6 py-4">Dịch vụ</th>
                    <th className="px-6 py-4">Bác sĩ</th>
                    <th className="px-6 py-4 text-right">SL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {servicesPerformed.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 font-semibold text-slate-600">{formatDate(item.date)}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{item.doctor}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">{item.quantity}</td>
                    </tr>
                  ))}
                  {!loading && servicesPerformed.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-bold">Chưa có dịch vụ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
