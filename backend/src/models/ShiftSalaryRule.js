const mongoose = require('mongoose');

const shiftSalaryRuleSchema = new mongoose.Schema({
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  dayType: {
    type: String,
    enum: ['WEEKDAY_OFFICE', 'WEEKDAY_AFTER_HOURS', 'SATURDAY', 'SUNDAY', 'HOLIDAY'],
    required: true,
    default: 'WEEKDAY_OFFICE'
  },
  dayOfWeek: {
    type: Number,
    min: -3,
    max: 6,
    required: true
  },
  shiftCoefficient: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

shiftSalaryRuleSchema.index({ shiftId: 1, dayOfWeek: 1 }, { unique: true });
shiftSalaryRuleSchema.index({ shiftId: 1, dayType: 1 }, { unique: true });

module.exports = mongoose.model('ShiftSalaryRule', shiftSalaryRuleSchema);
