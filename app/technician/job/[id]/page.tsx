'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/status-badge'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Booking } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Navigation,
  Play,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
} from 'lucide-react'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { technician } = useAuth()
  const [job, setJob] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [parts, setParts] = useState<Array<{ name: string; cost: number }>>([])

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', params.id)
        .single()

      setJob(data)
      setParts(data?.parts_used || [])
    } catch (error) {
      toast.error('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    setSubmitting(true)

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'technician_on_the_way') {
      updateData.on_the_way_at = new Date().toISOString()
    } else if (status === 'started') {
      updateData.started_at = new Date().toISOString()
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      updateData.parts_used = parts
      updateData.parts_cost = parts.reduce((sum, p) => sum + p.cost, 0)
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', job?.id)

    setSubmitting(false)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`)
      fetchJob()
    }
  }

  const handleReject = async () => {
    setSubmitting(true)
    const { error } = await supabase
      .from('bookings')
      .update({
        technician_id: null,
        status: 'pending',
        assigned_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job?.id)

    setSubmitting(false)

    if (error) {
      toast.error('Failed to reject job')
    } else {
      toast.success('Job rejected')
      router.push('/technician/jobs')
    }
  }

  if (loading) return <AppShell title="Job Details"><div /></AppShell>

  if (!job) return <AppShell title="Job Details"><div className="p-4">Job not found</div></AppShell>

  return (
    <AppShell title={job.service_name}>
      <div className="p-4 space-y-4 pb-20">
        {/* Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={job.status} />
            <span className="text-xs text-gray-500">#{job.booking_number}</span>
          </div>

          <h2 className="font-semibold text-lg text-gray-900">{job.service_name}</h2>
        </Card>

        {/* Customer Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>

          <div className="space-y-3">
            <div>
              <p className="font-medium">{job.customer_name}</p>
              <p className="text-sm text-gray-600">{job.customer_phone}</p>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">{job.customer_address}</p>
                {job.customer_landmark && (
                  <p className="text-xs text-gray-500 mt-1">Landmark: {job.customer_landmark}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(job.preferred_date), 'dd MMM yyyy')}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{job.preferred_time}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => window.open(`tel:${job?.customer_phone}`)}>
              <Phone className="h-4 w-4 mr-1" /> Call
            </Button>
            <Button
              size="sm"
              className="bg-green-50 border-green-200 text-green-700"
              onClick={() => window.open(`https://wa.me/91${job?.customer_phone?.replace(/\D/g, '')}`)}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
            {job.latitude && job.longitude && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`)}
              >
                <Navigation className="h-4 w-4 mr-1" /> Navigate
              </Button>
            )}
          </div>
        </Card>

        {/* Notes */}
        {job.notes && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{job.notes}</p>
          </Card>
        )}

        {/* Parts Used (for completing job) */}
        {(job.status === 'started' || job.status === 'technician_on_the_way') && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Parts Used</h3>

            <div className="space-y-2 mb-3">
              {parts.map((part, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Part name"
                    value={part.name}
                    onChange={(e) => {
                      const newParts = [...parts]
                      newParts[index].name = e.target.value
                      setParts(newParts)
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Cost"
                    value={part.cost || ''}
                    onChange={(e) => {
                      const newParts = [...parts]
                      newParts[index].cost = parseFloat(e.target.value) || 0
                      setParts(newParts)
                    }}
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setParts(parts.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setParts([...parts, { name: '', cost: 0 }])}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Part
            </Button>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-bottom">
          {job.status === 'assigned' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-red-600 border-red-200"
                onClick={handleReject}
                disabled={submitting}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => updateStatus('technician_on_the_way')}
                disabled={submitting}
              >
                Start Journey
              </Button>
            </div>
          )}

          {job.status === 'technician_on_the_way' && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => updateStatus('started')}
              disabled={submitting}
            >
              <Play className="h-4 w-4 mr-2" /> Start Service
            </Button>
          )}

          {job.status === 'started' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => updateStatus('completed')}
              disabled={submitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Complete Service
            </Button>
          )}

          {job.status === 'completed' && (
            <Card className="p-3 bg-green-50 border-green-200">
              <p className="text-sm text-green-800 text-center font-medium">Service Completed</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
