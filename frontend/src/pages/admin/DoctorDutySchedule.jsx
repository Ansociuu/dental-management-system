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
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDay, setSelectedDay] = useState(null); // For day detail popup

  const fetchData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(calYear, calMonth, 1).toISOString().slice(0, 10);
      const endDate = new Date(calYear, calMonth + 1, 0).toISOString().slice(0, 10);
      const [dutiesRes, shiftsRes, doctorsRes] = await Promise.all([
        getDutySchedules({ startDate, endDate }),
        getShifts(),
        apiFetch('/users?role=DOCTOR')
      ]);
      setDuties(dutiesRes.data || []);
      setShifts(shiftsRes.data || []);
      setDoctors(doctorsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [calMonth, calYear]);

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
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch trực này?')) return;
    try {
      await deleteDutySchedule(id);
      setSuccess('Đã hủy lịch trực');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.message); }
  };

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
  const calendarDays = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--)
    calendarDays.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(calYear, calMonth - 1, prevMonthDays - i) });
  for (let d = 1; d <= daysInMonth; d++)
    calendarDays.push({ day: d, currentMonth: true, date: new Date(calYear, calMonth, d) });
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++)
    calendarDays.push({ day: d, currentMonth: false, date: new Date(calYear, calMonth + 1, d) });

  const isSameDay = (d1, d2) => {
    const a = new Date(d1), b = new Date(d2);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };
  const isToday = (d) => isSameDay(d, new Date());
  const getDutiesForDay = (date) => duties.filter(d => isSameDay(d.date, date));

  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];
  const shiftBgColors = ['bg-blue-50 border-blue-200 text-blue-700', 'bg-amber-50 border-amber-200 text-amber-700', 'bg-purple-50 border-purple-200 text-purple-700'];

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const goToday = () => { setCalMonth(new Date().getMonth()); setCalYear(new Date().getFullYear()); };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Lịch khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Lịch trực Bác sĩ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch trực Bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Phân công lịch làm việc cho bác sĩ theo ngày và ca</p>
        </div>
        <button onClick={() => { setError(''); setForm({ doctorId: '', date: '', shiftId: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>Đăng ký trực
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      {/* Calendar */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100">
              <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_left</span>
            </button>
            <h2 className="text-lg font-extrabold text-slate-800 min-w-[180px] text-center">{monthNames[calMonth]} {calYear}</h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100">
              <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_right</span>
            </button>
            <button onClick={goToday} className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100">Hôm nay</button>
          </div>
          <div className="flex items-center gap-2">
            {shifts.map((s, i) => (
              <span key={s._id} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${shiftBgColors[i % 3]}`}>{s.name}</span>
            ))}
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {dayNames.map(d => (
            <div key={d} className="py-3 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0">{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, idx) => {
              const dayDuties = getDutiesForDay(cell.date);
              const today = isToday(cell.date);

              // Group by shift
              const byShift = {};
              dayDuties.forEach(d => {
                const sid = d.shiftId?._id;
                if (!sid) return;
                if (!byShift[sid]) byShift[sid] = { shift: d.shiftId, docs: [] };
                byShift[sid].docs.push(d);
              });

              return (
                <div key={idx}
                  onClick={() => cell.currentMonth && setSelectedDay({ date: cell.date, duties: dayDuties })}
                  className={`min-h-[110px] border-b border-r border-slate-100 p-1.5 relative cursor-pointer transition-colors hover:bg-blue-50/30 ${cell.currentMonth ? 'bg-white' : 'bg-slate-50/60'} ${today ? 'ring-2 ring-inset ring-blue-400/40' : ''}`}>
                  <div className="text-right mb-1 pr-0.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${today ? 'bg-blue-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                      {cell.day}
                    </span>
                  </div>
                  <div className="space-y-0.5 overflow-y-auto max-h-[72px]">
                    {Object.values(byShift).map((group) => {
                      const si = shifts.findIndex(s => s._id === group.shift?._id);
                      return (
                        <div key={group.shift._id} className={`px-1 py-0.5 rounded text-[9px] font-bold border ${shiftBgColors[si >= 0 ? si % 3 : 0]} truncate`}>
                          {group.shift.name}: {group.docs.map(d => d.doctorId?.fullName?.split(' ').pop()).join(', ')}
                        </div>
                      );
                    })}
                    {dayDuties.length === 0 && cell.currentMonth && (
                      <p className="text-[9px] text-slate-300 text-center mt-2">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day Detail Popup */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-extrabold text-slate-800">Lịch trực — {formatDate(selectedDay.date)}</h2>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-rose-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6">
              {selectedDay.duties.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có lịch trực nào</p>
              ) : (
                <div className="space-y-3">
                  {selectedDay.duties.map(duty => {
                    const si = shifts.findIndex(s => s._id === duty.shiftId?._id);
                    return (
                      <div key={duty._id} className="flex items-center justify-between border border-slate-200 rounded-xl p-3 group hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                            {duty.doctorId?.fullName?.split(' ').map(n => n[0]).join('').slice(-2) || 'BS'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{duty.doctorId?.fullName || 'N/A'}</h4>
                            <p className="text-[10px] text-slate-500">{duty.doctorId?.specialization || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${shiftBgColors[si >= 0 ? si % 3 : 0]}`}>
                            {duty.shiftId?.name} ({duty.shiftId?.startTime}—{duty.shiftId?.endTime})
                          </span>
                          <button onClick={() => handleDelete(duty._id)} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Duty Modal */}
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
                <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">— Chọn bác sĩ —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName} — {d.specialization}</option>)}
                </select>
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
