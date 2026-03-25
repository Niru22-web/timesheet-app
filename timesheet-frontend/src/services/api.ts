import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const employeeAPI = {
  getEmployees: () => api.get('/employees'),
  createEmployee: (employee: any) => api.post('/employees', employee),
  updateEmployee: (id: string, employee: any) => api.put(`/employees/${id}`, employee),
  deleteEmployee: (id: string) => api.delete(`/employees/${id}`),
};

export const projectAPI = {
  getProjects: () => api.get('/projects'),
  createProject: (project: any) => api.post('/projects', project),
  updateProject: (id: string, project: any) => api.put(`/projects/${id}`, project),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

export const timesheetAPI = {
  getTimeEntries: () => api.get('/timelogs'),
  createTimeEntry: (entry: any) => api.post('/timelogs', entry),
  updateTimeEntry: (id: string, entry: any) => api.put(`/timelogs/${id}`, entry),
  deleteTimeEntry: (id: string) => api.delete(`/timelogs/${id}`),
};

export default api;
