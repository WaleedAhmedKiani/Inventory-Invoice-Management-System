import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // This handles cookies for session management
});

// This handles the "token" found in Local Storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Use the exact key name "token"


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});