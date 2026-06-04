const DutySchedule = require('../models/DutySchedule');
const Holiday = require('../models/Holiday');
const Appointment = require('../models/Appointment');
const Shift = require('../models/Shift');

// Helper to construct a robust 24-hour date range ignoring timezone shifts
const getDayRange = (dateInput) => {
  const parsed = new Date(dateInput);
  
  const utcStart = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0));
  const utcEnd = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));
  
  const localStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  const localEnd = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);

  const gte = new Date(Math.min(utcStart.getTime(), localStart.getTime()));
  const lte = new Date(Math.max(utcEnd.getTime(), localEnd.getTime()));
  
  return { $gte: gte, $lte: lte };
};

const buildShiftSnapshot = (shift) => ({
  name: shift?.name || '',
  startTime: shift?.startTime || '',
  endTime: shift?.endTime || '',
  maxPatients: shift?.maxPatients || 0
});

const isPastOrToday = (dateInput) => new Date(dateInput).getTime() <= getDayRange(new Date()).$lte.getTime();

const getHistoricalShift = (duty) => {
  const snapshot = duty.shiftSnapshot || {};
  const currentShift = duty.shiftId || {};

  return {
    _id: currentShift?._id || currentShift,
    name: snapshot.name || currentShift?.name || '',
    startTime: snapshot.startTime || currentShift?.startTime || '',
    endTime: snapshot.endTime || currentShift?.endTime || '',
    maxPatients: snapshot.maxPatients || currentShift?.maxPatients || 0
  };
};

/**
 * @desc    Đăng ký lịch trực mới cho bác sĩ
 * @route   POST /api/v1/duty-schedules
 * @body    { doctorId, date, shiftId }
 */
const createDutySchedule = async (req, res, next) => {
  try {
    const { doctorId, date, shiftId } = req.body;
    if (req.user?.role === 'DOCTOR' && doctorId !== req.user._id.toString()) {
      const error = new Error('Bác sĩ chỉ được đăng ký lịch trực cho chính mình');
      error.statusCode = 403;
      throw error;
    }

    const dutyDate = new Date(date);

    // Ràng buộc: Không được đăng ký trực vào ngày nghỉ ACTIVE
    const holiday = await Holiday.findOne({
      status: 'ACTIVE',
      startDate: { $lte: dutyDate },
      endDate: { $gte: dutyDate }
    });
    if (holiday) {
      const error = new Error(`Không thể đăng ký trực vào ngày nghỉ: ${holiday.name}`);
      error.statusCode = 400;
      throw error;
    }

    // Ràng buộc: Không trùng lịch trực
    const existing = await DutySchedule.findOne({
      doctorId,
      date: getDayRange(dutyDate),
      shiftId,
      status: 'ACTIVE'
    });
    if (existing) {
      const error = new Error('Bác sĩ đã có lịch trực trong ca này vào ngày đã chọn');
      error.statusCode = 400;
      throw error;
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      const error = new Error('Không tìm thấy ca trực');
      error.statusCode = 404;
      throw error;
    }

    const duty = await DutySchedule.create({
      doctorId,
      date: dutyDate,
      shiftId,
      ...(isPastOrToday(dutyDate) ? { shiftSnapshot: buildShiftSnapshot(shift) } : {})
    });
    const populated = await DutySchedule.findById(duty._id).populate('doctorId', 'fullName').populate('shiftId', 'name startTime endTime maxPatients');
    res.status(201).json({ success: true, message: 'Đăng ký lịch trực thành công!', data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách lịch trực (lọc theo ngày, bác sĩ)
 * @route   GET /api/v1/duty-schedules
 * @query   startDate, endDate, doctorId
 */
const getDutySchedules = async (req, res, next) => {
  try {
    const filter = { status: 'ACTIVE' };
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.shiftId) filter.shiftId = req.query.shiftId;
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    } else if (req.query.date) {
      filter.date = getDayRange(req.query.date);
    }

    const duties = await DutySchedule.find(filter)
      .populate('doctorId', 'fullName email phone specialization')
      .populate('shiftId', 'name startTime endTime maxPatients')
      .sort({ date: 1 });

    res.json({ success: true, data: duties });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lay lich su ca truc da qua cua bac si
 * @route   GET /api/v1/duty-schedules/history
 * @query   doctorId, startDate, endDate, page, limit
 */
const getDutyHistory = async (req, res, next) => {
  try {
    if (!['ADMIN', 'MANAGER', 'DOCTOR'].includes(req.user?.role)) {
      const error = new Error('Ban khong co quyen xem lich su ca truc bac si');
      error.statusCode = 403;
      throw error;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const todayRange = getDayRange(new Date());
    const filter = {
      status: 'ACTIVE',
      date: { $lte: todayRange.$lte }
    };

    if (req.user.role === 'DOCTOR') {
      filter.doctorId = req.user._id;
    } else if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    if (req.query.startDate) {
      filter.date.$gte = getDayRange(req.query.startDate).$gte;
    }

    if (req.query.endDate) {
      const requestedEnd = getDayRange(req.query.endDate).$lte;
      filter.date.$lte = new Date(Math.min(requestedEnd.getTime(), todayRange.$lte.getTime()));
    }

    const [totalItems, duties] = await Promise.all([
      DutySchedule.countDocuments(filter),
      DutySchedule.find(filter)
        .populate('doctorId', 'fullName email phone specialization')
        .populate('shiftId', 'name startTime endTime maxPatients')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    const data = await Promise.all(duties.map(async (duty) => {
      const stats = await Appointment.aggregate([
        {
          $match: {
            doctorId: duty.doctorId?._id || duty.doctorId,
            shiftId: duty.shiftId?._id || duty.shiftId,
            date: getDayRange(duty.date)
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const counts = stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const completed = counts.COMPLETED || 0;
      const cancelled = counts.CANCELLED || 0;
      const noShow = counts.NO_SHOW || 0;
      const active = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS']
        .reduce((sum, status) => sum + (counts[status] || 0), 0);

      return {
        dutyId: duty._id,
        date: duty.date,
        doctor: duty.doctorId,
        shift: getHistoricalShift(duty),
        appointmentStats: {
          total: completed + cancelled + noShow + active,
          completed,
          cancelled,
          noShow,
          active
        }
      };
    }));

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hủy lịch trực
 * @route   DELETE /api/v1/duty-schedules/:id
 */
const deleteDutySchedule = async (req, res, next) => {
  try {
    const existingDuty = await DutySchedule.findById(req.params.id);
    if (!existingDuty) {
      const error = new Error('Không tìm thấy lịch trực');
      error.statusCode = 404;
      throw error;
    }

    if (req.user?.role === 'DOCTOR' && existingDuty.doctorId.toString() !== req.user._id.toString()) {
      const error = new Error('Bác sĩ chỉ được hủy lịch trực của chính mình');
      error.statusCode = 403;
      throw error;
    }

    const duty = await DutySchedule.findByIdAndUpdate(req.params.id, { status: 'CANCELLED' }, { returnDocument: 'after' });
    res.json({ success: true, message: 'Đã hủy lịch trực thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDutySchedule, getDutySchedules, getDutyHistory, deleteDutySchedule };
