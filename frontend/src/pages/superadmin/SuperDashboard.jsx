import { useQuery } from '@tanstack/react-query'
import { getAllTenants } from '../../api/tenants'
import { Building2, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SuperDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-tenants'], queryFn: getAllTenants })
  const tenants = data?.data?.data || []

  const active = tenants.filter(t => t.subscriptionStatus === 'ACTIVE').length
  const trial = tenants.filter(t => t.subscriptionStatus === 'TRIAL').length
  const expired = tenants.filter(t => t.subscriptionStatus === 'EXPIRED').length
  const totalRevenue = active * 15000

  const stats = [
    { label: 'Total Pharmacies', value: tenants.length, icon: Building2, color: 'bg-primary-500' },
    { label: 'Active Subscriptions', value: active, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'On Trial', value: trial, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Expired', value: expired, icon: XCircle, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Helvino Technologies — Platform Overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-200 font-medium text-sm">Estimated Annual Recurring Revenue</p>
            <p className="text-4xl font-bold mt-1">KES {totalRevenue.toLocaleString()}</p>
            <p className="text-primary-300 text-sm mt-1">{active} active x KES 15,000/year</p>
          </div>
          <DollarSign size={48} className="text-primary-300 opacity-60" />
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Pharmacies</h2>
          <Link to="/admin/tenants" className="text-primary-600 text-sm font-medium hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Pharmacy','Owner','Phone','Plan','Status','Trial End'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.slice(0,10).map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link to={`/admin/tenants/${t.id}`} className="hover:text-primary-600">{t.pharmacyName}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.ownerName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phone}</td>
                    <td className="px-4 py-3"><span className="badge-blue">{t.planType}</span></td>
                    <td className="px-4 py-3">
                      {t.subscriptionStatus === 'ACTIVE' && <span className="badge-green">Active</span>}
                      {t.subscriptionStatus === 'TRIAL' && <span className="badge-yellow">Trial</span>}
                      {t.subscriptionStatus === 'EXPIRED' && <span className="badge-red">Expired</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {t.trialEndDate ? new Date(t.trialEndDate).toLocaleDateString() : '-'}
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
