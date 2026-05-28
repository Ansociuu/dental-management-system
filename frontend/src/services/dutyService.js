import apiFetch from './api';

export const getDutySchedules = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/duty-schedules${query ? `?${query}` : ''}`);
};
export const getDutyHistory = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/duty-schedules/history${query ? `?${query}` : ''}`);
};
export const createDutySchedule = (data) => apiFetch('/duty-schedules', { method: 'POST', body: JSON.stringify(data) });
export const deleteDutySchedule = (id) => apiFetch(`/duty-schedules/${id}`, { method: 'DELETE' });
