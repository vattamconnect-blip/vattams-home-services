import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function CustomerDashboardPage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Customer Dashboard</h1>
            <p className="text-blue-100 text-sm">{profile?.phone || user?.phone}</p>
          </div>
          <button onClick={handleSignOut} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-400">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome, Customer</h2>
              <p className="text-gray-500">{profile?.phone || user?.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-blue-800 font-semibold mb-2">Active Bookings</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-green-800 font-semibold mb-2">Completed Services</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-6">
              <h3 className="text-amber-800 font-semibold mb-2">Pending</h3>
              <p className="text-3xl font-bold text-amber-600">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
