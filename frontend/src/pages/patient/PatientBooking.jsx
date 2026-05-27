/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import {
  createPatientPortalAppointment,
  getPatientBookingAvailability,
  getPatientBookingOptions
} from '../../services/patientPortalService';

const toDateInput = (date) => {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next.toISOString().slice(0, 10);
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const buildCalendarDays = (monthDate) => {
  const start = startOfMonth(monthDate);
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const days = [];
  while (days.length < 42) {
    days.push({
      date: new Date(cursor),
      dateKey: toDateInput(cursor),
      day: cursor.getDate(),
      currentMonth: cursor.getMonth() === monthDate.getMonth()
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

const isSameDay = (left, right) => toDateInput(left) === toDateInput(right);
const isPastDay = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
};

const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(Number(value) || 0);

const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const shiftBgColors = [
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-violet-50 border-violet-200 text-violet-700'
];

const PatientBooking = () => {
  const [services, setServices] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({ serviceId: '', date: '', shiftId: '', doctorId: '', symptoms: '' });
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAvailability = async (monthDate = calendarMonth, serviceId = form.serviceId) => {
    try {
      setCalendarLoading(true);
      const res = await getPatientBookingAvailability({
        dateFrom: toDateInput(startOfMonth(monthDate)),
        dateTo: toDateInput(endOfMonth(monthDate)),
        serviceId
      });
      setSlots(res.data?.slots || []);
      setHolidays(res.data?.holidays || []);
    } catch (err) {
      setSlots([]);
      setHolidays([]);
      setError(err.message || 'Không thể tải lịch khả dụng');
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await getPatientBookingOptions();
        const nextServices = res.data?.services || [];
        setServices(nextServices);
        setShifts(res.data?.shifts || []);
        const firstServiceId = nextServices[0]?._id || '';
        setForm((prev) => ({ ...prev, serviceId: prev.serviceId || firstServiceId }));
        await loadAvailability(calendarMonth, firstServiceId);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu đặt lịch');
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (!form.serviceId) return;
    loadAvailability(calendarMonth, form.serviceId);
  }, [calendarMonth, form.serviceId]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const selectedSlot = slots.find((slot) =>
    toDateInput(slot.date) === form.date
    && slot.shift?._id === form.shiftId
    && slot.doctor?._id === form.doctorId
  );

  const slotsByDate = useMemo(() => {
    return slots.reduce((acc, slot) => {
      const key = toDateInput(slot.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const holidaysByDate = useMemo(() => {
    const map = {};
    holidays.forEach((holiday) => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      const cursor = new Date(start);
      cursor.setHours(12, 0, 0, 0);
      while (cursor <= end) {
        map[toDateInput(cursor)] = holiday;
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [holidays]);

  const getShiftColor = (shiftId) => {
    const index = shifts.findIndex((shift) => shift._id === shiftId);
    return shiftBgColors[index >= 0 ? index % shiftBgColors.length : 0];
  };

  const getDaySlots = (date) => slotsByDate[toDateInput(date)] || [];

  const getDayGroups = (daySlots) => {
    const groups = {};
    daySlots.forEach((slot) => {
      const shiftId = slot.shift?._id;
      if (!shiftId) return;
      if (!groups[shiftId]) groups[shiftId] = { shift: slot.shift, slots: [] };
      groups[shiftId].slots.push(slot);
    });
    return Object.values(groups);
  };

  const handleSlotClick = (slot) => {
    if (!slot || slot.isFull || slot.availableSlots <= 0 || isPastDay(slot.date)) return;
    setForm((prev) => ({
      ...prev,
      date: toDateInput(slot.date),
      shiftId: slot.shift?._id || '',
      doctorId: slot.doctor?._id || ''
    }));
    setSelectedDay(null);
    setError('');
    setSuccess('');
  };

  const isSlotSelected = (slot) => (
    form.date === toDateInput(slot.date)
    && form.shiftId === slot.shift?._id
    && form.doctorId === slot.doctor?._id
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await createPatientPortalAppointment(form);
      setSuccess('Đặt lịch khám thành công. Lịch đang chờ xác nhận.');
      setForm((prev) => ({ ...prev, date: '', shiftId: '', doctorId: '', symptoms: '' }));
      await loadAvailability(calendarMonth, form.serviceId);
    } catch (err) {
      setError(err.message || 'Không thể đặt lịch khám');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const selectedDaySlots = selectedDay ? getDaySlots(selectedDay.date) : [];
  const selectedDayHoliday = selectedDay ? holidaysByDate[selectedDay.dateKey] : null;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đặt lịch khám</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Chọn dịch vụ, sau đó bấm trực tiếp vào ca còn chỗ trên lịch.</p>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}
      {success && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 xl:sticky xl:top-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">edit_calendar</span>
              <h2 className="font-extrabold text-slate-900">Thông tin đặt lịch</h2>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Dịch vụ</label>
              <select
                value={form.serviceId}
                onChange={(e) => {
                  setForm({ ...form, serviceId: e.target.value, date: '', shiftId: '', doctorId: '' });
                  setSelectedDay(null);
                }}
                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
                required
              >
                <option value="">Chọn dịch vụ</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - {formatCurrency(service.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Ngày khám</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value, shiftId: '', doctorId: '' })}
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Ca khám</label>
                <select
                  value={form.shiftId}
                  onChange={(e) => setForm({ ...form, shiftId: e.target.value, doctorId: '' })}
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">Chọn ca</option>
                  {shifts.map((shift) => (
                    <option key={shift._id} value={shift._id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Bác sĩ</label>
              <select
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white"
                required
              >
                <option value="">Chọn bác sĩ từ lịch</option>
                {slots
                  .filter((slot) => toDateInput(slot.date) === form.date && slot.shift?._id === form.shiftId && !slot.isFull && slot.availableSlots > 0)
                  .map((slot) => (
                    <option key={slot._id} value={slot.doctor?._id}>
                      {slot.isPreviousDoctor ? '★ ' : ''}{slot.doctor?.fullName} {slot.doctor?.specialization ? `- ${slot.doctor.specialization}` : ''} ({slot.availableSlots} chỗ)
                    </option>
                  ))}
              </select>
            </div>

            {selectedSlot ? (
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm">
                <p className="font-extrabold text-blue-800">{formatDate(selectedSlot.date)}</p>
                <p className="font-semibold text-blue-700 mt-1">{selectedSlot.shift?.name} ({selectedSlot.shift?.startTime} - {selectedSlot.shift?.endTime})</p>
                <p className="font-semibold text-slate-700 mt-2">BS. {selectedSlot.doctor?.fullName}</p>
                <p className="text-xs font-bold text-emerald-700 mt-2">Còn {selectedSlot.availableSlots} chỗ trống</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm font-semibold text-slate-500">
                Bấm vào một ca còn chỗ trên lịch để chọn nhanh ngày, ca và bác sĩ.
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Triệu chứng / ghi chú</label>
              <textarea
                rows="4"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Mô tả ngắn tình trạng cần khám..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.serviceId || !form.date || !form.shiftId || !form.doctorId}
              className="w-full px-6 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              {loading ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
            </button>
          </form>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <button type="button" onClick={prevMonth} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-white">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <h2 className="text-base font-extrabold text-slate-900 min-w-[150px] text-center">{monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</h2>
                <button type="button" onClick={nextMonth} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-white">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {shifts.map((shift, index) => (
                  <span key={shift._id} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${shiftBgColors[index % shiftBgColors.length]}`}>
                    {shift.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200">
              {dayNames.map((day) => (
                <div key={day} className="py-2 text-center text-[11px] font-extrabold text-slate-500 uppercase border-r border-slate-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {calendarLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm font-bold">Đang tải lịch khả dụng...</div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((cell) => {
                  const daySlots = getDaySlots(cell.date);
                  const holiday = holidaysByDate[cell.dateKey];
                  const today = isSameDay(cell.date, new Date());
                  const past = isPastDay(cell.date);
                  const availableCount = daySlots.reduce((sum, slot) => sum + (slot.availableSlots || 0), 0);

                  return (
                    <div
                      key={cell.dateKey}
                      onClick={() => cell.currentMonth && setSelectedDay(cell)}
                      className={`min-h-[132px] border-b border-r border-slate-100 p-1.5 transition-colors ${
                        cell.currentMonth ? 'bg-white cursor-pointer hover:bg-blue-50/30' : 'bg-slate-50/70'
                      } ${today ? 'ring-2 ring-inset ring-blue-400/50' : ''} ${past ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-extrabold ${availableCount > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {holiday ? 'Nghỉ' : availableCount > 0 ? `${availableCount} chỗ` : ''}
                        </span>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold ${
                          today ? 'bg-blue-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {cell.day}
                        </span>
                      </div>

                      <div className="space-y-1 max-h-[96px] overflow-y-auto">
                        {holiday ? (
                          <div className="px-1.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-[9px] font-bold text-rose-600 truncate">
                            {holiday.name}
                          </div>
                        ) : daySlots.slice(0, 4).map((slot) => {
                          const selected = isSlotSelected(slot);
                          const unavailable = past || slot.isFull || slot.availableSlots <= 0;
                          return (
                            <button
                              key={slot._id}
                              type="button"
                              disabled={unavailable}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSlotClick(slot);
                              }}
                              className={`w-full text-left px-1.5 py-1 rounded-lg text-[9px] font-bold truncate border transition-all ${
                                selected ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300 text-blue-800'
                                : unavailable ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : `${getShiftColor(slot.shift?._id)} hover:shadow-sm`
                              }`}
                            >
                              {slot.isPreviousDoctor ? '★ ' : ''}{slot.doctor?.fullName?.split(' ').pop() || 'BS'} {slot.availableSlots}/{slot.maxPatients}
                            </button>
                          );
                        })}
                        {!holiday && daySlots.length > 4 && (
                          <button type="button" className="w-full text-[9px] font-bold text-blue-600">+{daySlots.length - 4} ca khác</button>
                        )}
                        {!holiday && daySlots.length === 0 && cell.currentMonth && (
                          <p className="text-[10px] text-slate-300 text-center mt-5">-</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-3 bg-white rounded-xl border border-slate-100 px-4 py-3 flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Còn chỗ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span>Đang chọn</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span>Đã đầy/đã qua</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span>Ngày nghỉ</span>
          </div>
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/80">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Lịch khám khả dụng</h2>
                <p className="text-sm text-slate-500 font-semibold mt-1">{formatDate(selectedDay.date)}</p>
              </div>
              <button type="button" onClick={() => setSelectedDay(null)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {selectedDayHoliday ? (
                <div className="py-10 text-center border border-dashed border-rose-200 rounded-2xl bg-rose-50">
                  <span className="material-symbols-outlined text-[42px] text-rose-300">event_busy</span>
                  <p className="text-sm text-rose-700 font-extrabold mt-2">{selectedDayHoliday.name}</p>
                  <p className="text-xs text-rose-500 font-semibold mt-1">Phòng khám không nhận lịch vào ngày này.</p>
                </div>
              ) : selectedDaySlots.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                  <span className="material-symbols-outlined text-[42px] text-slate-300">event_busy</span>
                  <p className="text-sm text-slate-400 font-semibold mt-2">Ngày này chưa có ca khám khả dụng.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getDayGroups(selectedDaySlots).map((group) => (
                    <div key={group.shift?._id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className={`px-4 py-3 border-b ${getShiftColor(group.shift?._id)} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1`}>
                        <h3 className="text-sm font-extrabold">{group.shift?.name || 'Ca khám'}</h3>
                        <p className="text-xs font-bold">{group.shift?.startTime} - {group.shift?.endTime}</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {group.slots.map((slot) => {
                          const unavailable = isPastDay(slot.date) || slot.isFull || slot.availableSlots <= 0;
                          const selected = isSlotSelected(slot);
                          return (
                            <div key={slot._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                                  {slot.doctor?.fullName?.split(' ').map((part) => part[0]).join('').slice(-2) || 'BS'}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-slate-800 text-sm truncate">
                                    {slot.isPreviousDoctor ? '★ ' : ''}{slot.doctor?.fullName || 'N/A'}
                                  </h4>
                                  <p className="text-xs text-slate-500 font-medium truncate">{slot.doctor?.specialization || 'Chưa cập nhật chuyên khoa'}</p>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border text-center ${
                                  unavailable ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                  Còn {slot.availableSlots}/{slot.maxPatients} chỗ
                                </span>
                                <button
                                  type="button"
                                  disabled={unavailable}
                                  onClick={() => handleSlotClick(slot)}
                                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors ${
                                    selected ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : unavailable ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-700 text-white hover:bg-blue-800'
                                  }`}
                                >
                                  {selected ? 'Đang chọn' : unavailable ? 'Không khả dụng' : 'Chọn ca này'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBooking;
