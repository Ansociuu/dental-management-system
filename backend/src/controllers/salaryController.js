const Appointment = require('../models/Appointment');
const AppointmentComplexity = require('../models/AppointmentComplexity');
const DoctorSalaryProfile = require('../models/DoctorSalaryProfile');
const DutySchedule = require('../models/DutySchedule');
const Holiday = require('../models/Holiday');
const SalaryPayslip = require('../models/SalaryPayslip');
const SalaryRate = require('../models/SalaryRate');
const SalarySetting = require('../models/SalarySetting');
const Shift = require('../models/Shift');
const ShiftSalaryRule = require('../models/ShiftSalaryRule');
const User = require('../models/User');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const DEFAULT_BASE_HOURLY_RATE = 210000;
const VALID_PAYSLIP_REPORT_STATUSES = ['FINALIZED', 'APPROVED', 'PAID'];
const PAYSLIP_STATUSES = ['DRAFT', 'FINALIZED', 'APPROVED', 'PAID', 'CANCELLED'];

const DEGREE_LEVELS = [
  { value: 'UNIVERSITY', label: 'Đại học', coefficient: 1.2 },
  { value: 'MASTER', label: 'Thạc sĩ', coefficient: 1.5 },
  { value: 'DOCTORATE', label: 'Tiến sĩ', coefficient: 2.0 },
  { value: 'ASSOCIATE_PROFESSOR', label: 'Phó giáo sư', coefficient: 2.5 },
  { value: 'PROFESSOR', label: 'Giáo sư', coefficient: 3.0 }
];

const WEEK_DAYS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ nhật' }
];

const SHIFT_DAY_TYPES = [
  { value: 'WEEKDAY_OFFICE', dayOfWeek: -1, label: 'Ngày thường (trong giờ hành chính)' },
  { value: 'WEEKDAY_AFTER_HOURS', dayOfWeek: -2, label: 'Ngày thường (ngoài giờ)' },
  { value: 'SATURDAY', dayOfWeek: 6, label: 'Thứ 7' },
  { value: 'SUNDAY', dayOfWeek: 0, label: 'Chủ nhật' },
  { value: 'HOLIDAY', dayOfWeek: -3, label: 'Ngày lễ' }
];

const SALARY_SETTING_LOG_FIELDS = ['baseHourlyRate', 'effectiveFrom', 'effectiveTo', 'status', 'note'];
const SHIFT_RULE_LOG_FIELDS = ['shiftId', 'dayType', 'dayOfWeek', 'shiftCoefficient', 'status'];

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getDegreeConfig = (degreeLevel) => (
  DEGREE_LEVELS.find((item) => item.value === degreeLevel) || DEGREE_LEVELS[0]
);

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeComplexityCoefficient = (value, fallback = 0) => {
  const number = normalizeNumber(value, fallback);
  return Math.min(0.5, Math.max(0, Math.round((number + Number.EPSILON) * 100) / 100));
};

const roundHours = (value) => Math.round((normalizeNumber(value) + Number.EPSILON) * 100) / 100;
const roundMoney = (value) => Math.round(normalizeNumber(value));

const getServiceComplexityCoefficient = (service) => (
  normalizeComplexityCoefficient(service?.complexityCoefficient, 0)
);

const getAppointmentServiceItems = (appointment) => {
  const performedServices = Array.isArray(appointment?.servicesPerformed)
    ? appointment.servicesPerformed
        .map((item) => item.serviceId)
        .filter(Boolean)
    : [];

  if (performedServices.length > 0) return performedServices;
  return appointment?.serviceId ? [appointment.serviceId] : [];
};

const getAppointmentServiceNames = (appointment) => {
  const names = getAppointmentServiceItems(appointment)
    .map((service) => service?.name)
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : '-';
};

const getAppointmentServiceComplexityCoefficient = (appointment) => {
  const coefficients = getAppointmentServiceItems(appointment).map(getServiceComplexityCoefficient);
  if (coefficients.length === 0) return 0;
  return normalizeComplexityCoefficient(Math.max(...coefficients), 0);
};

const getEffectiveAppointmentComplexity = (complexity, serviceComplexityCoefficient) => {
  const manualCoefficient = normalizeComplexityCoefficient(complexity?.complexityCoefficient, 0);
  const hasNote = String(complexity?.note || '').trim().length > 0;
  const usesManualValue = Boolean(complexity) && (
    manualCoefficient > 0 ||
    hasNote ||
    serviceComplexityCoefficient === 0
  );

  return {
    coefficient: usesManualValue ? manualCoefficient : serviceComplexityCoefficient,
    source: usesManualValue ? 'MANUAL' : 'SERVICE_DEFAULT'
  };
};

const startOfDay = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const endOfDay = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const parseEffectiveDate = (dateInput, fallback = new Date(), end = false) => {
  if (!dateInput) return end ? endOfDay(fallback) : startOfDay(fallback);
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError('Ngày hiệu lực không hợp lệ.');
  }
  return end ? endOfDay(date) : startOfDay(date);
};

const getRateStatusForToday = (effectiveFrom, effectiveTo) => {
  const today = startOfDay();
  if (startOfDay(effectiveFrom) > today) return 'PENDING';
  if (effectiveTo && endOfDay(effectiveTo) < today) return 'INACTIVE';
  return 'ACTIVE';
};

