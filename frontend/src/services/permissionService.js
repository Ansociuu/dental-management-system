import apiFetch from './api';

export const getPermissions = () => apiFetch('/permissions');

export const updateRolePermissions = (role, permissions) => apiFetch(`/permissions/${role}`, {
  method: 'PUT',
  body: JSON.stringify({ permissions })
});
