import apiFetch from './api';

export const loginUser = (credentials) => apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

export const registerUser = (userData) => apiFetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData)
});

export const getMe = () => apiFetch('/auth/me');
