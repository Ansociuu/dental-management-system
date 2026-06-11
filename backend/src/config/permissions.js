const PERMISSION_MODULES = [
  'dashboard',
  'appointments',
  'followUps',
  'payments',
  'patients',
  'records',
  'services',
  'users',
  'roles',
  'reports',
  'payroll',
  'settings',
  'doctorDuty'
];

const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete', 'export'];

const makePermissions = (allowed = {}) => {
  return PERMISSION_MODULES.reduce((acc, module) => {
    acc[module] = PERMISSION_ACTIONS.reduce((actionAcc, action) => {
      actionAcc[action] = Boolean(allowed[module]?.includes(action));
      return actionAcc;
    }, {});
    return acc;
  }, {});
};

const allActions = [...PERMISSION_ACTIONS];
const readOnly = ['view'];

const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: makePermissions(
    PERMISSION_MODULES.reduce((acc, module) => {
      acc[module] = allActions;
      return acc;
    }, {})
  ),
  MANAGER: makePermissions(
    PERMISSION_MODULES.reduce((acc, module) => {
      if (module !== 'roles') {
        acc[module] = allActions;
      }
      return acc;
    }, {})
  ),
  RECEPTIONIST: makePermissions({
    dashboard: readOnly,
    appointments: ['view', 'create', 'update'],
    followUps: ['view', 'update'],
    payments: ['view', 'create'],
    patients: ['view', 'create', 'update'],
    records: readOnly,
    services: readOnly,
    users: readOnly,
    settings: readOnly,
    doctorDuty: ['view', 'create', 'delete']
  }),
  DOCTOR: makePermissions({
    dashboard: readOnly,
    appointments: ['view', 'update'],
    patients: readOnly,
    records: ['view', 'update'],
    services: readOnly,
    settings: readOnly,
    doctorDuty: readOnly
  }),
  PATIENT: makePermissions({})
};

const normalizePermissions = (permissions = {}) => {
  return PERMISSION_MODULES.reduce((acc, module) => {
    acc[module] = PERMISSION_ACTIONS.reduce((actionAcc, action) => {
      actionAcc[action] = Boolean(permissions?.[module]?.[action]);
      return actionAcc;
    }, {});
    return acc;
  }, {});
};

const applyRolePermissionRules = (role, permissions = {}) => {
  const normalizedRole = String(role || '').toUpperCase();
  const normalized = normalizePermissions(permissions);

  if (normalizedRole === 'ADMIN') {
    normalized.roles.view = true;
    normalized.roles.update = true;
  }

  if (normalizedRole === 'MANAGER') {
    PERMISSION_ACTIONS.forEach((action) => {
      normalized.roles[action] = false;
    });
  }

  return normalized;
};

const mergeWithDefaults = (role, permissions = {}) => {
  const defaults = DEFAULT_ROLE_PERMISSIONS[role] || makePermissions();
  const normalized = normalizePermissions(permissions);

  const merged = PERMISSION_MODULES.reduce((acc, module) => {
    acc[module] = PERMISSION_ACTIONS.reduce((actionAcc, action) => {
      actionAcc[action] = Boolean(normalized[module][action] || defaults[module]?.[action]);
      return actionAcc;
    }, {});
    return acc;
  }, {});

  return applyRolePermissionRules(role, merged);
};

const getDefaultPermissions = (role) => DEFAULT_ROLE_PERMISSIONS[role] || makePermissions();

module.exports = {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  getDefaultPermissions,
  normalizePermissions,
  applyRolePermissionRules,
  mergeWithDefaults
};
