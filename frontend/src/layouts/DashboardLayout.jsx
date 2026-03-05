import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  FileText, DollarSign, BarChart2, UserCog, LogOut,
  Pill, ClipboardList, Building2, Menu, X, Bell, ChevronRight
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
        flex flex-col sidebar-transition
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <Pill size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">PMSS</p>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.pharmacyName || 'Helvino Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Trial Banner */}
        {isTrial && (
          <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700">Trial Period</p>
            <p className="text-xs text-amber-600 mt-0.5">{user?.trialDaysLeft} day(s) remaining</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    isActive ? 'bg-primary-100' : 'group-hover:bg-gray-200'
                  }`}>
                    <Icon size={17} />
                  </span>
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-primary-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors mb-1">
            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100">
              <LogOut size={17} />
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-3 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Pill size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">PMSS</span>
          </div>

          <div className="flex-1" />

          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-sm font-semibold text-gray-800 hidden sm:block">{user?.fullName?.split(' ')[0]}</span>
          </div>
        </header>

        {/* Expired Banner */}
        {user?.subscriptionStatus === 'EXPIRED' && (
          <div className="bg-red-500 text-white text-center py-2.5 text-xs sm:text-sm font-medium px-4">
            Your subscription has expired. Contact us at helvinotech@gmail.com to renew.
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
