import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getTenant, activateTenant, toggleTenant } from '../../api/tenants'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Building2 } from 'lucide-react'

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [paymentMethod, setPaymentMethod] = useState('MPESA')
  const [reference, setReference] = useState('')
  const [paymentType, setPaymentType] = useState('SETUP')

  const { data, isLoading } = useQuery({ queryKey: ['tenant', id], queryFn: () => getTenant(id) })
  const tenant = data?.data?.data

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
    onSuccess: () => {
      qc.invalidateQueries(['tenant', id])
      qc.invalidateQueries(['admin-tenants'])
      toast.success('Tenant status updated')
    },
    onError: () => toast.error('Failed to update status')
  })

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!tenant) return (
    <div className="text-center py-20 text-gray-500">Tenant not found</div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.pharmacyName}</h1>
          <p className="text-gray-500 text-sm">Tenant Management</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{tenant.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-900">{tenant.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">KRA PIN</span>
              <span className="font-medium text-gray-900">{tenant.kraPin || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">License</span>
              <span className="font-medium text-gray-900">{tenant.licenseNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-gray-900 text-right max-w-48">{tenant.physicalAddress || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registered</span>
              <span className="font-medium text-gray-900">
                {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-3 border-b border-gray-100">Subscription Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span>
                {tenant.subscriptionStatus === 'ACTIVE' && <span className="badge-green">Active</span>}
                {tenant.subscriptionStatus === 'TRIAL' && <span className="badge-yellow">Trial</span>}
                {tenant.subscriptionStatus === 'EXPIRED' && <span className="badge-red">Expired</span>}
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
              <span>
                {tenant.isActive ? <span className="badge-green">Yes</span> : <span className="badge-red">No</span>}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => toggleMut.mutate(!tenant.isActive)}
              disabled={toggleMut.isPending}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tenant.isActive
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}>
              {tenant.isActive ? <><XCircle size={16} /> Deactivate</> : <><CheckCircle size={16} /> Activate</>}
            </button>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 pb-3 border-b border-gray-100">Record Subscription Payment</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Payment Type</label>
            <select className="input" value={paymentType} onChange={e => setPaymentType(e.target.value)}>
              <option value="SETUP">Setup Fee - KES 20,000</option>
              <option value="ANNUAL_RENEWAL">Annual Renewal - KES 15,000</option>
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
            className="btn-primary flex items-center gap-2 px-6">
            <RefreshCw size={16} />
            {activateMut.isPending ? 'Processing...' : 'Confirm Payment & Activate'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Recording a payment will set subscription status to ACTIVE and extend it by 1 year from today.
        </p>
      </div>
    </div>
  )
}
