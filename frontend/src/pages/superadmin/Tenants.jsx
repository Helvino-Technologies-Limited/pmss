import { useQuery } from '@tanstack/react-query'
import { getAllTenants } from '../../api/tenants'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, Building2 } from 'lucide-react'

export default function Tenants() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const { data, isLoading } = useQuery({ queryKey: ['admin-tenants'], queryFn: getAllTenants })
  const tenants = data?.data?.data || []

  const filtered = tenants.filter(t => {
    const matchSearch = t.pharmacyName.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search)
    const matchFilter = filter === 'ALL' || t.subscriptionStatus === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenant Pharmacies</h1>
        <p className="text-gray-500 text-sm">{tenants.length} registered pharmacies</p>
      </div>
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search pharmacy, owner, phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['ALL','TRIAL','ACTIVE','EXPIRED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-40" />
            <p>No pharmacies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Pharmacy Name','Owner','Phone','Email','Plan','Status','Registered','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.pharmacyName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.ownerName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phone}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{t.email}</td>
                    <td className="px-4 py-3"><span className="badge-blue">{t.planType}</span></td>
                    <td className="px-4 py-3">
                      {t.subscriptionStatus === 'ACTIVE' && <span className="badge-green">Active</span>}
                      {t.subscriptionStatus === 'TRIAL' && <span className="badge-yellow">Trial</span>}
                      {t.subscriptionStatus === 'EXPIRED' && <span className="badge-red">Expired</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/tenants/${t.id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium text-xs hover:underline">
                        Manage
                      </Link>
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
