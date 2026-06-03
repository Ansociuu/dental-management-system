const Appointment = require('../models/Appointment');
const AppointmentComplexity = require('../models/AppointmentComplexity');
const DoctorSalaryProfile = require('../models/DoctorSalaryProfile');
const DutySchedule = require('../models/DutySchedule');
const Holiday = require('../models/Holiday');
const SalaryPayslip = require('../models/SalaryPayslip');
const SalarySetting = require('../models/SalarySetting');
const Shift = require('../models/Shift');
const ShiftSalaryRule = require('../models/ShiftSalaryRule');
const User = require('../models/User');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const DEFAULT_BASE_HOURLY_RATE = 210000;
const VALID_PAYSLIP_REPORT_STATUSES = ['APPROVED', 'PAID'];
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

const SALARY_SETTING_LOG_FIELDS = ['key', 'baseHourlyRate'];
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

const roundHours = (value) => Math.round((normalizeNumber(value) + Number.EPSILON) * 100) / 100;
const roundMoney = (value) => Math.round(normalizeNumber(value));

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
  return setting;
};

const getDoctorProfileSnapshot = async (doctorId) => {
  const profile = await DoctorSalaryProfile.findOneAndUpdate(
    { doctorId },
    { $setOnInsert: { doctorId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
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
      { new: true, upsert: true, setDefaultsOnInsert: true }
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

  const [baseSetting, profile, duties, appointments, complexities, holidays] = await Promise.all([
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
      .populate('serviceId', 'name')
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
    }).lean()
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
    const shiftAppointments = appointmentsByShiftDate.get(`${dateKey}:${shiftId}`) || [];

    const appointmentLines = shiftAppointments.map((appointment) => {
      const complexity = complexityMap.get(appointment._id.toString());
      return {
        appointmentId: appointment._id,
        patientId: appointment.patientId?._id || appointment.patientId,
        patientName: appointment.patientId?.fullName || '-',
        patientCode: appointment.patientId?.patientCode || '-',
        serviceName: appointment.serviceId?.name || '-',
        complexityCoefficient: normalizeNumber(complexity?.complexityCoefficient, 0),
        note: complexity?.note || ''
      };
    });

    const patientComplexityTotal = roundHours(appointmentLines.reduce(
      (sum, appointment) => sum + normalizeNumber(appointment.complexityCoefficient, 0),
      0
    ));
    const convertedHours = roundHours(workingHours * (shiftCoefficient + patientComplexityTotal));
    const amount = roundMoney(convertedHours * profile.doctorCoefficient * baseHourlyRate);

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

const toPayslipPayload = (data, user, status = 'APPROVED') => ({
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
    res.json({
      success: true,
      data: {
        baseHourlyRate: setting.baseHourlyRate,
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

    const currentSetting = await ensureBaseSetting();
    const before = toPlainObject(currentSetting, SALARY_SETTING_LOG_FIELDS);
    const setting = await SalarySetting.findOneAndUpdate(
      { key: 'BASE_RATE' },
      { baseHourlyRate, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    await recordConfigChange({
      resourceType: 'SALARY_SETTING',
      resourceId: setting._id,
      resourceName: 'Tiền cơ bản một giờ',
      action: 'UPDATE',
      before,
      after: toPlainObject(setting, SALARY_SETTING_LOG_FIELDS),
      user: req.user
    });

    res.json({
      success: true,
      message: 'Cập nhật số tiền một giờ thành công.',
      data: setting
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
      { new: true, upsert: true, runValidators: true }
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
        { new: true, upsert: true, runValidators: true }
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

    const [appointments, complexities, doctors] = await Promise.all([
      Appointment.find(filter)
        .populate('patientId', 'fullName patientCode phone')
        .populate('doctorId', 'fullName specialization')
        .populate('shiftId', 'name startTime endTime')
        .populate('serviceId', 'name')
        .sort({ date: 1, queueNumber: 1 })
        .lean(),
      AppointmentComplexity.find({
        date: { $gte: period.start, $lte: period.end },
        ...(req.query.doctorId ? { doctorId: req.query.doctorId } : {})
      }).lean(),
      User.find({ role: 'DOCTOR' }).select('fullName email phone specialization').sort({ fullName: 1 }).lean()
    ]);

    const complexityMap = new Map(complexities.map((item) => [item.appointmentId.toString(), item]));
    const data = appointments.map((appointment) => {
      const complexity = complexityMap.get(appointment._id.toString());
      return {
        appointment,
        complexity: {
          _id: complexity?._id,
          complexityCoefficient: normalizeNumber(complexity?.complexityCoefficient, 0),
          note: complexity?.note || ''
        }
      };
    });

    res.json({ success: true, data, meta: { doctors } });
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
        { new: true, upsert: true, runValidators: true }
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

    const status = VALID_PAYSLIP_REPORT_STATUSES.includes(req.body.status)
      ? req.body.status
      : 'APPROVED';
    const data = await calculatePayslipData({ doctorId, month });
    const payload = toPayslipPayload(data, req.user, status);
    const payslip = await SalaryPayslip.findOneAndUpdate(
      { doctorId, month },
      payload,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Lập phiếu lương bác sĩ thành công.',
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
    const [setting, doctors, savedPayslips] = await Promise.all([
      ensureBaseSetting(),
      User.find({ role: 'DOCTOR' }).sort({ fullName: 1 }).lean(),
      SalaryPayslip.find({ month: period.month }).lean()
    ]);
    const savedMap = new Map(savedPayslips.map((payslip) => [payslip.doctorId.toString(), payslip]));

    const rows = await Promise.all(doctors.map(async (doctor) => {
      const data = await calculatePayslipData({
        doctorId: doctor._id,
        doctorDoc: doctor,
        month: period.month,
        setting
      });
      const saved = savedMap.get(doctor._id.toString());
      return {
        ...data,
        payslipId: saved?._id,
        status: saved?.status || 'PREVIEW',
        generatedAt: saved?.generatedAt
      };
    }));

    const activeRows = rows.filter((row) => row.totalShifts > 0 || row.totalAmount > 0);
    const totals = activeRows.reduce((acc, row) => {
      acc.totalDoctors += 1;
      acc.totalShifts += row.totalShifts;
      acc.totalConvertedHours += row.totalConvertedHours;
      acc.totalAmount += row.totalAmount;
      return acc;
    }, {
      totalDoctors: 0,
      totalShifts: 0,
      totalConvertedHours: 0,
      totalAmount: 0
    });

    res.json({
      success: true,
      data: activeRows,
      summary: {
        ...totals,
        totalConvertedHours: roundHours(totals.totalConvertedHours),
        totalAmount: roundMoney(totals.totalAmount)
      }
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

    const [setting, doctor] = await Promise.all([
      ensureBaseSetting(),
      User.findOne({ _id: doctorId, role: 'DOCTOR' }).lean()
    ]);
    if (!doctor) {
      throw createHttpError('Không tìm thấy bác sĩ.', 404);
    }

    const months = await Promise.all(Array.from({ length: 12 }, (_, index) => (
      calculatePayslipData({
        doctorId,
        doctorDoc: doctor,
        month: monthFromYear(year, index),
        setting
      })
    )));

    const summary = months.reduce((acc, row) => {
      acc.totalShifts += row.totalShifts;
      acc.totalConvertedHours += row.totalConvertedHours;
      acc.totalAmount += row.totalAmount;
      return acc;
    }, { totalShifts: 0, totalConvertedHours: 0, totalAmount: 0 });

    res.json({
      success: true,
      data: {
        doctor: {
          _id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization
        },
        year,
        months,
        summary: {
          totalShifts: summary.totalShifts,
          totalConvertedHours: roundHours(summary.totalConvertedHours),
          totalAmount: roundMoney(summary.totalAmount)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getYearlySalaryReport = async (req, res, next) => {
  try {
    const year = Number(req.query.year);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw createHttpError('Năm báo cáo không hợp lệ.');
    }

    const [setting, doctors] = await Promise.all([
      ensureBaseSetting(),
      User.find({ role: 'DOCTOR' }).sort({ fullName: 1 }).lean()
    ]);

    const months = [];

    for (let index = 0; index < 12; index += 1) {
      const month = monthFromYear(year, index);
      const rows = await Promise.all(doctors.map((doctor) => (
        calculatePayslipData({
          doctorId: doctor._id,
          doctorDoc: doctor,
          month,
          setting
        })
      )));

      const activeRows = rows.filter((row) => row.totalShifts > 0 || row.totalAmount > 0);
      const summary = activeRows.reduce((acc, row) => {
        acc.totalDoctors += 1;
        acc.totalShifts += row.totalShifts;
        acc.totalConvertedHours += row.totalConvertedHours;
        acc.totalAmount += row.totalAmount;
        return acc;
      }, {
        totalDoctors: 0,
        totalShifts: 0,
        totalConvertedHours: 0,
        totalAmount: 0
      });

      months.push({
        month,
        rows: activeRows,
        summary: {
          totalDoctors: summary.totalDoctors,
          totalShifts: summary.totalShifts,
          totalConvertedHours: roundHours(summary.totalConvertedHours),
          totalAmount: roundMoney(summary.totalAmount)
        }
      });
    }

    const yearlySummary = months.reduce((acc, item) => {
      acc.totalShifts += item.summary.totalShifts;
      acc.totalConvertedHours += item.summary.totalConvertedHours;
      acc.totalAmount += item.summary.totalAmount;
      return acc;
    }, { totalShifts: 0, totalConvertedHours: 0, totalAmount: 0 });

    res.json({
      success: true,
      data: {
        year,
        months,
        summary: {
          totalShifts: yearlySummary.totalShifts,
          totalConvertedHours: roundHours(yearlySummary.totalConvertedHours),
          totalAmount: roundMoney(yearlySummary.totalAmount)
        }
      }
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
