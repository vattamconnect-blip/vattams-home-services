'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { AdminShell } from '@/components/admin-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Lock, Mail, AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'admin@vattams.net'
const ADMIN_PASSWORD = 'Admin@123'

function AdminLoginScreen() {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'creating'>('login')
  const { refreshProfile } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (!email || !password) {
      setAuthError('Please enter email and password')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const msg = error.message || ''

      if (msg.includes('Invalid login credentials') || msg.includes('Invalid email or password')) {
        // Admin user doesn't exist yet, show creation form
        setAuthError('Admin account not found. Click "Create Admin Account" below to set it up.')
      } else if (msg.includes('Email not confirmed')) {
        setAuthError('Please confirm your email address first.')
      } else if (msg.includes('Too many')) {
        setAuthError('Too many login attempts. Please wait a minute.')
      } else {
        setAuthError(msg)
      }
      setLoading(false)
      return
    }

    // After successful login, check/create admin record
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if admin record exists
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingAdmin && user.email === ADMIN_EMAIL) {
        // Create admin record for seed admin
        const { error: regError } = await supabase.rpc('register_admin', {
          p_user_id: user.id,
          p_email: user.email
        })

        if (regError) {
          console.error('Error registering admin:', regError)
        }
      }

      // Verify admin status
      const { data: adminProfile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (!adminProfile) {
        setAuthError('Access denied. This account does not have admin privileges.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      await refreshProfile()
      toast.success('Welcome Admin!')
    }

    setLoading(false)
  }

  const createAdminAccount = async () => {
    setAuthError(null)
    setLoading(true)
    setMode('creating')

    try {
      // Sign up the admin user
      const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: 'Super Admin',
            role: 'super_admin'
          }
        }
      })

      if (error) {
        setAuthError(error.message)
        setLoading(false)
        setMode('login')
        return
      }

      if (data.user) {
        // Create the admin record using the RPC function
        const { error: regError } = await supabase.rpc('register_admin', {
          p_user_id: data.user.id,
          p_email: ADMIN_EMAIL
        })

        if (regError) {
          console.error('Error registering admin:', regError)
        }

        // For development, auto-confirm by signing in
        // In production, user would need to confirm email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        })

        if (signInError) {
          toast.success('Admin account created! Please check your email to confirm your account, then try logging in.')
          setMode('login')
        } else {
          await refreshProfile()
          toast.success('Admin account created and logged in!')
        }
      }
    } catch (err) {
      setAuthError('Failed to create admin account')
      setMode('login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Secure admin access</p>
        </div>

        {authError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{authError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800"
            disabled={loading}
          >
            {loading && mode === 'login' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="pt-4 border-t space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={createAdminAccount}
            disabled={loading}
          >
            {loading && mode === 'creating' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Admin Account
              </>
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>First time?</strong> Click "Create Admin Account" above to set up the admin user.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Credentials: <code className="bg-blue-100 px-1 rounded">admin@vattams.net</code> / <code className="bg-blue-100 px-1 rounded">Admin@123</code>
            </p>
          </div>

          <p className="text-xs text-center text-gray-400">
            For production, change the admin password after first login.
          </p>
        </div>
      </Card>
    </div>
  )
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, admin, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !admin) {
      signOut()
    }
  }, [user, admin, loading, signOut, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    )
  }

  if (!user || !admin) {
    return <AdminLoginScreen />
  }

  return <AdminShell>{children}</AdminShell>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminGate>{children}</AdminGate>
    </AuthProvider>
  )
}
