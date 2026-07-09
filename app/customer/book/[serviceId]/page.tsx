'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Service, Category } from '@/lib/types'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock } from 'lucide-react'
import { format, addDays } from 'date-fns'

export default function BookServicePage() {
  const params = useParams()
  const router = useRouter()
  const { customer, refreshProfile } = useAuth()
  const [service, setService] = useState<(Service & { category: Category }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    date: '',
    time: '10:00',
    notes: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })

  useEffect(() => {
    fetchService()
  }, [params.serviceId])

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        landmark: customer.landmark || '',
        latitude: customer.latitude,
        longitude: customer.longitude,
      }))
    }
  }, [customer])

  const fetchService = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('services')
        .select('*, category:categories(*)')
        .eq('id', params.serviceId)
        .single()

      setService(data)
    } catch (error) {
      toast.error('Failed to load service')
    } finally {
      setLoading(false)
    }
  }

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
      () => toast.error('Unable to get location')
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customer || !service) {
      toast.error('Missing required data')
      return
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.date) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)

    const bookingNumber = `VHS${format(new Date(), 'yyMMdd')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    const { data: bookingData, error } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        customer_id: customer.id,
        service_id: service.id,
        category_id: service.category_id,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_landmark: formData.landmark || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        service_name: service.name,
        service_price: service.base_price,
        preferred_date: formData.date,
        preferred_time: formData.time,
        notes: formData.notes || null,
        status: 'pending',
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      toast.error('Failed to create booking. Please try again.')
    } else {
      toast.success('Booking created successfully!')
      router.push(`/customer/booking/${bookingData?.id}`)
    }
  }

  if (loading) return <AppShell title="Book Service"><div /></AppShell>

  return (
    <AppShell title="Book Service">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Service Summary */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{service?.name}</h3>
              <p className="text-sm text-gray-600">{service?.category?.name}</p>
            </div>
            <p className="text-xl font-bold text-blue-600">₹{service?.base_price}</p>
          </div>
        </Card>

        {/* Contact Details */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Contact Details</h3>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
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
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              required
            />
          </div>
        </Card>

        {/* Address */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Service Address</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetLocation}
              className="text-blue-600"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Use Location
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Complete Address *</Label>
            <Textarea
              id="address"
              placeholder="House/Flat No., Street, Area"
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
              placeholder="Any landmark nearby"
              value={formData.landmark}
              onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
            />
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Schedule</h3>

          <div className="space-y-2">
            <Label htmlFor="date">Preferred Date *</Label>
            <Input
              id="date"
              type="date"
              min={format(addDays(new Date(), 0), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              value={formData.date}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time *</Label>
            <select
              id="time"
              value={formData.time}
              onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
              className="w-full h-10 border rounded-md px-3"
            >
              <option value="09:00">9:00 AM - 10:00 AM</option>
              <option value="10:00">10:00 AM - 11:00 AM</option>
              <option value="11:00">11:00 AM - 12:00 PM</option>
              <option value="12:00">12:00 PM - 1:00 PM</option>
              <option value="14:00">2:00 PM - 3:00 PM</option>
              <option value="15:00">3:00 PM - 4:00 PM</option>
              <option value="16:00">4:00 PM - 5:00 PM</option>
              <option value="17:00">5:00 PM - 6:00 PM</option>
            </select>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4 space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific requirements or instructions"
            value={formData.notes}
            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
          />
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? 'Booking...' : `Confirm Booking • ₹${service?.base_price}`}
        </Button>
      </form>
    </AppShell>
  )
}
