import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase, Profile } from '../lib/supabase'

export function AdminDashboardPage() {
  const { admin, signOut } = useAuth()
  const navigate = useNavigate()
  const [technicians, setTechnicians] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    fetchTechnicians()
  }, [])

  const fetchTechnicians = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'technician')
      .order('created_at', { ascending: false })
    setTechnicians((data || []) as Profile[])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await supabase.from('profiles').update({ is_approved: true }).eq('id', id)
    fetchTechnicians()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const pending = technicians.filter(t => !t.is_approved)
  const approved = technicians.filter(t => t.is_approved)

  if (!admin || !admin.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-red-100 text-sm">{admin.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium capitalize">
              {admin.role.replace('_', ' ')}
            </span>
            <button onClick={handleSignOut} className="bg-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-400">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Pending Approvals</p>
            <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Approved Technicians</p>
            <p className="text-3xl font-bold text-green-600">{approved.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Total Technicians</p>
            <p className="text-3xl font-bold text-gray-900">{technicians.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Admin Role</p>
            <p className="text-xl font-bold text-red-600 capitalize">{admin.role.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pending.length})
            </button>
            <button
              onClick={() => setTab('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'approved' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({approved.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (tab === 'pending' ? pending : approved).length === 0 ? (
            <div className="text-center py-12 text-gray-500">No {tab} technicians</div>
          ) : (
            <div className="space-y-4">
              {(tab === 'pending' ? pending : approved).map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{tech.phone || 'No phone'}</p>
                    <p className="text-sm text-gray-500">Created: {new Date(tech.created_at).toLocaleDateString()}</p>
                  </div>
                  {!tech.is_approved ? (
                    <button
                      onClick={() => handleApprove(tech.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Approved</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
