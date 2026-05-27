const RolePermission = require('../models/RolePermission');
const { DEFAULT_ROLE_PERMISSIONS, getDefaultPermissions, normalizePermissions } = require('../config/permissions');

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

  if (normalizedRole === 'ADMIN' && (!nextPermissions.roles?.view || !nextPermissions.roles?.update)) {
    nextPermissions.roles = { ...(nextPermissions.roles || {}), view: true, update: true };
    changed = true;
  }

  if (changed) {
    rolePermission.permissions = nextPermissions;
    await rolePermission.save();
  }

  return rolePermission;
};

const getPermissionsForRole = async (role) => {
  const rolePermission = await ensureRolePermission(role);
  return normalizePermissions(rolePermission.permissions);
};

const seedDefaultPermissions = async () => {
  const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS);
  await Promise.all(roles.map((role) => ensureRolePermission(role)));
};

const hasPermission = async (role, module, action) => {
  const permissions = await getPermissionsForRole(role);
  if (role === 'ADMIN' && module === 'roles' && ['view', 'update'].includes(action)) {
    return true;
  }

  return Boolean(permissions?.[module]?.[action]);
};

module.exports = {
  ensureRolePermission,
  getPermissionsForRole,
  seedDefaultPermissions,
  hasPermission
};
