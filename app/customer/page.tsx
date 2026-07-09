'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { User, AlertCircle, Loader2 } from 'lucide-react'

export default function CustomerLoginPage() {
  const router = useRouter()
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (!email || !password) {
      setAuthError('Please enter email and password')
      return
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUpWithPassword(email, password)
      if (error) {
        const msg = error.message || ''
        if (msg.includes('already')) {
          setAuthError('An account with this email already exists. Please sign in.')
          setMode('login')
        } else {
          setAuthError(msg)
        }
        setLoading(false)
        return
      }
      toast.success('Account created! Please sign in.')
      setMode('login')
      setPassword('')
      setLoading(false)
      return
    }

    const { error } = await signInWithPassword(email, password)
    if (error) {
      const msg = error.message || ''
      if (msg.includes('Invalid login credentials') || msg.includes('Invalid email or password')) {
        setAuthError('Invalid email or password. New user? Switch to Sign Up.')
      } else if (msg.includes('Email not confirmed')) {
        setAuthError('Please confirm your email address first.')
      } else {
        setAuthError(msg)
      }
      setLoading(false)
      return
    }

    router.push('/customer/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      <div className="px-6 pt-16 pb-8 text-center text-white">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
          <User className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Customer {mode === 'login' ? 'Login' : 'Sign Up'}</h1>
        <p className="text-blue-100 text-sm">
          {mode === 'login' ? 'Sign in to book services' : 'Create an account to get started'}
        </p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {authError && (
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{authError}</p>
              </div>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setAuthError(null)
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
