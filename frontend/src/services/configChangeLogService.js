import apiFetch from './api';

export const getConfigChangeLogs = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/config-change-logs${query ? `?${query}` : ''}`);
};
