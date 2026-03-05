import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../api/dashboard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, AlertTriangle, CreditCard, ShoppingBag, DollarSign, Activity, Clock } from 'lucide-react'
import { format } from 'date-fns'

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}

const fmt = (n) => `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const d = data?.data?.data

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={fmt(d?.todaySales)} icon={ShoppingBag} color="bg-primary-500" sub={`${d?.todayTransactions} transactions`} />
        <StatCard title="Monthly Sales" value={fmt(d?.monthlySales)} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Gross Profit" value={fmt(d?.grossProfit)} icon={DollarSign} color="bg-violet-500" />
        <StatCard title="Net Profit" value={fmt(d?.netProfit)} icon={Activity} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Low Stock Items" value={d?.lowStockCount ?? 0} icon={Package} color="bg-yellow-500" />
        <StatCard title="Out of Stock" value={d?.outOfStockCount ?? 0} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="Expiring (90d)" value={d?.expiringCount ?? 0} icon={Clock} color="bg-pink-500" />
        <StatCard title="Credit Outstanding" value={fmt(d?.creditOutstanding)} icon={CreditCard} color="bg-slate-500" />
      </div>

      {/* Sales Chart */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Sales — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d?.salesChartData || []}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`KES ${Number(v).toLocaleString()}`, 'Sales']} />
            <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" /> Expiring Soon
          </h2>
          {!d?.expiringProducts?.length ? (
            <p className="text-gray-400 text-sm text-center py-4">No expiring products</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Expiry</th>
                <th className="pb-2 font-medium text-right">Qty</th>
              </tr></thead>
              <tbody>
                {d.expiringProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2 text-orange-600">{p.expiryDate}</td>
                    <td className="py-2 text-right">{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-500" /> Low Stock Alert
          </h2>
          {!d?.lowStockProducts?.length ? (
            <p className="text-gray-400 text-sm text-center py-4">All stock levels are healthy</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium text-center">Qty</th>
                <th className="pb-2 font-medium text-right">Reorder At</th>
              </tr></thead>
              <tbody>
                {d.lowStockProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2 text-center">
                      <span className="badge-red">{p.quantity}</span>
                    </td>
                    <td className="py-2 text-right text-gray-500">{p.reorderLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
