const ConfigChangeLog = require('../models/ConfigChangeLog');

const normalizeValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = normalizeValue(value[key]);
      return acc;
    }, {});
  }
  return value ?? null;
};

const toPlainObject = (doc, fields = []) => {
  if (!doc) return null;
  const source = typeof doc.toObject === 'function' ? doc.toObject() : doc;

  return fields.reduce((acc, field) => {
    acc[field] = normalizeValue(source[field]);
    return acc;
  }, {});
};

const getChangedFields = (before = {}, after = {}) => {
  const fields = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return Array.from(fields).filter((field) => {
    return JSON.stringify(normalizeValue(before?.[field])) !== JSON.stringify(normalizeValue(after?.[field]));
  });
};

const recordConfigChange = async ({
  resourceType,
  resourceId,
  resourceName,
  action,
  before,
  after,
  user,
  note
}) => {
  const changedFields = ['CREATE', 'DELETE'].includes(action)
    ? []
    : getChangedFields(before, after);

  if (action === 'UPDATE' && changedFields.length === 0) {
    return null;
  }

  return ConfigChangeLog.create({
    resourceType,
    resourceId,
    resourceName,
    action,
    changedFields,
    before,
    after,
    actorId: user?._id,
    actorName: user?.fullName,
    actorRole: user?.role,
    note
  });
};

module.exports = {
  getChangedFields,
  recordConfigChange,
  toPlainObject
};
