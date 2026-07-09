import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { CustomerDashboardPage } from './pages/CustomerDashboardPage'
import { TechnicianDashboardPage } from './pages/TechnicianDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { PendingApprovalPage } from './pages/PendingApprovalPage'

function App() {
  const { user, loading, userRole, profile, admin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (userRole === 'admin' && admin?.is_active) {
    return (
      <Routes>
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    )
  }

  if (userRole === 'technician' && profile && !profile.is_approved) {
    return (
      <Routes>
        <Route path="/pending" element={<PendingApprovalPage />} />
        <Route path="/dashboard" element={<Navigate to="/pending" replace />} />
        <Route path="/login" element={<Navigate to="/pending" replace />} />
        <Route path="*" element={<Navigate to="/pending" replace />} />
      </Routes>
    )
  }

  if (userRole === 'technician' && profile?.is_approved) {
    return (
      <Routes>
        <Route path="/dashboard" element={<TechnicianDashboardPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/pending" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    )
  }

  if (userRole === 'customer') {
    return (
      <Routes>
        <Route path="/dashboard" element={<CustomerDashboardPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
