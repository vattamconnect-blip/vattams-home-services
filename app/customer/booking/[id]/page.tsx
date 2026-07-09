'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { supabase } from '@/lib/supabase/client'
import { Booking, Technician } from '@/lib/types'
import { toast } from 'sonner'
import { Phone, MessageCircle, MapPin, Calendar, Clock, ChevronLeft, Star } from 'lucide-react'
import { format } from 'date-fns'

const statusSteps = [
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'technician_on_the_way', label: 'On the Way' },
  { key: 'started', label: 'Started' },
  { key: 'completed', label: 'Completed' },
]

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<(Booking & { technician: Technician | null }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, technician:technicians(*)')
        .eq('id', params.id)
        .single()

      setBooking(data)
    } catch (error) {
      toast.error('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <AppShell title="Booking Details"><div /></AppShell>

  if (!booking) {
    return (
      <AppShell title="Booking Details">
        <div className="p-4 text-center text-gray-500">Booking not found</div>
      </AppShell>
    )
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === booking.status)

  return (
    <AppShell title="Booking Details" headerContent={
      <Button variant="ghost" size="sm" className="text-gray-600">
        <ChevronLeft className="h-5 w-5 mr-1" onClick={() => router.back()} />
      </Button>
    }>
      <div className="p-4 space-y-4">
        {/* Status Tracker */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={booking.status} />
            <span className="text-xs text-gray-500">#{booking.booking_number}</span>
          </div>

          <div className="space-y-2">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  index <= currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`} />
                <span className={`text-sm ${
                  index <= currentStepIndex ? 'font-medium text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Service Details */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{booking.service_name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(booking.preferred_date), 'dd MMMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{booking.preferred_time}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="text-xl font-bold text-blue-600">₹{booking.service_price}</span>
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Service Address</h3>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">{booking.customer_address}</p>
              {booking.customer_landmark && (
                <p className="text-xs text-gray-500 mt-1">Landmark: {booking.customer_landmark}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Technician Info */}
        {booking.technician && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Technician Assigned</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.technician.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{booking.technician.rating.toFixed(1)} ({booking.technician.total_jobs} jobs)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => window.open(`tel:${booking.technician?.phone}`)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-green-50 border-green-200"
                  onClick={() => window.open(`https://wa.me/91${booking.technician?.phone?.replace(/\D/g, '')}`)}
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {booking.notes && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </Card>
        )}

        {/* Support */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 mb-2">Need help with this booking?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('tel:+919876543210')}
            >
              <Phone className="h-4 w-4 mr-1" /> Call Support
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 border-green-200"
              onClick={() => window.open('https://wa.me/919876543210')}
            >
              <MessageCircle className="h-4 w-4 mr-1 text-green-600" /> WhatsApp
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
