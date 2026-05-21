const mongoose = require('mongoose');

/**
 * Schema Lịch trực Bác sĩ (DutySchedule)
 * Phân công lịch làm việc cho từng bác sĩ theo ngày và ca
 * 
 * @field doctorId - ID bác sĩ (tham chiếu User có role DOCTOR)
 * @field date - Ngày trực
 * @field shiftId - Ca trực (tham chiếu Shift)
 * @field status - ACTIVE hoặc CANCELLED
 */
const dutyScheduleSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'ID bác sĩ là bắt buộc'] 
  },
  date: { type: Date, required: [true, 'Ngày trực là bắt buộc'] },
  shiftId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shift', 
    required: [true, 'Ca trực là bắt buộc'] 
  },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED'], default: 'ACTIVE' }
}, { timestamps: true });

// Đảm bảo không trùng lịch trực: 1 bác sĩ chỉ trực tối đa 1 lần trong 1 ca của 1 ngày
dutyScheduleSchema.index({ doctorId: 1, date: 1, shiftId: 1 }, { unique: true });

module.exports = mongoose.model('DutySchedule', dutyScheduleSchema);
