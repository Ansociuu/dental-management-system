const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CARD'];

const getDayRange = (dateInput) => {
  const parsed = new Date(dateInput);

  const utcStart = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0));
  const utcEnd = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));

  const localStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  const localEnd = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);

  const gte = new Date(Math.min(utcStart.getTime(), localStart.getTime()));
  const lte = new Date(Math.max(utcEnd.getTime(), localEnd.getTime()));

  return { $gte: gte, $lte: lte };
};

const formatDateCode = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const generateInvoiceCode = async () => {
  const today = new Date();
  const prefix = `INV-${formatDateCode(today)}`;
  const paidAt = getDayRange(today);
  const count = await Invoice.countDocuments({ paidAt });
  let sequence = count + 1;
  let code = `${prefix}-${String(sequence).padStart(4, '0')}`;

  while (await Invoice.exists({ invoiceCode: code })) {
    sequence += 1;
    code = `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  return code;
};

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const buildInvoiceItems = (appointment) => {
  const performedItems = Array.isArray(appointment.servicesPerformed)
    ? appointment.servicesPerformed
    : [];

  if (performedItems.length > 0) {
    return performedItems.map((item) => {
      const service = item.serviceId || {};
      const quantity = Math.max(1, normalizeNumber(item.quantity, 1));
      const unitPrice = Math.max(0, normalizeNumber(item.priceAtAppointment, service.price || 0));

      return {
        serviceId: service._id || item.serviceId,
        name: service.name || 'Dich vu dieu tri',
        quantity,
        unitPrice,
        lineTotal: quantity * unitPrice
      };
    });
  }

  const service = appointment.serviceId;
  if (!service) {
    const error = new Error('Khong the tao hoa don vi lich kham chua co dich vu');
    error.statusCode = 400;
    throw error;
  }

  const unitPrice = Math.max(0, normalizeNumber(service.price, 0));
  return [{
    serviceId: service._id || service,
    name: service.name || 'Dich vu kham',
    quantity: 1,
    unitPrice,
    lineTotal: unitPrice
  }];
};

const addBillingPreview = (appointment) => {
  const obj = appointment.toObject ? appointment.toObject() : appointment;
  const items = buildInvoiceItems(appointment);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    ...obj,
    billingItems: items,
    billingTotal: total
  };
};

const populateInvoiceQuery = (query) => query
  .populate('appointmentId', 'date queueNumber status symptoms')
  .populate('patientId', 'fullName phone patientCode dob gender address')
  .populate('doctorId', 'fullName specialization')
  .populate('cashierId', 'fullName role')
  .populate('items.serviceId', 'name price');

const getPendingInvoices = async (req, res, next) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const paidAppointmentIds = await Invoice.distinct('appointmentId');

    const appointments = await Appointment.find({
      status: 'COMPLETED',
      date: getDayRange(targetDate),
      _id: { $nin: paidAppointmentIds }
    })
      .populate('patientId', 'fullName phone patientCode dob gender address')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price')
      .sort({ date: 1, queueNumber: 1 });

    res.json({ success: true, data: appointments.map(addBillingPreview) });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const filter = { paymentStatus: 'PAID' };

    if (req.query.dateFrom || req.query.dateTo) {
      filter.paidAt = {};
      if (req.query.dateFrom) {
        filter.paidAt.$gte = getDayRange(req.query.dateFrom).$gte;
      }
      if (req.query.dateTo) {
        filter.paidAt.$lte = getDayRange(req.query.dateTo).$lte;
      }
    }

    if (req.query.paymentMethod) {
      if (!PAYMENT_METHODS.includes(req.query.paymentMethod)) {
        const error = new Error(`Phuong thuc thanh toan khong hop le. Chi chap nhan: ${PAYMENT_METHODS.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      filter.paymentMethod = req.query.paymentMethod;
    }

    if (req.query.cashierId) {
      filter.cashierId = req.query.cashierId;
    }

    const invoices = await populateInvoiceQuery(Invoice.find(filter))
      .sort({ paidAt: -1, createdAt: -1 });

    res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await populateInvoiceQuery(Invoice.findById(req.params.id));

    if (!invoice) {
      const error = new Error('Khong tim thay hoa don');
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

const createInvoiceFromAppointment = async (req, res, next) => {
  try {
    const { paymentMethod = 'CASH', note = '' } = req.body;

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      const error = new Error(`Phuong thuc thanh toan khong hop le. Chi chap nhan: ${PAYMENT_METHODS.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patientId', 'fullName phone patientCode')
      .populate('doctorId', 'fullName specialization')
      .populate('shiftId', 'name startTime endTime')
      .populate('serviceId', 'name price')
      .populate('servicesPerformed.serviceId', 'name price');

    if (!appointment) {
      const error = new Error('Khong tim thay lich kham');
      error.statusCode = 404;
      throw error;
    }

    if (appointment.status !== 'COMPLETED') {
      const error = new Error('Chi co the thanh toan cho lich kham da hoan thanh');
      error.statusCode = 400;
      throw error;
    }

    const existingInvoice = await Invoice.findOne({ appointmentId: appointment._id });
    if (existingInvoice) {
      const error = new Error('Lich kham nay da co hoa don thanh toan');
      error.statusCode = 409;
      throw error;
    }

    const items = buildInvoiceItems(appointment);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discountAmount = 0;
    const totalAmount = subtotal - discountAmount;
    const invoiceCode = await generateInvoiceCode();

    const invoice = await Invoice.create({
      invoiceCode,
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      cashierId: req.user._id,
      items,
      subtotal,
      discountAmount,
      totalAmount,
      paidAmount: totalAmount,
      paymentMethod,
      paymentStatus: 'PAID',
      paidAt: new Date(),
      note: String(note || '').trim()
    });

    const populated = await populateInvoiceQuery(Invoice.findById(invoice._id));
    res.status(201).json({ success: true, message: 'Thanh toan hoa don thanh cong', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'Lich kham nay da co hoa don thanh toan';
      error.statusCode = 409;
    }
    next(error);
  }
};

module.exports = {
  getPendingInvoices,
  getInvoices,
  getInvoiceById,
  createInvoiceFromAppointment
};
