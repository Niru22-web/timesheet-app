import axios, { AxiosInstance } from "axios";
import { loadingManager } from "./utils/loadingManager";

const API: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Start global freeze for any outgoing data request
  if (config.method !== 'get') {
    loadingManager.startLoading("Syncing with database...");
  } else {
    // For GET, maybe use a more subtle message
    loadingManager.startLoading("Fetching latest records...");
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    loadingManager.stopLoading();
    return response;
  },
  (error) => {
    loadingManager.stopLoading();
    return Promise.reject(error);
  }
);

export default API;