import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getTenant, activateTenant, toggleTenant, extendTenant, impersonateTenant, getTenantUsers, resetUserPassword } from '../../api/tenants'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Building2, LogIn, CalendarPlus, X, Users, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function ExtendModal({ tenant, onClose, onExtended }) {
  const [months, setMonths] = useState(12)
  const qc = useQueryClient()

  const mut = useMutation({
    mutationFn: () => extendTenant(tenant.id, months),
    onSuccess: () => {
      qc.invalidateQueries(['tenant', tenant.id])
      qc.invalidateQueries(['admin-tenants'])
      toast.success(`Subscription extended by ${months} month${months > 1 ? 's' : ''}`)
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to extend subscription')
  })

  const currentEnd = tenant.subscriptionEndDate
    ? new Date(tenant.subscriptionEndDate)
    : null
  const newEnd = new Date(
    currentEnd && currentEnd > new Date() ? currentEnd : new Date()
  )
  newEnd.setMonth(newEnd.getMonth() + months)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Extend Subscription</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
            <p className="font-semibold text-blue-800">{tenant.pharmacyName}</p>
            <p className="text-blue-600 text-xs mt-0.5">
              Current end: {currentEnd ? currentEnd.toLocaleDateString() : 'Not set'}
            </p>
          </div>
          <div>
            <label className="label">Extend by</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map(m => (
                <button key={m} onClick={() => setMonths(m)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    months === m
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                  }`}>
                  {m === 12 ? '1 year' : `${m} mo`}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-center">
            <p className="text-green-600 text-xs">New expiry date</p>
            <p className="font-bold text-green-800 text-base mt-0.5">{newEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending} className="btn-primary flex-1">
            {mut.isPending ? 'Extending...' : 'Confirm Extension'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordModal({ tenantId, user, onClose }) {
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const qc = useQueryClient()

  const mut = useMutation({
    mutationFn: () => resetUserPassword(tenantId, user.id, password),
    onSuccess: () => {
      toast.success(`Password reset for ${user.email}`)
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to reset password')
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Reset Password</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
            <p className="font-semibold text-blue-800">{user.firstName} {user.lastName}</p>
            <p className="text-blue-600 text-xs mt-0.5">{user.email} · {user.role}</p>
          </div>
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || password.length < 6}
            className="btn-primary flex-1"
          >
            {mut.isPending ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { login } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('MPESA')
  const [reference, setReference] = useState('')
  const [paymentType, setPaymentType] = useState('SETUP')
  const [showExtend, setShowExtend] = useState(false)
  const [resetUser, setResetUser] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['tenant', id], queryFn: () => getTenant(id) })
  const tenant = data?.data?.data

  const { data: usersData } = useQuery({
    queryKey: ['tenant-users', id],
    queryFn: () => getTenantUsers(id),
    enabled: !!id
  })
  const tenantUsers = usersData?.data?.data || []

  const activateMut = useMutation({
    mutationFn: () => activateTenant(id, { paymentMethod, reference, paymentType }),
    onSuccess: () => {
      qc.invalidateQueries(['tenant', id])
      qc.invalidateQueries(['admin-tenants'])
      toast.success('Subscription activated successfully')
      setReference('')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to activate')
  })

  const toggleMut = useMutation({
    mutationFn: (active) => toggleTenant(id, active),
    onSuccess: (_, active) => {
      qc.invalidateQueries(['tenant', id])
      qc.invalidateQueries(['admin-tenants'])
      toast.success(active ? 'Tenant activated' : 'Tenant deactivated')
    },
    onError: () => toast.error('Failed to update status')
  })

  const impersonateMut = useMutation({
    mutationFn: () => impersonateTenant(id),
    onSuccess: (res) => {
      login(res.data.data)
      toast.success(`Now viewing as ${res.data.data.pharmacyName} admin`)
      navigate('/dashboard')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to impersonate tenant')
  })

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!tenant) return (
    <div className="text-center py-20 text-gray-500">Tenant not found</div>
  )

  const statusColor = {
    ACTIVE: 'badge-green', TRIAL: 'badge-yellow', EXPIRED: 'badge-red'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{tenant.pharmacyName}</h1>
          <p className="text-gray-500 text-sm">Tenant Management</p>
        </div>
        <button
          onClick={() => impersonateMut.mutate()}
          disabled={impersonateMut.isPending}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <LogIn size={16} />
          {impersonateMut.isPending ? 'Logging in...' : 'Login as Admin'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tenant Info */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{tenant.pharmacyName}</h2>
              <p className="text-sm text-gray-500">{tenant.ownerName}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Email', tenant.email],
              ['Phone', tenant.phone],
              ['KRA PIN', tenant.kraPin || '-'],
              ['License', tenant.licenseNumber || '-'],
              ['Address', tenant.physicalAddress || '-'],
              ['Registered', tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900 text-right max-w-56">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-3 border-b border-gray-100">Subscription</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className={statusColor[tenant.subscriptionStatus] || 'badge-gray'}>
                {tenant.subscriptionStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium text-gray-900">{tenant.planType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trial Ends</span>
              <span className="font-medium text-gray-900">
                {tenant.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subscription Ends</span>
              <span className="font-medium text-gray-900">
                {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Account Active</span>
              {tenant.isActive ? <span className="badge-green">Yes</span> : <span className="badge-red">No</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setShowExtend(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <CalendarPlus size={15} /> Extend
            </button>
            <button
              onClick={() => toggleMut.mutate(!tenant.isActive)}
              disabled={toggleMut.isPending}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                tenant.isActive
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
              }`}
            >
              {tenant.isActive
                ? <><XCircle size={15} /> Deactivate</>
                : <><CheckCircle size={15} /> Activate</>}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Recording */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 pb-3 border-b border-gray-100">Record Subscription Payment</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Payment Type</label>
            <select className="input" value={paymentType} onChange={e => setPaymentType(e.target.value)}>
              <option value="SETUP">Setup Fee — KES 20,000</option>
              <option value="ANNUAL_RENEWAL">Annual Renewal — KES 15,000</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="MPESA">M-Pesa</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <div>
            <label className="label">Transaction Reference</label>
            <input className="input" placeholder="e.g. QHG7X9K2L1" value={reference}
              onChange={e => setReference(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => activateMut.mutate()}
            disabled={activateMut.isPending || !reference.trim()}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <RefreshCw size={16} />
            {activateMut.isPending ? 'Processing...' : 'Confirm Payment & Activate'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Recording a payment sets status to ACTIVE and extends subscription by 1 year from today.
        </p>
      </div>

      {/* Users */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Users size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900">Users</h2>
        </div>
        {tenantUsers.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No users found for this tenant.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {tenantUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-gray-500">{u.email} · {u.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  {u.isActive
                    ? <span className="badge-green text-xs">Active</span>
                    : <span className="badge-red text-xs">Disabled</span>}
                  <button
                    onClick={() => setResetUser(u)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors"
                  >
                    <KeyRound size={13} /> Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showExtend && (
        <ExtendModal
          tenant={tenant}
          onClose={() => setShowExtend(false)}
        />
      )}

      {resetUser && (
        <ResetPasswordModal
          tenantId={id}
          user={resetUser}
          onClose={() => setResetUser(null)}
        />
      )}
    </div>
  )
}
