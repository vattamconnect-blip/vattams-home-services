'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { MapPin } from 'lucide-react'

export default function CustomerSetupPage() {
  const router = useRouter()
  const { user, refreshProfile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/customer')
    }
  }, [user, authLoading, router])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        toast.success('Location captured!')
      },
      () => {
        toast.error('Unable to get location')
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('customers').insert({
      user_id: user.id,
      name: formData.name,
      phone: formData.phone,
      email: user.email || formData.email,
      address: formData.address,
      landmark: formData.landmark || null,
      city: formData.city,
      pincode: formData.pincode || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
    })

    setLoading(false)

    if (error) {
      toast.error('Failed to create profile. Please try again.')
    } else {
      await refreshProfile()
      router.push('/customer/home')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-8 pb-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h1 className="text-xl font-bold">Complete Your Profile</h1>
        <p className="text-blue-100 text-sm mt-1">This helps us serve you better</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            maxLength={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="address">Address *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetLocation}
              className="text-blue-600 h-8"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Get Location
            </Button>
          </div>
          <Textarea
            id="address"
            placeholder="Enter your complete address"
            value={formData.address}
            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            required
          />
          {formData.latitude && (
            <p className="text-xs text-green-600">Location captured for precise service</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="landmark">Landmark (Optional)</Label>
          <Input
            id="landmark"
            placeholder="Near any landmark?"
            value={formData.landmark}
            onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              maxLength={6}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? 'Creating Profile...' : 'Complete Setup'}
        </Button>
      </form>
    </div>
  )
}
