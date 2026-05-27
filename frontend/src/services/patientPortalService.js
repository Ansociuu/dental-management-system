import apiFetch from './api';

export const getPatientPortalMe = () => apiFetch('/patient-portal/me');

export const updatePatientPortalMe = (data) => apiFetch('/patient-portal/me', {
  method: 'PATCH',
  body: JSON.stringify(data)
});

export const getPatientBookingOptions = () => apiFetch('/patient-portal/booking-options');

export const getPatientBookingAvailability = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/patient-portal/booking-availability${query ? `?${query}` : ''}`);
};

export const getPatientPortalAppointments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/patient-portal/appointments${query ? `?${query}` : ''}`);
};

export const getPatientPortalAppointmentById = (id) => apiFetch(`/patient-portal/appointments/${id}`);

export const createPatientPortalAppointment = (data) => apiFetch('/patient-portal/appointments', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const getPatientDoctorSuggestions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/patient-portal/doctors/suggestions${query ? `?${query}` : ''}`);
};

export const getPatientPortalInvoices = () => apiFetch('/patient-portal/invoices');
