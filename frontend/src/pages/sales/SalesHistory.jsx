import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSales } from '../../api/sales'
import { format } from 'date-fns'
import { ClipboardList, Receipt } from 'lucide-react'
import ReceiptModal from '../../components/ReceiptModal'

const paymentBadge = (m) => {
  const map = { CASH: 'badge-green', CARD: 'badge-blue', MOBILE_MONEY: 'badge-blue', CREDIT: 'badge-red', INSURANCE: 'badge-yellow' }
  return <span className={map[m] || 'badge-gray'}>{m?.replace('_', ' ')}</span>
}

const statusBadge = (s) => {
  const map = { PAID: 'badge-green', PARTIAL: 'badge-yellow', CREDIT: 'badge-red', REFUNDED: 'badge-gray' }
  return <span className={map[s] || 'badge-gray'}>{s}</span>
}

export default function SalesHistory() {
  const { data, isLoading } = useQuery({ queryKey: ['sales'], queryFn: getSales })
  const sales = data?.data?.data || []
  const [receipt, setReceipt] = useState(null)

  const total = sales.filter(s => !s.isVoid).reduce((sum, s) => sum + Number(s.totalAmount), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-500 text-sm">{sales.length} transactions · Total: KES {total.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : !sales.length ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p>No sales recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Invoice #', 'Date', 'Total', 'Paid', 'Balance', 'Method', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${s.isVoid ? 'opacity-50 line-through' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary-600">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{s.saleDate ? format(new Date(s.saleDate), 'dd MMM yyyy HH:mm') : '-'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">KES {Number(s.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">KES {Number(s.amountPaid).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {Number(s.balanceDue) > 0 ? (
                        <span className="text-red-600 font-medium">KES {Number(s.balanceDue).toLocaleString()}</span>
                      ) : <span className="text-green-600">—</span>}
                    </td>
                    <td className="px-4 py-3">{paymentBadge(s.paymentMethod)}</td>
                    <td className="px-4 py-3">{s.isVoid ? <span className="badge-gray">VOID</span> : statusBadge(s.paymentStatus)}</td>
                    <td className="px-4 py-3">
                      {!s.isVoid && (
                        <button
                          onClick={() => setReceipt(s)}
                          className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Receipt size={12} /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {receipt && (
        <ReceiptModal
          sale={receipt}
          items={[]}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  )
}
