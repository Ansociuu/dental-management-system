const Appointment = require('../models/Appointment');
const DutySchedule = require('../models/DutySchedule');
const Holiday = require('../models/Holiday');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Service = require('../models/Service');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { ensureServicePriceHistories, getEffectiveServicePrice } = require('../services/servicePriceService');

const BOOKING_OCCUPIED_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getDayRange = (dateInput) => {
  const parsed = new Date(dateInput);

  const utcStart = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0));
  const utcEnd = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));

  const localStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  const localEnd = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);

  return {
    $gte: new Date(Math.min(utcStart.getTime(), localStart.getTime())),
    $lte: new Date(Math.max(utcEnd.getTime(), localEnd.getTime()))
  };
};

const parseDateInput = (dateInput, label = 'Ngay') => {
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(`${label} khong hop le`);
  }
  return parsed;
};

const getPatientId = (req) => {
  const patientId = req.user?.patientId;
  if (!patientId) {
    throw createHttpError('Tai khoan benh nhan chua lien ket ho so', 403);
  }
  return patientId;
};

const populateAppointment = (query) => query
  .populate('patientId', 'fullName phone patientCode dob gender address')
  .populate('doctorId', 'fullName specialization avatar specialties')
  .populate('shiftId', 'name startTime endTime')
  .populate('serviceId', 'name price duration')
  .populate('servicesPerformed.serviceId', 'name price');

