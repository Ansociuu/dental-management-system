const RolePermission = require('../models/RolePermission');
const {
  DEFAULT_ROLE_PERMISSIONS,
  getDefaultPermissions,
  normalizePermissions,
  applyRolePermissionRules
} = require('../config/permissions');

const ensureRolePermission = async (role) => {
  const normalizedRole = String(role || '').toUpperCase();
  let rolePermission = await RolePermission.findOne({ role: normalizedRole });

  if (!rolePermission) {
    rolePermission = await RolePermission.create({
      role: normalizedRole,
      permissions: getDefaultPermissions(normalizedRole)
    });
  }

  const defaults = getDefaultPermissions(normalizedRole);
  let changed = false;
  const nextPermissions = { ...rolePermission.permissions };

  Object.entries(defaults).forEach(([module, actions]) => {
    if (!nextPermissions[module]) nextPermissions[module] = {};
    Object.entries(actions).forEach(([action, allowed]) => {
      if (nextPermissions[module][action] === undefined) {
        nextPermissions[module][action] = allowed;
        changed = true;
      }
    });
  });

  const ruledPermissions = applyRolePermissionRules(normalizedRole, nextPermissions);
  if (JSON.stringify(ruledPermissions) !== JSON.stringify(normalizePermissions(nextPermissions))) {
    changed = true;
  }

  if (changed) {
    rolePermission.permissions = ruledPermissions;
    await rolePermission.save();
  }

  return rolePermission;
};

const getPermissionsForRole = async (role) => {
  const rolePermission = await ensureRolePermission(role);
  return normalizePermissions(rolePermission.permissions);
};

const seedDefaultPermissions = async () => {
  const User = require('../models/User');
  await User.updateMany({ role: 'NURSE' }, { role: 'DOCTOR' });
  await RolePermission.deleteMany({ role: 'NURSE' });

  const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS);
  await Promise.all(roles.map((role) => ensureRolePermission(role)));
};

const hasPermission = async (role, module, action) => {
  const permissions = await getPermissionsForRole(role);
  const normalizedRole = String(role || '').toUpperCase();
  if (normalizedRole === 'ADMIN' && module === 'roles' && ['view', 'update'].includes(action)) {
    return true;
  }
  if (normalizedRole === 'MANAGER' && module === 'roles') {
    return false;
  }

  return Boolean(permissions?.[module]?.[action]);
};

module.exports = {
  ensureRolePermission,
  getPermissionsForRole,
  seedDefaultPermissions,
  hasPermission
};
