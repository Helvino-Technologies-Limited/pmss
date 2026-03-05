import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Pill, Plus, X, CheckCircle, XCircle, Search, Minus, Trash2, Phone } from 'lucide-react'
import api from '../../api/axios'
import { getCustomers } from '../../api/customers'
import { searchProducts } from '../../api/products'
import { createSale } from '../../api/sales'
import ReceiptModal from '../../components/ReceiptModal'

const getPrescriptions = () => api.get('/prescriptions')
const createPrescription = (data) => api.post('/prescriptions', data)
const updateStatus = ({ id, status }) => api.patch(`/prescriptions/${id}/status`, { status })

const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'CREDIT']

function DispenseModal({ prescription, onClose, onSuccess }) {
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountPaid, setAmountPaid] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const searchTimeout = useRef(null)
  const qc = useQueryClient()

  const subtotal = cart.reduce((s, i) => s + i.sellingPrice * i.qty, 0)
  const total = subtotal
  const change = Math.max(0, parseFloat(amountPaid || 0) - total)
  const balanceDue = Math.max(0, total - parseFloat(amountPaid || 0))

  const handleSearch = (val) => {
    setQuery(val)
    clearTimeout(searchTimeout.current)
    if (!val.trim()) { setResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchProducts(val)
        setResults(res.data.data || [])
      } finally { setSearching(false) }
    }, 300)
  }

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) {
        if (ex.qty >= product.quantity) { toast.error('Insufficient stock'); return prev }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      if (product.quantity < 1) { toast.error('Out of stock'); return prev }
      return [...prev, { ...product, qty: 1 }]
    })
    setQuery(''); setResults([])
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const newQty = i.qty + delta
      if (newQty <= 0) return null
      if (newQty > i.quantity) { toast.error('Insufficient stock'); return i }
      return { ...i, qty: newQty }
    }).filter(Boolean))
  }

  const dispenseMut = useMutation({
    mutationFn: async () => {
      if (!cart.length) throw new Error('Add at least one drug to dispense')
      const saleRes = await createSale({
        prescriptionId: prescription.id,
        items: cart.map(i => ({
          productId: i.id,
          quantity: i.qty,
          unitPrice: i.sellingPrice,
          discountPercent: 0,
        })),
        paymentMethod,
        amountPaid: parseFloat(amountPaid || total),
        discountAmount: 0,
      })
      await updateStatus({ id: prescription.id, status: 'DISPENSED' })
      return saleRes.data.data
    },
    onSuccess: (sale) => {
      qc.invalidateQueries(['prescriptions', 'sales', 'products', 'dashboard'])
      toast.success('Prescription dispensed and invoice created')
      onSuccess({ sale, items: cart, customerPhone })
    },
    onError: (e) => toast.error(e.message || e.response?.data?.message || 'Failed to dispense')
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Dispense & Invoice</h2>
            <p className="text-xs text-primary-600 font-mono mt-0.5">{prescription.prescriptionNumber || 'No Rx#'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Prescription info */}
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-sm">
            <p className="font-semibold text-violet-800">{prescription.doctorName || 'Walk-in'}</p>
            <p className="text-violet-600 text-xs mt-0.5">{prescription.notes}</p>
          </div>

          {/* Drug search */}
          <div>
            <label className="label">Add Drugs to Dispense</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" placeholder="Search drug name or barcode..."
                value={query} onChange={e => handleSearch(e.target.value)} />
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 mt-1 max-h-52 overflow-y-auto">
                  {results.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary-50 transition-colors text-left border-b last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.drugName}</p>
                        <p className="text-xs text-gray-500">{p.strength} · Stock: {p.quantity}</p>
                      </div>
                      <p className="font-bold text-primary-600 text-sm">KES {Number(p.sellingPrice).toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.drugName}</p>
                      <p className="text-xs text-gray-500">KES {Number(item.sellingPrice).toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200">
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200">
                        <Plus size={11} />
                      </button>
                    </div>
                    <p className="w-20 text-right font-bold text-sm text-gray-900">
                      KES {(item.sellingPrice * item.qty).toLocaleString()}
                    </p>
                    <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                      className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-primary-50 px-4 py-2.5 flex justify-between items-center border-t border-primary-100">
                <span className="text-sm font-semibold text-primary-700">Total</span>
                <span className="font-bold text-primary-700">KES {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="space-y-4">
            <div>
              <label className="label">Customer Phone (for WhatsApp receipt)</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-8" placeholder="+254 7XX XXX XXX"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      paymentMethod === m
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                    }`}>
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Amount Paid (KES)</label>
              <input className="input font-bold" type="number" step="0.01"
                placeholder={total.toFixed(2)}
                value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
            </div>

            {amountPaid && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-xs">Change</p>
                  <p className="font-bold text-green-700">KES {change.toFixed(2)}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${balanceDue > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-gray-500 text-xs">Balance Due</p>
                  <p className={`font-bold ${balanceDue > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                    KES {balanceDue.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => dispenseMut.mutate()}
            disabled={dispenseMut.isPending || !cart.length}
            className="btn-primary flex-1"
          >
            {dispenseMut.isPending ? 'Processing...' : `Dispense & Invoice — KES ${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function PrescriptionModal({ prefillDrug, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      notes: prefillDrug ? `Drug: ${prefillDrug}` : '',
      prescriptionDate: new Date().toISOString().slice(0, 10),
    }
  })
  const { data: custData } = useQuery({ queryKey: ['customers'], queryFn: getCustomers })
  const customers = custData?.data?.data || []

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900">New Prescription</h2>
            {prefillDrug && <p className="text-xs text-primary-600 mt-0.5">Drug: {prefillDrug}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Patient / Customer</label>
              <select className="input" {...register('customerId')}>
                <option value="">— Walk-in / Unknown —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            </div>
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
              <input className="input" placeholder="Dr. John Smith" {...register('doctorName')} />
            </div>
            <div>
              <label className="label">Doctor Phone</label>
              <input className="input" placeholder="+254 7XX XXX XXX" {...register('doctorPhone')} />
            </div>
            <div className="col-span-2">
              <label className="label">Hospital / Clinic</label>
              <input className="input" placeholder="Nairobi Hospital" {...register('hospitalName')} />
            </div>
            <div className="col-span-2">
              <label className="label">Prescription Notes / Drugs *</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Drug name, dosage, instructions..."
                {...register('notes', { required: 'Required' })} />
              {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const statusBadge = (s) => {
  const map = { PENDING: 'badge-yellow', DISPENSED: 'badge-green', CANCELLED: 'badge-red' }
  return <span className={map[s] || 'badge-gray'}>{s}</span>
}

export default function Prescriptions() {
  const [showModal, setShowModal] = useState(false)
  const [dispensing, setDispensing] = useState(null) // prescription to dispense
  const [receipt, setReceipt] = useState(null)       // { sale, items, customerPhone }
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['prescriptions'], queryFn: getPrescriptions })
  const prescriptions = data?.data?.data || []

  const createMut = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => { qc.invalidateQueries(['prescriptions']); toast.success('Prescription saved'); setShowModal(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save prescription')
  })

  const cancelMut = useMutation({
    mutationFn: (id) => updateStatus({ id, status: 'CANCELLED' }),
    onSuccess: () => { qc.invalidateQueries(['prescriptions']); toast.success('Prescription cancelled') },
    onError: () => toast.error('Failed to cancel prescription')
  })

  const filtered = prescriptions.filter(p =>
    (p.doctorName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.hospitalName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.prescriptionNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.notes || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 text-sm">{prescriptions.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={17} /> New Prescription
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by doctor, hospital, Rx number or drug..."
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
              <Pill size={26} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-600">No prescriptions found</p>
            <p className="text-sm mt-1">Create one from here or from the Inventory page</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Rx #', 'Date', 'Doctor', 'Hospital', 'Notes / Drug', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-600">{p.prescriptionNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.prescriptionDate || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.doctorName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.hospitalName || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{p.notes || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      {p.status === 'PENDING' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDispensing(p)}
                            className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <CheckCircle size={12} /> Dispense
                          </button>
                          <button
                            onClick={() => { if (confirm('Cancel this prescription?')) cancelMut.mutate(p.id) }}
                            className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </div>
                      )}
                      {p.status === 'DISPENSED' && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle size={12} /> Dispensed
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
        <PrescriptionModal
          onClose={() => setShowModal(false)}
          onSave={(d) => createMut.mutate(d)}
        />
      )}

      {dispensing && (
        <DispenseModal
          prescription={dispensing}
          onClose={() => setDispensing(null)}
          onSuccess={(data) => {
            setDispensing(null)
            setReceipt(data)
          }}
        />
      )}

      {receipt && (
        <ReceiptModal
          sale={receipt.sale}
          items={receipt.items}
          customerPhone={receipt.customerPhone}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  )
}
