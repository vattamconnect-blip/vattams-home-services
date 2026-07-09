import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function PendingApprovalPage() {
  const { signOut, user, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Approval</h2>
          <p className="text-gray-600 mb-6">Your technician account is pending admin approval.</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="text-gray-900 font-medium">{profile?.phone || user?.phone || 'N/A'}</p>
          </div>

          <button onClick={handleSignOut} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
