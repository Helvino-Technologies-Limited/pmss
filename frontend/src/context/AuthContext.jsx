import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pmss_user')) } catch { return null }
  })

  const login = useCallback((authData) => {
    localStorage.setItem('pmss_token', authData.token)
    localStorage.setItem('pmss_user', JSON.stringify(authData))
    setUser(authData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pmss_token')
    localStorage.removeItem('pmss_user')
    setUser(null)
  }, [])

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isTenantAdmin = user?.role === 'TENANT_ADMIN'
  const isExpired = user?.subscriptionStatus === 'EXPIRED'
  const isTrial = user?.subscriptionStatus === 'TRIAL'

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperAdmin, isTenantAdmin, isExpired, isTrial }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
