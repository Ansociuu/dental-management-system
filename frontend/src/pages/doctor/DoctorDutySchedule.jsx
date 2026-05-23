import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getShifts } from '../../services/shiftService';
import { getDutySchedules, createDutySchedule, deleteDutySchedule } from '../../services/dutyService';
import { getHolidays } from '../../services/holidayService';

const DoctorDutySchedule = () => {
  const { user } = useAuth();
  
  // State variables
  const [shifts, setShifts] = useState([]);
  const [myDuties, setMyDuties] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWeekOffset, setActiveWeekOffset] = useState(0); // 0 = this week, 1 = next week
  const [togglingCell, setTogglingCell] = useState(null); // Keeps track of which cell is saving: "dateStr-shiftId"
  const [error, setError] = useState('');

  // 1. Get dates of the selected week based on offset
  const getWeekDates = (offset) => {
    const today = new Date();
    // Get current day of week (0-6, 0 = Sunday, 1 = Monday...)
    const currentDay = today.getDay();
    // Calculate distance to Monday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const weekDates = getWeekDates(activeWeekOffset);
  const startDateStr = weekDates[0].toISOString().split('T')[0];
  const endDateStr = weekDates[6].toISOString().split('T')[0];

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [shiftsRes, dutiesRes, holidaysRes] = await Promise.all([
        getShifts(),
        getDutySchedules({
          doctorId: user._id,
          startDate: startDateStr,
          endDate: endDateStr
        }),
        getHolidays('ACTIVE')
      ]);

      setShifts((shiftsRes.data || []).filter(s => s.status === 'ACTIVE'));
      setMyDuties(dutiesRes.data || []);
      setHolidays(holidaysRes.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu lịch trực.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadScheduleData();
    }
  }, [activeWeekOffset, user?._id]);

  // Check if a date falls on a holiday
  const getHolidayOnDate = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(12, 0, 0, 0); // avoid time boundary issues
    return holidays.find(h => {
      const start = new Date(h.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(h.endDate);
      end.setHours(23, 59, 59, 999);
      return checkDate >= start && checkDate <= end;
    });
  };

  // Find if doctor has duty schedule for a specific date and shift
  const findDuty = (date, shiftId) => {
    const dStr = date.toISOString().split('T')[0];
    return myDuties.find(d => {
      const dutyDateStr = new Date(d.date).toISOString().split('T')[0];
      return dutyDateStr === dStr && d.shiftId?._id === shiftId;
    });
  };

  // Toggle shift availability
  const handleToggleShift = async (date, shift) => {
    const dateStr = date.toISOString().split('T')[0];
    const cellKey = `${dateStr}-${shift._id}`;
    
    // Check holiday constraint
    const holiday = getHolidayOnDate(date);
    if (holiday) {
      alert(`Không thể đăng ký lịch trực: Đây là ngày nghỉ lễ của phòng khám (${holiday.name}).`);
      return;
    }

    // Check past date constraint
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    if (target < today) {
      alert('Không thể đăng ký hoặc hủy lịch trực cho các ngày trong quá khứ.');
      return;
    }

    const existingDuty = findDuty(date, shift._id);

    try {
      setTogglingCell(cellKey);
      setError('');

      if (existingDuty) {
        // Already registered -> Cancel/Delete it
        await deleteDutySchedule(existingDuty._id);
        setMyDuties(myDuties.filter(d => d._id !== existingDuty._id));
      } else {
        // Register new
        const newDutyData = {
          doctorId: user._id,
          date: dateStr,
          shiftId: shift._id
        };
        const res = await createDutySchedule(newDutyData);
        if (res.success && res.data) {
          setMyDuties([...myDuties, res.data]);
        }
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật lịch trực.');
    } finally {
      setTogglingCell(null);
    }
  };

  const formatDayName = (date) => {
    const day = date.getDay();
    if (day === 0) return 'Chủ Nhật';
    return `Thứ ${day + 1}`;
  };

  const getWeekRangeLabel = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  // Stats
  const totalRegisteredShifts = myDuties.length;
  
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đăng Ký Lịch Trực Cá Nhân</h1>
          <p className="text-slate-500 font-medium mt-1">Đăng ký ca làm việc linh hoạt. Bảng trực được đồng bộ trực tiếp tới lịch đặt hẹn lễ tân.</p>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/80">
          <button
            onClick={() => setActiveWeekOffset(0)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeWeekOffset === 0
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tuần Này
          </button>
          <button
            onClick={() => setActiveWeekOffset(1)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeWeekOffset === 1
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tuần Sau
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-bold flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Week Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tuần trực</p>
            <p className="text-sm font-extrabold text-slate-800 mt-2">{getWeekRangeLabel()}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">date_range</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng ca trực đã đăng ký</p>
            <p className="text-3xl font-black text-teal-600 mt-2">{totalRegisteredShifts} ca</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">event_available</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Trạng thái bác sĩ</p>
            <p className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              Sẵn sàng tiếp nhận hẹn
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>
      </div>

      {/* Main Grid Calendar Registration */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600">calendar_view_week</span>
            Bảng đăng ký ca trực tuần {activeWeekOffset === 0 ? 'hiện tại' : 'tiếp theo'}
          </h3>
          <p className="text-xs text-slate-400 font-semibold">Bấm vào ô lịch trực để Đăng ký / Hủy bỏ ca làm việc.</p>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <span className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin block mx-auto mb-4"></span>
            <p className="text-slate-500 font-bold text-sm">Đang tải lịch trực của tuần...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[850px] p-8">
              {/* Grid Layout */}
              <div className="grid grid-cols-8 gap-4 text-center">
                {/* Header Top Left Empty */}
                <div></div>

                {/* Week Days Headers */}
                {weekDates.map((date, idx) => {
                  const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
                  const holiday = getHolidayOnDate(date);
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-2xl border transition-all ${
                        isToday 
                          ? 'bg-teal-50 border-teal-200 text-teal-950 shadow-inner' 
                          : holiday
                          ? 'bg-rose-50/50 border-rose-100 text-rose-800'
                          : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <p className="text-xs font-black uppercase tracking-wider opacity-60">{formatDayName(date)}</p>
                      <p className={`text-lg font-black mt-1 ${isToday ? 'text-teal-600' : 'text-slate-800'}`}>
                        {date.getDate()}/{date.getMonth() + 1}
                      </p>
                      {holiday && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-rose-100 text-[9px] font-black text-rose-700 rounded-md uppercase tracking-wider">
                          Nghỉ lễ
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Shift rows */}
                {shifts.map((shift) => (
                  <React.Fragment key={shift._id}>
                    {/* Row header: Shift name */}
                    <div className="flex flex-col justify-center items-start text-left bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-wide">{shift.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">
                        <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">schedule</span>
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </div>

                    {/* Cells for each day */}
                    {weekDates.map((date, dateIdx) => {
                      const dStr = date.toISOString().split('T')[0];
                      const cellKey = `${dStr}-${shift._id}`;
                      const isToggling = togglingCell === cellKey;
                      const hasDuty = findDuty(date, shift._id);
                      const holiday = getHolidayOnDate(date);
                      
                      // Disable historical days
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const target = new Date(date);
                      target.setHours(0, 0, 0, 0);
                      const isPast = target < today;

                      return (
                        <div key={dateIdx} className="relative group">
                          {isToggling ? (
                            <div className="w-full h-24 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
                              <span className="w-6 h-6 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></span>
                            </div>
                          ) : holiday ? (
                            <div className="w-full h-24 bg-rose-50/30 border border-dashed border-rose-100 rounded-2xl flex flex-col items-center justify-center p-2 opacity-60">
                              <span className="material-symbols-outlined text-rose-400 text-[20px] mb-1">block</span>
                              <span className="text-[10px] font-bold text-rose-500">Nghỉ lễ</span>
                            </div>
                          ) : isPast ? (
                            <div className="w-full h-24 bg-slate-100/50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center p-2 opacity-50">
                              <span className="text-[10px] font-bold text-slate-400">Đã qua</span>
                            </div>
                          ) : hasDuty ? (
                            /* Registered shift */
                            <button
                              type="button"
                              onClick={() => handleToggleShift(date, shift)}
                              className="w-full h-24 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-rose-500 hover:to-rose-600 text-slate-950 hover:text-white rounded-2xl border border-teal-400/20 flex flex-col items-center justify-center p-4 transition-all shadow-md shadow-teal-500/10 cursor-pointer group"
                            >
                              {/* Default check icon */}
                              <div className="group-hover:hidden flex flex-col items-center">
                                <span className="material-symbols-outlined text-[24px]">task_alt</span>
                                <span className="text-[11px] font-black uppercase mt-1">Đã đăng ký</span>
                              </div>

                              {/* Hover cancel icon */}
                              <div className="hidden group-hover:flex flex-col items-center">
                                <span className="material-symbols-outlined text-[24px]">cancel</span>
                                <span className="text-[11px] font-black uppercase mt-1">Hủy ca</span>
                              </div>
                            </button>
                          ) : (
                            /* Unregistered shift */
                            <button
                              type="button"
                              onClick={() => handleToggleShift(date, shift)}
                              className="w-full h-24 bg-white hover:bg-teal-50/50 border border-dashed border-slate-200 hover:border-teal-400/50 rounded-2xl flex flex-col items-center justify-center p-4 transition-all text-slate-400 hover:text-teal-600 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[22px]">add_circle</span>
                              <span className="text-[10px] font-bold mt-1">Đăng ký trực</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDutySchedule;
