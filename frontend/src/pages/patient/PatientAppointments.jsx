/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { getPatientPortalAppointments } from '../../services/patientPortalService';

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã tiếp nhận',
  IN_PROGRESS: 'Đang khám',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Vắng mặt'
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getPatientPortalAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lịch khám của tôi</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi trạng thái và chi tiết từng lịch khám.</p>
        </div>
        <button onClick={loadAppointments} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700">Tải lại</button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Đang tải lịch khám...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">Chưa có lịch khám</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((appointment) => (
              <button
                type="button"
                key={appointment._id}
                onClick={() => setSelected(appointment)}
                className="w-full text-left p-5 hover:bg-blue-50/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-slate-900">{formatDate(appointment.date)} • {appointment.shiftId?.name || '-'}</p>
                    <p className="text-sm text-slate-500 font-semibold mt-1">{appointment.serviceId?.name || '-'} • BS. {appointment.doctorId?.fullName || '-'}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold w-fit">
                    {STATUS_LABELS[appointment.status] || appointment.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Chi tiết lịch khám</h3>
                <p className="text-sm text-slate-500 font-semibold mt-1">{formatDate(selected.date)} • {selected.shiftId?.name || '-'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Dịch vụ</p>
                <p className="font-extrabold text-slate-900 mt-1">{selected.serviceId?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Bác sĩ phụ trách</p>
                <p className="font-extrabold text-slate-900 mt-1">{selected.doctorId?.fullName || '-'}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{selected.doctorId?.specialization || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Trạng thái</p>
                <p className="font-extrabold text-blue-700 mt-1">{STATUS_LABELS[selected.status] || selected.status}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Triệu chứng</p>
                <p className="font-semibold text-slate-700 mt-1">{selected.symptoms || '-'}</p>
              </div>
              {selected.status === 'COMPLETED' && (
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Kết quả khám</p>
                  <p className="font-semibold text-slate-700 mt-1 whitespace-pre-wrap">{selected.diagnosis || selected.clinicalNotes || 'Chưa có ghi chú'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
