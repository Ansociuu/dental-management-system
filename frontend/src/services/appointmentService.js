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
export const getDoctorTodayAppointments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/appointments/doctor-today${query ? `?${query}` : ''}`);
};
export const examineAppointment = (id, data) => apiFetch(`/appointments/${id}/examine`, { method: 'PUT', body: JSON.stringify(data) });
export const getAppointmentById = (id) => apiFetch(`/appointments/${id}`);
