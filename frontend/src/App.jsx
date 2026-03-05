import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Products from './pages/inventory/Products'
import AddProduct from './pages/inventory/AddProduct'
import POS from './pages/sales/POS'
import SalesHistory from './pages/sales/SalesHistory'
import Customers from './pages/customers/Customers'
import Suppliers from './pages/suppliers/Suppliers'
import Purchases from './pages/purchases/Purchases'
import Prescriptions from './pages/prescriptions/Prescriptions'
import Expenses from './pages/expenses/Expenses'
import Reports from './pages/reports/Reports'
import Staff from './pages/staff/Staff'
import SuperDashboard from './pages/superadmin/SuperDashboard'
import Tenants from './pages/superadmin/Tenants'
import TenantDetail from './pages/superadmin/TenantDetail'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function SuperRoute({ children }) {
  const { user, isSuperAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Tenant Routes */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="pos" element={<POS />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="staff" element={<Staff />} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/admin" element={<SuperRoute><DashboardLayout isAdmin /></SuperRoute>}>
        <Route index element={<SuperDashboard />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenants/:id" element={<TenantDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
