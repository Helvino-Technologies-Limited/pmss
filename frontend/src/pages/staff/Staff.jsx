import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, UserCog, X } from 'lucide-react'
import api from '../../api/axios'

const getStaff = () => api.get('/users')
const createStaff = (data) => api.post('/users', data)
const ROLES = ['PHARMACIST','CASHIER','STORE_MANAGER','ACCOUNTANT']

function AddStaffModal({ onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add Staff Member</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
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
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="staff@pharmacy.com" {...register('email', { required: 'Required' })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+254 7XX XXX XXX" {...register('phone')} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" {...register('role', { required: 'Required' })}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" placeholder="Min 8 chars" {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Staff Member</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Staff() {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: getStaff })
  const staff = (data?.data?.data || []).filter(u => u.role !== 'SUPER_ADMIN')

  const mutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      qc.invalidateQueries(['staff'])
      toast.success('Staff member added successfully')
      setShowModal(false)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add staff member')
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm">{staff.length} team members</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Staff
        </button>
      </div>
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : !staff.length ? (
          <div className="text-center py-16 text-gray-400">
            <UserCog size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No staff members yet</p>
            <p className="text-sm mt-1">Add your first team member to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name','Email','Phone','Role','Status','Last Login'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '-'}</td>
                    <td className="px-4 py-3"><span className="badge-blue">{u.role.replace('_',' ')}</span></td>
                    <td className="px-4 py-3">
                      {u.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onSave={(d) => mutation.mutate(d)} />}
    </div>
  )
}
