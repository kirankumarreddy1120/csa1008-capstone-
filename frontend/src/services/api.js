import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response && error.response.data) {
      message = error.response.data.detail || error.response.data.message || message;
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      message = 'Backend server unreachable. Please ensure Python FastAPI is running on http://localhost:8000.';
    }
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const waterAPI = {
  getZones: () => api.get('/water/zones'),
  createZone: (data) => api.post('/water/zones', data),
  getPipelines: () => api.get('/water/pipelines'),
  getReadings: (params) => api.get('/water/readings', { params }),
  createReading: (data) => api.post('/water/readings', data),
  getPressureHistory: (zoneId) => api.get(`/water/pressure/history/${zoneId}`),
};

export const wasteAPI = {
  getAreas: () => api.get('/waste/areas'),
  createArea: (data) => api.post('/waste/areas', data),
  getSchedules: (params) => api.get('/waste/schedules', { params }),
  createSchedule: (data) => api.post('/waste/schedules', data),
  getRequests: () => api.get('/waste/requests'),
  createRequest: (data) => api.post('/waste/requests', data),
};

export const incidentsAPI = {
  getIncidents: (params) => api.get('/incidents', { params }),
  getIncident: (id) => api.get(`/incidents/${id}`),
  createIncident: (data) => api.post('/incidents', data),
  updateStatus: (id, statusData) => api.put(`/incidents/${id}/status`, statusData),
};

export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateStatus: (id, statusData) => api.put(`/tasks/${id}/status`, statusData),
};

export const teamsAPI = {
  getTeams: () => api.get('/teams'),
  createTeam: (data) => api.post('/teams', data),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
};

export const repairServicesAPI = {
  getServices: () => api.get('/repair-services'),
  createService: (data) => api.post('/repair-services', data),
  getNearby: (zoneOrAreaId, radiusKm = 10, domain = 'water') => api.get(`/repair-services/nearby/${zoneOrAreaId}`, {
    params: { radius_km: radiusKm, domain }
  }),
};

export const alertsAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getUnreadCount: () => api.get('/alerts/unread-count'),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
};

export const analyticsAPI = {
  getWaterAnalytics: () => api.get('/analytics/water'),
  getWasteAnalytics: () => api.get('/analytics/waste'),
  getCivicAnalytics: () => api.get('/analytics/civic'),
  predictRisk: (params) => api.post('/analytics/predict-risk', null, { params }),
};

export const reportsAPI = {
  getPDFUrl: (type = 'combined') => `${API_BASE_URL}/reports/export-pdf?type=${type}`,
  getCSVUrl: (type = 'combined') => `${API_BASE_URL}/reports/export-csv?type=${type}`,
};

export default api;
