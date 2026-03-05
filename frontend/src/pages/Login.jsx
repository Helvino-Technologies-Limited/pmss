import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Pill, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your PMSS account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="you@pharmacy.com"
              {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                {...register('password', { required: 'Password is required' })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 text-base">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">Start free trial</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by <a href="https://helvino.org" className="hover:underline">Helvino Technologies</a>
        </p>
      </div>
    </div>
  )
}
