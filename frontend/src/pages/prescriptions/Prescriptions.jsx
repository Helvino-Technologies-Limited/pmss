import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Pill, Plus, X, CheckCircle, XCircle, Search } from 'lucide-react'
import api from '../../api/axios'
import { getCustomers } from '../../api/customers'

const getPrescriptions = () => api.get('/prescriptions')
const createPrescription = (data) => api.post('/prescriptions', data)
const updateStatus = ({ id, status }) => api.patch(`/prescriptions/${id}/status`, { status })

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
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['prescriptions'], queryFn: getPrescriptions })
  const prescriptions = data?.data?.data || []

  const createMut = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => { qc.invalidateQueries(['prescriptions']); toast.success('Prescription saved'); setShowModal(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save prescription')
  })

  const statusMut = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => { qc.invalidateQueries(['prescriptions']); toast.success('Status updated') },
    onError: () => toast.error('Failed to update status')
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
                            onClick={() => statusMut.mutate({ id: p.id, status: 'DISPENSED' })}
                            className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <CheckCircle size={12} /> Dispense
                          </button>
                          <button
                            onClick={() => statusMut.mutate({ id: p.id, status: 'CANCELLED' })}
                            className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </div>
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
    </div>
  )
}
