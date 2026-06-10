const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema Người dùng (User)
 * Lưu trữ thông tin tài khoản bao gồm Bác sĩ, Quản trị viên, Lễ tân, Y tá
 */
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, 'Họ và tên là bắt buộc'] },
  email: { type: String, required: [true, 'Email là bắt buộc'], unique: true },
  phone: { type: String, required: [true, 'Số điện thoại là bắt buộc'] },
  password: { type: String, required: [true, 'Mật khẩu là bắt buộc'], minlength: 6, select: false },
  role: { 
    type: String, 
    enum: ['ADMIN', 'MANAGER', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'], 
    default: 'DOCTOR' 
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  specialization: { type: String }, // Chuyên môn tóm tắt (legacy, dành cho Bác sĩ)
  // === Trường mở rộng cho hồ sơ Bác sĩ ===
  dob: { type: Date },                                     // Ngày sinh
  gender: { type: String, enum: ['Nam', 'Nữ', ''], default: '' }, // Giới tính
  licenseNumber: { type: String },                          // Số chứng chỉ hành nghề
  specialties: [{ type: String }],                          // Danh sách chuyên khoa (mảng tag)
  experience: { type: String },                             // Bằng cấp & Kinh nghiệm
  avatar: { type: String },                                 // URL ảnh đại diện
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE'], 
    default: 'ACTIVE' 
  }
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// So sánh mật khẩu nhập vào với hash
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
