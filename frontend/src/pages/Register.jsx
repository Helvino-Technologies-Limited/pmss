import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { register as registerApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Pill, CheckCircle } from 'lucide-react'

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await registerApi(data)
      authLogin(res.data.data)
      toast.success('Registration successful! Your 5-day trial has started.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register Your Pharmacy</h1>
          <p className="text-gray-500 text-sm mt-1">Start your 5-day free trial — no payment required</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle size={16} className="flex-shrink-0" />
          Full access for 5 days. KES 20,000 setup + KES 15,000/year to continue.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Pharmacy Name *</label>
              <input className="input" placeholder="ABC Pharmacy"
                {...register('pharmacyName', { required: 'Required' })} />
              {errors.pharmacyName && <p className="text-red-500 text-xs mt-1">{errors.pharmacyName.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="label">Owner / Manager Name *</label>
              <input className="input" placeholder="John Doe"
                {...register('ownerName', { required: 'Required' })} />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input className="input" placeholder="+254 7XX XXX XXX"
                {...register('phone', { required: 'Required' })} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="pharmacy@email.com"
                {...register('email', { required: 'Required' })} />
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
            <div className="col-span-2">
              <label className="label">Physical Address</label>
              <input className="input" placeholder="Tom Mboya St, Nairobi" {...register('physicalAddress')} />
            </div>
            <div className="col-span-2">
              <label className="label">Password *</label>
              <input className="input" type="password" placeholder="Minimum 8 characters"
                {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? 'Creating account...' : 'Create Account & Start Trial'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already registered? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
