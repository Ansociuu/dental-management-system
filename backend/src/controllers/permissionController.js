const RolePermission = require('../models/RolePermission');
const {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  normalizePermissions
} = require('../config/permissions');
const { ensureRolePermission, seedDefaultPermissions } = require('../services/permissionService');

const ROLE_LABELS = {
  ADMIN: 'Quan tri vien',
  DOCTOR: 'Bac si',
  NURSE: 'Y ta',
  RECEPTIONIST: 'Le tan'
};

const getPermissions = async (req, res, next) => {
  try {
    await seedDefaultPermissions();
    const rows = await RolePermission.find({})
      .populate('updatedBy', 'fullName role')
      .sort({ role: 1 });

    res.json({
      success: true,
      data: rows.map((row) => ({
        _id: row._id,
        role: row.role,
        label: ROLE_LABELS[row.role] || row.role,
        permissions: normalizePermissions(row.permissions),
        updatedBy: row.updatedBy,
        updatedAt: row.updatedAt
      })),
      meta: {
        modules: PERMISSION_MODULES,
        actions: PERMISSION_ACTIONS
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toUpperCase();
    if (!DEFAULT_ROLE_PERMISSIONS[role]) {
      const error = new Error('Vai tro khong hop le');
      error.statusCode = 400;
      throw error;
    }

    const permissions = normalizePermissions(req.body.permissions || {});

    if (role === 'ADMIN') {
      permissions.roles.view = true;
      permissions.roles.update = true;
    }

    const row = await ensureRolePermission(role);
    row.permissions = permissions;
    row.updatedBy = req.user._id;
    await row.save();

    const populated = await RolePermission.findById(row._id).populate('updatedBy', 'fullName role');

    res.json({
      success: true,
      message: 'Cap nhat phan quyen thanh cong',
      data: {
        _id: populated._id,
        role: populated.role,
        label: ROLE_LABELS[populated.role] || populated.role,
        permissions: normalizePermissions(populated.permissions),
        updatedBy: populated.updatedBy,
        updatedAt: populated.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPermissions,
  updateRolePermissions
};
