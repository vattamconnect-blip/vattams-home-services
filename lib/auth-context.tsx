'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase/client'
import { Customer, Technician, Admin } from './types'

interface AuthContextType {
  user: User | null
  session: Session | null
  customer: Customer | null
  technician: Technician | null
  admin: Admin | null
  userRole: 'customer' | 'technician' | 'admin' | null
  loading: boolean
  signUpWithPassword: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      // Check for admin profile first
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      if (adminError) {
        console.error('Error fetching admin profile:', adminError)
      }

      if (adminData) {
        return { customer: null, technician: null, admin: adminData }
      }

      // Check for customer profile
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (customerError) {
        console.error('Error fetching customer profile:', customerError)
      }

      // Check for technician profile
      const { data: technicianData, error: technicianError } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (technicianError) {
        console.error('Error fetching technician profile:', technicianError)
      }

      return { customer: customerData, technician: technicianData, admin: null }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return { customer: null, technician: null, admin: null }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const { customer: customerData, technician: technicianData, admin: adminData } = await fetchProfile(user.id)
      setCustomer(customerData)
      setTechnician(technicianData)
      setAdmin(adminData)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          const { customer: customerData, technician: technicianData, admin: adminData } = await fetchProfile(initialSession.user.id)
          setCustomer(customerData)
          setTechnician(technicianData)
          setAdmin(adminData)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      (async () => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const { customer: customerData, technician: technicianData, admin: adminData } = await fetchProfile(session.user.id)
          setCustomer(customerData)
          setTechnician(technicianData)
          setAdmin(adminData)
        } else {
          setCustomer(null)
          setTechnician(null)
          setAdmin(null)
        }
        setLoading(false)
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUpWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setCustomer(null)
    setTechnician(null)
    setAdmin(null)
  }

  const userRole = admin ? 'admin' : customer ? 'customer' : technician ? 'technician' : null

  return (
    <AuthContext.Provider value={{
      user,
      session,
      customer,
      technician,
      admin,
      userRole,
      loading,
      signUpWithPassword,
      signInWithPassword,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
