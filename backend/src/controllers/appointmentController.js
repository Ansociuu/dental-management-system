const Appointment = require('../models/Appointment');
const DutySchedule = require('../models/DutySchedule');
const Holiday = require('../models/Holiday');
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

/**
 * @desc    Đăng ký lịch khám mới
 * @route   POST /api/v1/appointments
 * @body    { patientId, doctorId, shiftId, date, serviceId, symptoms }
 */
const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, shiftId, date, serviceId, symptoms } = req.body;
    const appointmentDate = new Date(date);

    // 1. Ràng buộc: Không đặt lịch vào ngày nghỉ ACTIVE
    const holiday = await Holiday.findOne({
      status: 'ACTIVE',
      startDate: { $lte: appointmentDate },
      endDate: { $gte: appointmentDate }
    });
    if (holiday) {
      const error = new Error(`Không thể đặt lịch vào ngày nghỉ: ${holiday.name}`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Ràng buộc: Bác sĩ phải có lịch trực hợp lệ vào ngày và ca đó
    const dutyExists = await DutySchedule.findOne({
      doctorId,
      date: getDayRange(appointmentDate),
      shiftId,
      status: 'ACTIVE'
    });
    if (!dutyExists) {
      const error = new Error('Bác sĩ không có lịch trực vào ca này trong ngày đã chọn');
      error.statusCode = 400;
      throw error;
    }

    // 3. Ràng buộc: Kiểm tra Full Slot
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      const error = new Error('Ca khám không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const currentCount = await Appointment.countDocuments({
      doctorId,
      shiftId,
      date: getDayRange(appointmentDate),
      status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] }
    });

    if (currentCount >= shift.maxPatients) {
      const error = new Error(`Ca ${shift.name} đã đầy (${shift.maxPatients}/${shift.maxPatients} bệnh nhân). Vui lòng chọn ca khác.`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Tính số thứ tự khám trong ca
    const queueNumber = currentCount + 1;

    const appointment = await Appointment.create({
      patientId, doctorId, shiftId, date: appointmentDate, serviceId, symptoms, queueNumber
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName phone patientCode')
      .populate('doctorId', 'fullName')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name');

    res.status(201).json({ success: true, message: 'Đặt lịch khám thành công!', data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Theo dõi và điều phối lịch khám (API trọng tâm UC2.5)
 * @route   GET /api/v1/appointments/monitor
 * @query   date, doctorId, status, shiftId
 */
const monitorAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = getDayRange(req.query.date);
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.shiftId) filter.shiftId = req.query.shiftId;

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName phone patientCode')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .sort({ queueNumber: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách tất cả lịch khám
 * @route   GET /api/v1/appointments
 */
const getAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = getDayRange(req.query.date);
    if (req.query.patientId) filter.patientId = req.query.patientId;

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName phone patientCode')
      .populate('doctorId', 'fullName')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name')
      .sort({ date: -1, queueNumber: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật trạng thái lịch khám
 * @route   PATCH /api/v1/appointments/:id/status
 * @body    { status }
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('patientId', 'fullName phone')
      .populate('doctorId', 'fullName')
      .populate('shiftId', 'name');

    if (!appointment) {
      const error = new Error('Không tìm thấy lịch khám');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: `Cập nhật trạng thái thành ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, monitorAppointments, getAppointments, updateAppointmentStatus };
