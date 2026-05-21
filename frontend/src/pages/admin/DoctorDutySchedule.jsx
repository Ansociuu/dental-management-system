import React, { useState, useEffect } from 'react';
import { getDutySchedules, createDutySchedule, deleteDutySchedule } from '../../services/dutyService';
import { getShifts } from '../../services/shiftService';
import apiFetch from '../../services/api';

const DoctorDutySchedule = () => {
  const [duties, setDuties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '', shiftId: '' });
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dutiesRes, shiftsRes, doctorsRes] = await Promise.all([
        getDutySchedules({ date: filterDate }),
        getShifts(),
        apiFetch('/duty-schedules?startDate=2020-01-01&endDate=2030-12-31').then(() => apiFetch('/shifts')).catch(() => ({ data: [] }))
      ]);
      setDuties(dutiesRes.data);
      setShifts(shiftsRes.data);
      // Fetch doctors list
      try {
        const res = await fetch('http://localhost:5000/api/v1/duty-schedules?startDate=2020-01-01&endDate=2030-12-31');
        const data = await res.json();
        // Extract unique doctors
        const uniqueDoctors = [];
        const seen = new Set();
        data.data?.forEach(d => {
          if (d.doctorId && !seen.has(d.doctorId._id)) {
            seen.add(d.doctorId._id);
            uniqueDoctors.push(d.doctorId);
          }
        });
        if (uniqueDoctors.length > 0) setDoctors(uniqueDoctors);
      } catch(e) { /* ignore */ }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Also fetch doctors directly from users if we don't have them
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // We'll create a simple endpoint or use seed data
        const res = await fetch('http://localhost:5000/api/v1/duty-schedules');
        const data = await res.json();
        const uniqueDoctors = [];
        const seen = new Set();
        data.data?.forEach(d => {
          if (d.doctorId && !seen.has(d.doctorId._id)) {
            seen.add(d.doctorId._id);
            uniqueDoctors.push(d.doctorId);
          }
        });
        if (uniqueDoctors.length > 0) setDoctors(uniqueDoctors);
      } catch(e) { /* We'll add a doctors endpoint */ }
    };
    fetchDoctors();
  }, []);

  useEffect(() => { fetchData(); }, [filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await createDutySchedule(form);
      setSuccess('Đăng ký lịch trực thành công!');
      setIsModalOpen(false);
      setForm({ doctorId: '', date: '', shiftId: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch trực này?')) return;
    try {
      await deleteDutySchedule(id);
      setSuccess('Đã hủy lịch trực');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Lịch khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Lịch trực Bác sĩ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch trực Bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Phân công lịch làm việc cho bác sĩ theo ngày và ca</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 bg-white shadow-sm" />
          <button onClick={() => { setError(''); setForm({ doctorId: '', date: filterDate, shiftId: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Đăng ký trực
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Schedule Grid */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-500">calendar_month</span>
            Lịch trực ngày {formatDate(filterDate)}
          </h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Đang tải...</div>
        ) : duties.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 block mb-3">event_available</span>
            <p className="text-slate-500 font-medium">Chưa có lịch trực nào cho ngày này</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {duties.map((duty) => (
                <div key={duty._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-white group relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                        {duty.doctorId?.fullName?.split(' ').map(n => n[0]).join('').slice(-2) || 'BS'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{duty.doctorId?.fullName || 'N/A'}</h4>
                        <p className="text-xs text-slate-500">{duty.doctorId?.specialization || ''}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(duty._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">schedule</span>
                    <span className="font-medium text-slate-600">{duty.shiftId?.name}: {duty.shiftId?.startTime} — {duty.shiftId?.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">Đăng ký lịch trực</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Bác sĩ <span className="text-rose-500">*</span></label>
                {doctors.length > 0 ? (
                  <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">— Chọn bác sĩ —</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName} — {d.specialization}</option>)}
                  </select>
                ) : (
                  <input type="text" required placeholder="Nhập ID bác sĩ (chạy seed trước)" value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngày trực <span className="text-rose-500">*</span></label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ca trực <span className="text-rose-500">*</span></label>
                <select required value={form.shiftId} onChange={e => setForm({...form, shiftId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">— Chọn ca —</option>
                  {shifts.map(s => <option key={s._id} value={s._id}>{s.name} ({s.startTime} — {s.endTime})</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] shadow-sm">Đăng ký</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDutySchedule;
