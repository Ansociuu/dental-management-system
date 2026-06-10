const mongoose = require('mongoose');

/**
 * Schema Dịch vụ Nha khoa (Service)
 * Định nghĩa các dịch vụ mà phòng khám cung cấp
 */
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên dịch vụ là bắt buộc'], unique: true },
  description: { type: String },
  price: { type: Number, required: [true, 'Giá dịch vụ là bắt buộc'], min: 0 },
  duration: {
    type: Number,
    default: 30,
    min: [1, 'Thời gian thực hiện phải lớn hơn 0 phút']
  },
  complexityCoefficient: {
    type: Number,
    default: 0,
    min: [0, 'Hệ số độ khó không được nhỏ hơn 0'],
    max: [0.5, 'Hệ số độ khó không được lớn hơn 0.5']
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE'], 
    default: 'ACTIVE' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
