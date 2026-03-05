import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSuppliers, createSupplier } from '../../api/suppliers'
import toast from 'react-hot-toast'
import { Plus, Truck, X } from 'lucide-react'
import { useForm } from 'react-hook-form'

function Modal({ onClose, onSave }) {
  const { register, handleSubmit } = useForm()
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900">Add Supplier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
          <div><label className="label">Supplier Name *</label>
            <input className="input" {...register('name', { required: true })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Person</label>
              <input className="input" {...register('contactPerson')} /></div>
            <div><label className="label">Phone</label>
              <input className="input" {...register('phone')} /></div>
            <div><label className="label">Email</label>
              <input className="input" type="email" {...register('email')} /></div>
            <div><label className="label">KRA PIN</label>
              <input className="input" {...register('kraPin')} /></div>
          </div>
          <div><label className="label">Address</label>
            <textarea className="input h-16 resize-none" {...register('address')} /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Suppliers() {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers })
  const suppliers = data?.data?.data || []

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => { qc.invalidateQueries(['suppliers']); toast.success('Supplier added'); setShowModal(false) },
    onError: () => toast.error('Failed to save supplier')
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 text-sm">{suppliers.length} suppliers</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
        : !suppliers.length ? (
          <div className="text-center py-16 text-gray-400"><Truck size={40} className="mx-auto mb-3 opacity-40" /><p>No suppliers added</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Name', 'Contact', 'Phone', 'Email', 'KRA PIN', 'Balance'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.contactPerson || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.kraPin || '-'}</td>
                  <td className="px-4 py-3">
                    {Number(s.currentBalance) > 0
                      ? <span className="badge-red">KES {Number(s.currentBalance).toLocaleString()}</span>
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
