'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { User, MapPin, Phone, Mail, LogOut } from 'lucide-react'

export default function CustomerProfilePage() {
  const router = useRouter()
  const { user, customer, signOut, refreshProfile, loading: authLoading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    landmark: customer?.landmark || '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/customer')
      return
    }
    if (!authLoading && user && !customer) {
      router.push('/customer/setup')
      return
    }
  }, [user, customer, authLoading, router])

  const handleUpdate = async () => {
    if (!customer) return

    setLoading(true)
    const { error } = await supabase
      .from('customers')
      .update({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        landmark: formData.landmark || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id)

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
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{customer?.name}</h2>
              <p className="text-blue-100">{customer?.phone}</p>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Personal Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(!editing)}
              className="text-blue-600"
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
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
                />
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
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
                <span>{customer?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-5 w-5" />
                <span>{customer?.phone}</span>
              </div>
              {customer?.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5" />
                  <span>{customer.email}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{customer?.address}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card className="p-4 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push('/customer/bookings')}
          >
            My Bookings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push('/customer/notifications')}
          >
            Notifications
          </Button>
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
