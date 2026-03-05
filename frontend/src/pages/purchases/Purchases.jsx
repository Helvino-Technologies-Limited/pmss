import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import api from '../../api/axios'

const getPurchases = () => api.get('/purchases')

export default function Purchases() {
  const { data, isLoading } = useQuery({ queryKey: ['purchases'], queryFn: getPurchases })
  const purchases = data?.data?.data || []

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
        <p className="text-gray-500 text-sm">{purchases.length} purchase orders</p></div>
      <div className="card p-0 overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
        : !purchases.length ? (
          <div className="text-center py-16 text-gray-400"><FileText size={40} className="mx-auto mb-3 opacity-40" /><p>No purchase orders yet</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['PO #', 'Invoice', 'Date', 'Total', 'Paid', 'Balance', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.poNumber || '-'}</td>
                  <td className="px-4 py-3">{p.invoiceNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.purchaseDate?.slice(0,10) || '-'}</td>
                  <td className="px-4 py-3 font-bold">KES {Number(p.totalAmount).toLocaleString()}</td>
                  <td className="px-4 py-3">KES {Number(p.amountPaid).toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600">KES {Number(p.balanceDue).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="badge-gray">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
