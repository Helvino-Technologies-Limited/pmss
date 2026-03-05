import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExpenses, createExpense } from '../../api/expenses'
import toast from 'react-hot-toast'
import { Plus, DollarSign, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

const CATEGORIES = ['Rent','Utilities','Salaries','Equipment','Transport','Marketing','Insurance','Miscellaneous']

function Modal({ onClose, onSave }) {
  const { register, handleSubmit } = useForm()
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900">Record Expense</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
          <div><label className="label">Category *</label>
            <select className="input" {...register('category', { required: true })}>
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label className="label">Description</label>
            <textarea className="input h-16 resize-none" {...register('description')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Amount (KES) *</label>
              <input className="input" type="number" step="0.01" min="0"
                {...register('amount', { required: true })} /></div>
            <div><label className="label">Date *</label>
              <input className="input" type="date" defaultValue={new Date().toISOString().slice(0,10)}
                {...register('expenseDate', { required: true })} /></div>
          </div>
          <div><label className="label">Receipt #</label>
            <input className="input" {...register('receiptNumber')} /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Expenses() {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['expenses'], queryFn: getExpenses })
  const expenses = data?.data?.data || []

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Expense recorded'); setShowModal(false) }
  })

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm">Total: KES {total.toLocaleString('en', { minimumFractionDigits: 2 })}</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
        : !expenses.length ? (
          <div className="text-center py-16 text-gray-400"><DollarSign size={40} className="mx-auto mb-3 opacity-40" /><p>No expenses recorded</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Date', 'Category', 'Description', 'Receipt #', 'Amount'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{format(new Date(e.expenseDate), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3"><span className="badge-blue">{e.category}</span></td>
                  <td className="px-4 py-3 text-gray-700">{e.description || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.receiptNumber || '-'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">KES {Number(e.amount).toLocaleString()}</td>
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
