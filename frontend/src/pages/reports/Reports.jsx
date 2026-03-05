import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../api/dashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6']
const fmt = (n) => `KES ${Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2})}`

export default function Reports() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
  const d = data?.data?.data
  const salesData = d?.salesChartData?.map(s => ({ date: s.date?.slice(5), sales: Number(s.sales) })) || []
  const summaryData = [
    { name: 'Monthly Sales', value: Number(d?.monthlySales || 0) },
    { name: 'Gross Profit', value: Number(d?.grossProfit || 0) },
    { name: 'Expenses', value: Number(d?.monthlyExpenses || 0) },
    { name: 'Net Profit', value: Number(d?.netProfit || 0) },
  ]
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map(({ name, value }) => (
          <div key={name} className="card text-center">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">{name}</p>
            <p className="text-xl font-bold text-gray-900">{fmt(value)}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Sales - Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`KES ${v.toLocaleString()}`, 'Sales']} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Summary</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={summaryData.filter(item => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}>
                {summaryData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{d?.lowStockCount || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase font-medium">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{d?.outOfStockCount || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 uppercase font-medium">Expiring (90 days)</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{d?.expiringCount || 0}</p>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Credit Outstanding</h2>
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div>
            <p className="text-sm text-red-700 font-medium">Total Credit Due from Customers</p>
            <p className="text-2xl font-bold text-red-800 mt-1">{fmt(d?.creditOutstanding)}</p>
          </div>
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">💳</span>
          </div>
        </div>
      </div>
    </div>
  )
}
