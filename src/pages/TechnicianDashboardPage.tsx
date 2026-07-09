import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function TechnicianDashboardPage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Technician Dashboard</h1>
            <p className="text-green-100 text-sm">{profile?.phone || user?.phone}</p>
          </div>
          <button onClick={handleSignOut} className="bg-green-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-400">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome, Technician</h2>
              <p className="text-gray-500">{profile?.phone || user?.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-green-800 font-semibold mb-2">Active Tasks</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-blue-800 font-semibold mb-2">Completed Today</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-6">
              <h3 className="text-amber-800 font-semibold mb-2">Pending Review</h3>
              <p className="text-3xl font-bold text-amber-600">0</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-purple-800 font-semibold mb-2">Total Earnings</h3>
              <p className="text-3xl font-bold text-purple-600">$0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
