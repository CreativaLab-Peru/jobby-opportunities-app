import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthHeaders = (userId: string) => {
  api.defaults.headers.common['user-id'] = userId;
  // Si usas tokens JWT, también podrías hacer:
  // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;
