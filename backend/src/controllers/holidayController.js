const Holiday = require('../models/Holiday');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const HOLIDAY_LOG_FIELDS = ['name', 'startDate', 'endDate', 'holidayType', 'status', 'notes'];

const findOverlappingHoliday = ({ startDate, endDate, excludeId }) => {
  const filter = {
    status: 'ACTIVE',
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) }
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Holiday.findOne(filter);
};

const validateDateRange = (startDate, endDate) => {
  if (new Date(endDate) < new Date(startDate)) {
    const error = new Error('Ngay ket thuc khong duoc nho hon ngay bat dau');
    error.statusCode = 400;
    throw error;
  }
};

const validateNoOverlap = async ({ startDate, endDate, excludeId }) => {
  const overlapping = await findOverlappingHoliday({ startDate, endDate, excludeId });
  if (overlapping) {
    const error = new Error(`Khoang thoi gian nghi trung voi ngay nghi dang ap dung: ${overlapping.name}`);
    error.statusCode = 400;
    throw error;
  }
};

/**
 * @desc    Thêm mới ngày nghỉ
 * @route   POST /api/v1/holidays
 */
const createHoliday = async (req, res, next) => {
  try {
    const { name, startDate, endDate, holidayType, notes } = req.body;

    // Ràng buộc: Ngày kết thúc không được nhỏ hơn ngày bắt đầu
    if (new Date(endDate) < new Date(startDate)) {
      const error = new Error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
      error.statusCode = 400;
      throw error;
    }

    await validateNoOverlap({ startDate, endDate });

    const holiday = await Holiday.create({ name, startDate, endDate, holidayType, notes });
    await recordConfigChange({
      resourceType: 'HOLIDAY',
      resourceId: holiday._id,
      resourceName: holiday.name,
      action: 'CREATE',
      before: null,
      after: toPlainObject(holiday, HOLIDAY_LOG_FIELDS),
      user: req.user
    });
    res.status(201).json({ success: true, message: 'Thêm ngày nghỉ thành công!', data: holiday });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách ngày nghỉ (hỗ trợ lọc theo status)
 * @route   GET /api/v1/holidays
 * @query   status - ACTIVE/INACTIVE (tùy chọn)
 */
const getHolidays = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const holidays = await Holiday.find(filter).sort({ startDate: -1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Chỉnh sửa thông tin ngày nghỉ
 * @route   PUT /api/v1/holidays/:id
 */
const updateHoliday = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      const error = new Error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
      error.statusCode = 400;
      throw error;
    }

    if (startDate && endDate) {
      await validateNoOverlap({ startDate, endDate, excludeId: req.params.id });
    }

    const currentHoliday = await Holiday.findById(req.params.id);
    if (!currentHoliday) {
      const error = new Error('Không tìm thấy ngày nghỉ');
      error.statusCode = 404;
      throw error;
    }

    const before = toPlainObject(currentHoliday, HOLIDAY_LOG_FIELDS);
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    await recordConfigChange({
      resourceType: 'HOLIDAY',
      resourceId: holiday._id,
      resourceName: holiday.name,
      action: 'UPDATE',
      before,
      after: toPlainObject(holiday, HOLIDAY_LOG_FIELDS),
      user: req.user
    });
    res.json({ success: true, message: 'Cập nhật ngày nghỉ thành công!', data: holiday });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật trạng thái ngày nghỉ (ACTIVE/INACTIVE)
 * @route   PATCH /api/v1/holidays/:id/status
 */
const updateHolidayStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      const error = new Error('Trạng thái không hợp lệ. Chỉ chấp nhận ACTIVE hoặc INACTIVE');
      error.statusCode = 400;
      throw error;
    }

    const currentHoliday = await Holiday.findById(req.params.id);
    if (!currentHoliday) {
      const error = new Error('Không tìm thấy ngày nghỉ');
      error.statusCode = 404;
      throw error;
    }

    const before = toPlainObject(currentHoliday, HOLIDAY_LOG_FIELDS);
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    await recordConfigChange({
      resourceType: 'HOLIDAY',
      resourceId: holiday._id,
      resourceName: holiday.name,
      action: 'STATUS_CHANGE',
      before,
      after: toPlainObject(holiday, HOLIDAY_LOG_FIELDS),
      user: req.user
    });
    res.json({ success: true, message: `Đã cập nhật trạng thái thành ${status}`, data: holiday });
  } catch (error) {
    next(error);
  }
};

module.exports = { createHoliday, getHolidays, updateHoliday, updateHolidayStatus };
