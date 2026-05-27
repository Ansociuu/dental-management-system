/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { createAppointment, getAppointments } from '../../services/appointmentService';
import { getShifts } from '../../services/shiftService';
import { getPatients } from '../../services/patientService';
import { getDutySchedules } from '../../services/dutyService';
import { getServices } from '../../services/serviceService';

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?._id || seen.has(item._id)) return false;
    seen.add(item._id);
    return true;
  });
};

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

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [monthDuties, setMonthDuties] = useState([]);
  const [monthAppointments, setMonthAppointments] = useState([]);
  const [calLoading, setCalLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [shiftsRes, patientsRes, servicesRes] = await Promise.all([
          getShifts(), getPatients(), getServices()
        ]);
        setShifts(shiftsRes.data || []);
        setPatients(patientsRes.data || []);
        setServices(servicesRes.data || []);
      } catch (err) { setError(err.message); }
    };
    fetchInitial();
  }, []);

  // Fetch duties & appointments for the visible month
  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        setCalLoading(true);
        const startDate = new Date(calYear, calMonth, 1).toISOString().slice(0, 10);
        const endDate = new Date(calYear, calMonth + 1, 0).toISOString().slice(0, 10);
        const [dutiesRes, aptsRes] = await Promise.all([
          getDutySchedules({ startDate, endDate }),
          getAppointments()
        ]);
        setMonthDuties(dutiesRes.data || []);
        setMonthAppointments(aptsRes.data || []);
      } catch { /* silent */ }
      finally { setCalLoading(false); }
    };
    fetchMonthData();
  }, [calMonth, calYear]);

  // Fetch doctors when date + shift change (for the form dropdown)
  useEffect(() => {
    if (form.date && form.shiftId) {
      const fetchDoctors = async () => {
        try {
          const res = await getDutySchedules({ date: form.date, shiftId: form.shiftId });
          setDoctors(uniqueById((res.data || []).map(d => d.doctorId).filter(Boolean)));
        } catch { setDoctors([]); }
      };
      fetchDoctors();
    } else { setDoctors([]); }
  }, [form.date, form.shiftId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await createAppointment(form);
      setSuccess(`Đặt lịch thành công! Số thứ tự: ${res.data.queueNumber}`);
      setForm({ patientId: '', doctorId: '', shiftId: '', date: '', serviceId: '', symptoms: '' });
      setPatientSearch('');
      // Refresh calendar data
      const startDate = new Date(calYear, calMonth, 1).toISOString().slice(0, 10);
      const endDate = new Date(calYear, calMonth + 1, 0).toISOString().slice(0, 10);
      const [dutiesRes, aptsRes] = await Promise.all([
        getDutySchedules({ startDate, endDate }),
        getAppointments()
      ]);
      setMonthDuties(dutiesRes.data || []);
      setMonthAppointments(aptsRes.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch) ||
    p.patientCode.includes(patientSearch)
  );

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

  const getDutiesForDay = (date) => monthDuties.filter(d => isSameDay(d.date, date));
  const getAptsForDay = (date) =>
    monthAppointments.filter(a => isSameDay(a.date, date) && !['CANCELLED', 'NO_SHOW'].includes(a.status));
  const getAptsForDayShiftDoctor = (date, shiftId, doctorId) =>
    monthAppointments.filter(a => isSameDay(a.date, date) && a.shiftId?._id === shiftId && a.doctorId?._id === doctorId && !['CANCELLED', 'NO_SHOW'].includes(a.status));

  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  const getDayShiftGroups = (duties) => {
    const groups = {};
    duties.forEach(d => {
      const sid = d.shiftId?._id;
      if (!sid) return;
      if (!groups[sid]) groups[sid] = { shift: d.shiftId, doctors: [] };
      groups[sid].doctors.push(d);
    });
    return Object.values(groups);
  };

  // Click-to-fill: when user clicks a duty slot on the calendar, pre-fill form
  const handleSlotClick = (date, shiftId, doctorId) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setForm(prev => ({ ...prev, date: dateStr, shiftId, doctorId }));
    setSelectedDay(null);
    setSuccess('');
    setError('');
  };

  const isSlotSelected = (date, shiftId, doctorId) => {
    if (!form.date || !form.shiftId || !form.doctorId) return false;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return form.date === dateStr && form.shiftId === shiftId && form.doctorId === doctorId;
  };

  const shiftBgColors = ['bg-blue-50 border-blue-200 text-blue-700', 'bg-amber-50 border-amber-200 text-amber-700', 'bg-purple-50 border-purple-200 text-purple-700'];
  const selectedDayDuties = selectedDay ? getDutiesForDay(selectedDay.date) : [];
  const selectedDayApts = selectedDay ? getAptsForDay(selectedDay.date) : [];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="text-gray-900 font-semibold">Lịch khám</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-[var(--color-primary)] font-semibold">Đặt lịch khám</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đặt lịch khám mới</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Chọn ca trực trên lịch bên phải để tự động điền thông tin</p>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* LEFT: Booking Form */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 space-y-5 sticky top-8">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
              <span className="material-symbols-outlined text-blue-500">edit_calendar</span>
              Thông tin đặt lịch
            </h3>

            {/* Patient */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Bệnh nhân <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Tìm tên, SĐT..." />
              </div>
              {patientSearch && (
                <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-white shadow-md">
                  {filteredPatients.map(p => (
                    <button key={p._id} type="button" onClick={() => { setForm({...form, patientId: p._id}); setPatientSearch(`${p.fullName} — ${p.phone}`); }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors ${form.patientId === p._id ? 'bg-blue-50 font-bold' : ''}`}>
                      {p.fullName} — <span className="text-slate-400">{p.phone}</span>
                    </button>
                  ))}
                  {filteredPatients.length === 0 && <p className="px-4 py-2 text-sm text-slate-400">Không tìm thấy</p>}
                </div>
              )}
            </div>

            {/* Date & Shift (auto-filled from calendar click) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ngày khám <span className="text-rose-500">*</span></label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value, doctorId: ''})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Ca khám <span className="text-rose-500">*</span></label>
                <select required value={form.shiftId} onChange={e => setForm({...form, shiftId: e.target.value, doctorId: ''})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">— Chọn ca —</option>
                  {shifts.map(s => <option key={s._id} value={s._id}>{s.name} ({s.startTime}—{s.endTime})</option>)}
                </select>
              </div>
            </div>

            {/* Doctor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Bác sĩ <span className="text-rose-500">*</span></label>
              {doctors.length > 0 ? (
                <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">— Chọn bác sĩ —</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName} — {d.specialization || ''}</option>)}
                </select>
              ) : (
                <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                  {form.date && form.shiftId ? '⚠️ Không có BS trực ca này.' : '👈 Chọn ca trực trên lịch bên phải'}
                </div>
              )}
            </div>

            {/* Service */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Dịch vụ <span className="text-rose-500">*</span></label>
              <select required value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                <option value="">— Chọn dịch vụ —</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name} — {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(s.price)}</option>)}
              </select>
            </div>

            {/* Symptoms */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Triệu chứng / Ghi chú</label>
              <textarea rows="2" value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Mô tả triệu chứng..." />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#1e40af] hover:bg-[#1e3a8a] transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          </form>
        </div>

        {/* RIGHT: Duty Calendar */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100">
                  <span className="material-symbols-outlined text-[16px] text-slate-600">chevron_left</span>
                </button>
                <h2 className="text-sm font-extrabold text-slate-800 min-w-[140px] text-center">{monthNames[calMonth]} {calYear}</h2>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100">
                  <span className="material-symbols-outlined text-[16px] text-slate-600">chevron_right</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                {shifts.map((s, i) => (
                  <span key={s._id} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${shiftBgColors[i % 3]}`}>{s.name}</span>
                ))}
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {dayNames.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            {calLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm font-semibold">Đang tải lịch trực...</div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((cell, idx) => {
                  const dayDuties = getDutiesForDay(cell.date);
                  const today = isToday(cell.date);
                  const isPast = cell.date < new Date(new Date().setHours(0,0,0,0)) && !today;

                  // Group duties by shift
                  const dutiesByShift = {};
                  dayDuties.forEach(d => {
                    const sid = d.shiftId?._id;
                    if (!sid) return;
                    if (!dutiesByShift[sid]) dutiesByShift[sid] = { shift: d.shiftId, doctors: [] };
                    dutiesByShift[sid].doctors.push(d);
                  });

                  return (
                    <div key={idx}
                      onClick={() => cell.currentMonth && setSelectedDay({ date: cell.date })}
                      className={`min-h-[128px] border-b border-r border-slate-100 p-1.5 relative transition-colors ${cell.currentMonth ? 'bg-white cursor-pointer hover:bg-blue-50/30' : 'bg-slate-50/60'} ${today ? 'ring-2 ring-inset ring-blue-400/40' : ''} ${isPast ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        {dayDuties.length > 0 && cell.currentMonth ? (
                          <span className="text-[9px] font-bold text-slate-400">{dayDuties.length} BS</span>
                        ) : <span />}
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${today ? 'bg-blue-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                          {cell.day}
                        </span>
                      </div>
                      {/* Duty slots */}
                      <div className="space-y-1 overflow-y-auto max-h-[92px]">
                        {Object.values(dutiesByShift).map((group) => {
                          const shiftIdx = shifts.findIndex(s => s._id === group.shift?._id);
                          return group.doctors.map(duty => {
                            const booked = getAptsForDayShiftDoctor(cell.date, group.shift._id, duty.doctorId?._id);
                            const maxP = group.shift?.maxPatients || 5;
                            const isFull = booked.length >= maxP;
                            const selected = isSlotSelected(cell.date, group.shift._id, duty.doctorId?._id);

                            return (
                              <button key={`${duty._id || `${group.shift._id}-${duty.doctorId?._id}`}-${cell.date.toISOString()}`} type="button" disabled={isPast || isFull}
                                onClick={(e) => { e.stopPropagation(); if (!isPast && !isFull) handleSlotClick(cell.date, group.shift._id, duty.doctorId?._id); }}
                                className={`w-full text-left px-1.5 py-1 rounded text-[9px] font-bold truncate border transition-all ${
                                  selected ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300 text-blue-800 scale-[1.02]'
                                  : isFull ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                                  : `${shiftBgColors[shiftIdx >= 0 ? shiftIdx % 3 : 0]} cursor-pointer hover:shadow-sm hover:scale-[1.02]`
                                }`}>
                                {duty.doctorId?.fullName?.split(' ').pop() || 'BS'} {booked.length}/{maxP}
                              </button>
                            );
                          });
                        })}
                        {dayDuties.length === 0 && cell.currentMonth && (
                          <p className="text-[10px] text-slate-300 text-center mt-4">—</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 bg-white rounded-xl border border-slate-100 px-4 py-3 flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Có thể đặt</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Đang chọn</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Đã đầy</span>
            <span className="text-slate-400">Nhấp vào ngày để xem chi tiết, nhấp vào ca trực để điền form</span>
          </div>
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Chi tiết lịch trực</h2>
                <p className="text-sm text-slate-500 font-semibold mt-0.5">{formatDate(selectedDay.date)}</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Ca trực</p>
                  <p className="text-xl font-extrabold text-slate-800">{getDayShiftGroups(selectedDayDuties).length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Bác sĩ</p>
                  <p className="text-xl font-extrabold text-slate-800">{selectedDayDuties.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Đã đặt</p>
                  <p className="text-xl font-extrabold text-slate-800">{selectedDayApts.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Trạng thái</p>
                  <p className={`text-sm font-extrabold mt-1 ${selectedDayDuties.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {selectedDayDuties.length ? 'Có lịch trực' : 'Chưa có lịch'}
                  </p>
                </div>
              </div>

              {selectedDayDuties.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                  <span className="material-symbols-outlined text-[42px] text-slate-300">event_busy</span>
                  <p className="text-sm text-slate-400 font-semibold mt-2">Ngày này chưa có bác sĩ trực.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getDayShiftGroups(selectedDayDuties).map(group => {
                    const shiftIdx = shifts.findIndex(s => s._id === group.shift?._id);
                    return (
                      <div key={group.shift?._id} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className={`px-4 py-3 border-b ${shiftBgColors[shiftIdx >= 0 ? shiftIdx % 3 : 0]} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1`}>
                          <h3 className="text-sm font-extrabold">{group.shift?.name || 'Ca khám'}</h3>
                          <p className="text-xs font-bold">{group.shift?.startTime} — {group.shift?.endTime}</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {group.doctors.map(duty => {
                            const booked = getAptsForDayShiftDoctor(selectedDay.date, group.shift?._id, duty.doctorId?._id);
                            const maxP = group.shift?.maxPatients || 5;
                            const isFull = booked.length >= maxP;
                            const isPast = selectedDay.date < new Date(new Date().setHours(0,0,0,0)) && !isToday(selectedDay.date);
                            const selected = isSlotSelected(selectedDay.date, group.shift?._id, duty.doctorId?._id);

                            return (
                              <div key={duty._id || `${group.shift?._id}-${duty.doctorId?._id}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                                    {duty.doctorId?.fullName?.split(' ').map(n => n[0]).join('').slice(-2) || 'BS'}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-extrabold text-slate-800 text-sm truncate">{duty.doctorId?.fullName || 'N/A'}</h4>
                                    <p className="text-xs text-slate-500 font-medium truncate">{duty.doctorId?.specialization || 'Chưa cập nhật chuyên khoa'}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border text-center ${isFull ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                    {booked.length}/{maxP} lượt đặt
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isPast || isFull}
                                    onClick={() => handleSlotClick(selectedDay.date, group.shift?._id, duty.doctorId?._id)}
                                    className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors ${
                                      selected ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                      : isPast || isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                      : 'bg-[#1e40af] text-white hover:bg-[#1e3a8a]'
                                    }`}
                                  >
                                    {selected ? 'Đang chọn' : isFull ? 'Đã đầy' : isPast ? 'Đã qua' : 'Chọn ca này'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
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
    </div>
  );
};

export default AppointmentBooking;
