const mongoose = require('mongoose');

/**
 * Schema Lịch khám (Appointment)
 * Chi tiết các buổi đặt lịch hẹn của bệnh nhân với bác sĩ
 * 
 * @field status - Vòng đời lịch khám:
 *   PENDING -> CONFIRMED -> CHECKED_IN -> COMPLETED
 *   Hoặc PENDING/CONFIRMED -> CANCELLED / NO_SHOW
 * @field queueNumber - Số thứ tự khám trong ca (tự động tính)
 */
const appointmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: [true, 'Bệnh nhân là bắt buộc'] 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Bác sĩ là bắt buộc'] 
  },
  shiftId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shift', 
    required: [true, 'Ca khám là bắt buộc'] 
  },
  date: { type: Date, required: [true, 'Ngày khám là bắt buộc'] },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: [true, 'Dịch vụ là bắt buộc'] 
  },
  serviceNameAtBooking: { type: String },
  servicePriceAtBooking: { type: Number },
  servicePriceEffectiveFrom: { type: Date },
  symptoms: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], 
    default: 'PENDING' 
  },
  queueNumber: { type: Number },
  followUpStatus: {
    type: String,
    enum: ['PENDING', 'CALLED', 'UNREACHABLE'],
    default: 'PENDING'
  },
  followUpNote: { type: String },
  followUpAt: { type: Date },
  followUpBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Các trường lâm sàng cập nhật bởi Bác sĩ khi khám bệnh
  diagnosis: { type: String },
  clinicalNotes: { type: String },
  servicesPerformed: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    quantity: { type: Number, default: 1 },
    priceAtAppointment: { type: Number }
  }],
  prescription: [{
    medicineName: { type: String, required: true },
    dosage: { type: String },     // VD: "500mg"
    qty: { type: Number, default: 1 },
    frequency: { type: String },   // VD: "Sáng 1 viên, tối 1 viên sau ăn"
    duration: { type: String }     // VD: "5 ngày"
  }],
  teethImages: [{ type: String }], // Mảng lưu các URLs ảnh X-quang hoặc răng
  dentalChart: {
    type: Map,
    of: {
      condition: { type: String, enum: ['HEALTHY', 'DECAYED', 'FILLED', 'RCT', 'MISSING'] },
      notes: { type: String }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
