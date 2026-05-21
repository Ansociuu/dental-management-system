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
  symptoms: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], 
    default: 'PENDING' 
  },
  queueNumber: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
