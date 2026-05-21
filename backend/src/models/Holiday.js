const mongoose = require('mongoose');

/**
 * Schema Ngày nghỉ (Holiday)
 * Lưu trữ các ngày nghỉ lễ, nghỉ phòng khám để hệ thống chặn đặt lịch
 * 
 * @field name - Tên ngày nghỉ (VD: "Nghỉ Tết Nguyên Đán")
 * @field startDate - Ngày bắt đầu nghỉ
 * @field endDate - Ngày kết thúc nghỉ (phải >= startDate)
 * @field holidayType - Loại nghỉ: LE (Lễ), TOAN_PHONG_KHAM (Toàn phòng khám), DAC_BIET (Đặc biệt)
 * @field status - Trạng thái: ACTIVE (đang áp dụng) / INACTIVE (tạm ngưng)
 */
const holidaySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên ngày nghỉ là bắt buộc'] },
  startDate: { type: Date, required: [true, 'Ngày bắt đầu là bắt buộc'] },
  endDate: { type: Date, required: [true, 'Ngày kết thúc là bắt buộc'] },
  holidayType: { 
    type: String, 
    enum: ['LE', 'TOAN_PHONG_KHAM', 'DAC_BIET'], 
    required: [true, 'Loại ngày nghỉ là bắt buộc'] 
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
