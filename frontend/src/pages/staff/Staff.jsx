import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, UserCog, X, Pencil, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import api from '../../api/axios'

const getStaff = () => api.get('/users')
const createStaff = (data) => api.post('/users', data)
const updateStaff = ({ id, ...data }) => api.put(`/users/${id}`, data)
const ROLES = ['TENANT_ADMIN', 'PHARMACIST', 'CASHIER', 'STORE_MANAGER', 'ACCOUNTANT']

function StaffModal({ staff, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: staff ? {
      firstName: staff.firstName, lastName: staff.lastName,
      phone: staff.phone, role: staff.role
    } : {}
  })
  const [showPass, setShowPass] = useState(false)
  const isEdit = !!staff

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(d => onSave(isEdit ? { id: staff.id, ...d } : d))} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" placeholder="John" {...register('firstName', { required: 'Required' })} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" placeholder="Doe" {...register('lastName', { required: 'Required' })} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
            {!isEdit && (
              <div className="col-span-2">
                <label className="label">Email *</label>
                <input className="input" type="email" placeholder="staff@pharmacy.com" {...register('email', { required: 'Required' })} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            )}
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+254 7XX XXX XXX" {...register('phone')} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" {...register('role', { required: 'Required' })}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  {...register('password', isEdit ? {} : { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{isEdit ? 'Save Changes' : 'Add Staff Member'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Staff() {
  const { isTenantAdmin } = useAuth()
  const [modal, setModal] = useState(null) // null | 'add' | { staff object for edit }
  const qc = useQueryClient()

  if (!isTenantAdmin) return <Navigate to="/dashboard" replace />

  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: getStaff })
  const staff = (data?.data?.data || []).filter(u => u.role !== 'SUPER_ADMIN')

  const addMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => { qc.invalidateQueries(['staff']); toast.success('Staff member added'); setModal(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add staff')
  })

  const editMutation = useMutation({
    mutationFn: updateStaff,
    onSuccess: () => { qc.invalidateQueries(['staff']); toast.success('Staff member updated'); setModal(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update staff')
  })

  const handleSave = (data) => {
    if (data.id) editMutation.mutate(data)
    else addMutation.mutate(data)
  }

  const roleColor = (role) => {
    const map = { TENANT_ADMIN: 'badge-blue', PHARMACIST: 'badge-green', CASHIER: 'badge-gray', STORE_MANAGER: 'badge-yellow', ACCOUNTANT: 'badge-blue' }
    return map[role] || 'badge-gray'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm">{staff.length} team members</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <Plus size={17} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full" />
          </div>
        ) : !staff.length ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserCog size={26} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-600">No staff members yet</p>
            <p className="text-sm mt-1">Add your first team member to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Status', 'Last Login', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-semibold text-gray-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3"><span className={roleColor(u.role)}>{u.role.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3">
                      {u.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModal(u)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Pencil size={12} /> Edit / Reset PW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <StaffModal
          staff={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
