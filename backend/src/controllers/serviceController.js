const Service = require('../models/Service');
const ServicePriceHistory = require('../models/ServicePriceHistory');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');
const {
  createServicePriceHistory,
  ensureServicePriceHistory,
  ensureServicePriceHistories,
  getEffectiveServicePrice,
  normalizeEffectiveDate,
  normalizePrice
} = require('../services/servicePriceService');

const SERVICE_LOG_FIELDS = ['name', 'category', 'description', 'price', 'duration', 'complexityCoefficient', 'status'];
const PRICE_LOG_FIELDS = ['price', 'effectiveFrom', 'effectiveTo', 'status', 'note'];

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
    const error = new Error('Giá dịch vụ phải lớn hơn 0');
    error.statusCode = 400;
    throw error;
  }
  if (duration !== undefined && (!Number.isFinite(Number(duration)) || Number(duration) <= 0)) {
    const error = new Error('Thời gian thực hiện phải lớn hơn 0 phút');
    error.statusCode = 400;
    throw error;
  }
};

const buildPriceLogObject = (priceHistory) => toPlainObject(priceHistory, PRICE_LOG_FIELDS);

const recordServicePriceChange = async ({ service, priceHistory, action = 'UPDATE', user, before = null }) => {
  await recordConfigChange({
    resourceType: 'SERVICE_PRICE',
    resourceId: service._id,
    resourceName: service.name,
    action,
    before,
    after: buildPriceLogObject(priceHistory),
    user,
    note: priceHistory.note
  });
};

