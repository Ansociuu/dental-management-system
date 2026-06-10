const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const SERVICE_LOG_FIELDS = ['name', 'description', 'price', 'duration', 'complexityCoefficient', 'status'];

const normalizeComplexityCoefficient = (value, fallback = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.round(number * 100) / 100;
};

const validateComplexityCoefficient = (value) => {
  const coefficient = normalizeComplexityCoefficient(value, 0);
  if (coefficient < 0 || coefficient > 0.5) {
    const error = new Error('Hệ số độ khó dịch vụ phải nằm trong khoảng 0 đến 0.5');
    error.statusCode = 400;
    throw error;
  }
  return coefficient;
};

const validateServiceInput = ({ name, price, duration }, { creating = false } = {}) => {
  if (creating && !String(name || '').trim()) {
    const error = new Error('Vui lòng nhập Tên dịch vụ');
    error.statusCode = 400;
    throw error;
  }
  if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
    const error = new Error('Giá dịch vụ phải lớn hơn hoặc bằng 0');
    error.statusCode = 400;
    throw error;
  }
  if (duration !== undefined && (!Number.isFinite(Number(duration)) || Number(duration) <= 0)) {
    const error = new Error('Thời gian thực hiện phải lớn hơn 0 phút');
    error.statusCode = 400;
    throw error;
  }
};

// GET /api/v1/services
exports.getServices = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/services
exports.createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, complexityCoefficient, status } = req.body;
    validateServiceInput({ name, price, duration }, { creating: true });

    const existing = await Service.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên dịch vụ đã tồn tại' });
    }

    const newService = await Service.create({
      name,
      description,
      price,
      duration,
      complexityCoefficient: validateComplexityCoefficient(complexityCoefficient),
      status: status ? status.toUpperCase() : 'ACTIVE'
    });

    await recordConfigChange({
      resourceType: 'SERVICE',
      resourceId: newService._id,
      resourceName: newService.name,
      action: 'CREATE',
      before: null,
      after: toPlainObject(newService, SERVICE_LOG_FIELDS),
      user: req.user
    });

    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/services/:id
exports.updateService = async (req, res, next) => {
  try {
    const { name, description, price, duration, complexityCoefficient, status } = req.body;
    validateServiceInput({ name, price, duration });

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }

    const before = toPlainObject(service, SERVICE_LOG_FIELDS);

    if (name && name !== service.name) {
      const existing = await Service.findOne({ name });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Tên dịch vụ đã tồn tại' });
      }
      service.name = name;
    }

    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (complexityCoefficient !== undefined) {
      service.complexityCoefficient = validateComplexityCoefficient(complexityCoefficient);
    }
    if (status) service.status = status.toUpperCase();

    await service.save();
    await recordConfigChange({
      resourceType: 'SERVICE',
      resourceId: service._id,
      resourceName: service.name,
      action: before.status !== service.status && Object.keys(req.body).length === 1 && req.body.status ? 'STATUS_CHANGE' : 'UPDATE',
      before,
      after: toPlainObject(service, SERVICE_LOG_FIELDS),
      user: req.user
    });
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/services/:id
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }

    const [appointmentCount, invoiceCount] = await Promise.all([
      Appointment.countDocuments({
        $or: [
          { serviceId: service._id },
          { 'servicesPerformed.serviceId': service._id }
        ]
      }),
      Invoice.countDocuments({ 'items.serviceId': service._id })
    ]);
    if (appointmentCount > 0 || invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa dịch vụ đã phát sinh dữ liệu. Vui lòng chọn Ngưng sử dụng!'
      });
    }

    await Service.findByIdAndDelete(req.params.id);
    await recordConfigChange({
      resourceType: 'SERVICE',
      resourceId: service._id,
      resourceName: service.name,
      action: 'DELETE',
      before: toPlainObject(service, SERVICE_LOG_FIELDS),
      after: null,
      user: req.user
    });
    res.json({ success: true, message: 'Đã xóa dịch vụ thành công' });
  } catch (error) {
    next(error);
  }
};
