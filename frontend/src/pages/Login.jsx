import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Pill } from 'lucide-react'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login: authLogin, user } = useAuth()
  const navigate = useNavigate()

  if (user) navigate(user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await login(data)
      authLogin(res.data.data)
      toast.success(`Welcome back, ${res.data.data.fullName}!`)
      navigate(res.data.data.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-md">
          <Pill size={26} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary-600 leading-tight">PMSS</h1>
          <p className="text-xs text-gray-500">Pharmacy Management System</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your pharmacy credentials below</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              className="input"
              type="email"
              placeholder="you@pharmacy.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password</label>
            </div>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Start free trial
            </Link>
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
