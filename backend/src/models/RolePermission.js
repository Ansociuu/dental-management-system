const mongoose = require('mongoose');
const {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  applyRolePermissionRules
} = require('../config/permissions');

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'],
    required: true,
    unique: true
  },
  permissions: {
    type: Object,
    required: true,
    default: () => applyRolePermissionRules()
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

rolePermissionSchema.pre('validate', function normalizeBeforeValidate() {
  this.permissions = applyRolePermissionRules(this.role, this.permissions);
});

rolePermissionSchema.methods.hasPermission = function hasPermission(module, action) {
  if (!PERMISSION_MODULES.includes(module) || !PERMISSION_ACTIONS.includes(action)) {
    return false;
  }

  return Boolean(this.permissions?.[module]?.[action]);
};

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
