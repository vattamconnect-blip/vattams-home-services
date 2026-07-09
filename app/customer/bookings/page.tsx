'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Booking } from '@/lib/types'
import { toast } from 'sonner'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default function BookingsPage() {
  const router = useRouter()
  const { user, customer, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/customer')
      return
    }
    if (!authLoading && user && !customer) {
      router.push('/customer/setup')
      return
    }
    if (customer) fetchBookings()
  }, [user, customer, authLoading, router])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, service:services(*), category:categories(*)')
        .eq('customer_id', customer?.id)
        .order('created_at', { ascending: false })

      setBookings(data || [])
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const activeStatuses = ['pending', 'assigned', 'technician_on_the_way', 'started']
  const activeBookings = bookings.filter((b) => activeStatuses.includes(b.status))
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled')

  return (
    <AppShell title="My Bookings">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-white sticky top-14 z-10">
          <TabsList className="w-full bg-transparent justify-start px-4 py-0 h-12">
            <TabsTrigger value="active" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4">
              Active ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4">
              Completed ({completedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent px-4">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <TabsContent value="active" className="space-y-3 mt-0">
            {activeBookings.length === 0 ? (
              <EmptyState
                title="No Active Bookings"
                description="Your active service bookings will appear here"
              />
            ) : (
              activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onClick={() => router.push(`/customer/booking/${booking.id}`)} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedBookings.length === 0 ? (
              <EmptyState title="No Completed Bookings" />
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onClick={() => router.push(`/customer/booking/${booking.id}`)} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3 mt-0">
            {cancelledBookings.length === 0 ? (
              <EmptyState title="No Cancelled Bookings" />
            ) : (
              cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onClick={() => router.push(`/customer/booking/${booking.id}`)} />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>
    </AppShell>
  )
}

function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500">#{booking.booking_number}</p>
          <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(booking.preferred_date), 'dd MMM yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{booking.preferred_time}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className="text-lg font-bold text-blue-600">₹{booking.service_price}</span>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  )
}
