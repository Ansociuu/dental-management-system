const mongoose = require('mongoose');

const configChangeLogSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: ['SHIFT', 'HOLIDAY', 'SERVICE', 'SALARY_SETTING', 'SHIFT_SALARY_RULE'],
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  resourceName: { type: String },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'],
    required: true,
    index: true
  },
  changedFields: [{ type: String }],
  before: { type: Object },
  after: { type: Object },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String },
  actorRole: { type: String },
  note: { type: String }
}, { timestamps: true });

configChangeLogSchema.index({ resourceType: 1, createdAt: -1 });

module.exports = mongoose.model('ConfigChangeLog', configChangeLogSchema);
