const RolePermission = require('../models/RolePermission');
const {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  normalizePermissions,
  applyRolePermissionRules
} = require('../config/permissions');
const { ensureRolePermission, seedDefaultPermissions } = require('../services/permissionService');

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  DOCTOR: 'Bác sĩ',
  RECEPTIONIST: 'Lễ tân'
};

const getPermissions = async (req, res, next) => {
  try {
    await seedDefaultPermissions();
    const rows = await RolePermission.find({ role: { $in: ['ADMIN', 'MANAGER', 'DOCTOR', 'RECEPTIONIST'] } })
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

    const permissions = applyRolePermissionRules(role, req.body.permissions || {});

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
