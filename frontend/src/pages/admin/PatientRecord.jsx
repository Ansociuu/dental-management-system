import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAppointments } from '../../services/appointmentService';
import { getPatientById, getPatients } from '../../services/patientService';

const upperLeft = [18, 17, 16, 15, 14, 13, 12, 11];
const upperRight = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerRight = [31, 32, 33, 34, 35, 36, 37, 38];

const PatientRecord = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('id');

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!patientId) {
          const patientsRes = await getPatients();
          const firstPatient = patientsRes.data?.[0];
          if (firstPatient?._id) {
            navigate(`/admin/records?id=${firstPatient._id}`, { replace: true });
          } else {
            setPatient(null);
            setAppointments([]);
          }
          return;
        }

        const [patientRes, appointmentsRes] = await Promise.all([
          getPatientById(patientId),
          getAppointments({ patientId })
        ]);

        const patientAppointments = (appointmentsRes.data || [])
          .filter((appointment) => {
            const id = appointment.patientId?._id || appointment.patientId || appointment.patient?._id || appointment.patient;
            return id === patientId;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setPatient(patientRes.data);
        setAppointments(patientAppointments);
      } catch (err) {
        setError(err.message || 'Không thể tải hồ sơ bệnh án');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, navigate]);

  const completedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'COMPLETED'),
    [appointments]
  );

  const latestClinicalAppointment = useMemo(() => {
    return completedAppointments.find((appointment) =>
      appointment.diagnosis ||
      appointment.clinicalNotes ||
      appointment.servicesPerformed?.length ||
      appointment.prescription?.length ||
      appointment.dentalChart
    ) || completedAppointments[0];
  }, [completedAppointments]);

  const dentalChart = useMemo(() => {
    return completedAppointments.reduce((chart, appointment) => {
      if (!appointment.dentalChart) return chart;
      Object.entries(appointment.dentalChart).forEach(([toothNumber, info]) => {
        chart[toothNumber] = info;
      });
      return chart;
    }, {});
  }, [completedAppointments]);

  const treatmentRows = useMemo(() => {
    return completedAppointments.flatMap((appointment) => {
      const performed = appointment.servicesPerformed?.length
        ? appointment.servicesPerformed
        : appointment.serviceId
          ? [{ serviceId: appointment.serviceId, quantity: 1, priceAtAppointment: appointment.serviceId.price }]
          : [];

      return performed.map((item, index) => {
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.priceAtAppointment ?? item.serviceId?.price) || 0;

        return {
          id: `${appointment._id}-${item.serviceId?._id || item.serviceId || index}`,
          date: appointment.date,
          serviceName: item.serviceId?.name || 'Dịch vụ nha khoa',
          doctorName: appointment.doctorId?.fullName || appointment.doctor?.fullName || '-',
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      });
    });
  }, [completedAppointments]);

  const calculateAge = (dobString) => {
    if (!dobString) return '-';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatPrice = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const getToothColorClass = (condition) => {
    switch (condition) {
      case 'DECAYED':
        return 'border-red-400 bg-red-100 shadow-[0_0_15px_rgba(248,113,113,0.3)]';
      case 'FILLED':
        return 'border-blue-400 bg-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.3)]';
      case 'RCT':
        return 'border-purple-400 bg-purple-100 shadow-[0_0_15px_rgba(192,132,252,0.3)]';
      case 'MISSING':
        return 'border-slate-400 bg-slate-200 border-dashed opacity-60';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'DECAYED': return 'Sâu răng';
      case 'FILLED': return 'Đã trám';
      case 'RCT': return 'Chữa tủy';
      case 'MISSING': return 'Mất răng';
      default: return 'Khỏe mạnh';
    }
  };

  const renderToothGroup = (numbers, lower = false) => (
    <div className="flex gap-2">
      {numbers.map((number) => {
        const info = dentalChart[number.toString()] || {};
        return (
          <div key={number} className="flex flex-col items-center gap-3 group">
            {!lower && <span className="text-[11px] text-slate-500 font-bold">{number}</span>}
            <div
              className={`w-9 h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black text-slate-700 ${getToothColorClass(info.condition)}`}
              title={`${number}: ${getConditionLabel(info.condition)}${info.notes ? ` - ${info.notes}` : ''}`}
            >
              {info.condition ? info.condition.substring(0, 1) : ''}
            </div>
            {lower && <span className="text-[11px] text-slate-500 font-bold">{number}</span>}
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <span className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin block mx-auto mb-4"></span>
          <p className="text-slate-500 font-bold text-sm">Đang tải hồ sơ bệnh án...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex-1 p-8 bg-slate-50 flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">person_search</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy bệnh nhân</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'Vui lòng chọn một bệnh nhân từ danh sách để xem hồ sơ.'}</p>
        <button
          onClick={() => navigate('/admin/customers')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
        >
          Đến danh sách khách hàng
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span onClick={() => navigate('/admin/customers')} className="hover:text-[var(--color-primary)] cursor-pointer transition-colors font-semibold">Bệnh nhân</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-gray-900 font-semibold">Hồ sơ bệnh án</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ bệnh án</h1>
            <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-[var(--color-primary)] border border-blue-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              {patient.patientCode}
            </span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
          In hồ sơ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-[100px] -z-10 opacity-70"></div>

            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-[var(--color-primary)] rounded-2xl shadow-inner flex items-center justify-center text-2xl font-black border border-blue-50">
                {patient.fullName?.split(' ').pop()?.substring(0, 2).toUpperCase() || 'BN'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{patient.fullName}</h3>
                <p className="text-xs text-slate-500 mt-1.5 font-bold">{patient.patientCode}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Họ và tên</p>
                <p className="text-sm font-bold text-gray-900">{patient.fullName}</p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Giới tính / Tuổi</p>
                <p className="text-sm font-bold text-gray-900">{patient.gender} • {calculateAge(patient.dob)} tuổi</p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Số điện thoại</p>
                <p className="text-sm font-bold text-gray-900">{patient.phone}</p>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <p className="text-sm text-gray-500 font-medium">Địa chỉ</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{patient.address || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">history</span>
              Lịch sử các ca hẹn
            </h3>

            {appointments.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium text-center py-4">Chưa có lịch sử cuộc hẹn nào trên hệ thống.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="relative">
                    <div className="absolute w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -left-[33px] top-1 border-4 border-white shadow-md"></div>
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <p className="text-xs font-bold text-blue-700">{formatDate(appointment.date)}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded text-blue-600 border border-blue-50 shadow-sm">
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{appointment.serviceId?.name || 'Khám tổng quát'}</p>
                      <p className="text-xs text-slate-500 mt-1">Bác sĩ: {appointment.doctorId?.fullName || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-[var(--color-primary)]">dentistry</span>
              Sơ đồ răng FDI
            </h3>

            <div className="bg-[#f8fafc] rounded-3xl p-8 mb-6 overflow-x-auto border border-slate-100 shadow-inner">
              <div className="flex flex-col items-center gap-10 min-w-[650px]">
                <div className="flex gap-6 border-b-[3px] border-slate-200 pb-8 w-full justify-center relative">
                  <div className="absolute -bottom-3 bg-[#f8fafc] px-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Hàm trên</div>
                  <div className="border-r-[3px] border-slate-200 pr-6">{renderToothGroup(upperLeft)}</div>
                  <div className="pl-6">{renderToothGroup(upperRight)}</div>
                </div>

                <div className="flex gap-6 pt-6 w-full justify-center relative">
                  <div className="absolute -top-3 bg-[#f8fafc] px-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Hàm dưới</div>
                  <div className="border-r-[3px] border-slate-200 pr-6">{renderToothGroup(lowerLeft, true)}</div>
                  <div className="pl-6">{renderToothGroup(lowerRight, true)}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-600 bg-white px-6 py-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-200"></div>Khỏe mạnh</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>Sâu răng</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-blue-500"></div>Đã trám</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-purple-500"></div>Chữa tủy</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-slate-400"></div>Mất răng</div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">clinical_notes</span>
              Kết quả khám lâm sàng mới nhất
            </h3>

            {!latestClinicalAppointment ? (
              <div className="text-center py-10 text-slate-400 font-bold text-sm">Chưa có ca khám hoàn tất nào có dữ liệu lâm sàng.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700">Chẩn đoán</p>
                  <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 min-h-[120px] border border-slate-100">
                    {latestClinicalAppointment.diagnosis || 'Chưa có chẩn đoán.'}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700">Ghi chú lâm sàng</p>
                  <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 min-h-[120px] border border-slate-100">
                    {latestClinicalAppointment.clinicalNotes || 'Chưa có ghi chú.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">medical_services</span>
          Dịch vụ đã thực hiện
        </h3>

        <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày khám</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dịch vụ / Điều trị</th>
                  <th className="px-6 py-4 whitespace-nowrap">Bác sĩ</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">SL</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Đơn giá</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {treatmentRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{row.serviceName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{row.doctorName}</td>
                    <td className="px-6 py-4 text-slate-900 text-center font-bold">{row.quantity}</td>
                    <td className="px-6 py-4 text-slate-700 text-right font-semibold">{formatPrice(row.unitPrice)}</td>
                    <td className="px-6 py-4 text-slate-900 text-right font-black">{formatPrice(row.total)}</td>
                  </tr>
                ))}
                {treatmentRows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-bold">
                      Chưa có dịch vụ điều trị đã hoàn tất.
                    </td>
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

export default PatientRecord;
