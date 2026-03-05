import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { register as registerApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Pill, CheckCircle, Eye, EyeOff } from 'lucide-react'

const perks = [
  'Full system access for 5 days',
  'No payment required upfront',
  'All modules included',
]

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await registerApi(data)
      authLogin(res.data.data)
      toast.success('Welcome! Your 5-day trial has started.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center shadow-md">
          <Pill size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary-600 leading-tight">PMSS</h1>
          <p className="text-xs text-gray-500">Pharmacy Management System</p>
        </div>
      </div>

      {/* Trial perks strip */}
      <div className="w-full max-w-xl bg-primary-50 border border-primary-100 rounded-2xl px-5 py-3 mb-4 flex flex-wrap gap-3">
        {perks.map(p => (
          <span key={p} className="flex items-center gap-1.5 text-xs font-medium text-primary-700">
            <CheckCircle size={13} className="text-primary-500 flex-shrink-0" />
            {p}
          </span>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Create your pharmacy account</h2>
        <p className="text-sm text-gray-500 mb-5">Start your free 5-day trial — no credit card needed</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Pharmacy Name *</label>
              <input
                className="input"
                placeholder="e.g. Sunrise Pharmacy"
                {...register('pharmacyName', { required: 'Required' })}
              />
              {errors.pharmacyName && <p className="text-red-500 text-xs mt-1">{errors.pharmacyName.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Owner / Manager Name *</label>
              <input
                className="input"
                placeholder="e.g. John Doe"
                {...register('ownerName', { required: 'Required' })}
              />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <input
                className="input"
                placeholder="+254 7XX XXX XXX"
                {...register('phone', { required: 'Required' })}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                className="input"
                type="email"
                placeholder="pharmacy@email.com"
                {...register('email', { required: 'Required' })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">KRA PIN</label>
              <input className="input" placeholder="A012345678Z" {...register('kraPin')} />
            </div>

            <div>
              <label className="label">License Number</label>
              <input className="input" placeholder="PPB/LIC/XXXX" {...register('licenseNumber')} />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Physical Address</label>
              <input className="input" placeholder="Tom Mboya St, Nairobi" {...register('physicalAddress')} />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account & Start Trial'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Powered by{' '}
        <a href="https://helvino.org" className="hover:underline text-gray-500">Helvino Technologies</a>
      </p>
    </div>
  )
}
