import apiFetch from './api';

export const getUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/users${query ? `?${query}` : ''}`);
};

export const getUserById = (id) => apiFetch(`/users/${id}`);

export const createUser = (data) => apiFetch('/users', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateUser = (id, data) => apiFetch(`/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteUser = (id) => apiFetch(`/users/${id}`, {
  method: 'DELETE',
});