const getPortalMe = async (req, res, next) => {
  try {
    const patient = await Patient.findById(getPatientId(req));
    res.json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          status: req.user.status
        },
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePortalMe = async (req, res, next) => {
  try {
    const { fullName, email, phone, address } = req.body;
    const patient = await Patient.findById(getPatientId(req));
    const user = await User.findById(req.user._id);

    if (!patient || !user) {
      const error = new Error('Khong tim thay ho so benh nhan');
      error.statusCode = 404;
      throw error;
    }

    if (email !== undefined && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmail) {
        const error = new Error('Email da ton tai');
        error.statusCode = 400;
        throw error;
      }
      user.email = String(email).trim();
    }

    if (fullName !== undefined) {
      user.fullName = String(fullName).trim();
      patient.fullName = String(fullName).trim();
    }

    if (phone !== undefined && phone !== user.phone) {
      const existingPatient = await Patient.findOne({ phone, _id: { $ne: patient._id } });
      if (existingPatient) {
        const error = new Error('So dien thoai da ton tai trong ho so khac');
        error.statusCode = 400;
        throw error;
      }
      user.phone = String(phone).trim();
      patient.phone = String(phone).trim();
    }

    if (address !== undefined) {
      patient.address = String(address || '').trim();
    }

    await Promise.all([user.save(), patient.save()]);
    req.user = user;

    res.json({
      success: true,
      message: 'Cap nhat thong tin thanh cong',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status
        },
        patient
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPortalAppointments = async (req, res, next) => {
  try {
    const filter = { patientId: getPatientId(req) };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = getDayRange(req.query.dateFrom).$gte;
      if (req.query.dateTo) filter.date.$lte = getDayRange(req.query.dateTo).$lte;
    }

    const appointments = await populateAppointment(Appointment.find(filter))
      .sort({ date: -1, queueNumber: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

const getPortalAppointmentById = async (req, res, next) => {
  try {
    const appointment = await populateAppointment(Appointment.findOne({
      _id: req.params.id,
      patientId: getPatientId(req)
    }));

    if (!appointment) {
      const error = new Error('Khong tim thay lich kham');
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const getDoctorSuggestions = async (req, res, next) => {
  try {
    const { date, shiftId, serviceId } = req.query;
    if (!date || !shiftId) {
      throw createHttpError('Ngay kham va ca kham la bat buoc');
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw createHttpError('Ngay kham khong hop le');
    }

    const [shift, service, holiday] = await Promise.all([
      Shift.findOne({ _id: shiftId, status: 'ACTIVE' }),
      serviceId ? Service.findOne({ _id: serviceId, status: 'ACTIVE' }) : Promise.resolve(null),
      Holiday.findOne({
        status: 'ACTIVE',
        startDate: { $lte: appointmentDate },
        endDate: { $gte: appointmentDate }
      })
    ]);

    if (!shift) {
      throw createHttpError('Ca kham khong ton tai hoac dang tam dung', 404);
    }

    if (serviceId && !service) {
      throw createHttpError('Dich vu khong ton tai hoac dang tam dung', 404);
    }

    if (holiday) {
      throw createHttpError(`Khong the dat lich vao ngay nghi: ${holiday.name}`);
    }

    const duties = await DutySchedule.find({
      date: getDayRange(appointmentDate),
      shiftId,
      status: 'ACTIVE'
    }).populate({
      path: 'doctorId',
      match: { role: 'DOCTOR', status: 'ACTIVE' },
      select: 'fullName specialization avatar specialties'
    });

    const previousDoctorIds = await Appointment.distinct('doctorId', {
      patientId: getPatientId(req),
      status: 'COMPLETED'
    });
    const previousSet = new Set(previousDoctorIds.map((id) => id.toString()));

    const rawSuggestions = duties
      .filter((duty) => duty.doctorId)
      .map((duty) => ({
        doctor: duty.doctorId,
        isPreviousDoctor: previousSet.has(duty.doctorId._id.toString())
      }));

    const suggestionsWithCapacity = await Promise.all(rawSuggestions.map(async (item) => {
      const currentCount = await Appointment.countDocuments({
        doctorId: item.doctor._id,
        shiftId,
        date: getDayRange(appointmentDate),
        status: { $in: BOOKING_OCCUPIED_STATUSES }
      });

      if (currentCount >= shift.maxPatients) return null;

      return {
        ...item,
        availableSlots: shift.maxPatients - currentCount
      };
    }));

    const suggestions = suggestionsWithCapacity
      .filter(Boolean)
      .sort((a, b) => Number(b.isPreviousDoctor) - Number(a.isPreviousDoctor));

    res.json({
      success: true,
      data: suggestions,
      meta: { total: suggestions.length }
    });
  } catch (error) {
    next(error);
  }
};

const getBookingOptions = async (req, res, next) => {
  try {
    getPatientId(req);
    const [services, shifts] = await Promise.all([
      Service.find({ status: 'ACTIVE' }).sort({ name: 1 }),
      Shift.find({ status: 'ACTIVE' }).sort({ startTime: 1 })
    ]);
    await ensureServicePriceHistories(services, req.user);
    const refreshedServices = await Service.find({ status: 'ACTIVE' }).sort({ name: 1 });

    res.json({ success: true, data: { services: refreshedServices, shifts } });
  } catch (error) {
    next(error);
  }
};

const getBookingAvailability = async (req, res, next) => {
  try {
    getPatientId(req);
    const { dateFrom, dateTo, serviceId } = req.query;

    if (!dateFrom || !dateTo) {
      throw createHttpError('Tu ngay va den ngay la bat buoc');
    }

    const from = parseDateInput(dateFrom, 'Tu ngay');
    const to = parseDateInput(dateTo, 'Den ngay');
    const start = getDayRange(from).$gte;
    const end = getDayRange(to).$lte;

    if (end < start) {
      throw createHttpError('Khoang ngay khong hop le');
    }

    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 93) {
      throw createHttpError('Chi duoc xem lich trong toi da 3 thang');
    }

    if (serviceId) {
      const service = await Service.findOne({ _id: serviceId, status: 'ACTIVE' });
      if (!service) {
        throw createHttpError('Dich vu khong ton tai hoac dang tam dung', 404);
      }
    }

    const [duties, holidays, previousDoctorIds] = await Promise.all([
      DutySchedule.find({
        date: { $gte: start, $lte: end },
        status: 'ACTIVE'
      })
        .populate({
          path: 'doctorId',
          match: { role: 'DOCTOR', status: 'ACTIVE' },
          select: 'fullName specialization avatar specialties'
        })
        .populate({
          path: 'shiftId',
          match: { status: 'ACTIVE' },
          select: 'name startTime endTime maxPatients'
        })
        .sort({ date: 1 }),
      Holiday.find({
        status: 'ACTIVE',
        startDate: { $lte: end },
        endDate: { $gte: start }
      }).select('name startDate endDate holidayType notes'),
      Appointment.distinct('doctorId', {
        patientId: getPatientId(req),
        status: 'COMPLETED'
      })
    ]);

    const previousSet = new Set(previousDoctorIds.map((id) => id.toString()));
    const activeDuties = duties.filter((duty) => duty.doctorId && duty.shiftId);

    const slots = await Promise.all(activeDuties.map(async (duty) => {
      const bookedCount = await Appointment.countDocuments({
        doctorId: duty.doctorId._id,
        shiftId: duty.shiftId._id,
        date: getDayRange(duty.date),
        status: { $in: BOOKING_OCCUPIED_STATUSES }
      });
      const maxPatients = duty.shiftId.maxPatients || 0;
      const availableSlots = Math.max(maxPatients - bookedCount, 0);

      return {
        _id: duty._id,
        date: duty.date,
        shift: duty.shiftId,
        doctor: duty.doctorId,
        isPreviousDoctor: previousSet.has(duty.doctorId._id.toString()),
        bookedCount,
        maxPatients,
        availableSlots,
        isFull: availableSlots <= 0
      };
    }));

    slots.sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff) return dateDiff;
      const shiftDiff = String(a.shift?.startTime || '').localeCompare(String(b.shift?.startTime || ''));
      if (shiftDiff) return shiftDiff;
      const previousDiff = Number(b.isPreviousDoctor) - Number(a.isPreviousDoctor);
      if (previousDiff) return previousDiff;
      return String(a.doctor?.fullName || '').localeCompare(String(b.doctor?.fullName || ''));
    });

    res.json({
      success: true,
      data: {
        slots,
        holidays
      }
    });
  } catch (error) {
    next(error);
  }
};

const createPortalAppointment = async (req, res, next) => {
  try {
    const patientId = getPatientId(req);
    const { doctorId, shiftId, date, serviceId, symptoms } = req.body;
    if (!doctorId || !shiftId || !date || !serviceId) {
      throw createHttpError('Bac si, ca kham, ngay kham va dich vu la bat buoc');
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      throw createHttpError('Ngay kham khong hop le');
    }

    const [doctor, service, shift] = await Promise.all([
      User.findOne({ _id: doctorId, role: 'DOCTOR', status: 'ACTIVE' }),
      Service.findOne({ _id: serviceId, status: 'ACTIVE' }),
      Shift.findOne({ _id: shiftId, status: 'ACTIVE' })
    ]);

    if (!doctor) {
      throw createHttpError('Bac si khong ton tai hoac dang tam khoa', 404);
    }

    if (!service) {
      throw createHttpError('Dich vu khong ton tai hoac dang tam dung', 404);
    }

    if (!shift) {
      throw createHttpError('Ca kham khong ton tai hoac dang tam dung', 404);
    }

    const holiday = await Holiday.findOne({
      status: 'ACTIVE',
      startDate: { $lte: appointmentDate },
      endDate: { $gte: appointmentDate }
    });
    if (holiday) {
      const error = new Error(`Khong the dat lich vao ngay nghi: ${holiday.name}`);
      error.statusCode = 400;
      throw error;
    }

    const dutyExists = await DutySchedule.findOne({
      doctorId,
      date: getDayRange(appointmentDate),
      shiftId,
      status: 'ACTIVE'
    });
    if (!dutyExists) {
      const error = new Error('Bac si khong co lich truc vao ca nay trong ngay da chon');
      error.statusCode = 400;
      throw error;
    }

    const currentCount = await Appointment.countDocuments({
      doctorId,
      shiftId,
      date: getDayRange(appointmentDate),
      status: { $in: BOOKING_OCCUPIED_STATUSES }
    });

    if (currentCount >= shift.maxPatients) {
      const error = new Error(`Ca ${shift.name} da day. Vui long chon ca khac.`);
      error.statusCode = 400;
      throw error;
    }

    const priceHistory = await getEffectiveServicePrice(service, appointmentDate);
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      shiftId,
      date: appointmentDate,
      serviceId,
      serviceNameAtBooking: service.name,
      servicePriceAtBooking: priceHistory?.price || service.price,
      servicePriceEffectiveFrom: priceHistory?.effectiveFrom,
      symptoms: symptoms ? String(symptoms).trim() : '',
      queueNumber: currentCount + 1,
      status: 'PENDING'
    });

    const populated = await populateAppointment(Appointment.findById(appointment._id));
    res.status(201).json({ success: true, message: 'Dat lich kham thanh cong', data: populated });
  } catch (error) {
    next(error);
  }
};

const getPortalInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({
      patientId: getPatientId(req),
      paymentStatus: 'PAID'
    })
      .populate('appointmentId', 'date queueNumber status symptoms')
      .populate('doctorId', 'fullName specialization')
      .populate('items.serviceId', 'name price')
      .sort({ paidAt: -1, createdAt: -1 });

    res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortalMe,
  updatePortalMe,
  getPortalAppointments,
  getPortalAppointmentById,
  createPortalAppointment,
  getBookingOptions,
  getBookingAvailability,
  getDoctorSuggestions,
  getPortalInvoices
};
