import apiFetch from './api';

export const getDoctorPerformanceReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/reports/doctor-performance${query ? `?${query}` : ''}`);
};

export const getPatientsServicesReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/reports/patients-services${query ? `?${query}` : ''}`);
};
