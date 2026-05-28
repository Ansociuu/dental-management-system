const Service = require('../models/Service');
const { recordConfigChange, toPlainObject } = require('../services/configChangeLogService');

const SERVICE_LOG_FIELDS = ['name', 'description', 'price', 'duration', 'status'];

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
    const { name, description, price, duration, status } = req.body;

    const existing = await Service.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên dịch vụ đã tồn tại' });
    }

    const newService = await Service.create({
      name,
      description,
      price,
      duration,
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
    const { name, description, price, duration, status } = req.body;

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
