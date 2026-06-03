const mongoose = require('mongoose');

const appointmentComplexitySchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  complexityCoefficient: {
    type: Number,
    min: 0,
    max: 0.5,
    default: 0
  },
  note: { type: String, trim: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

appointmentComplexitySchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model('AppointmentComplexity', appointmentComplexitySchema);
