'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { User, Phone, Mail, MapPin, Star, LogOut } from 'lucide-react'

export default function TechnicianProfilePage() {
  const router = useRouter()
  const { user, technician, signOut, refreshProfile, loading: authLoading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: technician?.name || '',
    phone: technician?.phone || '',
    email: technician?.email || '',
    address: technician?.address || '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/technician')
      return
    }
    if (!authLoading && user && !technician) {
      router.push('/technician/setup')
      return
    }
  }, [user, technician, authLoading, router])

  const handleUpdate = async () => {
    if (!technician) return

    setLoading(true)
    const { error } = await supabase
      .from('technicians')
      .update({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', technician.id)

    setLoading(false)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
      setEditing(false)
      await refreshProfile()
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <AppShell title="Profile">
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{technician?.name}</h2>
              <p className="text-emerald-100">{technician?.phone}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">{technician?.rating?.toFixed(1)} ({technician?.total_jobs} jobs)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Approval Status */}
        {!technician?.is_approved && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800">
              Your account is pending approval. You cannot receive jobs until approved by admin.
            </p>
          </Card>
        )}

        {/* Profile Details */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Personal Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(!editing)}
              className="text-emerald-600"
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {editing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <User className="h-5 w-5" />
                <span>{technician?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-5 w-5" />
                <span>{technician?.phone}</span>
              </div>
              {technician?.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5" />
                  <span>{technician.email}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{technician?.address}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Skills */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {technician?.skills?.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {skill}
              </span>
            ))}
          </div>
        </Card>

        {/* Sign Out */}
        <Button
          variant="ghost"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppShell>
  )
}
