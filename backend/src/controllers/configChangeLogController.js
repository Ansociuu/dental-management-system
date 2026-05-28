const ConfigChangeLog = require('../models/ConfigChangeLog');

const getConfigChangeLogs = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.resourceType) {
      filter.resourceType = String(req.query.resourceType).toUpperCase();
    }

    if (req.query.resourceId) {
      filter.resourceId = req.query.resourceId;
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const logs = await ConfigChangeLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getConfigChangeLogs };
