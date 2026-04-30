import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!user)    return <Navigate to="/login"  state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/"       replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
