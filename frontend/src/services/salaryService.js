import apiFetch from './api';

export const getSalaryBaseRate = () => apiFetch('/salaries/settings/base-rate');

export const updateSalaryBaseRate = (data) => apiFetch('/salaries/settings/base-rate', {
  method: 'PUT',
  body: JSON.stringify(typeof data === 'object' ? data : { baseHourlyRate: data })
});

export const getSalaryDoctorProfiles = () => apiFetch('/salaries/doctor-profiles');

export const updateSalaryDoctorProfile = (doctorId, data) => apiFetch(`/salaries/doctor-profiles/${doctorId}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const getSalaryDegreeCoefficients = () => apiFetch('/salaries/degree-coefficients');

export const updateSalaryDegreeCoefficient = (degreeLevel, data) => apiFetch(`/salaries/degree-coefficients/${degreeLevel}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const getSalaryShiftRules = () => apiFetch('/salaries/shift-rules');

export const updateSalaryShiftRules = (rules) => apiFetch('/salaries/shift-rules', {
  method: 'PUT',
  body: JSON.stringify({ rules })
});

export const getSalaryComplexities = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/salaries/complexities${query ? `?${query}` : ''}`);
};

export const updateSalaryComplexities = (items) => apiFetch('/salaries/complexities', {
  method: 'PUT',
  body: JSON.stringify({ items })
});

export const generateSalaryPayslip = (data) => apiFetch('/salaries/payslips/generate', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const getSalaryPayslips = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/salaries/payslips${query ? `?${query}` : ''}`);
};

export const getSalaryMonthlyReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/salaries/reports/monthly${query ? `?${query}` : ''}`);
};

export const getSalaryDoctorYearlyReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/salaries/reports/doctor-yearly${query ? `?${query}` : ''}`);
};

export const getSalaryYearlyReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/salaries/reports/yearly${query ? `?${query}` : ''}`);
};