// GET /api/v1/services
exports.getServices = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = String(status).toUpperCase();

    const services = await Service.find(query).sort({ createdAt: -1 });
    await ensureServicePriceHistories(services, req.user);
    const refreshedServices = await Service.find(query).sort({ createdAt: -1 });
    const categories = await Service.distinct('category');

    res.json({
      success: true,
      data: refreshedServices,
      meta: {
        categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi'))
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/services
exports.createService = async (req, res, next) => {
  try {
    const { name, category, description, price, duration, complexityCoefficient, status, priceEffectiveFrom, note } = req.body;
    validateServiceInput({ name, price, duration }, { creating: true });
    const trimmedName = String(name || '').trim();

    const existing = await Service.findOne({ name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên dịch vụ đã tồn tại' });
    }

    const newService = await Service.create({
      name: trimmedName,
      category: String(category || 'Tổng quát').trim() || 'Tổng quát',
      description,
      price: normalizePrice(price),
      duration,
      complexityCoefficient: validateComplexityCoefficient(complexityCoefficient),
      status: status ? status.toUpperCase() : 'ACTIVE'
    });

    const priceHistory = await createServicePriceHistory({
      service: newService,
      price: newService.price,
      effectiveFrom: priceEffectiveFrom,
      note: note || 'Giá khởi tạo',
      user: req.user
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
    await recordServicePriceChange({
      service: newService,
      priceHistory,
      action: 'CREATE',
      user: req.user
    });

    res.status(201).json({ success: true, data: await Service.findById(newService._id) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/services/:id
exports.updateService = async (req, res, next) => {
  try {
    const { name, category, description, price, duration, complexityCoefficient, status, priceEffectiveFrom, note } = req.body;
    validateServiceInput({ name, price, duration });

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }

    const before = toPlainObject(service, SERVICE_LOG_FIELDS);
    let priceHistory = null;

    if (name && name !== service.name) {
      const trimmedName = String(name).trim();
      const existing = await Service.findOne({
        _id: { $ne: service._id },
        name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: 'i' }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Tên dịch vụ đã tồn tại' });
      }
      service.name = trimmedName;
    }

    if (category !== undefined) service.category = String(category || 'Tổng quát').trim() || 'Tổng quát';
    if (description !== undefined) service.description = description;
    if (duration !== undefined) service.duration = duration;
    if (complexityCoefficient !== undefined) {
      service.complexityCoefficient = validateComplexityCoefficient(complexityCoefficient);
    }
    if (status) service.status = status.toUpperCase();

    await service.save();
    if (price !== undefined) {
      const currentPrice = await getEffectiveServicePrice(service, priceEffectiveFrom || new Date());
      priceHistory = await createServicePriceHistory({
        service,
        price,
        effectiveFrom: priceEffectiveFrom,
        note,
        user: req.user
      });
      await recordServicePriceChange({
        service,
        priceHistory,
        action: 'UPDATE',
        user: req.user,
        before: currentPrice ? buildPriceLogObject(currentPrice) : null
      });
    }

    const refreshedService = await Service.findById(service._id);
    await recordConfigChange({
      resourceType: 'SERVICE',
      resourceId: service._id,
      resourceName: service.name,
      action: before.status !== service.status && Object.keys(req.body).length === 1 && req.body.status ? 'STATUS_CHANGE' : 'UPDATE',
      before,
      after: toPlainObject(refreshedService, SERVICE_LOG_FIELDS),
      user: req.user
    });
    res.json({ success: true, data: refreshedService, priceHistory });
  } catch (error) {
    next(error);
  }
};

exports.getServicePriceHistory = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }

    await ensureServicePriceHistory(service, req.user);
    const histories = await ServicePriceHistory.find({ serviceId: service._id })
      .sort({ effectiveFrom: -1 })
      .populate('createdBy', 'fullName role');

    res.json({ success: true, data: histories, meta: { service } });
  } catch (error) {
    next(error);
  }
};

exports.createServicePrice = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
    }

    await ensureServicePriceHistory(service, req.user);
    const currentPrice = await getEffectiveServicePrice(service, req.body.effectiveFrom || new Date());
    const priceHistory = await createServicePriceHistory({
      service,
      price: req.body.price,
      effectiveFrom: req.body.effectiveFrom,
      note: req.body.note,
      user: req.user
    });
    await recordServicePriceChange({
      service,
      priceHistory,
      action: 'UPDATE',
      user: req.user,
      before: currentPrice ? buildPriceLogObject(currentPrice) : null
    });

    res.status(201).json({ success: true, data: priceHistory, service: await Service.findById(service._id) });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateServicePrices = async (req, res, next) => {
  try {
    const { serviceIds = [], percentage, effectiveFrom, note } = req.body;
    const percent = Number(percentage);
    if (!Number.isFinite(percent) || percent === 0 || percent <= -100) {
      return res.status(400).json({ success: false, message: 'Tỷ lệ tăng/giảm phải khác 0 và lớn hơn -100%' });
    }

    const normalizedEffectiveFrom = normalizeEffectiveDate(effectiveFrom);
    const query = Array.isArray(serviceIds) && serviceIds.length > 0
      ? { _id: { $in: serviceIds } }
      : { status: 'ACTIVE' };

    const services = await Service.find(query).sort({ name: 1 });
    if (services.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dịch vụ phù hợp để cập nhật giá' });
    }

    const results = [];
    for (const service of services) {
      await ensureServicePriceHistory(service, req.user);
      const currentPrice = await getEffectiveServicePrice(service, normalizedEffectiveFrom);
      const nextPrice = normalizePrice((currentPrice?.price || service.price) * (1 + percent / 100));
      const priceHistory = await createServicePriceHistory({
        service,
        price: nextPrice,
        effectiveFrom: normalizedEffectiveFrom,
        note: note || `Cập nhật hàng loạt ${percent > 0 ? '+' : ''}${percent}%`,
        user: req.user
      });

      await recordServicePriceChange({
        service,
        priceHistory,
        action: 'UPDATE',
        user: req.user,
        before: currentPrice ? buildPriceLogObject(currentPrice) : null
      });

      results.push({ serviceId: service._id, name: service.name, price: nextPrice, priceHistory });
    }

    res.json({ success: true, data: results });
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
    await ServicePriceHistory.deleteMany({ serviceId: service._id });
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
