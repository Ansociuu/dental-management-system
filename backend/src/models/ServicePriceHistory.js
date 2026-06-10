const mongoose = require('mongoose');

const servicePriceHistorySchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Giá dịch vụ là bắt buộc'],
    min: [1, 'Giá dịch vụ phải lớn hơn 0']
  },
  effectiveFrom: {
    type: Date,
    required: [true, 'Ngày hiệu lực là bắt buộc'],
    index: true
  },
  effectiveTo: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'ACTIVE', 'EXPIRED'],
    default: 'ACTIVE',
    index: true
  },
  note: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

servicePriceHistorySchema.index({ serviceId: 1, effectiveFrom: 1 }, { unique: true });
servicePriceHistorySchema.index({ serviceId: 1, status: 1, effectiveFrom: -1 });

module.exports = mongoose.model('ServicePriceHistory', servicePriceHistorySchema);
