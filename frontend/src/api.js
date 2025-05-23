// src/api.js
import axios from 'axios';
//Exporting an axios instance with a base URL for the API. This allows us to make HTTP requests to the backend server.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
// Before every request, it retrieves the JWT from localStorage and attaches it as an 
// Authorization header, ensuring that protected routes receive the credentials they need.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
