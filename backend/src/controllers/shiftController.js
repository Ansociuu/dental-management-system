const Shift = require('../models/Shift');

/**
 * @desc    Tạo ca làm việc mới
 * @route   POST /api/v1/shifts
 */
const createShift = async (req, res, next) => {
  try {
    const { name, startTime, endTime, maxPatients } = req.body;

    // Ràng buộc: Giờ kết thúc phải lớn hơn giờ bắt đầu
    if (endTime <= startTime) {
      const error = new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      error.statusCode = 400;
      throw error;
    }

    const shift = await Shift.create({ name, startTime, endTime, maxPatients });
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

    if (startTime && endTime && endTime <= startTime) {
      const error = new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu');
      error.statusCode = 400;
      throw error;
    }

    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shift) {
      const error = new Error('Không tìm thấy ca làm việc');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: 'Cập nhật ca làm việc thành công!', data: shift });
  } catch (error) {
    next(error);
  }
};

module.exports = { createShift, getShifts, updateShift };
