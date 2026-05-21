import React, { useState, useEffect } from 'react';
import { createAppointment } from '../../services/appointmentService';
import { getShifts } from '../../services/shiftService';
import { getPatients } from '../../services/patientService';
import { getDutySchedules } from '../../services/dutyService';

const AppointmentBooking = () => {
  const [shifts, setShifts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ patientId: '', doctorId: '', shiftId: '', date: '', serviceId: '', symptoms: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [shiftsRes, patientsRes] = await Promise.all([getShifts(), getPatients()]);
        setShifts(shiftsRes.data);
        setPatients(patientsRes.data);
        // Fetch services
        const svcRes = await fetch('http://localhost:5000/api/v1/shifts');
        // Get services from a different call
        try {
          const res = await fetch('http://localhost:5000/api/v1/appointments');
          const data = await res.json();
          // Extract services from existing appointments if any
        } catch(e) {}
      } catch (err) { setError(err.message); }
    };
    fetchInitial();
    // Fetch services list
    fetch('http://localhost:5000/api/v1/appointments').catch(() => {});
  }, []);

  // Fetch doctors when date + shift change
  useEffect(() => {
    if (form.date && form.shiftId) {
      const fetchDoctors = async () => {
        try {
          const res = await getDutySchedules({ date: form.date, shiftId: form.shiftId });
          const availableDoctors = res.data.map(d => d.doctorId).filter(Boolean);
          setDoctors(availableDoctors);
        } catch (err) { setDoctors([]); }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [form.date, form.shiftId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await createAppointment(form);
      setSuccess(`Đặt lịch thành công! Số thứ tự: ${res.data.queueNumber}`);
      setForm({ patientId: '', doctorId: '', shiftId: '', date: '', serviceId: '', symptoms: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch) ||
    p.patientCode.includes(patientSearch)
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="text-gray-900 font-semibold">Lịch khám</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-[var(--color-primary)] font-semibold">Đặt lịch khám</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đặt lịch khám mới</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Đăng ký lịch khám cho bệnh nhân với bác sĩ theo ca trực</p>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 space-y-6">
            {/* Patient Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Bệnh nhân <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Tìm tên, SĐT hoặc mã bệnh nhân..." />
              </div>
              {patientSearch && (
                <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-md">
                  {filteredPatients.map(p => (
                    <button key={p._id} type="button" onClick={() => { setForm({...form, patientId: p._id}); setPatientSearch(`${p.fullName} — ${p.phone}`); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex justify-between items-center transition-colors ${form.patientId === p._id ? 'bg-blue-50 font-bold' : ''}`}>
                      <span>{p.fullName} — <span className="text-slate-500">{p.phone}</span></span>
                      <span className="text-xs text-slate-400">{p.patientCode}</span>
                    </button>
                  ))}
                  {filteredPatients.length === 0 && <p className="px-4 py-3 text-sm text-slate-400">Không tìm thấy</p>}
                </div>
              )}
            </div>

            {/* Date & Shift */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngày khám <span className="text-rose-500">*</span></label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value, doctorId: ''})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ca khám <span className="text-rose-500">*</span></label>
                <select required value={form.shiftId} onChange={e => setForm({...form, shiftId: e.target.value, doctorId: ''})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">— Chọn ca —</option>
                  {shifts.map(s => <option key={s._id} value={s._id}>{s.name} ({s.startTime} — {s.endTime})</option>)}
                </select>
              </div>
            </div>

            {/* Doctor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Bác sĩ <span className="text-rose-500">*</span></label>
              {doctors.length > 0 ? (
                <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">— Chọn bác sĩ đang trực —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName} — {d.specialization || ''}</option>)}
                </select>
              ) : (
                <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  {form.date && form.shiftId ? '⚠️ Không có bác sĩ trực trong ca này. Vui lòng chọn ngày/ca khác.' : 'Vui lòng chọn ngày và ca khám trước'}
                </div>
              )}
            </div>

            {/* Service */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Dịch vụ <span className="text-rose-500">*</span></label>
              <input type="text" required placeholder="Nhập ID dịch vụ (từ seed data)" value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              <p className="text-[11px] text-slate-400">💡 Chạy seed script để có danh sách dịch vụ. ID sẽ được hiển thị trong MongoDB.</p>
            </div>

            {/* Symptoms */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Triệu chứng / Ghi chú</label>
              <textarea rows="3" value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Mô tả triệu chứng của bệnh nhân..." />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-500">info</span>
              Hướng dẫn
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">1.</span>Chọn bệnh nhân từ danh sách</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">2.</span>Chọn ngày và ca khám mong muốn</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">3.</span>Hệ thống tự động hiển thị bác sĩ đang trực</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">4.</span>Chọn dịch vụ và mô tả triệu chứng</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 font-bold">5.</span>Xác nhận để nhận số thứ tự khám</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] p-6 text-white">
            <span className="material-symbols-outlined text-[32px] mb-3 block opacity-80">auto_awesome</span>
            <h3 className="font-bold text-lg mb-2">Slot thông minh</h3>
            <p className="text-sm opacity-90">Hệ thống tự động kiểm tra số lượng bệnh nhân tối đa trong ca và chặn khi ca đã đầy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
