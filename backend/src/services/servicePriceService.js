const Service = require('../models/Service');
const ServicePriceHistory = require('../models/ServicePriceHistory');

const toObjectIdString = (value) => {
  if (!value) return '';
  return (value._id || value).toString();
};

const roundCurrency = (value) => Math.round(Number(value));

const normalizePrice = (value) => {
  const price = roundCurrency(value);
  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error('Giá dịch vụ phải lớn hơn 0');
    error.statusCode = 400;
    throw error;
  }
  return price;
};

const normalizeEffectiveDate = (value) => {
  if (!value) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error('Ngày hiệu lực không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getPriceStatus = (effectiveFrom, effectiveTo, now = new Date()) => {
  if (effectiveFrom > now) return 'SCHEDULED';
  if (effectiveTo && effectiveTo < now) return 'EXPIRED';
  return 'ACTIVE';
};

const refreshServicePriceTimeline = async (serviceId) => {
  const histories = await ServicePriceHistory.find({ serviceId }).sort({ effectiveFrom: 1, createdAt: 1 });
  const now = new Date();
  let activeHistory = null;

  for (let index = 0; index < histories.length; index += 1) {
    const current = histories[index];
    const next = histories[index + 1];
    const nextEffectiveTo = next ? new Date(next.effectiveFrom.getTime() - 1) : null;
    const nextStatus = getPriceStatus(current.effectiveFrom, nextEffectiveTo, now);

    if (
      String(current.effectiveTo || '') !== String(nextEffectiveTo || '') ||
      current.status !== nextStatus
    ) {
      current.effectiveTo = nextEffectiveTo;
      current.status = nextStatus;
      await current.save();
    }

    if (nextStatus === 'ACTIVE') {
      activeHistory = current;
    }
  }

  if (activeHistory) {
    await Service.findByIdAndUpdate(activeHistory.serviceId, { price: activeHistory.price }, { returnDocument: 'after' });
  }

  return activeHistory;
};

const ensureServicePriceHistory = async (serviceOrId, user = null) => {
  const service = typeof serviceOrId?.toObject === 'function' || serviceOrId?.name
    ? serviceOrId
    : await Service.findById(serviceOrId);

  if (!service) return null;

  const serviceId = service._id;
  const existing = await ServicePriceHistory.exists({ serviceId });
  if (!existing && Number(service.price) > 0) {
    const effectiveFrom = normalizeEffectiveDate(service.createdAt || new Date());
    await ServicePriceHistory.create({
      serviceId,
      price: normalizePrice(service.price),
      effectiveFrom,
      note: 'Khởi tạo từ giá hiện tại',
      createdBy: user?._id
    });
  }

  return refreshServicePriceTimeline(serviceId);
};

const ensureServicePriceHistories = async (services, user = null) => {
  await Promise.all((services || []).map((service) => ensureServicePriceHistory(service, user)));
};

const getEffectiveServicePrice = async (serviceOrId, dateInput = new Date()) => {
  const serviceId = toObjectIdString(serviceOrId);
  if (!serviceId) return null;

  await ensureServicePriceHistory(serviceOrId);

  const effectiveDate = normalizeEffectiveDate(dateInput);
  const priceHistory = await ServicePriceHistory.findOne({
    serviceId,
    effectiveFrom: { $lte: effectiveDate },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: effectiveDate } }
    ]
  }).sort({ effectiveFrom: -1 });

  if (priceHistory) return priceHistory;

  const service = typeof serviceOrId?.toObject === 'function' || serviceOrId?.name
    ? serviceOrId
    : await Service.findById(serviceId);

  return service
    ? { serviceId: service._id, price: service.price, effectiveFrom: service.createdAt || new Date(), effectiveTo: null, status: 'ACTIVE' }
    : null;
};

const createServicePriceHistory = async ({ service, price, effectiveFrom, note, user }) => {
  const serviceId = toObjectIdString(service);
  if (!serviceId) {
    const error = new Error('Dịch vụ không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const normalizedPrice = normalizePrice(price);
  const normalizedEffectiveFrom = normalizeEffectiveDate(effectiveFrom);

  const duplicate = await ServicePriceHistory.findOne({
    serviceId,
    effectiveFrom: normalizedEffectiveFrom
  });

  if (duplicate) {
    const error = new Error('Đã tồn tại mức giá áp dụng từ ngày này.');
    error.statusCode = 400;
    throw error;
  }

  const created = await ServicePriceHistory.create({
    serviceId,
    price: normalizedPrice,
    effectiveFrom: normalizedEffectiveFrom,
    note: String(note || '').trim(),
    createdBy: user?._id
  });

  await refreshServicePriceTimeline(serviceId);
  return ServicePriceHistory.findById(created._id).populate('serviceId', 'name category price status');
};

module.exports = {
  createServicePriceHistory,
  ensureServicePriceHistory,
  ensureServicePriceHistories,
  getEffectiveServicePrice,
  normalizeEffectiveDate,
  normalizePrice,
  refreshServicePriceTimeline
};
