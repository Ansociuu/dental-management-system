const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceCode: { type: String, required: true, unique: true, trim: true },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: {
    type: [invoiceItemSchema],
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: 'Hoa don phai co it nhat mot dong dich vu'
    }
  },
  subtotal: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'CARD'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PAID'],
    default: 'PAID'
  },
  paidAt: { type: Date, default: Date.now },
  note: { type: String, trim: true }
}, { timestamps: true });

invoiceSchema.index({ paidAt: -1 });
invoiceSchema.index({ paymentMethod: 1, paidAt: -1 });
invoiceSchema.index({ cashierId: 1, paidAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
