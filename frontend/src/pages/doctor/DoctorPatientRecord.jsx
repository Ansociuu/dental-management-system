import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPatientById, getPatients } from '../../services/patientService';
import { getAppointments } from '../../services/appointmentService';

const DoctorPatientRecord = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('id');

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dental Chart State
  const [dentalChart, setDentalChart] = useState({});

  useEffect(() => {
    const loadPatientsList = async () => {
      try {
        const patientsRes = await getPatients();
        setAllPatients(patientsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadPatientsList();
  }, []);

  useEffect(() => {
    if (!patientId) {
      setPatient(null);
      setAppointments([]);
      setDentalChart({});
      return;
    }

    const loadPatientDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const patientRes = await getPatientById(patientId);
        setPatient(patientRes.data);

        // Lấy lịch sử ca khám
        const appointmentsRes = await getAppointments();
        const filtered = (appointmentsRes.data || []).filter(
          apt => apt.patientId && apt.patientId._id === patientId && apt.status === 'COMPLETED'
        );
        setAppointments(filtered);

        // Tổng hợp sơ đồ răng FDI lũy kế qua các lần khám
        const combinedChart = {};
        filtered.forEach(apt => {
          if (apt.dentalChart) {
            Object.entries(apt.dentalChart).forEach(([toothNum, info]) => {
              combinedChart[toothNum] = info; // Ghi đè trạng thái mới nhất của răng
            });
          }
        });
        setDentalChart(combinedChart);

      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông tin bệnh án');
      } finally {
        setLoading(false);
      }
    };

    loadPatientDetails();
  }, [patientId]);

  const calculateAge = (dobString) => {
    if (!dobString) return '—';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  const getToothColorClass = (condition) => {
    switch (condition) {
      case 'DECAYED':
        return 'border-rose-400 bg-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
      case 'FILLED':
        return 'border-blue-400 bg-blue-100 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
      case 'RCT':
        return 'border-purple-400 bg-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'MISSING':
        return 'border-slate-400 bg-slate-200 border-dashed opacity-50';
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

  // Filter patients list based on search term
  const filteredPatientsList = allPatients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(term) ||
      p.phone?.includes(term) ||
      p.patientCode?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Left side list: Search Patient */}
      <aside className="w-[340px] bg-white border-r border-slate-200/60 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-teal-600">manage_search</span>
            Tra Cứu Bệnh Nhân
          </h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Nhập tên, SĐT hoặc mã số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredPatientsList.length === 0 ? (
            <p className="text-slate-400 text-xs font-bold text-center py-8">Không tìm thấy bệnh nhân nào.</p>
          ) : (
            filteredPatientsList.map(p => (
              <button
                key={p._id}
                onClick={() => navigate(`/doctor/records?id=${p._id}`)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  patientId === p._id
                    ? 'bg-teal-50/60 border-teal-200 text-teal-900 shadow-sm'
                    : 'bg-white border-slate-100 hover:bg-slate-50/50 hover:border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-900 truncate text-sm">{p.fullName}</h4>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    patientId === p._id ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.patientCode}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-semibold text-slate-500">
                  <span>SĐT: {p.phone}</span>
                  <span>{p.gender} • {calculateAge(p.dob)} tuổi</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right side content: Patient medical record details */}
      <section className="flex-1 overflow-y-auto p-8 bg-slate-50 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin block mx-auto mb-4"></span>
              <p className="text-slate-500 font-bold text-sm">Đang tải hồ sơ bệnh án chi tiết...</p>
            </div>
          </div>
        ) : !patient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[72px] text-teal-200/80 mb-4">clinical_notes</span>
            <h3 className="text-xl font-bold text-slate-700 mb-1">Chưa Chọn Bệnh Nhân</h3>
            <p className="text-slate-400 text-sm max-w-sm">Chọn một bệnh nhân từ danh sách bên trái hoặc sử dụng bộ lọc tìm kiếm để bắt đầu xem bệnh án.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Patient Header Bio */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-bl-[120px] -z-10 opacity-70"></div>
              
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-teal-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-teal-500/10">
                  {patient.fullName?.split(' ').pop().substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-slate-900">{patient.fullName}</h2>
                    <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{patient.patientCode}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-2 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span> {patient.gender} • {calculateAge(patient.dob)} tuổi</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span> {patient.phone}</span>
                    {patient.address && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {patient.address}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Dental Chart */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">dentistry</span>
                Sơ đồ răng FDI (Tổng Hợp Quá Trình Điều Trị)
              </h3>
              
              <div className="bg-slate-50 rounded-2xl p-8 mb-6 overflow-x-auto border border-slate-100 shadow-inner">
                <div className="flex flex-col items-center gap-10 min-w-[700px]">
                  {/* Upper Teeth */}
                  <div className="flex gap-6 border-b-2 border-slate-200 pb-8 w-full justify-center relative">
                    <div className="absolute -bottom-3 bg-slate-50 px-4 text-slate-400 font-bold text-[10px] tracking-widest uppercase">Hàm Trên</div>
                    <div className="flex gap-2 border-r-2 border-slate-200 pr-6">
                      {[18, 17, 16, 15, 14, 13, 12, 11].map(num => {
                        const toothInfo = dentalChart[num.toString()] || {};
                        return (
                          <div key={num} className="flex flex-col items-center gap-3">
                            <span className="text-[11px] text-slate-500 font-bold">{num}</span>
                            <div 
                              className={`w-9 h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black text-slate-700 ${getToothColorClass(toothInfo.condition)}`}
                              title={`${num}: ${getConditionLabel(toothInfo.condition)} ${toothInfo.notes ? `(${toothInfo.notes})` : ''}`}
                            >
                              {toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 pl-6">
                      {[21, 22, 23, 24, 25, 26, 27, 28].map(num => {
                        const toothInfo = dentalChart[num.toString()] || {};
                        return (
                          <div key={num} className="flex flex-col items-center gap-3">
                            <span className="text-[11px] text-slate-500 font-bold">{num}</span>
                            <div 
                              className={`w-9 h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black text-slate-700 ${getToothColorClass(toothInfo.condition)}`}
                              title={`${num}: ${getConditionLabel(toothInfo.condition)} ${toothInfo.notes ? `(${toothInfo.notes})` : ''}`}
                            >
                              {toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lower Teeth */}
                  <div className="flex gap-6 pt-6 w-full justify-center relative">
                    <div className="absolute -top-3 bg-slate-50 px-4 text-slate-400 font-bold text-[10px] tracking-widest uppercase">Hàm Dưới</div>
                    <div className="flex gap-2 border-r-2 border-slate-200 pr-6">
                      {[48, 47, 46, 45, 44, 43, 42, 41].map(num => {
                        const toothInfo = dentalChart[num.toString()] || {};
                        return (
                          <div key={num} className="flex flex-col items-center gap-3">
                            <div 
                              className={`w-9 h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black text-slate-700 ${getToothColorClass(toothInfo.condition)}`}
                              title={`${num}: ${getConditionLabel(toothInfo.condition)} ${toothInfo.notes ? `(${toothInfo.notes})` : ''}`}
                            >
                              {toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold">{num}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 pl-6">
                      {[31, 32, 33, 34, 35, 36, 37, 38].map(num => {
                        const toothInfo = dentalChart[num.toString()] || {};
                        return (
                          <div key={num} className="flex flex-col items-center gap-3">
                            <div 
                              className={`w-9 h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-black text-slate-700 ${getToothColorClass(toothInfo.condition)}`}
                              title={`${num}: ${getConditionLabel(toothInfo.condition)} ${toothInfo.notes ? `(${toothInfo.notes})` : ''}`}
                            >
                              {toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}
                            </div>
                            <span className="text-[11px] text-slate-500 font-bold">{num}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* FDI Legends */}
              <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-slate-600 bg-white px-6 py-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-lg border border-slate-200 bg-white"></div>Khỏe mạnh (H)</div>
                <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-lg bg-rose-500"></div>Sâu răng (D)</div>
                <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-lg bg-blue-500"></div>Đã trám (F)</div>
                <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-lg bg-purple-500"></div>Chữa tủy (R)</div>
                <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-lg bg-slate-400"></div>Mất răng (M)</div>
              </div>
            </div>

            {/* Visit Timeline History */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-800 mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">history</span>
                Nhật Ký Các Ca Điều Trị ({appointments.length} lần khám)
              </h3>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">clinical_notes</span>
                  <p className="text-slate-400 font-bold text-sm">Chưa có nhật ký ca khám lâm sàng hoàn tất nào.</p>
                </div>
              ) : (
                <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full -left-[42px] top-1 border-[4px] border-white shadow-md"></div>
                      
                      <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-3xl p-6 md:p-8 transition-colors shadow-sm space-y-6">
                        {/* Header visit */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/60 pb-4 gap-2">
                          <div>
                            <p className="text-sm font-black text-teal-700">{new Date(apt.date).toLocaleDateString('vi-VN')} • Ca {apt.shiftId?.name || '—'}</p>
                            <p className="text-xs text-slate-500 mt-1 font-semibold">Bác sĩ phụ trách: {apt.doctorId?.fullName || '—'}</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg uppercase tracking-wider">Hoàn tất</span>
                        </div>

                        {/* Visit Diagnosis & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Chẩn đoán chuyên khoa</h4>
                            <p className="text-sm text-slate-800 font-bold bg-white p-4 rounded-2xl border border-slate-100 shadow-inner min-h-[70px]">{apt.diagnosis || 'Không có ghi nhận chẩn đoán.'}</p>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Ghi chú điều trị / Lâm sàng</h4>
                            <p className="text-sm text-slate-700 font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-inner min-h-[70px]">{apt.clinicalNotes || 'Không có ghi nhận ghi chú.'}</p>
                          </div>
                        </div>

                        {/* Visit Treatments/Services */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Dịch vụ & Thủ thuật thực hiện</h4>
                          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                                <tr>
                                  <th className="px-5 py-3">Tên dịch vụ</th>
                                  <th className="px-5 py-3 text-center">Số lượng</th>
                                  <th className="px-5 py-3 text-right">Giá thực tế</th>
                                  <th className="px-5 py-3 text-right">Tổng cộng</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {apt.servicesPerformed && apt.servicesPerformed.length > 0 ? (
                                  apt.servicesPerformed.map((serv, sIdx) => (
                                    <tr key={sIdx}>
                                      <td className="px-5 py-3 font-bold text-slate-800">{serv.serviceId?.name || 'Thủ thuật nha khoa'}</td>
                                      <td className="px-5 py-3 text-center font-bold text-slate-900">{serv.quantity || 1}</td>
                                      <td className="px-5 py-3 text-right font-semibold text-slate-600">{formatPrice(serv.priceAtAppointment || 0)}</td>
                                      <td className="px-5 py-3 text-right font-black text-slate-950">{formatPrice((serv.priceAtAppointment || 0) * (serv.quantity || 1))}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td className="px-5 py-3 font-bold text-slate-800">{apt.serviceId?.name || 'Khám cơ bản'}</td>
                                    <td className="px-5 py-3 text-center font-bold text-slate-900">1</td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-600">{formatPrice(apt.serviceId?.price || 0)}</td>
                                    <td className="px-5 py-3 text-right font-black text-slate-950">{formatPrice(apt.serviceId?.price || 0)}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Visit Prescriptions */}
                        {apt.prescription && apt.prescription.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex justify-between items-center">
                              <span>Đơn thuốc đã kê</span>
                              <button
                                onClick={() => {
                                  const text = apt.prescription.map(m => `- ${m.medicineName} (SL: ${m.qty}): ${m.dosage || ''} • ${m.frequency || ''} (dùng ${m.duration || ''})`).join('\n');
                                  navigator.clipboard.writeText(text);
                                  alert('Đã copy thông tin đơn thuốc!');
                                }}
                                className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-100 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                Sao chép đơn thuốc
                              </button>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {apt.prescription.map((m, mIdx) => (
                                <div key={mIdx} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner mt-0.5">
                                    <span className="material-symbols-outlined text-[18px]">pill</span>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-800">{m.medicineName} <span className="text-slate-400 font-medium ml-1">x {m.qty} viên</span></h5>
                                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">Cách dùng: {m.frequency || '—'} {m.dosage ? `(${m.dosage})` : ''}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Thời gian uống: {m.duration || '—'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visit X-Rays */}
                        {apt.teethImages && apt.teethImages.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Hình ảnh X-Quang & Chẩn đoán lâm sàng</h4>
                            <div className="flex flex-wrap gap-4">
                              {apt.teethImages.map((img, iIdx) => (
                                <a key={iIdx} href={img} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-2xl border border-slate-200 shadow-sm max-w-[200px]">
                                  <img src={img} alt="Teeth/X-Ray detail" className="h-32 w-auto object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">open_in_new</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorPatientRecord;
