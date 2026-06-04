const Shift = require('../models/Shift');
const DutySchedule = require('../models/DutySchedule');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const SHIFT_LOG_FIELDS = ['name', 'startTime', 'endTime', 'maxPatients', 'status'];

/**
 * @desc    Tạo ca làm việc mới
 * @route   POST /api/v1/shifts
 */
const createShift = async (req, res, next) => {
  try {
    const { name, startTime, endTime, maxPatients } = req.body;

    // Ràng buộc: Giờ bắt đầu và giờ kết thúc không được trùng nhau
    if (startTime === endTime) {
      const error = new Error('Giờ bắt đầu và giờ kết thúc không được trùng nhau');
      error.statusCode = 400;
      throw error;
    }

    const shift = await Shift.create({ name, startTime, endTime, maxPatients: maxPatients || 20 });
    await recordConfigChange({
      resourceType: 'SHIFT',
      resourceId: shift._id,
      resourceName: shift.name,
      action: 'CREATE',
      before: null,
      after: toPlainObject(shift, SHIFT_LOG_FIELDS),
      user: req.user
    });
    res.status(201).json({ success: true, message: 'Tạo ca làm việc thành công!', data: shift });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách tất cả các ca làm việc
 * @route   GET /api/v1/shifts
 */
const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find().sort({ startTime: 1 });
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật thông tin ca làm việc
 * @route   PUT /api/v1/shifts/:id
 */
const updateShift = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;

    if (startTime && endTime && startTime === endTime) {
      const error = new Error('Giờ bắt đầu và giờ kết thúc không được trùng nhau');
      error.statusCode = 400;
      throw error;
    }

    const currentShift = await Shift.findById(req.params.id);
    if (!currentShift) {
      const error = new Error('Không tìm thấy ca làm việc');
      error.statusCode = 404;
      throw error;
    }

    await DutySchedule.updateMany(
      {
        shiftId: currentShift._id,
        date: { $lte: new Date() },
        $or: [
          { 'shiftSnapshot.name': { $exists: false } },
          { 'shiftSnapshot.startTime': { $exists: false } },
          { 'shiftSnapshot.endTime': { $exists: false } }
        ]
      },
      {
        $set: {
          shiftSnapshot: {
            name: currentShift.name,
            startTime: currentShift.startTime,
            endTime: currentShift.endTime,
            maxPatients: currentShift.maxPatients || 0
          }
        }
      }
    );

    const before = toPlainObject(currentShift, SHIFT_LOG_FIELDS);
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    await recordConfigChange({
      resourceType: 'SHIFT',
      resourceId: shift._id,
      resourceName: shift.name,
      action: 'UPDATE',
      before,
      after: toPlainObject(shift, SHIFT_LOG_FIELDS),
      user: req.user
    });
    res.json({ success: true, message: 'Cập nhật ca làm việc thành công!', data: shift });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xóa ca làm việc
 * @route   DELETE /api/v1/shifts/:id
 */
const deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      const error = new Error('Không tìm thấy ca làm việc');
      error.statusCode = 404;
      throw error;
    }
    await Shift.findByIdAndDelete(req.params.id);
    await recordConfigChange({
      resourceType: 'SHIFT',
      resourceId: shift._id,
      resourceName: shift.name,
      action: 'DELETE',
      before: toPlainObject(shift, SHIFT_LOG_FIELDS),
      after: null,
      user: req.user
    });
    res.json({ success: true, message: 'Xóa ca làm việc thành công!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createShift, getShifts, updateShift, deleteShift };
