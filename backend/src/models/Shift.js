const mongoose = require('mongoose');

/**
 * Schema Ca làm việc (Shift)
 * Định nghĩa thời gian và giới hạn số lượng bệnh nhân của mỗi ca
 * 
 * @field name - Tên ca (VD: "Ca Sáng", "Ca Chiều", "Ca Tối")
 * @field startTime - Giờ bắt đầu, định dạng "HH:MM"
 * @field endTime - Giờ kết thúc, định dạng "HH:MM" (phải > startTime)
 * @field maxPatients - Số lượng bệnh nhân tối đa trong ca
 */
const shiftSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên ca là bắt buộc'], unique: true },
  startTime: { type: String, required: [true, 'Giờ bắt đầu là bắt buộc'] },
  endTime: { type: String, required: [true, 'Giờ kết thúc là bắt buộc'] },
  maxPatients: { type: Number, default: 20, min: 1 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
