import apiFetch from './api';

export const getShifts = () => apiFetch('/shifts');
export const createShift = (data) => apiFetch('/shifts', { method: 'POST', body: JSON.stringify(data) });
export const updateShift = (id, data) => apiFetch(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteShift = (id) => apiFetch(`/shifts/${id}`, { method: 'DELETE' });
