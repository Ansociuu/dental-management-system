import React, { useEffect, useState } from 'react';
import { getDutySchedules } from '../../services/dutyService';
import { getShifts } from '../../services/shiftService';

const DutyScheduleView = () => {
  const [duties, setDuties] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const startDate = new Date(calYear, calMonth, 1).toISOString().slice(0, 10);
      const endDate = new Date(calYear, calMonth + 1, 0).toISOString().slice(0, 10);
      const [dutiesRes, shiftsRes] = await Promise.all([
        getDutySchedules({ startDate, endDate }),
        getShifts()
      ]);
      setDuties(dutiesRes.data || []);
      setShifts(shiftsRes.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch trực bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [calMonth, calYear]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
  const calendarDays = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(calYear, calMonth - 1, prevMonthDays - i) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, currentMonth: true, date: new Date(calYear, calMonth, day) });
  }
  while (calendarDays.length < 42) {
    const day = calendarDays.length - firstDayOfWeek - daysInMonth + 1;
    calendarDays.push({ day, currentMonth: false, date: new Date(calYear, calMonth + 1, day) });
  }

  const isSameDay = (left, right) => {
    const a = new Date(left);
    const b = new Date(right);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const getDutiesForDay = (date) => duties.filter((duty) => isSameDay(duty.date, date));
  const isToday = (date) => isSameDay(date, new Date());
  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];
  const shiftBgColors = ['bg-blue-50 border-blue-200 text-blue-700', 'bg-amber-50 border-amber-200 text-amber-700', 'bg-purple-50 border-purple-200 text-purple-700'];

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((year) => year - 1);
    } else {
      setCalMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((year) => year + 1);
    } else {
      setCalMonth((month) => month + 1);
    }
  };

  const goToday = () => {
    setCalMonth(new Date().getMonth());
    setCalYear(new Date().getFullYear());
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-900 font-semibold">Lịch khám</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[var(--color-primary)] font-semibold">Lịch trực bác sĩ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch trực bác sĩ</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Lễ tân chỉ xem lịch trực để điều phối đặt lịch và tiếp nhận bệnh nhân.</p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm border border-gray-200 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Tải lại
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">{error}</div>}

      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
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
          <div className="hidden lg:flex items-center gap-2">
            {shifts.map((shift, index) => (
              <span key={shift._id} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${shiftBgColors[index % 3]}`}>{shift.name}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200">
          {dayNames.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0">{day}</div>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Đang tải lịch trực...</div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, index) => {
              const dayDuties = getDutiesForDay(cell.date);
              const byShift = {};
              dayDuties.forEach((duty) => {
                const shiftId = duty.shiftId?._id;
                if (!shiftId) return;
                if (!byShift[shiftId]) byShift[shiftId] = { shift: duty.shiftId, doctors: [] };
                byShift[shiftId].doctors.push(duty.doctorId);
              });

              return (
                <div
                  key={index}
                  onClick={() => cell.currentMonth && setSelectedDay({ date: cell.date, duties: dayDuties })}
                  className={`min-h-[118px] border-b border-r border-slate-100 p-1.5 relative transition-colors ${cell.currentMonth ? 'bg-white cursor-pointer hover:bg-blue-50/30' : 'bg-slate-50/60'} ${isToday(cell.date) ? 'ring-2 ring-inset ring-blue-400/40' : ''}`}
                >
                  <div className="text-right mb-1 pr-0.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isToday(cell.date) ? 'bg-blue-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                      {cell.day}
                    </span>
                  </div>
                  <div className="space-y-0.5 overflow-y-auto max-h-[78px]">
                    {Object.values(byShift).map((group) => {
                      const shiftIndex = shifts.findIndex((shift) => shift._id === group.shift?._id);
                      return (
                        <div key={group.shift._id} className={`px-1 py-0.5 rounded text-[9px] font-bold border truncate ${shiftBgColors[shiftIndex >= 0 ? shiftIndex % 3 : 0]}`}>
                          {group.shift.name}: {group.doctors.map((doctor) => doctor?.fullName?.split(' ').pop()).filter(Boolean).join(', ')}
                        </div>
                      );
                    })}
                    {dayDuties.length === 0 && cell.currentMonth && (
                      <p className="text-[9px] text-slate-300 text-center mt-2">-</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Chi tiết lịch trực</h2>
                <p className="text-sm text-slate-500 font-semibold mt-0.5">{formatDate(selectedDay.date)}</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-rose-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              {selectedDay.duties.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Ngày này chưa có bác sĩ trực.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDay.duties.map((duty) => {
                    const shiftIndex = shifts.findIndex((shift) => shift._id === duty.shiftId?._id);
                    return (
                      <div key={duty._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center border border-blue-100 shrink-0">
                            {duty.doctorId?.fullName?.split(' ').map((name) => name[0]).join('').slice(-2) || 'BS'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-sm truncate">{duty.doctorId?.fullName || 'N/A'}</h4>
                            <p className="text-xs text-slate-500 font-medium truncate">{duty.doctorId?.specialization || 'Chưa cập nhật chuyên khoa'}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${shiftBgColors[shiftIndex >= 0 ? shiftIndex % 3 : 0]}`}>
                          {duty.shiftId?.name} ({duty.shiftId?.startTime}-{duty.shiftId?.endTime})
                        </span>
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

export default DutyScheduleView;
