import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  FileText, DollarSign, BarChart2, UserCog, LogOut,
  Pill, ClipboardList, Building2, Menu, X, Bell
} from 'lucide-react'
import { useState } from 'react'

const tenantNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/pos', icon: ShoppingCart, label: 'Point of Sale' },
  { to: '/dashboard/sales', icon: ClipboardList, label: 'Sales History' },
  { to: '/dashboard/products', icon: Package, label: 'Inventory' },
  { to: '/dashboard/customers', icon: Users, label: 'Customers' },
  { to: '/dashboard/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/dashboard/purchases', icon: FileText, label: 'Purchases' },
  { to: '/dashboard/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/dashboard/expenses', icon: DollarSign, label: 'Expenses' },
  { to: '/dashboard/reports', icon: BarChart2, label: 'Reports' },
  { to: '/dashboard/staff', icon: UserCog, label: 'Staff' },
]

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/tenants', icon: Building2, label: 'Tenants' },
]

export default function DashboardLayout({ isAdmin }) {
  const { user, logout, isTrial } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const nav = isAdmin ? adminNav : tenantNav

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300`}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <Pill size={20} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">PMSS</p>
              <p className="text-xs text-slate-400 truncate max-w-[130px]">{user?.pharmacyName}</p>
            </div>
          </div>
        </div>

        {/* Trial Banner */}
        {isTrial && (
          <div className="mx-3 mt-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-2.5 text-xs text-yellow-300">
            ⏳ Trial: {user?.trialDaysLeft} day(s) left
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-900/50 hover:text-red-300 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={18} className="text-gray-600" />
          </button>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{user?.fullName}</span>
          </div>
        </header>

        {/* Expired Banner */}
        {user?.subscriptionStatus === 'EXPIRED' && (
          <div className="bg-red-600 text-white text-center py-2.5 text-sm font-medium">
            ⚠️ Your subscription has expired. Contact Helvino Technologies at helvinotech@gmail.com to renew.
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
