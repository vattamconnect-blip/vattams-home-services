import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment
// These are pre-populated by the Bolt environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  role: 'customer' | 'technician'
  is_approved: boolean
  phone: string | null
  name: string | null
  created_at: string
}

export type Admin = {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'viewer'
  is_active: boolean
  created_at: string
}