const getLocalDateKey = (dateInput) => {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseMonth = (monthInput) => {
  if (!/^\d{4}-\d{2}$/.test(String(monthInput || ''))) {
    throw createHttpError('Tháng lương không hợp lệ. Định dạng đúng là YYYY-MM.');
  }

  const [year, month] = monthInput.split('-').map(Number);
  if (month < 1 || month > 12) {
    throw createHttpError('Tháng lương không hợp lệ.');
  }

  return {
    month: monthInput,
    year,
    monthNumber: month,
    start: new Date(year, month - 1, 1, 0, 0, 0, 0),
    end: new Date(year, month, 0, 23, 59, 59, 999)
  };
};

const monthFromYear = (year, monthIndex) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const getClockMinutes = (time) => {
  const [hour, minute] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return hour * 60 + minute;
};

const getShiftHours = (startTime, endTime) => {
  const start = getClockMinutes(startTime);
  let end = getClockMinutes(endTime);
  if (end <= start) end += 24 * 60;
  return roundHours((end - start) / 60);
};

const getDayTypeConfig = (dayType) => (
  SHIFT_DAY_TYPES.find((item) => item.value === dayType) || SHIFT_DAY_TYPES[0]
);

const isAfterHoursShift = (shift) => {
  const name = String(shift?.name || '').toLowerCase();
  return name.includes('tối') || name.includes('toi') || getClockMinutes(shift?.startTime) >= 17 * 60;
};

const isDateInHoliday = (dateInput, holidays = []) => {
  const date = new Date(dateInput);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const endOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  return holidays.some((holiday) => (
    holiday.status === 'ACTIVE' &&
    new Date(holiday.startDate) <= endOfDate &&
    new Date(holiday.endDate) >= startOfDate
  ));
};

const getShiftRuleTypeForDuty = (duty, shift, holidays = []) => {
  if (isDateInHoliday(duty.date, holidays)) return 'HOLIDAY';

  const dayOfWeek = new Date(duty.date).getDay();
  if (dayOfWeek === 0) return 'SUNDAY';
  if (dayOfWeek === 6) return 'SATURDAY';
  if (isAfterHoursShift(shift)) return 'WEEKDAY_AFTER_HOURS';
  return 'WEEKDAY_OFFICE';
};

const getShiftSnapshot = (duty) => {
  const snapshot = duty.shiftSnapshot || {};
  const shift = duty.shiftId || {};

  return {
    _id: shift?._id || shift,
    name: snapshot.name || shift?.name || 'Ca làm việc',
    startTime: snapshot.startTime || shift?.startTime || '',
    endTime: snapshot.endTime || shift?.endTime || '',
    maxPatients: snapshot.maxPatients || shift?.maxPatients || 0
  };
};

const ensureBaseSetting = async () => {
  let setting = await SalarySetting.findOne({ key: 'BASE_RATE' });
  if (!setting) {
    try {
      setting = await SalarySetting.create({
        key: 'BASE_RATE',
        baseHourlyRate: DEFAULT_BASE_HOURLY_RATE
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      setting = await SalarySetting.findOne({ key: 'BASE_RATE' });
    }
  }

  const existingRate = await SalaryRate.findOne();
  if (!existingRate) {
    await SalaryRate.create({
      baseHourlyRate: normalizeNumber(setting.baseHourlyRate, DEFAULT_BASE_HOURLY_RATE),
      effectiveFrom: startOfDay(),
      status: 'ACTIVE',
      note: 'Mức tiền mặc định'
    });
  }

  await refreshSalaryRateStatuses();
  const activeRate = await getActiveSalaryRateForDate(new Date());
  if (activeRate && activeRate.baseHourlyRate !== setting.baseHourlyRate) {
    setting.baseHourlyRate = activeRate.baseHourlyRate;
    await setting.save();
  }

  return {
    ...setting.toObject(),
    baseHourlyRate: activeRate?.baseHourlyRate || setting.baseHourlyRate
  };
};

const refreshSalaryRateStatuses = async () => {
  const rates = await SalaryRate.find().sort({ effectiveFrom: 1, createdAt: 1 });
  await Promise.all(rates.map((rate) => {
    const status = getRateStatusForToday(rate.effectiveFrom, rate.effectiveTo);
    if (rate.status === status) return Promise.resolve(rate);
    rate.status = status;
    return rate.save();
  }));
};

const getActiveSalaryRateForDate = async (dateInput) => {
  const date = new Date(dateInput);
  return SalaryRate.findOne({
    effectiveFrom: { $lte: date },
    $or: [{ effectiveTo: null }, { effectiveTo: { $gte: date } }]
  }).sort({ effectiveFrom: -1, createdAt: -1 }).lean();
};

const getBaseRateForDate = (dateInput, rates = [], fallback = DEFAULT_BASE_HOURLY_RATE) => {
  const date = new Date(dateInput);
  const matched = rates
    .filter((rate) => (
      new Date(rate.effectiveFrom) <= date &&
      (!rate.effectiveTo || new Date(rate.effectiveTo) >= date)
    ))
    .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0];

  return normalizeNumber(matched?.baseHourlyRate, fallback);
};

const serializeSalaryRate = (rate) => ({
  _id: rate._id,
  baseHourlyRate: rate.baseHourlyRate,
  effectiveFrom: rate.effectiveFrom,
  effectiveTo: rate.effectiveTo,
  status: rate.status,
  note: rate.note || '',
  createdAt: rate.createdAt,
  updatedAt: rate.updatedAt
});

const getDoctorProfileSnapshot = async (doctorId) => {
  const profile = await DoctorSalaryProfile.findOneAndUpdate(
    { doctorId },
    { $setOnInsert: { doctorId } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );
  const degreeLevel = profile?.degreeLevel || 'UNIVERSITY';
  const degreeConfig = getDegreeConfig(degreeLevel);

  return {
    degreeLevel,
    degreeLabel: degreeConfig.label,
    doctorCoefficient: normalizeNumber(profile?.doctorCoefficient, degreeConfig.coefficient)
  };
};

const getDoctorProfilesPayload = async () => {
  const doctors = await User.find({ role: 'DOCTOR' }).sort({ fullName: 1 }).lean();
  const profiles = await Promise.all(doctors.map((doctor) => (
    DoctorSalaryProfile.findOneAndUpdate(
      { doctorId: doctor._id },
      { $setOnInsert: { doctorId: doctor._id } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean()
  )));
  const profileMap = new Map(profiles.map((profile) => [profile.doctorId.toString(), profile]));

  return doctors.map((doctor) => {
    const profile = profileMap.get(doctor._id.toString());
    const degreeLevel = profile?.degreeLevel || 'UNIVERSITY';
    const degreeConfig = getDegreeConfig(degreeLevel);

    return {
      doctor,
      profile: {
        _id: profile?._id,
        degreeLevel,
        degreeLabel: degreeConfig.label,
        doctorCoefficient: normalizeNumber(profile?.doctorCoefficient, degreeConfig.coefficient)
      }
    };
  });
};

const getRuleMap = async (shiftIds) => {
  const rules = await ShiftSalaryRule.find({
    shiftId: { $in: shiftIds },
    status: 'ACTIVE'
  }).lean();
  return new Map(rules.map((rule) => [`${rule.shiftId.toString()}:${rule.dayType}`, rule]));
};

const calculatePayslipData = async ({ doctorId, doctorDoc, month, setting }) => {
  const period = parseMonth(month);
  const doctor = doctorDoc || await User.findOne({ _id: doctorId, role: 'DOCTOR' }).lean();

  if (!doctor) {
    throw createHttpError('Không tìm thấy bác sĩ.', 404);
  }

  const [baseSetting, profile, duties, appointments, complexities, holidays, salaryRates] = await Promise.all([
    setting ? Promise.resolve(setting) : ensureBaseSetting(),
    getDoctorProfileSnapshot(doctor._id),
    DutySchedule.find({
      doctorId: doctor._id,
      status: 'ACTIVE',
      date: { $gte: period.start, $lte: period.end }
    })
      .populate('shiftId', 'name startTime endTime maxPatients')
      .sort({ date: 1 })
      .lean(),
    Appointment.find({
      doctorId: doctor._id,
      status: 'COMPLETED',
      date: { $gte: period.start, $lte: period.end }
    })
      .populate('patientId', 'fullName patientCode phone')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name complexityCoefficient')
      .populate('servicesPerformed.serviceId', 'name complexityCoefficient')
      .sort({ date: 1, queueNumber: 1 })
      .lean(),
    AppointmentComplexity.find({
      doctorId: doctor._id,
      date: { $gte: period.start, $lte: period.end }
    }).lean(),
    Holiday.find({
      status: 'ACTIVE',
      startDate: { $lte: period.end },
      endDate: { $gte: period.start }
    }).lean(),
    SalaryRate.find({
      effectiveFrom: { $lte: period.end },
      $or: [{ effectiveTo: null }, { effectiveTo: { $gte: period.start } }]
    }).sort({ effectiveFrom: 1 }).lean()
  ]);

  const shiftIds = duties
    .map((duty) => getShiftSnapshot(duty)._id)
    .filter(Boolean)
    .map((id) => id.toString());

  const ruleMap = await getRuleMap(shiftIds);
  const complexityMap = new Map(complexities.map((item) => [item.appointmentId.toString(), item]));
  const appointmentsByShiftDate = new Map();

  appointments.forEach((appointment) => {
    const shiftId = appointment.shiftId?._id || appointment.shiftId;
    if (!shiftId) return;
    const key = `${getLocalDateKey(appointment.date)}:${shiftId.toString()}`;
    const current = appointmentsByShiftDate.get(key) || [];
    current.push(appointment);
    appointmentsByShiftDate.set(key, current);
  });

  const baseHourlyRate = normalizeNumber(baseSetting.baseHourlyRate, DEFAULT_BASE_HOURLY_RATE);

  const lines = duties.map((duty) => {
    const shift = getShiftSnapshot(duty);
    const shiftId = shift._id?.toString();
    const dateKey = getLocalDateKey(duty.date);
    const dayType = getShiftRuleTypeForDuty(duty, shift, holidays);
    const rule = ruleMap.get(`${shiftId}:${dayType}`);
    const shiftCoefficient = normalizeNumber(rule?.shiftCoefficient, 1);
    const workingHours = getShiftHours(shift.startTime, shift.endTime);
    const lineBaseHourlyRate = getBaseRateForDate(duty.date, salaryRates, baseHourlyRate);
    const shiftAppointments = appointmentsByShiftDate.get(`${dateKey}:${shiftId}`) || [];

    const appointmentLines = shiftAppointments.map((appointment) => {
      const complexity = complexityMap.get(appointment._id.toString());
      const serviceComplexityCoefficient = getAppointmentServiceComplexityCoefficient(appointment);
      const effectiveComplexity = getEffectiveAppointmentComplexity(complexity, serviceComplexityCoefficient);
      return {
        appointmentId: appointment._id,
        patientId: appointment.patientId?._id || appointment.patientId,
        patientName: appointment.patientId?.fullName || '-',
        patientCode: appointment.patientId?.patientCode || '-',
        serviceName: getAppointmentServiceNames(appointment),
        serviceComplexityCoefficient,
        complexityCoefficient: effectiveComplexity.coefficient,
        complexitySource: effectiveComplexity.source,
        note: complexity?.note || ''
      };
    });

    const patientComplexityTotal = roundHours(appointmentLines.reduce(
      (sum, appointment) => sum + normalizeNumber(appointment.complexityCoefficient, 0),
      0
    ));
    const convertedHours = roundHours(workingHours * (shiftCoefficient + patientComplexityTotal));
    const amount = roundMoney(convertedHours * profile.doctorCoefficient * lineBaseHourlyRate);

    return {
      dutyId: duty._id,
      date: duty.date,
      shiftId: shift._id,
      shiftName: shift.name,
      dayType,
      dayTypeLabel: getDayTypeConfig(dayType).label,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workingHours,
      baseHourlyRate: lineBaseHourlyRate,
      shiftCoefficient,
      patientComplexityTotal,
      convertedHours,
      amount,
      appointments: appointmentLines
    };
  });

  const totals = lines.reduce((acc, line) => {
    acc.totalShifts += 1;
    acc.totalAppointments += line.appointments.length;
    acc.totalWorkingHours += line.workingHours;
    acc.totalConvertedHours += line.convertedHours;
    acc.totalAmount += line.amount;
    return acc;
  }, {
    totalShifts: 0,
    totalAppointments: 0,
    totalWorkingHours: 0,
    totalConvertedHours: 0,
    totalAmount: 0
  });

  return {
    month: period.month,
    doctor: {
      _id: doctor._id,
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization
    },
    baseHourlyRate,
    doctorDegreeLevel: profile.degreeLevel,
    doctorDegreeLabel: profile.degreeLabel,
    doctorCoefficient: profile.doctorCoefficient,
    totalShifts: totals.totalShifts,
    totalAppointments: totals.totalAppointments,
    totalWorkingHours: roundHours(totals.totalWorkingHours),
    totalConvertedHours: roundHours(totals.totalConvertedHours),
    totalAllowance: 0,
    totalDeduction: 0,
    totalAmount: roundMoney(totals.totalAmount),
    lines
  };
};

const toPayslipPayload = (data, user, status = 'FINALIZED') => ({
  doctorId: data.doctor._id,
  month: data.month,
  status,
  baseHourlyRate: data.baseHourlyRate,
  doctorDegreeLevel: data.doctorDegreeLevel,
  doctorDegreeLabel: data.doctorDegreeLabel,
  doctorCoefficient: data.doctorCoefficient,
  totalShifts: data.totalShifts,
  totalAppointments: data.totalAppointments,
  totalWorkingHours: data.totalWorkingHours,
  totalConvertedHours: data.totalConvertedHours,
  totalAllowance: normalizeNumber(data.totalAllowance, 0),
  totalDeduction: normalizeNumber(data.totalDeduction, 0),
  totalAmount: data.totalAmount,
  lines: data.lines,
  generatedBy: user?._id,
  generatedAt: new Date()
});

const getBaseRate = async (req, res, next) => {
  try {
    const setting = await ensureBaseSetting();
    const rates = await SalaryRate.find().sort({ effectiveFrom: -1, createdAt: -1 }).lean();
    const activeRate = await getActiveSalaryRateForDate(new Date());
    res.json({
      success: true,
      data: {
        baseHourlyRate: setting.baseHourlyRate,
        activeRate: activeRate ? serializeSalaryRate(activeRate) : null,
        rates: rates.map(serializeSalaryRate),
        updatedAt: setting.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateBaseRate = async (req, res, next) => {
  try {
    const baseHourlyRate = normalizeNumber(req.body.baseHourlyRate, -1);
    if (baseHourlyRate <= 0) {
      throw createHttpError('Số tiền một giờ phải lớn hơn 0.');
    }
    const effectiveFrom = parseEffectiveDate(req.body.effectiveFrom);
    const effectiveTo = req.body.effectiveTo ? parseEffectiveDate(req.body.effectiveTo, undefined, true) : null;
    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw createHttpError('Ngày kết thúc hiệu lực phải sau ngày áp dụng.');
    }

    const currentSetting = await ensureBaseSetting();
    const existingRate = await SalaryRate.findOne({ effectiveFrom });
    const currentRate = existingRate || await getActiveSalaryRateForDate(effectiveFrom);
    const before = currentRate ? toPlainObject(currentRate, SALARY_SETTING_LOG_FIELDS) : toPlainObject(currentSetting, ['baseHourlyRate']);
    const previousEffectiveTo = endOfDay(addDays(effectiveFrom, -1));
    await SalaryRate.updateMany(
      {
        effectiveFrom: { $lt: effectiveFrom },
        $or: [{ effectiveTo: null }, { effectiveTo: { $gte: effectiveFrom } }]
      },
      { $set: { effectiveTo: previousEffectiveTo, updatedBy: req.user._id } }
    );

    let savedRate;
    if (existingRate) {
      existingRate.baseHourlyRate = baseHourlyRate;
      existingRate.effectiveTo = effectiveTo;
      existingRate.status = getRateStatusForToday(effectiveFrom, effectiveTo);
      existingRate.note = String(req.body.note || '').trim();
      existingRate.updatedBy = req.user._id;
      savedRate = await existingRate.save();
    } else {
      savedRate = await SalaryRate.create({
        baseHourlyRate,
        effectiveFrom,
        effectiveTo,
        status: getRateStatusForToday(effectiveFrom, effectiveTo),
        note: String(req.body.note || '').trim(),
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
    }
    await refreshSalaryRateStatuses();
    const activeRate = await getActiveSalaryRateForDate(new Date());
    const setting = await SalarySetting.findOneAndUpdate(
      { key: 'BASE_RATE' },
      { baseHourlyRate: activeRate?.baseHourlyRate || baseHourlyRate, updatedBy: req.user._id },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    await recordConfigChange({
      resourceType: 'SALARY_SETTING',
      resourceId: savedRate._id,
      resourceName: 'Tiền cơ bản một giờ',
      action: existingRate ? 'UPDATE' : 'CREATE',
      before,
      after: toPlainObject(savedRate, SALARY_SETTING_LOG_FIELDS),
      user: req.user
    });
    const rates = await SalaryRate.find().sort({ effectiveFrom: -1, createdAt: -1 }).lean();

    res.json({
      success: true,
      message: 'Lưu mức tiền một giờ thành công.',
      data: {
        baseHourlyRate: setting.baseHourlyRate,
        activeRate: activeRate ? serializeSalaryRate(activeRate) : null,
        rates: rates.map(serializeSalaryRate),
        updatedAt: setting.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorProfiles = async (req, res, next) => {
  try {
    const data = await getDoctorProfilesPayload();
    res.json({ success: true, data, meta: { degreeLevels: DEGREE_LEVELS } });
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.doctorId, role: 'DOCTOR' });
    if (!doctor) {
      throw createHttpError('Không tìm thấy bác sĩ.', 404);
    }

    const degreeLevel = req.body.degreeLevel || 'UNIVERSITY';
    const degreeConfig = getDegreeConfig(degreeLevel);
    const doctorCoefficient = normalizeNumber(req.body.doctorCoefficient, degreeConfig.coefficient);

    if (doctorCoefficient <= 0) {
      throw createHttpError('Hệ số bác sĩ phải lớn hơn 0.');
    }

    const profile = await DoctorSalaryProfile.findOneAndUpdate(
      { doctorId: doctor._id },
      {
        degreeLevel,
        doctorCoefficient,
        updatedBy: req.user._id
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật hệ số bác sĩ thành công.',
      data: {
        doctor,
        profile: {
          _id: profile._id,
          degreeLevel: profile.degreeLevel,
          degreeLabel: getDegreeConfig(profile.degreeLevel).label,
          doctorCoefficient: profile.doctorCoefficient
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getShiftRules = async (req, res, next) => {
  try {
    const [shifts, rules] = await Promise.all([
      Shift.find().sort({ startTime: 1 }).lean(),
      ShiftSalaryRule.find().lean()
    ]);

    const ruleMap = new Map(rules.map((rule) => [`${rule.shiftId.toString()}:${rule.dayType}`, rule]));
    const matrix = shifts.map((shift) => ({
      shift,
      rules: SHIFT_DAY_TYPES.map((dayType) => {
        const rule = ruleMap.get(`${shift._id.toString()}:${dayType.value}`);
        return {
          _id: rule?._id,
          dayType: dayType.value,
          dayOfWeek: dayType.dayOfWeek,
          label: dayType.label,
          shiftCoefficient: normalizeNumber(rule?.shiftCoefficient, 1),
          status: rule?.status || 'ACTIVE'
        };
      })
    }));

    res.json({ success: true, data: matrix, meta: { dayTypes: SHIFT_DAY_TYPES } });
  } catch (error) {
    next(error);
  }
};

const updateShiftRules = async (req, res, next) => {
  try {
    const rules = Array.isArray(req.body.rules) ? req.body.rules : [];
    if (rules.length === 0) {
      throw createHttpError('Danh sách hệ số ca không được để trống.');
    }

    await Promise.all(rules.map(async (rule) => {
      const shiftCoefficient = normalizeNumber(rule.shiftCoefficient, -1);
      const dayConfig = getDayTypeConfig(rule.dayType);

      if (shiftCoefficient < 1) {
        throw createHttpError('Hệ số ca làm việc phải lớn hơn hoặc bằng 1.0.');
      }

      const currentRule = await ShiftSalaryRule.findOne({ shiftId: rule.shiftId, dayType: dayConfig.value });
      const before = currentRule ? toPlainObject(currentRule, SHIFT_RULE_LOG_FIELDS) : null;
      const savedRule = await ShiftSalaryRule.findOneAndUpdate(
        { shiftId: rule.shiftId, dayType: dayConfig.value },
        {
          dayType: dayConfig.value,
          dayOfWeek: dayConfig.dayOfWeek,
          shiftCoefficient,
          status: rule.status || 'ACTIVE',
          updatedBy: req.user._id
        },
        { returnDocument: 'after', upsert: true, runValidators: true }
      );
      await recordConfigChange({
        resourceType: 'SHIFT_SALARY_RULE',
        resourceId: savedRule._id,
        resourceName: dayConfig.label,
        action: currentRule ? 'UPDATE' : 'CREATE',
        before,
        after: toPlainObject(savedRule, SHIFT_RULE_LOG_FIELDS),
        user: req.user
      });
      return savedRule;
    }));

    const [shifts, savedRules] = await Promise.all([
      Shift.find().sort({ startTime: 1 }).lean(),
      ShiftSalaryRule.find().lean()
    ]);
    const ruleMap = new Map(savedRules.map((rule) => [`${rule.shiftId.toString()}:${rule.dayType}`, rule]));
    const matrix = shifts.map((shift) => ({
      shift,
      rules: SHIFT_DAY_TYPES.map((dayType) => {
        const rule = ruleMap.get(`${shift._id.toString()}:${dayType.value}`);
        return {
          _id: rule?._id,
          dayType: dayType.value,
          dayOfWeek: dayType.dayOfWeek,
          label: dayType.label,
          shiftCoefficient: normalizeNumber(rule?.shiftCoefficient, 1),
          status: rule?.status || 'ACTIVE'
        };
      })
    }));

    res.json({
      success: true,
      message: 'Cập nhật hệ số ca làm việc thành công.',
      data: matrix,
      meta: { dayTypes: SHIFT_DAY_TYPES }
    });
  } catch (error) {
    next(error);
  }
};

const getComplexities = async (req, res, next) => {
  try {
    const period = parseMonth(req.query.month);
    const filter = {
      status: 'COMPLETED',
      date: { $gte: period.start, $lte: period.end }
    };
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;

    const [appointments, complexities, doctors, doctorProfiles] = await Promise.all([
      Appointment.find(filter)
        .populate('patientId', 'fullName patientCode phone')
        .populate('doctorId', 'fullName specialization')
        .populate('shiftId', 'name startTime endTime')
        .populate('serviceId', 'name complexityCoefficient')
        .populate('servicesPerformed.serviceId', 'name complexityCoefficient')
        .sort({ date: 1, queueNumber: 1 })
        .lean(),
      AppointmentComplexity.find({
        date: { $gte: period.start, $lte: period.end },
        ...(req.query.doctorId ? { doctorId: req.query.doctorId } : {})
      }).lean(),
      User.find({ role: 'DOCTOR' }).select('fullName email phone specialization').sort({ fullName: 1 }).lean(),
      DoctorSalaryProfile.find().lean()
    ]);

    const complexityMap = new Map(complexities.map((item) => [item.appointmentId.toString(), item]));
    const doctorProfileMap = new Map(doctorProfiles.map((profile) => [profile.doctorId.toString(), profile]));
    const doctorsWithProfiles = doctors.map((doctor) => {
      const profile = doctorProfileMap.get(doctor._id.toString());
      return {
        ...doctor,
        degreeLevel: profile?.degreeLevel || 'UNIVERSITY'
      };
    });
    const data = appointments.map((appointment) => {
      const complexity = complexityMap.get(appointment._id.toString());
      const serviceComplexityCoefficient = getAppointmentServiceComplexityCoefficient(appointment);
      const effectiveComplexity = getEffectiveAppointmentComplexity(complexity, serviceComplexityCoefficient);
      const appointmentDoctorId = appointment.doctorId?._id || appointment.doctorId;
      const doctorProfile = appointmentDoctorId
        ? doctorProfileMap.get(appointmentDoctorId.toString())
        : null;
      return {
        appointment: {
          ...appointment,
          doctorProfile: {
            degreeLevel: doctorProfile?.degreeLevel || 'UNIVERSITY'
          }
        },
        complexity: {
          _id: complexity?._id,
          complexityCoefficient: effectiveComplexity.coefficient,
          serviceComplexityCoefficient,
          source: effectiveComplexity.source,
          note: complexity?.note || ''
        }
      };
    });

    res.json({ success: true, data, meta: { doctors: doctorsWithProfiles } });
  } catch (error) {
    next(error);
  }
};

const updateComplexities = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0) {
      throw createHttpError('Danh sách ca bệnh cần cập nhật không được để trống.');
    }

    await Promise.all(items.map(async (item) => {
      const complexityCoefficient = normalizeNumber(item.complexityCoefficient, 0);
      if (complexityCoefficient < 0 || complexityCoefficient > 0.5) {
        throw createHttpError('Hệ số bệnh nhân phải nằm trong khoảng 0 đến 0.5.');
      }

      const appointment = await Appointment.findOne({
        _id: item.appointmentId,
        status: 'COMPLETED'
      });
      if (!appointment) {
        throw createHttpError('Không tìm thấy lịch khám đã hoàn thành.', 404);
      }

      return AppointmentComplexity.findOneAndUpdate(
        { appointmentId: appointment._id },
        {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          shiftId: appointment.shiftId,
          date: appointment.date,
          complexityCoefficient,
          note: String(item.note || '').trim(),
          updatedBy: req.user._id
        },
        { returnDocument: 'after', upsert: true, runValidators: true }
      );
    }));

    res.json({
      success: true,
      message: 'Cập nhật hệ số bệnh nhân phức tạp thành công.'
    });
  } catch (error) {
    next(error);
  }
};

const generatePayslip = async (req, res, next) => {
  try {
    const { doctorId, month } = req.body;
    if (!doctorId || !month) {
      throw createHttpError('Bác sĩ và tháng lương là bắt buộc.');
    }

    const status = PAYSLIP_STATUSES.includes(req.body.status) && req.body.status !== 'CANCELLED'
      ? req.body.status
      : 'FINALIZED';
    const data = await calculatePayslipData({ doctorId, month });
    const payload = toPayslipPayload(data, req.user, status);
    const payslip = await SalaryPayslip.findOneAndUpdate(
      { doctorId, month },
      payload,
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Chốt phiếu lương bác sĩ thành công.',
      data: {
        ...data,
        _id: payslip._id,
        status: payslip.status,
        generatedAt: payslip.generatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPayslips = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.month) filter.month = req.query.month;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.status && PAYSLIP_STATUSES.includes(req.query.status)) filter.status = req.query.status;

    const payslips = await SalaryPayslip.find(filter)
      .populate('doctorId', 'fullName email phone specialization')
      .populate('generatedBy', 'fullName role')
      .sort({ month: -1, totalAmount: -1 });

    res.json({ success: true, data: payslips });
  } catch (error) {
    next(error);
  }
};

const getMonthlySalaryReport = async (req, res, next) => {
  try {
    const period = parseMonth(req.query.month);
    const statuses = parseReportStatuses(req.query.status);
    const filter = {
      month: period.month,
      status: { $in: statuses }
    };
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;

    const payslips = await SalaryPayslip.find(filter)
      .populate('doctorId', 'fullName email phone specialization')
      .sort({ totalAmount: -1, generatedAt: -1 })
      .lean();

    const rows = payslips.map((payslip) => {
      const doctor = payslip.doctorId || {};
      return {
        payslipId: payslip._id,
        status: payslip.status,
        generatedAt: payslip.generatedAt,
        month: payslip.month,
        doctor: {
          _id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization
        },
        baseHourlyRate: payslip.baseHourlyRate,
        doctorDegreeLevel: payslip.doctorDegreeLevel,
        doctorDegreeLabel: payslip.doctorDegreeLabel,
        doctorCoefficient: payslip.doctorCoefficient,
        totalShifts: normalizeNumber(payslip.totalShifts, 0),
        totalAppointments: normalizeNumber(payslip.totalAppointments, 0),
        totalWorkingHours: roundHours(payslip.totalWorkingHours),
        totalConvertedHours: roundHours(payslip.totalConvertedHours),
        totalAllowance: roundMoney(payslip.totalAllowance),
        totalDeduction: roundMoney(payslip.totalDeduction),
        totalAmount: roundMoney(payslip.totalAmount),
        lines: payslip.lines || []
      };
    });

    const totals = rows.reduce((acc, row) => {
      acc.totalDoctors += 1;
      acc.totalPayslips += 1;
      acc.totalShifts += row.totalShifts;
      acc.totalAppointments += row.totalAppointments;
      acc.totalWorkingHours += row.totalWorkingHours;
      acc.totalConvertedHours += row.totalConvertedHours;
      acc.totalAllowance += row.totalAllowance;
      acc.totalDeduction += row.totalDeduction;
      acc.totalAmount += row.totalAmount;
      return acc;
    }, {
      totalDoctors: 0,
      totalPayslips: 0,
      totalShifts: 0,
      totalAppointments: 0,
      totalWorkingHours: 0,
      totalConvertedHours: 0,
      totalAllowance: 0,
      totalDeduction: 0,
      totalAmount: 0
    });

    res.json({
      success: true,
      data: rows,
      summary: {
        ...totals,
        totalWorkingHours: roundHours(totals.totalWorkingHours),
        totalConvertedHours: roundHours(totals.totalConvertedHours),
        totalAllowance: roundMoney(totals.totalAllowance),
        totalDeduction: roundMoney(totals.totalDeduction),
        totalAmount: roundMoney(totals.totalAmount)
      },
      month: period.month,
      statusFilter: statuses
    });
  } catch (error) {
    next(error);
  }
};

const parseReportStatuses = (statusInput) => {
  if (!statusInput || statusInput === 'ALL') return VALID_PAYSLIP_REPORT_STATUSES;
  const statuses = String(statusInput).split(',').map((status) => status.trim().toUpperCase());
  const validStatuses = statuses.filter((status) => VALID_PAYSLIP_REPORT_STATUSES.includes(status));
  if (validStatuses.length === 0) {
    throw createHttpError('Trạng thái phiếu lương báo cáo không hợp lệ.');
  }
  return validStatuses;
};

const buildYearlyPayslipReport = async ({ year, doctorId, status }) => {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw createHttpError('Năm báo cáo không hợp lệ.');
  }

  const statuses = parseReportStatuses(status);
  const filter = {
    month: { $regex: `^${year}-` },
    status: { $in: statuses }
  };
  if (doctorId) filter.doctorId = doctorId;

  const payslips = await SalaryPayslip.find(filter)
    .populate('doctorId', 'fullName email phone specialization')
    .sort({ month: 1, totalAmount: -1 })
    .lean();

  const doctorMap = new Map();
  const monthMap = new Map(Array.from({ length: 12 }, (_, index) => {
    const month = monthFromYear(year, index);
    return [month, {
      month,
      totalDoctors: 0,
      totalShifts: 0,
      totalWorkingHours: 0,
      totalConvertedHours: 0,
      totalAllowance: 0,
      totalDeduction: 0,
      totalAmount: 0
    }];
  }));

  payslips.forEach((payslip) => {
    const doctor = payslip.doctorId || {};
    const doctorKey = doctor?._id?.toString() || payslip.doctorId?.toString();
    if (!doctorKey) return;

    if (!doctorMap.has(doctorKey)) {
      doctorMap.set(doctorKey, {
        doctor: {
          _id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization
        },
        doctorDegreeLevel: payslip.doctorDegreeLevel,
        doctorDegreeLabel: payslip.doctorDegreeLabel,
        doctorCoefficient: payslip.doctorCoefficient,
        months: Array.from({ length: 12 }, (_, index) => ({
          month: monthFromYear(year, index),
          payslipId: null,
          status: null,
          totalShifts: 0,
          totalWorkingHours: 0,
          totalConvertedHours: 0,
          totalAllowance: 0,
          totalDeduction: 0,
          totalAmount: 0
        })),
        totalPayslips: 0,
        totalShifts: 0,
        totalWorkingHours: 0,
        totalConvertedHours: 0,
        totalAllowance: 0,
        totalDeduction: 0,
        totalAmount: 0,
        totalShiftCoefficient: 0,
        totalComplexityCoefficient: 0
      });
    }

    const row = doctorMap.get(doctorKey);
    const monthIndex = Number(payslip.month.slice(5, 7)) - 1;
    const monthRow = row.months[monthIndex];
    const totalAllowance = normalizeNumber(payslip.totalAllowance, 0);
    const totalDeduction = normalizeNumber(payslip.totalDeduction, 0);
    const totalWorkingHours = normalizeNumber(payslip.totalWorkingHours, 0);
    const totalConvertedHours = normalizeNumber(payslip.totalConvertedHours, 0);
    const totalAmount = normalizeNumber(payslip.totalAmount, 0);
    const totalShifts = normalizeNumber(payslip.totalShifts, 0);
    const shiftCoefficientTotal = (payslip.lines || []).reduce(
      (sum, line) => sum + normalizeNumber(line.shiftCoefficient, 0),
      0
    );
    const complexityCoefficientTotal = (payslip.lines || []).reduce(
      (sum, line) => sum + normalizeNumber(line.patientComplexityTotal, 0),
      0
    );

    if (monthRow) {
      monthRow.payslipId = payslip._id;
      monthRow.status = payslip.status;
      monthRow.totalShifts += totalShifts;
      monthRow.totalWorkingHours += totalWorkingHours;
      monthRow.totalConvertedHours += totalConvertedHours;
      monthRow.totalAllowance += totalAllowance;
      monthRow.totalDeduction += totalDeduction;
      monthRow.totalAmount += totalAmount;
    }

    row.totalPayslips += 1;
    row.totalShifts += totalShifts;
    row.totalWorkingHours += totalWorkingHours;
    row.totalConvertedHours += totalConvertedHours;
    row.totalAllowance += totalAllowance;
    row.totalDeduction += totalDeduction;
    row.totalAmount += totalAmount;
    row.totalShiftCoefficient += shiftCoefficientTotal;
    row.totalComplexityCoefficient += complexityCoefficientTotal;

    const monthSummary = monthMap.get(payslip.month);
    if (monthSummary) {
      monthSummary.totalDoctors += 1;
      monthSummary.totalShifts += totalShifts;
      monthSummary.totalWorkingHours += totalWorkingHours;
      monthSummary.totalConvertedHours += totalConvertedHours;
      monthSummary.totalAllowance += totalAllowance;
      monthSummary.totalDeduction += totalDeduction;
      monthSummary.totalAmount += totalAmount;
    }
  });

  const rows = Array.from(doctorMap.values()).map((row) => ({
    ...row,
    totalWorkingHours: roundHours(row.totalWorkingHours),
    totalConvertedHours: roundHours(row.totalConvertedHours),
    totalAllowance: roundMoney(row.totalAllowance),
    totalDeduction: roundMoney(row.totalDeduction),
    totalAmount: roundMoney(row.totalAmount),
    averageShiftCoefficient: row.totalShifts > 0
      ? roundHours(row.totalShiftCoefficient / row.totalShifts)
      : 0,
    totalComplexityCoefficient: roundHours(row.totalComplexityCoefficient),
    months: row.months.map((month) => ({
      ...month,
      totalWorkingHours: roundHours(month.totalWorkingHours),
      totalConvertedHours: roundHours(month.totalConvertedHours),
      totalAllowance: roundMoney(month.totalAllowance),
      totalDeduction: roundMoney(month.totalDeduction),
      totalAmount: roundMoney(month.totalAmount)
    }))
  }));

  const months = Array.from(monthMap.values()).map((month) => ({
    ...month,
    totalWorkingHours: roundHours(month.totalWorkingHours),
    totalConvertedHours: roundHours(month.totalConvertedHours),
    totalAllowance: roundMoney(month.totalAllowance),
    totalDeduction: roundMoney(month.totalDeduction),
    totalAmount: roundMoney(month.totalAmount)
  }));

  const summary = rows.reduce((acc, row) => {
    acc.totalDoctors += 1;
    acc.totalPayslips += row.totalPayslips;
    acc.totalShifts += row.totalShifts;
    acc.totalWorkingHours += row.totalWorkingHours;
    acc.totalConvertedHours += row.totalConvertedHours;
    acc.totalAllowance += row.totalAllowance;
    acc.totalDeduction += row.totalDeduction;
    acc.totalAmount += row.totalAmount;
    return acc;
  }, {
    totalDoctors: 0,
    totalPayslips: 0,
    totalShifts: 0,
    totalWorkingHours: 0,
    totalConvertedHours: 0,
    totalAllowance: 0,
    totalDeduction: 0,
    totalAmount: 0
  });

  return {
    year,
    statusFilter: statuses,
    rows,
    months,
    summary: {
      totalDoctors: summary.totalDoctors,
      totalPayslips: summary.totalPayslips,
      totalShifts: summary.totalShifts,
      totalWorkingHours: roundHours(summary.totalWorkingHours),
      totalConvertedHours: roundHours(summary.totalConvertedHours),
      totalAllowance: roundMoney(summary.totalAllowance),
      totalDeduction: roundMoney(summary.totalDeduction),
      totalAmount: roundMoney(summary.totalAmount)
    }
  };
};

const getDoctorYearlySalaryReport = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const doctorId = req.query.doctorId;
    if (!Number.isInteger(year) || year < 2000 || year > 2100 || !doctorId) {
      throw createHttpError('Bác sĩ và năm báo cáo là bắt buộc.');
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' }).lean();
    if (!doctor) {
      throw createHttpError('Không tìm thấy bác sĩ.', 404);
    }

    const report = await buildYearlyPayslipReport({
      year,
      doctorId,
      status: req.query.status
    });
    const doctorRow = report.rows[0];

    res.json({
      success: true,
      data: {
        doctor: doctorRow?.doctor || {
          _id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization
        },
        year,
        months: doctorRow?.months || Array.from({ length: 12 }, (_, index) => ({
          month: monthFromYear(year, index),
          payslipId: null,
          status: null,
          totalShifts: 0,
          totalWorkingHours: 0,
          totalConvertedHours: 0,
          totalAllowance: 0,
          totalDeduction: 0,
          totalAmount: 0
        })),
        summary: doctorRow ? {
          totalPayslips: doctorRow.totalPayslips,
          totalShifts: doctorRow.totalShifts,
          totalWorkingHours: doctorRow.totalWorkingHours,
          totalConvertedHours: doctorRow.totalConvertedHours,
          totalAllowance: doctorRow.totalAllowance,
          totalDeduction: doctorRow.totalDeduction,
          totalAmount: doctorRow.totalAmount
        } : {
          totalPayslips: 0,
          totalShifts: 0,
          totalWorkingHours: 0,
          totalConvertedHours: 0,
          totalAllowance: 0,
          totalDeduction: 0,
          totalAmount: 0
        },
        statusFilter: report.statusFilter
      }
    });
  } catch (error) {
    next(error);
  }
};

const getYearlySalaryReport = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    const report = await buildYearlyPayslipReport({
      year,
      doctorId: req.query.doctorId,
      status: req.query.status
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  DEGREE_LEVELS,
  WEEK_DAYS,
  getBaseRate,
  updateBaseRate,
  getDoctorProfiles,
  updateDoctorProfile,
  getShiftRules,
  updateShiftRules,
  getComplexities,
  updateComplexities,
  generatePayslip,
  getPayslips,
  getMonthlySalaryReport,
  getDoctorYearlySalaryReport,
  getYearlySalaryReport
};
