'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Booking, Technician } from '@/lib/types'
import { toast } from 'sonner'
import { Search, UserPlus, Phone } from 'lucide-react'
import { format } from 'date-fns'

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assignDialog, setAssignDialog] = useState<string | null>(null)
  const [selectedTech, setSelectedTech] = useState('')

  useEffect(() => {
    fetchBookings()
    fetchTechnicians()
  }, [search, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (search) {
        query = query.or(`booking_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
      }

      const { data } = await query
      setBookings(data || [])
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    const { data } = await supabase
      .from('technicians')
      .select('*')
      .eq('is_approved', true)
      .eq('is_suspended', false)

    setTechnicians(data || [])
  }

  const assignTechnician = async () => {
    if (!assignDialog || !selectedTech) return

    const { error } = await supabase
      .from('bookings')
      .update({
        technician_id: selectedTech,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', assignDialog)

    if (error) {
      toast.error('Failed to assign technician')
    } else {
      toast.success('Technician assigned')
      setAssignDialog(null)
      fetchBookings()
    }
  }

  const statusOptions = ['all', 'pending', 'assigned', 'technician_on_the_way', 'started', 'completed', 'cancelled']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'all' ? 'All Status' : s.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">#{booking.booking_number}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.customer_name} - {booking.customer_phone}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(booking.preferred_date), 'dd MMM yyyy')} at {booking.preferred_time}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">₹{booking.service_price}</p>
                {booking.status === 'pending' && (
                  <Dialog open={assignDialog === booking.id} onOpenChange={(o) => setAssignDialog(o ? booking.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="mt-2">
                        <UserPlus className="h-4 w-4 mr-1" /> Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Technician</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Select Technician</Label>
                          <Select value={selectedTech} onValueChange={setSelectedTech}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose technician" />
                            </SelectTrigger>
                            <SelectContent>
                              {technicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>
                                  {tech.name} ({tech.rating.toFixed(1)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={assignTechnician} disabled={!selectedTech}>
                          Assign Technician
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {booking.technician_id && (
                  <p className="text-xs text-gray-500 mt-2">Technician assigned</p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {bookings.length === 0 && !loading && (
          <Card className="p-6 text-center text-gray-500">
            No bookings found
          </Card>
        )}
      </div>
    </div>
  )
}
