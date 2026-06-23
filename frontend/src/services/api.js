import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data) => API.post('/auth/register', data)
export const login    = (data) => API.post('/auth/login', data)
export const logout   = ()     => API.post('/auth/logout')

// Projects
export const getProjects    = (params) => API.get('/projects', { params })
export const getProject     = (id)     => API.get(`/projects/${id}`)
export const createProject  = (data)   => API.post('/projects', data)
export const updateProject  = (id, data) => API.put(`/projects/${id}`, data)
export const deleteProject  = (id)     => API.delete(`/projects/${id}`)

// Tasks
export const getTasks    = (params)    => API.get('/tasks', { params })
export const getTask     = (id)        => API.get(`/tasks/${id}`)
export const createTask  = (data)      => API.post('/tasks', data)
export const updateTask  = (id, data)  => API.put(`/tasks/${id}`, data)
export const deleteTask  = (id)        => API.delete(`/tasks/${id}`)

// Dashboard
export const getDashboard = () => API.get('/dashboard')

// Notifications
export const testDailyDigest = () => API.post('/notifications/test-daily')
export const sendDeadlineAlert = (projectId) => API.post(`/notifications/send-deadline/${projectId}`)

export default API
