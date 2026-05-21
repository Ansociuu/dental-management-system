import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPatientById, getPatients } from '../../services/patientService';
import { getAppointments } from '../../services/appointmentService';

const PatientRecord = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('id');

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom states for clinic data to make the UI active
  const [clinicalExam, setClinicalExam] = useState({
    diagnosis: 'Sâu răng mặt nhai R36, viêm tủy không hồi phục.',
    treatment: ['Chụp X-quang quanh chóp R36.', 'Lấy tủy toàn bộ R36.', 'Kê đơn: Amoxicillin 500mg, Paracetamol 500mg.'],
    notes: 'Răng 36 đau khi gõ, nhạy cảm nhiệt độ cao.'
  });

  const [treatmentPlan, setTreatmentPlan] = useState([
    { date: '15/10/2023', service: 'Chữa tủy răng hàm nhỏ', tooth: '36', qty: 1, price: 1500000, status: 'Đang điều trị' },
    { date: '15/10/2023', service: 'Chụp X-quang quanh chóp', tooth: '36', qty: 1, price: 1500000, status: 'Hoàn thành' }
  ]);

  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  // New Visit form state
  const [visitForm, setVisitForm] = useState({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    diagnosis: '',
    treatment: '',
    recallDate: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        if (patientId) {
          const patientRes = await getPatientById(patientId);
          setPatient(patientRes.data);

          // Get appointments history for this patient
          const appointmentsRes = await getAppointments();
          const filtered = (appointmentsRes.data || []).filter(
            apt => apt.patient && apt.patient._id === patientId
          );
          setAppointments(filtered);
        } else {
          // If no ID is specified, load all patients so the user can select one
          const patientsRes = await getPatients();
          setAllPatients(patientsRes.data || []);
          if (patientsRes.data && patientsRes.data.length > 0) {
            // Auto redirect to the first patient for convenience
            navigate(`/admin/records?id=${patientsRes.data[0]._id}`, { replace: true });
          }
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông tin bệnh án');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleAddVisit = (e) => {
    e.preventDefault();
    setClinicalExam({
      diagnosis: visitForm.diagnosis || 'Chưa có chẩn đoán',
      treatment: visitForm.treatment ? visitForm.treatment.split('\n') : ['Không chỉ định'],
      notes: visitForm.reason || 'Đến khám thường quy'
    });
    
    // Add to treatment plan mock for dynamic feel
    if (visitForm.reason) {
      setTreatmentPlan([
        {
          date: new Date(visitForm.date).toLocaleDateString('vi-VN'),
          service: visitForm.reason,
          tooth: 'Hàm',
          qty: 1,
          price: 500000,
          status: 'Hoàn thành'
        },
        ...treatmentPlan
      ]);
    }

    setIsAddVisitModalOpen(false);
    setVisitForm({
      date: new Date().toISOString().split('T')[0],
      reason: '',
      diagnosis: '',
      treatment: '',
      recallDate: ''
    });
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span onClick={() => navigate('/admin/customers')} className="hover:text-[var(--color-primary)] cursor-pointer transition-colors font-semibold">Bệnh nhân</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-gray-900 font-semibold">Hồ sơ bệnh án</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hồ sơ bệnh án</h1>
            <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-[var(--color-primary)] border border-blue-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">{patient.patientCode}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            In hồ sơ
          </button>
          <button 
            onClick={() => setIsAddVisitModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[var(--color-primary)] px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-blue-100 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Thêm lần khám
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-1">
          {/* Patient Info Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-[100px] -z-10 opacity-70"></div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-[var(--color-primary)] rounded-2xl shadow-inner flex items-center justify-center text-2xl font-black border border-blue-50">
                {patient.fullName.split(' ').pop().substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{patient.fullName}</h3>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1.5 font-medium bg-green-50 px-2 py-0.5 rounded-md inline-flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Đang hoạt động
                </div>
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
                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{patient.address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">history</span>
              Lịch sử các ca hẹn
            </h3>
            
            {appointments.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium text-center py-4">Chưa có lịch sử cuộc hẹn nào trên hệ thống.</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                {appointments.map((apt, index) => (
                  <div key={apt._id} className="relative group cursor-pointer">
                    <div className="absolute w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -left-[33px] top-1 border-4 border-white shadow-md"></div>
                    <div className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-2xl p-4 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-blue-700">{new Date(apt.date).toLocaleDateString('vi-VN')}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded text-blue-600 border border-blue-50 shadow-sm">{apt.status}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{apt.service ? apt.service.name : 'Khám tổng quát'}</p>
                      <p className="text-xs text-slate-500 mt-1">Bác sĩ: {apt.doctor ? apt.doctor.fullName : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dental Chart */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">dentistry</span>
                Sơ đồ răng (FDI)
              </h3>
            </div>
            
            <div className="bg-[#f8fafc] rounded-3xl p-8 mb-6 overflow-x-auto border border-slate-100 shadow-inner">
              <div className="flex flex-col items-center gap-10 min-w-[650px]">
                {/* Upper Teeth */}
                <div className="flex gap-6 border-b-[3px] border-slate-200 pb-8 w-full justify-center relative">
                  <div className="absolute -bottom-3 bg-[#f8fafc] px-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Hàm Trên</div>
                  <div className="flex gap-2 border-r-[3px] border-slate-200 pr-6">
                    {[18, 17, 16, 15, 14, 13, 12, 11].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                        <div className={`w-9 h-12 rounded-xl border-2 transition-all group-hover:-translate-y-1 group-hover:shadow-md ${
                          num === 16 ? 'border-green-400 bg-green-100 shadow-[0_0_15px_rgba(74,222,128,0.3)]' :
                          num === 14 ? 'border-blue-400 bg-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.3)]' :
                          'border-slate-200 bg-white'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pl-6">
                    {[21, 22, 23, 24, 25, 26, 27, 28].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                        <div className={`w-9 h-12 rounded-xl border-2 transition-all group-hover:-translate-y-1 group-hover:shadow-md ${
                          num === 26 ? 'border-purple-400 bg-purple-100 shadow-[0_0_15px_rgba(192,132,252,0.3)]' :
                          'border-slate-200 bg-white'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lower Teeth */}
                <div className="flex gap-6 pt-6 w-full justify-center relative">
                  <div className="absolute -top-3 bg-[#f8fafc] px-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Hàm Dưới</div>
                  <div className="flex gap-2 border-r-[3px] border-slate-200 pr-6">
                    {[48, 47, 46, 45, 44, 43, 42, 41].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-12 bg-white border-2 border-slate-200 rounded-xl transition-all group-hover:translate-y-1 group-hover:shadow-md"></div>
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pl-6">
                    {[31, 32, 33, 34, 35, 36, 37, 38].map(num => (
                      <div key={num} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className={`w-9 h-12 rounded-xl border-2 transition-all group-hover:translate-y-1 group-hover:shadow-md ${
                          num === 36 ? 'border-red-400 bg-red-100 shadow-[0_0_15px_rgba(248,113,113,0.3)]' :
                          'border-slate-200 bg-white'
                        }`}></div>
                        <span className="text-[11px] text-slate-500 font-bold group-hover:text-primary transition-colors">{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-600 bg-white px-6 py-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>Khỏe mạnh</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>Sâu răng</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-blue-500"></div>Đã trám</div>
              <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-purple-500"></div>Chữa tủy</div>
            </div>
          </div>

          {/* Clinical Exam */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 p-2.5 rounded-xl shadow-inner border border-indigo-100">
                <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Khám lâm sàng</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Chẩn đoán hiện tại
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 min-h-[120px] border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">
                  {clinicalExam.diagnosis}
                </div>
              </div>
              <div className="row-span-2 space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Chỉ định điều trị
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 h-full min-h-[120px] border border-slate-100 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-sm leading-relaxed">
                  <ul className="list-disc pl-4 space-y-2">
                    {clinicalExam.treatment.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Ghi chú lâm sàng
                </p>
                <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 min-h-[100px] border border-slate-100 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-sm">
                  {clinicalExam.notes}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Plan Section */}
      <div className="mt-8 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 p-2.5 rounded-xl shadow-inner border border-emerald-100">
              <span className="material-symbols-outlined text-[24px]">medical_services</span>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">Kế hoạch điều trị mẫu</h3>
          </div>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày lập</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dịch vụ / Điều trị</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Răng</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">SL</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Thành tiền</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {treatmentPlan.map((plan, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">{plan.date}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold group-hover:text-primary transition-colors">{plan.service}</td>
                    <td className="px-6 py-4 text-slate-600 text-center font-medium">{plan.tooth}</td>
                    <td className="px-6 py-4 text-slate-900 text-center font-bold">{plan.qty}</td>
                    <td className="px-6 py-4 text-slate-900 text-right font-black">{formatPrice(plan.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm border ${
                        plan.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Visit Modal */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-lg font-extrabold text-slate-800">Thêm Lần Khám Mới</h2>
              <button onClick={() => setIsAddVisitModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddVisit} className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Ngày khám <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={visitForm.date}
                    onChange={e => setVisitForm({...visitForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Lý do đến khám <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={visitForm.reason}
                  onChange={e => setVisitForm({...visitForm, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="VD: Đau nhức răng hàm dưới bên trái" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chẩn đoán lâm sàng</label>
                <textarea 
                  rows="3" 
                  value={visitForm.diagnosis}
                  onChange={e => setVisitForm({...visitForm, diagnosis: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" 
                  placeholder="Nhập tình trạng quan sát được..."
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Chỉ định điều trị (mỗi dòng một chỉ định)</label>
                <textarea 
                  rows="3" 
                  value={visitForm.treatment}
                  onChange={e => setVisitForm({...visitForm, treatment: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" 
                  placeholder="VD: Chụp X-quang răng hàm&#10;Lấy cao răng"
                ></textarea>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 sticky bottom-0 z-10">
                <button type="button" onClick={() => setIsAddVisitModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Lưu hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecord;
