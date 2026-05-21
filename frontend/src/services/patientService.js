import apiFetch from './api';

export const getPatients = (search) => apiFetch(`/patients${search ? `?search=${search}` : ''}`);
export const getPatientById = (id) => apiFetch(`/patients/${id}`);
export const createPatient = (data) => apiFetch('/patients', { method: 'POST', body: JSON.stringify(data) });
export const updatePatient = (id, data) => apiFetch(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePatient = (id) => apiFetch(`/patients/${id}`, { method: 'DELETE' });
