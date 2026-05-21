import apiFetch from './api';

export const getHolidays = (status) => apiFetch(`/holidays${status ? `?status=${status}` : ''}`);
export const createHoliday = (data) => apiFetch('/holidays', { method: 'POST', body: JSON.stringify(data) });
export const updateHoliday = (id, data) => apiFetch(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateHolidayStatus = (id, status) => apiFetch(`/holidays/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
