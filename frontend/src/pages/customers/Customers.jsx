import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCustomers, createCustomer } from '../../api/customers'
import toast from 'react-hot-toast'
import { Plus, Search, Users, X } from 'lucide-react'
import { useForm } from 'react-hook-form'

function Modal({ onClose, onSave }) {
  const { register, handleSubmit } = useForm()
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900">Add Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name *</label>
              <input className="input" {...register('firstName', { required: true })} /></div>
            <div><label className="label">Last Name</label>
              <input className="input" {...register('lastName')} /></div>
            <div><label className="label">Phone</label>
              <input className="input" {...register('phone')} /></div>
            <div><label className="label">Email</label>
              <input className="input" type="email" {...register('email')} /></div>
            <div><label className="label">Gender</label>
              <select className="input" {...register('gender')}>
                <option value="">-</option><option>Male</option><option>Female</option><option>Other</option>
              </select></div>
            <div><label className="label">Date of Birth</label>
              <input className="input" type="date" {...register('dateOfBirth')} /></div>
            <div className="col-span-2"><label className="label">Allergy Notes</label>
              <textarea className="input h-16 resize-none" {...register('allergyNotes')} /></div>
            <div className="col-span-2"><label className="label">Chronic Conditions</label>
              <textarea className="input h-16 resize-none" {...register('chronicConditions')} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Customer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Customers() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['customers'], queryFn: getCustomers })
  const customers = data?.data?.data || []

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => { qc.invalidateQueries(['customers']); toast.success('Customer added'); setShowModal(false) },
    onError: () => toast.error('Failed to save customer')
  })

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">{customers.length} registered patients</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-40" />
            <p>No customers found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Name', 'Phone', 'Email', 'Gender', 'Insurance', 'Credit Balance'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.gender || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.insuranceProvider || '-'}</td>
                  <td className="px-4 py-3">
                    {Number(c.creditBalance) > 0
                      ? <span className="badge-red">KES {Number(c.creditBalance).toLocaleString()}</span>
                      : <span className="badge-green">Clear</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} onSave={(d) => mutation.mutate(d)} />}
    </div>
  )
}
