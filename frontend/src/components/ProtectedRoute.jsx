import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  const { role: roleParam } = useParams()

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/portal/${user.role}`} replace />
  }

  if (roleParam && roleParam !== user.role) {
    return <Navigate to={`/portal/${user.role}`} replace />
  }

  return children
}
