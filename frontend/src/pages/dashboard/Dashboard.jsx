import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../api/dashboard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, AlertTriangle, CreditCard, ShoppingBag, DollarSign, Activity, Clock } from 'lucide-react'
import { format } from 'date-fns'

const fmt = (n) => `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

function StatCard({ title, value, icon: Icon, gradient, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function AlertCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white/40`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs font-medium text-white/80">{title}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const d = data?.data?.data

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={fmt(d?.todaySales)}
          icon={ShoppingBag}
          gradient="bg-gradient-to-br from-primary-500 to-primary-600"
          sub={`${d?.todayTransactions || 0} transactions`}
        />
        <StatCard
          title="Monthly Sales"
          value={fmt(d?.monthlySales)}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
        <StatCard
          title="Gross Profit"
          value={fmt(d?.grossProfit)}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-violet-400 to-violet-600"
        />
        <StatCard
          title="Net Profit"
          value={fmt(d?.netProfit)}
          icon={Activity}
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <AlertCard title="Low Stock" value={d?.lowStockCount ?? 0} icon={Package} bg="bg-gradient-to-br from-amber-400 to-amber-500" />
        <AlertCard title="Out of Stock" value={d?.outOfStockCount ?? 0} icon={AlertTriangle} bg="bg-gradient-to-br from-red-400 to-red-500" />
        <AlertCard title="Expiring (90d)" value={d?.expiringCount ?? 0} icon={Clock} bg="bg-gradient-to-br from-pink-400 to-pink-500" />
        <AlertCard title="Credit Due" value={fmt(d?.creditOutstanding)} icon={CreditCard} bg="bg-gradient-to-br from-slate-500 to-slate-600" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Sales Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">Last 7 days performance</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={d?.salesChartData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1877F2" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(v) => [`KES ${Number(v).toLocaleString()}`, 'Sales']}
              labelStyle={{ color: '#374151', fontWeight: 600, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="sales" stroke="#1877F2" strokeWidth={2.5} fill="url(#salesGrad)" dot={false} activeDot={{ r: 5, fill: '#1877F2' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Tables */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Expiring */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Expiring Soon</h2>
              <p className="text-xs text-gray-400">Products expiring within 90 days</p>
            </div>
          </div>
          {!d?.expiringProducts?.length ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock size={18} className="text-green-500" />
              </div>
              <p className="text-sm text-gray-500">No expiring products</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-50">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold">Expiry</th>
                    <th className="pb-2 font-semibold text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.expiringProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800 pr-2">{p.name}</td>
                      <td className="py-2.5"><span className="badge-yellow">{p.expiryDate}</span></td>
                      <td className="py-2.5 text-right font-medium">{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Low Stock Alert</h2>
              <p className="text-xs text-gray-400">Items below reorder level</p>
            </div>
          </div>
          {!d?.lowStockProducts?.length ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package size={18} className="text-green-500" />
              </div>
              <p className="text-sm text-gray-500">All stock levels healthy</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-50">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-center">Qty</th>
                    <th className="pb-2 font-semibold text-right">Reorder At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.lowStockProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800 pr-2">{p.name}</td>
                      <td className="py-2.5 text-center">
                        <span className="badge-red">{p.quantity}</span>
                      </td>
                      <td className="py-2.5 text-right text-gray-400">{p.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
