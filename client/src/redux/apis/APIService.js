import axios from 'axios';

export const apiService = axios.create({
  baseURL: import.meta.env.VITE_EMPLOYEE_API + "/api", // ✅ critical
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});