import apiFetch from './api';

export const getPendingInvoices = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/invoices/pending${query ? `?${query}` : ''}`);
};

export const getInvoices = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/invoices${query ? `?${query}` : ''}`);
};

export const getInvoiceById = (id) => apiFetch(`/invoices/${id}`);

export const createInvoiceFromAppointment = (appointmentId, data) => apiFetch(`/invoices/from-appointment/${appointmentId}`, {
  method: 'POST',
  body: JSON.stringify(data)
});
