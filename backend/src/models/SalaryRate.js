const mongoose = require('mongoose');

const salaryRateSchema = new mongoose.Schema({
  baseHourlyRate: {
    type: Number,
    required: true,
    min: 1
  },
  effectiveFrom: {
    type: Date,
    required: true,
    index: true
  },
  effectiveTo: {
    type: Date,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

salaryRateSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

module.exports = mongoose.model('SalaryRate', salaryRateSchema);
