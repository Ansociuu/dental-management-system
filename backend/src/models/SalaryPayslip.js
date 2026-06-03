const mongoose = require('mongoose');

const salaryAppointmentLineSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: { type: String },
  patientCode: { type: String },
  serviceName: { type: String },
  complexityCoefficient: { type: Number, default: 0 },
  note: { type: String }
}, { _id: false });

const salaryShiftLineSchema = new mongoose.Schema({
  dutyId: { type: mongoose.Schema.Types.ObjectId, ref: 'DutySchedule' },
  date: { type: Date, required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  shiftName: { type: String },
  dayType: { type: String },
  dayTypeLabel: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  workingHours: { type: Number, default: 0 },
  shiftCoefficient: { type: Number, default: 1 },
  patientComplexityTotal: { type: Number, default: 0 },
  convertedHours: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  appointments: [salaryAppointmentLineSchema]
}, { _id: false });

const salaryPayslipSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/
  },
  status: {
    type: String,
    enum: ['DRAFT', 'FINALIZED', 'APPROVED', 'PAID', 'CANCELLED'],
    default: 'APPROVED',
    index: true
  },
  baseHourlyRate: { type: Number, required: true, min: 0 },
  doctorDegreeLevel: { type: String },
  doctorDegreeLabel: { type: String },
  doctorCoefficient: { type: Number, required: true, min: 0 },
  totalShifts: { type: Number, default: 0 },
  totalAppointments: { type: Number, default: 0 },
  totalWorkingHours: { type: Number, default: 0 },
  totalConvertedHours: { type: Number, default: 0 },
  totalAllowance: { type: Number, default: 0 },
  totalDeduction: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  lines: [salaryShiftLineSchema],
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

salaryPayslipSchema.index({ doctorId: 1, month: 1 }, { unique: true });
salaryPayslipSchema.index({ month: 1, totalAmount: -1 });
salaryPayslipSchema.index({ month: 1, status: 1 });

module.exports = mongoose.model('SalaryPayslip', salaryPayslipSchema);
