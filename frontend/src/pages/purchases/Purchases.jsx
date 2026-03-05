import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FileText, Plus, X, Trash2, Search, CheckCircle, PackageCheck } from 'lucide-react'
import api from '../../api/axios'
import { getSuppliers } from '../../api/suppliers'
import { getProducts } from '../../api/products'

const getPurchases = () => api.get('/purchases')
const createPurchase = (data) => api.post('/purchases', data)
const receivePurchase = (id) => api.post(`/purchases/${id}/receive`)

function PurchaseModal({ onClose, onSave }) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { items: [{ productId: '', quantityOrdered: 1, unitCost: 0 }] }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const { data: suppData } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers })
  const { data: prodData } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const suppliers = suppData?.data?.data || []
  const products = prodData?.data?.data || []

  const items = watch('items') || []
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantityOrdered) || 0) * (Number(item.unitCost) || 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">New Purchase Order</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="purchase-form" onSubmit={handleSubmit(onSave)} className="p-5 space-y-5">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Supplier</label>
                <select className="input" {...register('supplierId')}>
                  <option value="">— Select supplier —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">PO Number</label>
                <input className="input" placeholder="PO-2024-001" {...register('poNumber')} />
              </div>
              <div>
                <label className="label">Supplier Invoice #</label>
                <input className="input" placeholder="INV-001" {...register('invoiceNumber')} />
              </div>
              <div>
                <label className="label">Amount Paid (KES)</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="0" {...register('amountPaid', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" placeholder="Optional notes" {...register('notes')} />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Order Items</h3>
                <button type="button"
                  onClick={() => append({ productId: '', quantityOrdered: 1, unitCost: 0 })}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => {
                  const qty = Number(watch(`items.${idx}.quantityOrdered`)) || 0
                  const cost = Number(watch(`items.${idx}.unitCost`)) || 0
                  return (
                    <div key={field.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 sm:col-span-5">
                          <label className="label text-xs">Product *</label>
                          <select className="input text-sm" {...register(`items.${idx}.productId`, { required: 'Select product' })}>
                            <option value="">— Select —</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.drugName}{p.strength ? ` (${p.strength})` : ''}</option>)}
                          </select>
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="label text-xs">Qty *</label>
                          <input className="input text-sm" type="number" min="1"
                            {...register(`items.${idx}.quantityOrdered`, { required: true, min: 1, valueAsNumber: true })} />
                        </div>
                        <div className="col-span-4 sm:col-span-3">
                          <label className="label text-xs">Unit Cost (KES) *</label>
                          <input className="input text-sm" type="number" min="0" step="0.01"
                            {...register(`items.${idx}.unitCost`, { required: true, min: 0, valueAsNumber: true })} />
                        </div>
                        <div className="col-span-3 sm:col-span-2 flex items-end gap-1">
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 mb-1">Total</p>
                            <p className="text-sm font-semibold text-gray-900">KES {(qty * cost).toLocaleString()}</p>
                          </div>
                          {fields.length > 1 && (
                            <button type="button" onClick={() => remove(idx)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 mb-0.5">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Subtotal */}
              <div className="flex justify-end mt-3">
                <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 text-right">
                  <p className="text-xs text-primary-600 font-medium">Order Total</p>
                  <p className="text-xl font-bold text-primary-700">KES {subtotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" form="purchase-form" className="btn-primary flex-1">Create Purchase Order</button>
        </div>
      </div>
    </div>
  )
}

const statusColor = (s) => {
  const map = { PENDING: 'badge-yellow', RECEIVED: 'badge-green', PARTIAL: 'badge-blue', CANCELLED: 'badge-red' }
  return map[s] || 'badge-gray'
}

export default function Purchases() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['purchases'], queryFn: getPurchases })
  const purchases = data?.data?.data || []

  const createMut = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => { qc.invalidateQueries(['purchases']); toast.success('Purchase order created'); setShowModal(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create purchase order')
  })

  const receiveMut = useMutation({
    mutationFn: receivePurchase,
    onSuccess: () => { qc.invalidateQueries(['purchases', 'products']); toast.success('Stock updated — purchase received') },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to receive purchase')
  })

  const filtered = purchases.filter(p =>
    (p.poNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.invoiceNumber || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalOwed = purchases
    .filter(p => p.status !== 'CANCELLED')
    .reduce((sum, p) => sum + Number(p.balanceDue || 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-500 text-sm">{purchases.length} orders · Outstanding: KES {totalOwed.toLocaleString()}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={17} /> New Order
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by PO number or invoice..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText size={26} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-600">No purchase orders yet</p>
            <p className="text-sm mt-1">Create your first order to track supplier purchases</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['PO #', 'Invoice', 'Date', 'Total', 'Paid', 'Balance', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-600">{p.poNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.invoiceNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.purchaseDate?.slice(0, 10) || '—'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">KES {Number(p.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">KES {Number(p.amountPaid).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {Number(p.balanceDue) > 0
                        ? <span className="text-red-600 font-semibold">KES {Number(p.balanceDue).toLocaleString()}</span>
                        : <span className="text-emerald-600 font-medium">—</span>}
                    </td>
                    <td className="px-4 py-3"><span className={statusColor(p.status)}>{p.status}</span></td>
                    <td className="px-4 py-3">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => { if (confirm('Mark as received and update stock?')) receiveMut.mutate(p.id) }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <PackageCheck size={13} /> Receive
                        </button>
                      )}
                      {p.status === 'RECEIVED' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle size={13} /> Received
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <PurchaseModal
          onClose={() => setShowModal(false)}
          onSave={(d) => createMut.mutate(d)}
        />
      )}
    </div>
  )
}
