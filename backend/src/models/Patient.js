const mongoose = require('mongoose');

/**
 * Schema Bệnh nhân (Patient)
 * Quản lý thông tin hồ sơ khách hàng đặt lịch khám
 * 
 * @field patientCode - Mã bệnh nhân tự sinh, định dạng MEC-PT-XXXX
 * @field phone - Số điện thoại (duy nhất trong hệ thống)
 */
const patientSchema = new mongoose.Schema({
  patientCode: { type: String, required: true, unique: true },
  fullName: { type: String, required: [true, 'Họ và tên bệnh nhân là bắt buộc'] },
  phone: { type: String, required: [true, 'Số điện thoại là bắt buộc'], unique: true },
  dob: { type: Date, required: [true, 'Ngày sinh là bắt buộc'] },
  gender: { 
    type: String, 
    enum: ['Nam', 'Nữ', 'Khác'], 
    required: [true, 'Giới tính là bắt buộc'] 
  },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
