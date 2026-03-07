import api from './axios'
export const getAllTenants = () => api.get('/superadmin/tenants')
export const getTenant = (id) => api.get(`/superadmin/tenants/${id}`)
export const activateTenant = (id, data) => api.post(`/superadmin/tenants/${id}/activate`, data)
export const toggleTenant = (id, active) => api.post(`/superadmin/tenants/${id}/toggle`, { active })
export const extendTenant = (id, months) => api.post(`/superadmin/tenants/${id}/extend`, { months })
export const impersonateTenant = (id) => api.post(`/superadmin/tenants/${id}/impersonate`)
export const getTenantUsers = (id) => api.get(`/superadmin/tenants/${id}/users`)
export const resetUserPassword = (tenantId, userId, newPassword) =>
  api.post(`/superadmin/tenants/${tenantId}/users/${userId}/reset-password`, { newPassword })
