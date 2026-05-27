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
  NURSE: makePermissions({
    dashboard: readOnly,
    appointments: readOnly,
    patients: readOnly,
    records: readOnly,
    services: readOnly,
    settings: readOnly,
    doctorDuty: readOnly
  })
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

const mergeWithDefaults = (role, permissions = {}) => {
  const defaults = DEFAULT_ROLE_PERMISSIONS[role] || makePermissions();
  const normalized = normalizePermissions(permissions);

  return PERMISSION_MODULES.reduce((acc, module) => {
    acc[module] = PERMISSION_ACTIONS.reduce((actionAcc, action) => {
      actionAcc[action] = Boolean(normalized[module][action] || defaults[module]?.[action]);
      return actionAcc;
    }, {});
    return acc;
  }, {});
};

const getDefaultPermissions = (role) => DEFAULT_ROLE_PERMISSIONS[role] || makePermissions();

module.exports = {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  getDefaultPermissions,
  normalizePermissions,
  mergeWithDefaults
};
