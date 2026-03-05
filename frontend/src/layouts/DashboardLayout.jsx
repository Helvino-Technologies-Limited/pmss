import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  FileText, DollarSign, BarChart2, UserCog, LogOut,
  Pill, ClipboardList, Building2, Menu, X, Bell, ChevronRight,
  Settings, KeyRound, Eye, EyeOff
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/axios'

const baseTenantNav = [
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
  { to: '/dashboard/staff', icon: UserCog, label: 'Staff', adminOnly: true },
]

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/tenants', icon: Building2, label: 'Tenants' },
]

// Notification data (static for now — extend with real API later)
const NOTIFICATIONS = [
  { id: 1, text: 'Low stock alert: 3 products below reorder level', time: '2m ago', unread: true },
  { id: 2, text: 'New sale recorded: KES 4,500', time: '15m ago', unread: true },
  { id: 3, text: 'Subscription trial: 4 days remaining', time: '1h ago', unread: false },
]

function NotificationPanel({ onClose }) {
  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {NOTIFICATIONS.map(n => (
          <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.unread ? 'bg-primary-50/50' : ''}`}>
            <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-100">
        <button className="text-xs text-primary-600 font-semibold hover:underline">Mark all as read</button>
      </div>
    </div>
  )
}

function ProfileModal({ user, onClose }) {
  const { login } = useAuth()
  const [tab, setTab] = useState('profile')
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await api.post('/users/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed successfully')
      reset()
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Account Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[['profile', Settings, 'Profile'], ['password', KeyRound, 'Change Password']].map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                tab === key ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.fullName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="badge-blue text-xs mt-1">{user?.role?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Pharmacy</span>
                  <span className="font-medium text-gray-900">{user?.pharmacyName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Subscription</span>
                  <span className={`font-medium ${user?.subscriptionStatus === 'ACTIVE' ? 'text-green-600' : user?.subscriptionStatus === 'TRIAL' ? 'text-amber-600' : 'text-red-600'}`}>
                    {user?.subscriptionStatus}
                    {user?.subscriptionStatus === 'TRIAL' && ` (${user?.trialDaysLeft}d left)`}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="btn-secondary w-full mt-2">Close</button>
            </div>
          )}

          {tab === 'password' && (
            <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input className="input pr-11" type={showPass ? 'text' : 'password'} placeholder="Current password"
                    {...register('currentPassword', { required: 'Required' })} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
              </div>
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" placeholder="Min 8 characters"
                  {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input className="input" type="password" placeholder="Repeat new password"
                  {...register('confirmPassword', { required: 'Required' })} />
              </div>
              <button type="submit" className="btn-primary w-full">Update Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ isAdmin }) {
  const { user, logout, isTrial, isTenantAdmin } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const nav = isAdmin
    ? adminNav
    : baseTenantNav.filter(item => !item.adminOnly || isTenantAdmin)

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
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
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

        {/* User / Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors mb-1"
          >
            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.replace(/_/g, ' ').toLowerCase()}</p>
            </div>
            <Settings size={15} className="text-gray-400" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg">
              <LogOut size={17} />
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-3 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Pill size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">PMSS</span>
          </div>

          <div className="flex-1" />

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
          </div>

          {/* Profile button */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2.5 pl-2 border-l border-gray-100 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-sm font-semibold text-gray-800 hidden sm:block">{user?.fullName?.split(' ')[0]}</span>
          </button>
        </header>

        {/* Expired Banner */}
        {user?.subscriptionStatus === 'EXPIRED' && (
          <div className="bg-red-500 text-white text-center py-2.5 text-xs sm:text-sm font-medium px-4">
            Your subscription has expired. Contact us at helvinotech@gmail.com to renew.
          </div>
        )}

        {/* Close notifs on outside click */}
        {showNotifs && <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
    </div>
  )
}
