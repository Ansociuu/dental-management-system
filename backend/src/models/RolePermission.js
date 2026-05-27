const mongoose = require('mongoose');
const { PERMISSION_MODULES, PERMISSION_ACTIONS, normalizePermissions } = require('../config/permissions');

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    required: true,
    unique: true
  },
  permissions: {
    type: Object,
    required: true,
    default: () => normalizePermissions()
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

rolePermissionSchema.pre('validate', function normalizeBeforeValidate() {
  this.permissions = normalizePermissions(this.permissions);

  if (this.role === 'ADMIN') {
    this.permissions.roles.view = true;
    this.permissions.roles.update = true;
  }
});

rolePermissionSchema.methods.hasPermission = function hasPermission(module, action) {
  if (!PERMISSION_MODULES.includes(module) || !PERMISSION_ACTIONS.includes(action)) {
    return false;
  }

  return Boolean(this.permissions?.[module]?.[action]);
};

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
