import api from './axios'
export const getSales = () => api.get('/sales')
export const getSale = (id) => api.get(`/sales/${id}`)
export const createSale = (data) => api.post('/sales', data)
export const voidSale = (id) => api.post(`/sales/${id}/void`)
