const mongoose = require('mongoose');

/**
 * Schema Dịch vụ Nha khoa (Service)
 * Định nghĩa các dịch vụ mà phòng khám cung cấp
 */
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên dịch vụ là bắt buộc'], unique: true },
  description: { type: String },
  price: { type: Number, required: [true, 'Giá dịch vụ là bắt buộc'], min: 0 },
  duration: { type: Number, default: 30 }, // Thời gian ước tính (phút)
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE'], 
    default: 'ACTIVE' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
