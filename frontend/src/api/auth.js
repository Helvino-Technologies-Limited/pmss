import api from './axios'
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const exitImpersonation = () => api.post('/auth/exit-impersonation')
