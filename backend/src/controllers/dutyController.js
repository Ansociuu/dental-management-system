const DutySchedule = require('../models/DutySchedule');
const Holiday = require('../models/Holiday');

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

/**
 * @desc    Đăng ký lịch trực mới cho bác sĩ
 * @route   POST /api/v1/duty-schedules
 * @body    { doctorId, date, shiftId }
 */
const createDutySchedule = async (req, res, next) => {
  try {
    const { doctorId, date, shiftId } = req.body;
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

    const duty = await DutySchedule.create({ doctorId, date: dutyDate, shiftId });
    const populated = await DutySchedule.findById(duty._id).populate('doctorId', 'fullName').populate('shiftId', 'name startTime endTime');
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
 * @desc    Hủy lịch trực
 * @route   DELETE /api/v1/duty-schedules/:id
 */
const deleteDutySchedule = async (req, res, next) => {
  try {
    const duty = await DutySchedule.findByIdAndUpdate(req.params.id, { status: 'CANCELLED' }, { new: true });
    if (!duty) {
      const error = new Error('Không tìm thấy lịch trực');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: 'Đã hủy lịch trực thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDutySchedule, getDutySchedules, deleteDutySchedule };
