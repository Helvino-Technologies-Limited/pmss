import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '../../api/products'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, Edit, Package, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export default function Products() {
  const [search, setSearch] = useState('')
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
    p.genericName?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  )

  const getStockBadge = (p) => {
    if (p.quantity === 0) return <span className="badge-red">Out of Stock</span>
    if (p.quantity <= p.reorderLevel) return <span className="badge-yellow">Low Stock</span>
    return <span className="badge-green">In Stock</span>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <Link to="/dashboard/products/add" className="btn-primary flex items-center gap-2 self-start">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by drug name, generic name or barcode..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Drug Name', 'Generic', 'Barcode', 'Type', 'Cost', 'Price', 'Qty', 'Expiry', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.drugName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.genericName || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.barcode || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={p.productType === 'CONTROLLED' ? 'badge-red' : p.productType === 'PRESCRIPTION' ? 'badge-blue' : 'badge-gray'}>
                        {p.productType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">KES {Number(p.costPrice).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">KES {Number(p.sellingPrice).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${p.quantity === 0 ? 'text-red-600' : p.quantity <= p.reorderLevel ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.expiryDate ? (
                        <span className={new Date(p.expiryDate) < new Date(Date.now() + 90*86400000) ? 'text-orange-600 font-medium' : ''}>
                          {format(new Date(p.expiryDate), 'MMM yyyy')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">{getStockBadge(p)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/dashboard/products/add?edit=${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => {
                          if (confirm(`Delete ${p.drugName}?`)) deleteMut.mutate(p.id)
                        }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
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
    </div>
  )
}
