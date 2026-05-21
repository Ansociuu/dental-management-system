import apiFetch from './api';

export const getServices = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/services${query ? `?${query}` : ''}`);
};

export const createService = (data) => apiFetch('/services', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateService = (id, data) => apiFetch(`/services/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteService = (id) => apiFetch(`/services/${id}`, {
  method: 'DELETE',
});
