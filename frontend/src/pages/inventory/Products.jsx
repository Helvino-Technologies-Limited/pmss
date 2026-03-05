import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '../../api/products'
import { getCustomers } from '../../api/customers'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, Edit, Package, Pill, X } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../api/axios'

function PrescribeModal({ drug, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      notes: `Drug: ${drug.drugName}${drug.genericName ? ` (${drug.genericName})` : ''}${drug.strength ? ` — ${drug.strength}` : ''}`,
      prescriptionDate: new Date().toISOString().slice(0, 10),
    }
  })
  const qc = useQueryClient()
  const { data: custData } = useQuery({ queryKey: ['customers'], queryFn: getCustomers })
  const customers = custData?.data?.data || []

  const mut = useMutation({
    mutationFn: (data) => api.post('/prescriptions', data),
    onSuccess: () => {
      qc.invalidateQueries(['prescriptions'])
      toast.success(`Prescription created for ${drug.drugName}`)
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create prescription')
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900">Prescribe Drug</h2>
            <p className="text-xs text-primary-600 mt-0.5 font-medium">{drug.drugName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-5 space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-sm">
            <p className="font-semibold text-primary-800">{drug.drugName}</p>
            <p className="text-primary-600 text-xs mt-0.5">
              {[drug.genericName, drug.strength, drug.dosageForm].filter(Boolean).join(' · ')}
            </p>
            <p className="text-primary-600 text-xs mt-0.5">Stock: {drug.quantity} {drug.unitOfMeasure}</p>
          </div>

          <div>
            <label className="label">Patient / Customer</label>
            <select className="input" {...register('customerId')}>
              <option value="">— Walk-in / Unknown —</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.phone ? ` (${c.phone})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Rx Number</label>
              <input className="input" placeholder="RX-001" {...register('prescriptionNumber')} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" {...register('prescriptionDate', { required: 'Required' })} />
              {errors.prescriptionDate && <p className="text-red-500 text-xs mt-1">{errors.prescriptionDate.message}</p>}
            </div>
            <div>
              <label className="label">Doctor Name</label>
              <input className="input" placeholder="Dr. Jane Smith" {...register('doctorName')} />
            </div>
            <div>
              <label className="label">Hospital</label>
              <input className="input" placeholder="KNH / Clinic" {...register('hospitalName')} />
            </div>
          </div>

          <div>
            <label className="label">Notes / Dosage Instructions *</label>
            <textarea className="input min-h-[70px] resize-none" placeholder="Dosage, frequency, duration..."
              {...register('notes', { required: 'Required' })} />
            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="btn-primary flex-1">
              {mut.isPending ? 'Saving...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Products() {
  const [search, setSearch] = useState('')
  const [prescribeDrug, setPrescribeDrug] = useState(null)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const products = data?.data?.data || []

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { qc.invalidateQueries(['products']); toast.success('Product deleted') },
    onError: () => toast.error('Failed to delete product')
  })

  const filtered = products.filter(p =>
    p.drugName.toLowerCase().includes(search.toLowerCase()) ||
    (p.genericName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').includes(search)
  )

  const stockBadge = (p) => {
    if (p.quantity === 0) return <span className="badge-red">Out of Stock</span>
    if (p.quantity <= p.reorderLevel) return <span className="badge-yellow">Low Stock</span>
    return <span className="badge-green">In Stock</span>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <Link to="/dashboard/products/add" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={17} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by drug name, generic name or barcode..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package size={26} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-600">No products found</p>
            <p className="text-sm mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Drug Name', 'Generic', 'Type', 'Price', 'Qty', 'Expiry', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{p.drugName}</p>
                      {p.strength && <p className="text-xs text-gray-400">{p.strength}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.genericName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={p.productType === 'CONTROLLED' ? 'badge-red' : p.productType === 'PRESCRIPTION' ? 'badge-blue' : 'badge-gray'}>
                        {p.productType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">KES {Number(p.sellingPrice).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${p.quantity === 0 ? 'text-red-600' : p.quantity <= p.reorderLevel ? 'text-amber-600' : 'text-gray-900'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {p.expiryDate ? (
                        <span className={new Date(p.expiryDate) < new Date(Date.now() + 90 * 86400000) ? 'text-orange-600 font-medium' : ''}>
                          {format(new Date(p.expiryDate), 'MMM yyyy')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">{stockBadge(p)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPrescribeDrug(p)}
                          className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Pill size={12} /> Prescribe
                        </button>
                        <Link to={`/dashboard/products/add?edit=${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => { if (confirm(`Delete ${p.drugName}?`)) deleteMut.mutate(p.id) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {prescribeDrug && <PrescribeModal drug={prescribeDrug} onClose={() => setPrescribeDrug(null)} />}
    </div>
  )
}
