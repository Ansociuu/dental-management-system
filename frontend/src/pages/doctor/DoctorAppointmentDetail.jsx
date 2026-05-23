import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentById, examineAppointment } from '../../services/appointmentService';
import { getServices } from '../../services/serviceService';

const DoctorAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [servicesPerformed, setServicesPerformed] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [teethImages, setTeethImages] = useState([]);
  const [dentalChart, setDentalChart] = useState({});

  // Active tooth being configured in the modal
  const [activeTooth, setActiveTooth] = useState(null);
  const [activeToothData, setActiveToothData] = useState({ condition: 'HEALTHY', notes: '' });
  const [isToothModalOpen, setIsToothModalOpen] = useState(false);

  // Selector for new service adding
  const [selectedServiceId, setSelectedServiceId] = useState('');

  useEffect(() => {
    const loadDetailData = async () => {
      try {
        setLoading(true);
        setError('');
        const [aptRes, servicesRes] = await Promise.all([
          getAppointmentById(id),
          getServices()
        ]);

        const apt = aptRes.data;
        setAppointment(apt);
        setServices(servicesRes.data || []);

        // Populate existing data if available
        setDiagnosis(apt.diagnosis || '');
        setClinicalNotes(apt.clinicalNotes || '');
        setTeethImages(apt.teethImages || []);
        
        // Convert Mongoose Map to plain object for React state
        if (apt.dentalChart) {
          const chartObj = {};
          Object.entries(apt.dentalChart).forEach(([key, val]) => {
            chartObj[key] = val;
          });
          setDentalChart(chartObj);
        } else {
          setDentalChart({});
        }

        // Services Performed
        if (apt.servicesPerformed && apt.servicesPerformed.length > 0) {
          setServicesPerformed(apt.servicesPerformed.map(item => ({
            serviceId: item.serviceId?._id || item.serviceId,
            name: item.serviceId?.name || 'Dịch vụ',
            priceAtAppointment: item.priceAtAppointment || 0,
            quantity: item.quantity || 1
          })));
        } else {
          // Default: Add the initial booked service to the performed list
          setServicesPerformed([{
            serviceId: apt.serviceId?._id,
            name: apt.serviceId?.name,
            priceAtAppointment: apt.serviceId?.price || 0,
            quantity: 1
          }]);
        }

        // Prescription
        if (apt.prescription && apt.prescription.length > 0) {
          setPrescription(apt.prescription);
        }

      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông tin chi tiết ca khám.');
      } finally {
        setLoading(false);
      }
    };

    loadDetailData();
  }, [id]);

  const handleOpenToothModal = (toothNum) => {
    setActiveTooth(toothNum);
    const existing = dentalChart[toothNum.toString()] || { condition: 'HEALTHY', notes: '' };
    setActiveToothData(existing);
    setIsToothModalOpen(true);
  };

  const handleSaveTooth = () => {
    setDentalChart({
      ...dentalChart,
      [activeTooth.toString()]: activeToothData
    });
    setIsToothModalOpen(false);
    setActiveTooth(null);
  };

  const handleAddService = () => {
    if (!selectedServiceId) return;
    const serv = services.find(s => s._id === selectedServiceId);
    if (!serv) return;

    // Check duplicate
    if (servicesPerformed.some(s => s.serviceId === serv._id)) {
      alert('Dịch vụ này đã được thêm vào danh sách.');
      return;
    }

    setServicesPerformed([
      ...servicesPerformed,
      {
        serviceId: serv._id,
        name: serv.name,
        priceAtAppointment: serv.price,
        quantity: 1
      }
    ]);
    setSelectedServiceId('');
  };

  const handleRemoveService = (index) => {
    setServicesPerformed(servicesPerformed.filter((_, idx) => idx !== index));
  };

  const handleUpdateServiceQty = (index, qty) => {
    const updated = [...servicesPerformed];
    updated[index].quantity = Math.max(1, qty);
    setServicesPerformed(updated);
  };

  const handleUpdateServicePrice = (index, price) => {
    const updated = [...servicesPerformed];
    updated[index].priceAtAppointment = Math.max(0, price);
    setServicesPerformed(updated);
  };

  const handleAddMedicine = () => {
    setPrescription([
      ...prescription,
      { medicineName: '', dosage: '', qty: 10, frequency: 'Sáng 1 viên, tối 1 viên sau ăn', duration: '5 ngày' }
    ]);
  };

  const handleUpdateMedicine = (index, field, val) => {
    const updated = [...prescription];
    updated[index][field] = val;
    setPrescription(updated);
  };

  const handleRemoveMedicine = (index) => {
    setPrescription(prescription.filter((_, idx) => idx !== index));
  };

  const handleAddSampleXray = () => {
    // Thêm ảnh X-quang răng mẫu để làm phong phú dữ liệu demo
    const mockUrls = [
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80'
    ];
    const nextImg = teethImages.length % 2 === 0 ? mockUrls[0] : mockUrls[1];
    setTeethImages([...teethImages, nextImg]);
  };

  const handleRemoveXray = (idx) => {
    setTeethImages(teethImages.filter((_, i) => i !== idx));
  };

  const handleSubmitExamine = async () => {
    if (!diagnosis.trim()) {
      alert('Vui lòng nhập chẩn đoán bệnh lý lâm sàng trước khi hoàn tất.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const submitData = {
        diagnosis,
        clinicalNotes,
        servicesPerformed: servicesPerformed.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          priceAtAppointment: s.priceAtAppointment
        })),
        prescription,
        teethImages,
        dentalChart
      };

      await examineAppointment(id, submitData);
      alert('Khám bệnh & lưu hồ sơ bệnh án thành công!');
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message || 'Không thể lưu thông tin khám bệnh.');
    } finally {
      setSubmitting(false);
    }
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

  const getToothColorClass = (condition) => {
    switch (condition) {
      case 'DECAYED': return 'border-rose-400 bg-rose-100 text-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.35)]';
      case 'FILLED': return 'border-blue-400 bg-blue-100 text-blue-700 shadow-[0_0_12px_rgba(59,130,246,0.35)]';
      case 'RCT': return 'border-purple-400 bg-purple-100 text-purple-700 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
      case 'MISSING': return 'border-slate-400 bg-slate-200 border-dashed opacity-50 text-slate-500';
      default: return 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300';
    }
  };

  const grandTotal = servicesPerformed.reduce((sum, s) => sum + (s.priceAtAppointment * s.quantity), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <span className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin block mx-auto mb-4"></span>
          <p className="text-slate-500 font-bold text-sm">Đang tải hồ sơ ca khám...</p>
        </div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="flex-1 p-8 bg-slate-50 flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-[64px] text-rose-300 mb-4">error</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={() => navigate('/doctor/dashboard')} className="px-6 py-2.5 bg-teal-500 text-slate-950 font-bold rounded-xl shadow-md transition-all hover:bg-teal-600">
          Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  const p = appointment.patientId || {};

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      {/* Header Bio */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-bold">
            <span onClick={() => navigate('/doctor/dashboard')} className="hover:text-teal-600 cursor-pointer transition-colors">Ca khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900">Chi tiết & Điều trị</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thực Hiện Khám & Điều Trị</h1>
            <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              STT: {appointment.queueNumber || '—'}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm border border-slate-200 transition-all hover:-translate-y-0.5"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmitExamine}
            disabled={submitting}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 px-6 py-2.5 rounded-xl font-black shadow-md shadow-teal-500/10 transition-all hover:-translate-y-0.5"
          >
            {submitting ? 'Đang hoàn tất...' : 'Hoàn tất & Gửi thanh toán'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Patient Bio Card & Interactive FDI Chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Patient Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-5 items-center relative overflow-hidden">
            <div className="w-14 h-14 bg-teal-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-xl shadow-md">
              {p.fullName ? p.fullName.split(' ').pop().substring(0, 2).toUpperCase() : 'BN'}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-slate-900">{p.fullName}</h3>
              <p className="text-xs text-slate-500 mt-1 font-bold">
                Mã BN: <span className="text-teal-600">{p.patientCode || 'MEC-PT-XXXX'}</span> • {p.gender} • {calculateAge(p.dob)} tuổi • SĐT: {p.phone}
              </p>
            </div>
            <div className="bg-amber-50 text-amber-700 border border-amber-100 rounded-xl px-4 py-2 text-center text-xs font-bold shadow-sm">
              <p className="text-[10px] text-amber-600/80 uppercase tracking-wider">Lý do khám</p>
              <p className="mt-0.5">{appointment.symptoms || 'Khám tổng quát'}</p>
            </div>
          </div>

          {/* Interactive FDI Dental Chart */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600">dentistry</span>
                  Sơ đồ răng tương tác FDI
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Bấm vào bất kỳ răng nào bên dưới để chẩn đoán & gán tình trạng bệnh lý.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-6 overflow-x-auto border border-slate-100 shadow-inner">
              <div className="flex flex-col items-center gap-8 min-w-[650px]">
                {/* Upper Teeth */}
                <div className="flex gap-4 border-b-2 border-slate-200 pb-6 w-full justify-center relative">
                  <div className="absolute -bottom-3 bg-slate-50 px-4 text-slate-400 font-bold text-[9px] tracking-widest uppercase">Hàm Trên</div>
                  <div className="flex gap-1.5 border-r-2 border-slate-200 pr-5">
                    {[18, 17, 16, 15, 14, 13, 12, 11].map(num => {
                      const toothInfo = dentalChart[num.toString()] || {};
                      return (
                        <button
                          key={num}
                          onClick={() => handleOpenToothModal(num)}
                          className={`w-9 h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-between py-1 group cursor-pointer ${getToothColorClass(toothInfo.condition)}`}
                        >
                          <span className="text-[8px] font-bold opacity-60">{num}</span>
                          <span className="text-[10px] font-black">{toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5 pl-5">
                    {[21, 22, 23, 24, 25, 26, 27, 28].map(num => {
                      const toothInfo = dentalChart[num.toString()] || {};
                      return (
                        <button
                          key={num}
                          onClick={() => handleOpenToothModal(num)}
                          className={`w-9 h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-between py-1 group cursor-pointer ${getToothColorClass(toothInfo.condition)}`}
                        >
                          <span className="text-[8px] font-bold opacity-60">{num}</span>
                          <span className="text-[10px] font-black">{toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Teeth */}
                <div className="flex gap-4 pt-6 w-full justify-center relative">
                  <div className="absolute -top-3 bg-slate-50 px-4 text-slate-400 font-bold text-[9px] tracking-widest uppercase">Hàm Dưới</div>
                  <div className="flex gap-1.5 border-r-2 border-slate-200 pr-5">
                    {[48, 47, 46, 45, 44, 43, 42, 41].map(num => {
                      const toothInfo = dentalChart[num.toString()] || {};
                      return (
                        <button
                          key={num}
                          onClick={() => handleOpenToothModal(num)}
                          className={`w-9 h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-between py-1 group cursor-pointer ${getToothColorClass(toothInfo.condition)}`}
                        >
                          <span className="text-[10px] font-black">{toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}</span>
                          <span className="text-[8px] font-bold opacity-60">{num}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5 pl-5">
                    {[31, 32, 33, 34, 35, 36, 37, 38].map(num => {
                      const toothInfo = dentalChart[num.toString()] || {};
                      return (
                        <button
                          key={num}
                          onClick={() => handleOpenToothModal(num)}
                          className={`w-9 h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-between py-1 group cursor-pointer ${getToothColorClass(toothInfo.condition)}`}
                        >
                          <span className="text-[10px] font-black">{toothInfo.condition ? toothInfo.condition.substring(0, 1) : ''}</span>
                          <span className="text-[8px] font-bold opacity-60">{num}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap justify-center gap-5 text-[10px] sm:text-xs font-bold text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-white border border-slate-200"></div>Khỏe mạnh</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500"></div>Sâu răng (D)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500"></div>Đã trám (F)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-purple-500"></div>Chữa tủy (R)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-400"></div>Mất răng (M)</div>
            </div>
          </div>

          {/* Diagnosis & Clinical Notes */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">stethoscope</span>
              Kết quả khám lâm sàng & Chẩn đoán
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  Chẩn đoán bệnh lý <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="VD: Sâu răng hàm R36 kèm viêm tủy cấp, khớp cắn hở..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl text-sm font-semibold transition-all focus:ring-2 focus:ring-teal-500/10 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Ghi chú điều trị / Lâm sàng cụ thể</label>
                <textarea
                  rows="4"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Ghi nhận triệu chứng, tiền sử dị ứng thuốc hoặc chi tiết thủ thuật thực hiện thêm..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white rounded-2xl text-sm font-medium transition-all focus:ring-2 focus:ring-teal-500/10 focus:outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Performed Services, Prescriptions, Images */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Performed Services Manager */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">medical_services</span>
              Thủ thuật & Dịch vụ thực hiện
            </h3>

            {/* Add Service Selector */}
            <div className="flex gap-2">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Chọn dịch vụ chỉ định --</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({formatPrice(s.price)})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddService}
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-all"
              >
                Thêm
              </button>
            </div>

            {/* List Services Performed */}
            <div className="space-y-3">
              {servicesPerformed.map((serv, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                  <p className="text-xs font-bold text-slate-900 pr-4">{serv.name}</p>
                  
                  <div className="flex items-center justify-between gap-4">
                    {/* Qty */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateServiceQty(idx, serv.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-800">{serv.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateServiceQty(idx, serv.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        value={serv.priceAtAppointment}
                        onChange={(e) => handleUpdateServicePrice(idx, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right font-bold text-slate-800 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Tạm tính tổng cộng</span>
              <span className="text-lg font-black text-teal-600">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Prescription Manager */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">pill</span>
                Đơn thuốc đi kèm
              </h3>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-xl shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm thuốc
              </button>
            </div>

            {prescription.length === 0 ? (
              <p className="text-slate-400 text-xs font-bold text-center py-6">Chưa kê thuốc nào cho ca này.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {prescription.map((med, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-inner space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={med.medicineName}
                          onChange={(e) => handleUpdateMedicine(idx, 'medicineName', e.target.value)}
                          placeholder="Tên thuốc (VD: Amoxicillin 500mg)"
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                          required
                        />
                        <input
                          type="number"
                          value={med.qty}
                          onChange={(e) => handleUpdateMedicine(idx, 'qty', parseInt(e.target.value) || 0)}
                          placeholder="SL"
                          className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-bold focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                          placeholder="Liều lượng (VD: 500mg)"
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold focus:outline-none"
                        />
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                          placeholder="Số ngày (VD: 5 ngày)"
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        placeholder="Tần suất (VD: Sáng 1 viên, tối 1 viên sau ăn)"
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dental X-rays Gallery */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-teal-600">image</span>
                Hình ảnh X-Quang nha khoa
              </h3>
              <button
                type="button"
                onClick={handleAddSampleXray}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-xl shadow-sm transition-all"
              >
                Chèn ảnh mẫu
              </button>
            </div>

            {teethImages.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 font-bold text-xs">
                Chưa chèn hình ảnh chẩn đoán y khoa nào.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {teethImages.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={img} alt="Clinical item" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveXray(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooth Configuration Modal */}
      {isToothModalOpen && activeTooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800">Cấu hình răng số {activeTooth}</h3>
              <button onClick={() => setIsToothModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Trạng thái bệnh lý răng</label>
                <select
                  value={activeToothData.condition}
                  onChange={(e) => setActiveToothData({ ...activeToothData, condition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="HEALTHY">Khỏe mạnh</option>
                  <option value="DECAYED">Sâu răng (Decayed)</option>
                  <option value="FILLED">Đã trám (Filled)</option>
                  <option value="RCT">Chữa tủy (Root Canal Treatment)</option>
                  <option value="MISSING">Mất răng (Missing)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ghi chú cụ thể của răng</label>
                <textarea
                  rows="3"
                  value={activeToothData.notes}
                  onChange={(e) => setActiveToothData({ ...activeToothData, notes: e.target.value })}
                  placeholder="Ghi chú thêm về chiếc răng này (nếu có)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setIsToothModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTooth}
                className="px-5 py-2 rounded-lg text-xs font-black text-slate-950 bg-teal-500 hover:bg-teal-600 transition-colors shadow-sm"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentDetail;
