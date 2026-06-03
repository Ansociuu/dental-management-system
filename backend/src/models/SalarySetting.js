const mongoose = require('mongoose');

const salarySettingSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['BASE_RATE'],
    default: 'BASE_RATE',
    unique: true
  },
  baseHourlyRate: {
    type: Number,
    required: true,
    min: 0,
    default: 210000
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SalarySetting', salarySettingSchema);
