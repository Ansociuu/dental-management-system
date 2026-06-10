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

const getPreviousDate = (dateInput) => {
  const parsed = dateInput ? new Date(dateInput) : new Date();
  parsed.setDate(parsed.getDate() - 1);
  return parsed;
};

const addDays = (dateInput, days) => {
  const parsed = dateInput ? new Date(dateInput) : new Date();
  parsed.setDate(parsed.getDate() + days);
  return parsed;
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
      .populate('servicesPerformed.serviceId', 'name price')
      .sort({ queueNumber: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách lịch đã khám xong cần gọi lại vào ngày hôm sau
 * @route   GET /api/v1/appointments/follow-ups
 * @query   date - ngày lễ tân cần gọi, status - PENDING/CALLED/UNREACHABLE/ALL
 */
const getFollowUpAppointments = async (req, res, next) => {
  try {
    const followUpDate = req.query.date || new Date().toISOString().split('T')[0];
    const followUpStatus = req.query.status || 'PENDING';
    let appointmentDateFilter;

    if (req.query.dateFrom || req.query.dateTo) {
      const from = req.query.dateFrom || req.query.dateTo;
      const to = req.query.dateTo || req.query.dateFrom;
      appointmentDateFilter = {
        $gte: getDayRange(getPreviousDate(from)).$gte,
        $lte: getDayRange(getPreviousDate(to)).$lte
      };
    } else {
      appointmentDateFilter = getDayRange(getPreviousDate(followUpDate));
    }

    const filter = {
      status: 'COMPLETED',
      date: appointmentDateFilter
    };

    if (followUpStatus !== 'ALL') {
      const validStatuses = ['PENDING', 'CALLED', 'UNREACHABLE'];
      if (!validStatuses.includes(followUpStatus)) {
        const error = new Error(`Trạng thái gọi lại không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}, ALL`);
        error.statusCode = 400;
        throw error;
      }
      filter.followUpStatus = followUpStatus === 'PENDING'
        ? { $in: ['PENDING', null] }
        : followUpStatus;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price')
      .populate('followUpBy', 'fullName role')
      .sort({ date: 1, queueNumber: 1 });

    const data = appointments.map((appointment) => {
      const obj = appointment.toObject();
      obj.followUpDueDate = addDays(obj.date, 1);
      return obj;
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật trạng thái gọi lại sau khám
 * @route   PATCH /api/v1/appointments/:id/follow-up
 * @body    { followUpStatus, followUpNote }
 */
const updateAppointmentFollowUp = async (req, res, next) => {
  try {
    const { followUpStatus, followUpNote } = req.body;
    const validStatuses = ['CALLED', 'UNREACHABLE'];

    if (followUpStatus !== undefined && !validStatuses.includes(followUpStatus)) {
      const error = new Error(`Trạng thái gọi lại không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      const error = new Error('Không tìm thấy lịch khám');
      error.statusCode = 404;
      throw error;
    }

    if (appointment.status !== 'COMPLETED') {
      const error = new Error('Chỉ cập nhật gọi lại cho lịch khám đã hoàn thành');
      error.statusCode = 400;
      throw error;
    }

    const currentFollowUpStatus = appointment.followUpStatus || 'PENDING';

    if (followUpStatus && currentFollowUpStatus === 'CALLED' && followUpStatus !== 'CALLED') {
      const error = new Error('Lịch đã gọi thành công không thể chuyển về trạng thái khác');
      error.statusCode = 400;
      throw error;
    }

    if (followUpStatus && currentFollowUpStatus === 'UNREACHABLE' && followUpStatus === 'UNREACHABLE') {
      appointment.followUpAt = new Date();
      appointment.followUpBy = req.user._id;
    }

    if (followUpStatus && (currentFollowUpStatus === 'PENDING' || currentFollowUpStatus === 'UNREACHABLE')) {
      appointment.followUpStatus = followUpStatus;
      appointment.followUpAt = new Date();
      appointment.followUpBy = req.user._id;
    }

    if (followUpNote !== undefined) {
      appointment.followUpNote = String(followUpNote).trim();
    }

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price')
      .populate('followUpBy', 'fullName role');

    const data = populated.toObject();
    data.followUpDueDate = addDays(data.date, 1);

    res.json({ success: true, message: 'Cập nhật gọi lại sau khám thành công', data });
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
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price')
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
    const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      const error = new Error('Không tìm thấy lịch khám');
      error.statusCode = 404;
      throw error;
    }

    const allowedTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
      CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
      CHECKED_IN: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: []
    };
    if (!allowedTransitions[appointment.status]?.includes(status)) {
      const error = new Error(`Không thể chuyển trạng thái từ ${appointment.status} sang ${status}`);
      error.statusCode = 400;
      throw error;
    }

    appointment.status = status;
    await appointment.save();
    await appointment.populate('patientId', 'fullName phone');
    await appointment.populate('doctorId', 'fullName');
    await appointment.populate('shiftId', 'name');
    res.json({ success: true, message: `Cập nhật trạng thái thành ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách cuộc hẹn của bác sĩ đăng nhập (hôm nay hoặc ngày tùy chọn)
 * @route   GET /api/v1/appointments/doctor-today
 */
const getDoctorTodayAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({
      doctorId,
      date: getDayRange(targetDate)
    })
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price')
      .sort({ queueNumber: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bác sĩ lưu kết quả khám lâm sàng & kết thúc ca khám
 * @route   PUT /api/v1/appointments/:id/examine
 */
const examineAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diagnosis, clinicalNotes, servicesPerformed, prescription, teethImages, dentalChart } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      const error = new Error('Không tìm thấy lịch khám');
      error.statusCode = 404;
      throw error;
    }

    // Đảm bảo chỉ bác sĩ được phân công hoặc admin được cập nhật
    if (req.user.role === 'DOCTOR' && appointment.doctorId.toString() !== req.user._id.toString()) {
      const error = new Error('Bạn không được phân công phụ trách ca khám này.');
      error.statusCode = 403;
      throw error;
    }

    if (!['CHECKED_IN', 'IN_PROGRESS'].includes(appointment.status)) {
      const error = new Error('Chỉ có thể cập nhật hồ sơ khi lịch khám đang CHECKED_IN hoặc IN_PROGRESS');
      error.statusCode = 400;
      throw error;
    }
    if (!String(diagnosis || '').trim()) {
      const error = new Error('Chẩn đoán là bắt buộc trước khi hoàn tất khám');
      error.statusCode = 400;
      throw error;
    }

    if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
    if (clinicalNotes !== undefined) appointment.clinicalNotes = clinicalNotes;
    if (servicesPerformed !== undefined) appointment.servicesPerformed = servicesPerformed;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (teethImages !== undefined) appointment.teethImages = teethImages;
    if (dentalChart !== undefined) appointment.dentalChart = dentalChart;

    // Chuyển trạng thái về COMPLETED để hoàn tất
    appointment.status = 'COMPLETED';

    await appointment.save();

    const populated = await Appointment.findById(id)
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price');

    res.json({ success: true, message: 'Lưu bệnh án & hoàn tất khám thành công!', data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy chi tiết một lịch khám theo ID
 * @route   GET /api/v1/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price');

    if (!appointment) {
      const error = new Error('Không tìm thấy lịch khám');
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createAppointment, 
  monitorAppointments, 
  getFollowUpAppointments,
  getAppointments, 
  updateAppointmentStatus,
  updateAppointmentFollowUp,
  getDoctorTodayAppointments,
  examineAppointment,
  getAppointmentById
};
