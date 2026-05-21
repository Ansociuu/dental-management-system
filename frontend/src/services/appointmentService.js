import apiFetch from './api';

export const getAppointments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/appointments${query ? `?${query}` : ''}`);
};
export const monitorAppointments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/appointments/monitor${query ? `?${query}` : ''}`);
};
export const createAppointment = (data) => apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) });
export const updateAppointmentStatus = (id, status) => apiFetch(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
